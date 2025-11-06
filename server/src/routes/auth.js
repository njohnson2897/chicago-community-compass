import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Register Provider
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('organizationName').trim().notEmpty(),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const { email, password, organizationName, firstName, lastName, phone } = req.body;

    // Check if provider already exists
    const existingProvider = await prisma.provider.findUnique({
      where: { email }
    });

    if (existingProvider) {
      return res.status(400).json({ error: { message: 'Email already registered' } });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create provider
    const provider = await prisma.provider.create({
      data: {
        email,
        passwordHash,
        organizationName,
        firstName,
        lastName,
        phone
      },
      select: {
        id: true,
        email: true,
        organizationName: true,
        firstName: true,
        lastName: true,
        verified: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(provider.id);

    res.status(201).json({
      message: 'Provider registered successfully',
      provider,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login Provider
router.post('/login', [
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
    const token = generateToken(provider.id);

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

// Get current provider (protected)
router.get('/me', async (req, res, next) => {
  try {
    // This route will be protected by authenticateToken middleware
    // For now, return error if not implemented with middleware
    res.status(501).json({ error: { message: 'Use /api/providers/me instead' } });
  } catch (error) {
    next(error);
  }
});

export default router;

