import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateProvider } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all services (public)
router.get('/', [
  query('category').optional().trim(),
  query('subcategory').optional().trim(),
  query('search').optional().trim(),
  query('latitude').optional().toFloat(),
  query('longitude').optional().toFloat(),
  query('radius').optional().toInt(), // in miles
  query('status').optional().isIn(['active', 'pending', 'inactive']),
  query('page').optional().toInt().default(1),
  query('limit').optional().toInt().default(50)
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const {
      category,
      subcategory,
      search,
      latitude,
      longitude,
      radius = 10, // default 10 miles
      status = 'active',
      page = 1,
      limit = 50
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      status
    };

    if (category) {
      where.category = category;
    }

    if (subcategory) {
      where.subcategory = subcategory;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get services
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          photos: {
            where: { isPrimary: true },
            take: 1
          },
          provider: {
            select: {
              id: true,
              organizationName: true
            }
          },
          _count: {
            select: {
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
      prisma.service.count({ where })
    ]);

    // Calculate distance if coordinates provided
    let servicesWithDistance = services;
    if (latitude && longitude) {
      servicesWithDistance = services.map(service => {
        if (service.latitude && service.longitude) {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(service.latitude.toString()),
            parseFloat(service.longitude.toString())
          );
          return { ...service, distance };
        }
        return service;
      });

      // Filter by radius and sort by distance
      servicesWithDistance = servicesWithDistance
        .filter(service => !service.distance || service.distance <= radius)
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    res.json({
      services: servicesWithDistance,
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

// Get single service (public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: {
            isPrimary: 'desc'
          }
        },
        provider: {
          select: {
            id: true,
            organizationName: true,
            email: true,
            phone: true
          }
        },
        events: {
          where: {
            status: { in: ['upcoming', 'ongoing'] }
          },
          orderBy: {
            startDate: 'asc'
          },
          take: 5
        }
      }
    });

    if (!service) {
      return res.status(404).json({ error: { message: 'Service not found' } });
    }

    // Increment view count
    await prisma.service.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ service });
  } catch (error) {
    next(error);
  }
});

// Create service (protected - providers only)
router.post('/', authenticateProvider, [
  body('name').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('address').trim().notEmpty(),
  body('description').optional().trim(),
  body('subcategory').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zip').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail(),
  body('website').optional().isURL(),
  body('hoursOfOperation').optional().trim(),
  body('eligibilityRequirements').optional().trim(),
  body('languagesSpoken').optional().isArray(),
  body('accessibilityFeatures').optional().isArray(),
  body('latitude').optional().toFloat(),
  body('longitude').optional().toFloat()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const serviceData = {
      ...req.body,
      providerId: req.provider.id,
      status: 'pending' // New services need approval
    };

    const service = await prisma.service.create({
      data: serviceData,
      include: {
        provider: {
          select: {
            id: true,
            organizationName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Service created successfully (pending approval)',
      service
    });
  } catch (error) {
    next(error);
  }
});

// Update service (protected - only by owner)
router.put('/:id', authenticateProvider, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if service exists and belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return res.status(404).json({ error: { message: 'Service not found' } });
    }

    if (existingService.providerId !== req.provider.id) {
      return res.status(403).json({ error: { message: 'Not authorized to update this service' } });
    }

    const { name, description, category, subcategory, address, city, state, zip, phone, email, website, hoursOfOperation, eligibilityRequirements, languagesSpoken, accessibilityFeatures, latitude, longitude } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(address && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zip !== undefined && { zip }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
        ...(hoursOfOperation !== undefined && { hoursOfOperation }),
        ...(eligibilityRequirements !== undefined && { eligibilityRequirements }),
        ...(languagesSpoken !== undefined && { languagesSpoken }),
        ...(accessibilityFeatures !== undefined && { accessibilityFeatures }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude })
      },
      include: {
        provider: {
          select: {
            id: true,
            organizationName: true
          }
        }
      }
    });

    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    next(error);
  }
});

// Delete service (protected - only by owner)
router.delete('/:id', authenticateProvider, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if service exists and belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return res.status(404).json({ error: { message: 'Service not found' } });
    }

    if (existingService.providerId !== req.provider.id) {
      return res.status(403).json({ error: { message: 'Not authorized to delete this service' } });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;

