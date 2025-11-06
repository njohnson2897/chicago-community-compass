import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all events (public)
router.get('/', [
  query('serviceId').optional().trim(),
  query('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().toInt().default(1),
  query('limit').optional().toInt().default(50)
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const {
      serviceId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {};

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (status) {
      where.status = status;
    } else {
      // Default to upcoming/ongoing
      where.status = { in: ['upcoming', 'ongoing'] };
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) {
        where.startDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate);
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              address: true,
              category: true
            }
          },
          provider: {
            select: {
              id: true,
              organizationName: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          startDate: 'asc'
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      events,
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

// Get single event (public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            website: true
          }
        },
        provider: {
          select: {
            id: true,
            organizationName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: { message: 'Event not found' } });
    }

    res.json({ event });
  } catch (error) {
    next(error);
  }
});

// Create event (protected - providers only)
router.post('/', authenticateToken, [
  body('title').trim().notEmpty(),
  body('startDate').isISO8601(),
  body('description').optional().trim(),
  body('serviceId').optional().trim(),
  body('eventType').optional().trim(),
  body('endDate').optional().isISO8601(),
  body('locationType').optional().isIn(['in_person', 'virtual', 'hybrid']),
  body('address').optional().trim(),
  body('virtualLink').optional().isURL(),
  body('capacity').optional().isInt({ min: 1 }),
  body('registrationRequired').optional().isBoolean(),
  body('registrationUrl').optional().isURL()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const eventData = {
      ...req.body,
      providerId: req.provider.id,
      startDate: new Date(req.body.startDate),
      ...(req.body.endDate && { endDate: new Date(req.body.endDate) })
    };

    const event = await prisma.event.create({
      data: eventData,
      include: {
        service: {
          select: {
            id: true,
            name: true
          }
        },
        provider: {
          select: {
            id: true,
            organizationName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
});

// Update event (protected - only by owner)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if event exists and belongs to provider
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: { message: 'Event not found' } });
    }

    if (existingEvent.providerId !== req.provider.id) {
      return res.status(403).json({ error: { message: 'Not authorized to update this event' } });
    }

    const updateData = { ...req.body };
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            name: true
          }
        },
        provider: {
          select: {
            id: true,
            organizationName: true
          }
        }
      }
    });

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
});

// Delete event (protected - only by owner)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if event exists and belongs to provider
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: { message: 'Event not found' } });
    }

    if (existingEvent.providerId !== req.provider.id) {
      return res.status(403).json({ error: { message: 'Not authorized to delete this event' } });
    }

    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

