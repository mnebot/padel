import { Request, Response, NextFunction, Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { BookingService } from '../services/BookingService';
import { BookingRepository } from '../repositories/BookingRepository';
import { CourtRepository } from '../repositories/CourtRepository';
import { UsageCounterRepository } from '../repositories/UsageCounterRepository';
import { authenticate, requireAdmin, requireOwnerOrAdmin } from '../middleware/auth';

// Initialize Prisma client, repositories, and services
const prisma = new PrismaClient();
const bookingRepository = new BookingRepository(prisma);
const courtRepository = new CourtRepository(prisma);
const usageCounterRepository = new UsageCounterRepository(prisma);
const bookingService = new BookingService(bookingRepository, courtRepository, usageCounterRepository);

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
 * /api/bookings:
 *   post:
 *     tags:
 *       - Bookings
 *     summary: Crear una reserva directa
 *     description: Crea una nova reserva directa per a una data amb menys de 2 dies d'antelació. La reserva es confirma immediatament amb pista assignada. Valida els requisits 6.1, 6.2, 6.3, 6.4.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courtId
 *               - date
 *               - timeSlot
 *               - numberOfPlayers
 *               - participantIds
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Identificador de l'usuari que fa la reserva
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               courtId:
 *                 type: string
 *                 format: uuid
 *                 description: Identificador de la pista a reservar
 *                 example: 660e8400-e29b-41d4-a716-446655440001
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Data de la reserva (menys de 2 dies d'antelació)
 *                 example: 2024-12-15
 *               timeSlot:
 *                 type: string
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Hora d'inici de la franja horària (format HH:mm)
 *                 example: "10:00"
 *               numberOfPlayers:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 4
 *                 description: Nombre de jugadors (entre 2 i 4)
 *                 example: 4
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 2
 *                 maxItems: 4
 *                 description: IDs dels usuaris participants (ha de coincidir amb numberOfPlayers)
 *                 example: ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440001"]
 *     responses:
 *       201:
 *         description: Reserva creada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/',
  authenticate,
  [
    body('userId')
      .trim()
      .notEmpty()
      .withMessage('User ID is required')
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
    body('courtId')
      .trim()
      .notEmpty()
      .withMessage('Court ID is required')
      .isUUID()
      .withMessage('Court ID must be a valid UUID'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    body('timeSlot')
      .trim()
      .notEmpty()
      .withMessage('Time slot is required')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time slot must be in HH:mm format'),
    body('numberOfPlayers')
      .notEmpty()
      .withMessage('Number of players is required')
      .isInt({ min: 2, max: 4 })
      .withMessage('Number of players must be between 2 and 4'),
    body('participantIds')
      .isArray({ min: 1, max: 4 })
      .withMessage('Participant IDs must be an array with 1 to 4 elements'),
    body('participantIds.*')
      .isUUID()
      .withMessage('Each participant ID must be a valid UUID'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, courtId, date, timeSlot, numberOfPlayers, participantIds } = req.body;

      const booking = await bookingService.createDirectBooking({
        userId,
        courtId,
        date: new Date(date),
        timeSlot,
        numberOfPlayers: parseInt(numberOfPlayers, 10),
        participantIds,
      });

      res.status(201).json({
        success: true,
        data: {
          id: booking.id,
          userId: booking.userId,
          courtId: booking.courtId,
          date: booking.date,
          timeSlot: booking.timeSlot,
          numberOfPlayers: booking.numberOfPlayers,
          status: booking.status,
          participants: (booking as any).participants,
          createdAt: booking.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/bookings/user/{userId}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Obtenir reserves per usuari
 *     description: Consulta totes les reserves d'un usuari específic. Valida el requisit 7.1.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de l'usuari
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Llista de reserves de l'usuari
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/user/:userId',
  authenticate,
  requireOwnerOrAdmin('userId'),
  [
    param('userId')
      .trim()
      .notEmpty()
      .withMessage('User ID is required')
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const bookings = await bookingService.getBookingsByUser(userId);

      res.status(200).json({
        success: true,
        data: bookings.map(booking => ({
          id: booking.id,
          userId: booking.userId,
          courtId: booking.courtId,
          date: booking.date,
          timeSlot: booking.timeSlot,
          numberOfPlayers: booking.numberOfPlayers,
          status: booking.status,
          requestId: booking.requestId,
          participants: (booking as any).participants,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          completedAt: booking.completedAt,
          cancelledAt: booking.cancelledAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Obtenir totes les reserves (operació d'administrador)
 *     description: Consulta totes les reserves del sistema amb filtres opcionals.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REQUESTED, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filtrar per estat
 *       - in: query
 *         name: courtId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar per pista
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar per usuari
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *     responses:
 *       200:
 *         description: Llista de reserves
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, courtId, userId, dateFrom, dateTo } = req.query;

      // Build filter conditions
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (courtId) {
        where.courtId = courtId;
      }
      
      if (userId) {
        where.userId = userId;
      }
      
      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) {
          where.date.gte = new Date(dateFrom as string);
        }
        if (dateTo) {
          where.date.lte = new Date(dateTo as string);
        }
      }

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
          court: {
            select: {
              id: true,
              name: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      res.status(200).json({
        success: true,
        data: bookings.map(booking => ({
          id: booking.id,
          userId: booking.userId,
          user: booking.user,
          courtId: booking.courtId,
          court: booking.court,
          date: booking.date,
          timeSlot: booking.timeSlot,
          numberOfPlayers: booking.numberOfPlayers,
          status: booking.status,
          requestId: booking.requestId,
          participants: booking.participants.map(p => p.user),
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          completedAt: booking.completedAt,
          cancelledAt: booking.cancelledAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/bookings/availability/{date}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Obtenir disponibilitat completa per dia
 *     description: Consulta totes les franges horàries i pistes disponibles per una data específica.
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de la reserva
 *         example: 2024-12-15
 *     responses:
 *       200:
 *         description: Disponibilitat del dia
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/availability/:date',
  [
    param('date')
      .trim()
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;
      const parsedDate = new Date(date);

      // Import TimeSlotService
      const { TimeSlotService } = await import('../services/TimeSlotService');
      const { TimeSlotRepository } = await import('../repositories/TimeSlotRepository');
      const timeSlotRepository = new TimeSlotRepository(prisma);
      const timeSlotService = new TimeSlotService(timeSlotRepository);

      // Get time slots for the date
      const timeSlots = await timeSlotService.getTimeSlotsForDate(parsedDate);

      // Get available courts for each time slot
      const slots = await Promise.all(
        timeSlots.map(async (slot) => {
          const availableCourts = await bookingService.getAvailableCourts(
            parsedDate,
            slot.startTime
          );

          return {
            timeSlot: slot.startTime,
            type: slot.type,
            availableCourts: availableCourts.map(court => ({
              id: court.id,
              name: court.name,
              description: court.description,
            })),
            isAvailable: availableCourts.length > 0,
          };
        })
      );

      // Determine booking window type
      const { isWithinDirectBookingWindow, isWithinRequestWindow } = await import('../utils/dateValidation');
      const isInDirectBookingWindow = isWithinDirectBookingWindow(parsedDate);
      const isInRequestWindow = isWithinRequestWindow(parsedDate);

      res.status(200).json({
        success: true,
        data: {
          date: parsedDate.toISOString().split('T')[0],
          slots,
          isInDirectBookingWindow,
          isInRequestWindow,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/bookings/available:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Obtenir pistes disponibles
 *     description: Consulta les pistes disponibles per a una data i franja horària específiques. Valida el requisit 6.1.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de la reserva
 *         example: 2024-12-15
 *       - in: query
 *         name: timeSlot
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *         description: Franja horària (format HH:mm)
 *         example: "10:00"
 *     responses:
 *       200:
 *         description: Llista de pistes disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Court'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/available',
  [
    query('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    query('timeSlot')
      .trim()
      .notEmpty()
      .withMessage('Time slot is required')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time slot must be in HH:mm format'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, timeSlot } = req.query;

      const availableCourts = await bookingService.getAvailableCourts(
        new Date(date as string),
        timeSlot as string
      );

      res.status(200).json({
        success: true,
        data: {
          count: availableCourts.length,
          timeSlot: timeSlot as string,
          courts: availableCourts.map(court => ({
            id: court.id,
            name: court.name,
            description: court.description,
            isActive: court.isActive,
            createdAt: court.createdAt,
            updatedAt: court.updatedAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/bookings/{id}:
 *   delete:
 *     tags:
 *       - Bookings
 *     summary: Cancel·lar una reserva
 *     description: Cancel·la una reserva existent, alliberant la pista per a altres usuaris. No es poden cancel·lar reserves completades. Valida els requisits 8.2, 8.3.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la reserva
 *         example: 770e8400-e29b-41d4-a716-446655440002
 *     responses:
 *       200:
 *         description: Reserva cancel·lada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking cancelled successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Booking ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await bookingService.cancelBooking(id);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/bookings/{id}/complete:
 *   patch:
 *     tags:
 *       - Bookings
 *     summary: Completar una reserva (operació d'administrador/sistema)
 *     description: Marca una reserva com a completada i incrementa el comptador d'ús de l'usuari. Aquesta operació requereix permisos d'administrador o és executada automàticament pel sistema. Valida el requisit 4.1.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la reserva
 *         example: 770e8400-e29b-41d4-a716-446655440002
 *     responses:
 *       200:
 *         description: Reserva completada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking completed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  '/:id/complete',
  authenticate,
  requireAdmin,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Booking ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await bookingService.completeBooking(id);

      res.status(200).json({
        success: true,
        message: 'Booking completed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as bookingController };
