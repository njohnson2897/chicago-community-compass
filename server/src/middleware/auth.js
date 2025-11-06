import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: { message: 'Access token required' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify provider still exists
    const provider = await prisma.provider.findUnique({
      where: { id: decoded.providerId }
    });

    if (!provider) {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }

    req.provider = {
      id: provider.id,
      email: provider.email,
      organizationName: provider.organizationName
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    next(error);
  }
};

export const generateToken = (providerId) => {
  return jwt.sign(
    { providerId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

