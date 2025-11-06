import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult, query } from 'express-validator';
import { authenticateAdmin } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all providers (admin only)
router.get('/providers', authenticateAdmin, [
  query('search').optional().trim(),
  query('verified').optional().isBoolean(),
  query('page').optional().toInt().default(1),
  query('limit').optional().toInt().default(50)
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const { search, verified, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { organizationName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (verified !== undefined) {
      where.verified = verified === 'true';
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        select: {
          id: true,
          email: true,
          organizationName: true,
          firstName: true,
          lastName: true,
          phone: true,
          verified: true,
          createdAt: true,
          _count: {
            select: {
              services: true,
              events: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.provider.count({ where })
    ]);

    res.json({
      providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create provider (admin only)
router.post('/providers', authenticateAdmin, [
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
      return res.status(400).json({ error: { message: 'Provider with this email already exists' } });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create provider (verified by default since created by admin)
    const provider = await prisma.provider.create({
      data: {
        email,
        passwordHash,
        organizationName,
        firstName,
        lastName,
        phone,
        verified: true,
        createdByAdminId: req.admin.id
      },
      select: {
        id: true,
        email: true,
        organizationName: true,
        firstName: true,
        lastName: true,
        phone: true,
        verified: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Provider created successfully',
      provider
    });
  } catch (error) {
    next(error);
  }
});

// Get single provider (admin only)
router.get('/providers/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        organizationName: true,
        firstName: true,
        lastName: true,
        phone: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        createdByAdmin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            services: true,
            events: true
          }
        }
      }
    });

    if (!provider) {
      return res.status(404).json({ error: { message: 'Provider not found' } });
    }

    res.json({ provider });
  } catch (error) {
    next(error);
  }
});

// Update provider (admin only)
router.put('/providers/:id', authenticateAdmin, [
  body('email').optional().isEmail().normalizeEmail(),
  body('organizationName').optional().trim().notEmpty(),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('verified').optional().isBoolean(),
  body('password').optional().isLength({ min: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const { id } = req.params;
    const { email, organizationName, firstName, lastName, phone, verified, password } = req.body;

    // Check if provider exists
    const existingProvider = await prisma.provider.findUnique({
      where: { id }
    });

    if (!existingProvider) {
      return res.status(404).json({ error: { message: 'Provider not found' } });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingProvider.email) {
      const emailTaken = await prisma.provider.findUnique({
        where: { email }
      });
      if (emailTaken) {
        return res.status(400).json({ error: { message: 'Email already in use' } });
      }
    }

    // Build update data
    const updateData = {};
    if (email) updateData.email = email;
    if (organizationName) updateData.organizationName = organizationName;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (verified !== undefined) updateData.verified = verified;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        organizationName: true,
        firstName: true,
        lastName: true,
        phone: true,
        verified: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Provider updated successfully',
      provider
    });
  } catch (error) {
    next(error);
  }
});

// Delete provider (admin only)
router.delete('/providers/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingProvider = await prisma.provider.findUnique({
      where: { id }
    });

    if (!existingProvider) {
      return res.status(404).json({ error: { message: 'Provider not found' } });
    }

    await prisma.provider.delete({
      where: { id }
    });

    res.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get admin profile (admin only)
router.get('/me', authenticateAdmin, async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        _count: {
          select: {
            providersCreated: true
          }
        }
      }
    });

    if (!admin) {
      return res.status(404).json({ error: { message: 'Admin not found' } });
    }

    res.json({ admin });
  } catch (error) {
    next(error);
  }
});

export default router;

