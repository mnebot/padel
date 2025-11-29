import { Request, Response, NextFunction, Router } from 'express';
import { query, validationResult } from 'express-validator';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

// Initialize Prisma client
const prisma = new PrismaClient();

// Create router
const router = Router();

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid input data',
      details: errors.array(),
    });
    return;
  }
  next();
};

/**
 * @openapi
 * /api/stats:
 *   get:
 *     tags:
 *       - Stats
 *     summary: Obtenir estadístiques del sistema
 *     description: Retorna estadístiques generals del sistema incloent reserves, usuaris, pistes i ús de pistes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data d'inici per filtrar estadístiques (opcional)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fi per filtrar estadístiques (opcional)
 *     responses:
 *       200:
 *         description: Estadístiques obtingudes correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBookings:
 *                       type: integer
 *                       description: Total de reserves
 *                     totalActiveBookings:
 *                       type: integer
 *                       description: Reserves confirmades
 *                     totalCompletedBookings:
 *                       type: integer
 *                       description: Reserves completades
 *                     totalCancelledBookings:
 *                       type: integer
 *                       description: Reserves cancel·lades
 *                     totalPendingRequests:
 *                       type: integer
 *                       description: Sol·licituds pendents
 *                     totalUsers:
 *                       type: integer
 *                       description: Total d'usuaris
 *                     totalCourts:
 *                       type: integer
 *                       description: Total de pistes actives
 *                     courtUsage:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courtId:
 *                             type: string
 *                           courtName:
 *                             type: string
 *                           bookingCount:
 *                             type: integer
 *                           utilizationRate:
 *                             type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  [
    query('dateFrom')
      .optional()
      .isISO8601()
      .withMessage('dateFrom must be a valid ISO 8601 date'),
    query('dateTo')
      .optional()
      .isISO8601()
      .withMessage('dateTo must be a valid ISO 8601 date'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dateFrom, dateTo } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        dateFilter.lte = new Date(dateTo as string);
      }

      // Get booking statistics
      const [
        totalBookings,
        totalActiveBookings,
        totalCompletedBookings,
        totalCancelledBookings,
        totalPendingRequests,
        totalUsers,
        totalCourts,
      ] = await Promise.all([
        // Total bookings
        prisma.booking.count({
          where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
        }),
        // Active bookings (CONFIRMED status)
        prisma.booking.count({
          where: {
            status: BookingStatus.CONFIRMED,
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          },
        }),
        // Completed bookings
        prisma.booking.count({
          where: {
            status: BookingStatus.COMPLETED,
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          },
        }),
        // Cancelled bookings
        prisma.booking.count({
          where: {
            status: BookingStatus.CANCELLED,
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          },
        }),
        // Pending requests
        prisma.bookingRequest.count({
          where: {
            status: BookingStatus.REQUESTED,
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          },
        }),
        // Total users
        prisma.user.count(),
        // Total active courts
        prisma.court.count({
          where: { isActive: true },
        }),
      ]);

      // Get court usage statistics
      const courts = await prisma.court.findMany({
        where: { isActive: true },
        include: {
          bookings: {
            where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
          },
        },
      });

      // Calculate utilization rate (simplified - based on bookings vs potential slots)
      // For a more accurate calculation, you'd need to consider time slots and dates
      const courtUsage = courts.map((court) => {
        const bookingCount = court.bookings.length;
        // Simplified utilization: assume 10 slots per day, calculate based on date range
        let potentialSlots = 10; // Default for current stats
        
        if (dateFrom && dateTo) {
          const days = Math.ceil(
            (new Date(dateTo as string).getTime() - new Date(dateFrom as string).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          potentialSlots = days * 10; // 10 slots per day
        }
        
        const utilizationRate = potentialSlots > 0 
          ? Math.min((bookingCount / potentialSlots) * 100, 100)
          : 0;

        return {
          courtId: court.id,
          courtName: court.name,
          bookingCount,
          utilizationRate: Math.round(utilizationRate * 100) / 100, // Round to 2 decimals
        };
      });

      res.status(200).json({
        success: true,
        data: {
          totalBookings,
          totalActiveBookings,
          totalCompletedBookings,
          totalCancelledBookings,
          totalPendingRequests,
          totalUsers,
          totalCourts,
          courtUsage,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/stats/courts:
 *   get:
 *     tags:
 *       - Stats
 *     summary: Obtenir estadístiques d'ús de pistes
 *     description: Retorna estadístiques detallades d'ús per cada pista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data d'inici per filtrar estadístiques (opcional)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fi per filtrar estadístiques (opcional)
 *     responses:
 *       200:
 *         description: Estadístiques de pistes obtingudes correctament
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/courts',
  authenticate,
  requireAdmin,
  [
    query('dateFrom')
      .optional()
      .isISO8601()
      .withMessage('dateFrom must be a valid ISO 8601 date'),
    query('dateTo')
      .optional()
      .isISO8601()
      .withMessage('dateTo must be a valid ISO 8601 date'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dateFrom, dateTo } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        dateFilter.lte = new Date(dateTo as string);
      }

      // Get court usage statistics
      const courts = await prisma.court.findMany({
        where: { isActive: true },
        include: {
          bookings: {
            where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
          },
        },
      });

      const courtUsage = courts.map((court) => {
        const bookingCount = court.bookings.length;
        let potentialSlots = 10;
        
        if (dateFrom && dateTo) {
          const days = Math.ceil(
            (new Date(dateTo as string).getTime() - new Date(dateFrom as string).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          potentialSlots = days * 10;
        }
        
        const utilizationRate = potentialSlots > 0 
          ? Math.min((bookingCount / potentialSlots) * 100, 100)
          : 0;

        return {
          courtId: court.id,
          courtName: court.name,
          bookingCount,
          utilizationRate: Math.round(utilizationRate * 100) / 100,
        };
      });

      res.status(200).json({
        success: true,
        data: courtUsage,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/stats/users:
 *   get:
 *     tags:
 *       - Stats
 *     summary: Obtenir estadístiques d'usuaris
 *     description: Retorna estadístiques d'ús per cada usuari
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data d'inici per filtrar estadístiques (opcional)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fi per filtrar estadístiques (opcional)
 *     responses:
 *       200:
 *         description: Estadístiques d'usuaris obtingudes correctament
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/users',
  authenticate,
  requireAdmin,
  [
    query('dateFrom')
      .optional()
      .isISO8601()
      .withMessage('dateFrom must be a valid ISO 8601 date'),
    query('dateTo')
      .optional()
      .isISO8601()
      .withMessage('dateTo must be a valid ISO 8601 date'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dateFrom, dateTo } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        dateFilter.lte = new Date(dateTo as string);
      }

      // Get user statistics
      const users = await prisma.user.findMany({
        include: {
          usageCounter: true,
          bookings: {
            where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
          },
        },
      });

      const userStats = users.map((user) => ({
        userId: user.id,
        userName: user.name,
        userType: user.type,
        usageCount: user.usageCounter?.count || 0,
        totalBookings: user.bookings.length,
      }));

      res.status(200).json({
        success: true,
        data: userStats,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as statsController };
