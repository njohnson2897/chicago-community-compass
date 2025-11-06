import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Authenticate Provider
export const authenticateProvider = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: { message: 'Access token required' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a provider token
    if (!decoded.providerId) {
      return res.status(401).json({ error: { message: 'Invalid token type' } });
    }
    
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

// Authenticate Admin
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: { message: 'Access token required' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (!decoded.adminId) {
      return res.status(401).json({ error: { message: 'Invalid token type' } });
    }
    
    // Verify admin still exists
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId }
    });

    if (!admin) {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName
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

// Generate tokens
export const generateProviderToken = (providerId) => {
  return jwt.sign(
    { providerId, type: 'provider' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const generateAdminToken = (adminId) => {
  return jwt.sign(
    { adminId, type: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Legacy support (for backward compatibility)
export const authenticateToken = authenticateProvider;
export const generateToken = generateProviderToken;

