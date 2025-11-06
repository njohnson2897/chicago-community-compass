import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { generateProviderToken, generateAdminToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Login Provider (Public - providers can login once account is created)
router.post('/provider/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const { email, password } = req.body;

    // Find provider
    const provider = await prisma.provider.findUnique({
      where: { email }
    });

    if (!provider) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, provider.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // Generate token
    const token = generateProviderToken(provider.id);

    res.json({
      message: 'Login successful',
      provider: {
        id: provider.id,
        email: provider.email,
        organizationName: provider.organizationName,
        firstName: provider.firstName,
        lastName: provider.lastName,
        verified: provider.verified
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login Admin (Public - for admin access)
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const { email, password } = req.body;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // Generate token
    const token = generateAdminToken(admin.id);

    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

export default router;

