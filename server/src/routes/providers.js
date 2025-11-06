import express from 'express';
import { authenticateProvider } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get current provider profile (protected)
router.get('/me', authenticateProvider, async (req, res, next) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.provider.id },
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

// Update provider profile (protected)
router.put('/me', authenticateProvider, async (req, res, next) => {
  try {
    const { organizationName, firstName, lastName, phone } = req.body;

    const provider = await prisma.provider.update({
      where: { id: req.provider.id },
      data: {
        ...(organizationName && { organizationName }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone })
      },
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
      message: 'Profile updated successfully',
      provider
    });
  } catch (error) {
    next(error);
  }
});

// Get provider's services (protected)
router.get('/me/services', authenticateProvider, async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { providerId: req.provider.id },
      include: {
        photos: {
          where: { isPrimary: true },
          take: 1
        },
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ services });
  } catch (error) {
    next(error);
  }
});

// Get provider's events (protected)
router.get('/me/events', authenticateProvider, async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { providerId: req.provider.id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json({ events });
  } catch (error) {
    next(error);
  }
});

export default router;

