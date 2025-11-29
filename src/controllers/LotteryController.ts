import { Request, Response, NextFunction, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { PrismaClient, Booking } from '@prisma/client';
import { LotteryService } from '../services/LotteryService';
import { BookingRequestRepository } from '../repositories/BookingRequestRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { UserRepository } from '../repositories/UserRepository';
import { UsageCounterRepository } from '../repositories/UsageCounterRepository';
import { authenticate, requireAdmin } from '../middleware/auth';

// Initialize Prisma client, repositories, and services
const prisma = new PrismaClient();
const bookingRequestRepository = new BookingRequestRepository(prisma);
const bookingRepository = new BookingRepository(prisma);
const userRepository = new UserRepository(prisma);
const usageCounterRepository = new UsageCounterRepository(prisma);
const lotteryService = new LotteryService(
  bookingRequestRepository,
  bookingRepository,
  userRepository,
  usageCounterRepository
);

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
 * /api/lottery/execute:
 *   post:
 *     tags:
 *       - Lottery
 *     summary: Executar el sorteig ponderat (operació d'administrador)
 *     description: Executa el sorteig ponderat per a una data i franja horària específiques, assignant pistes segons els pesos calculats. Aquesta operació requereix permisos d'administrador. Valida els requisits 5.1, 5.2, 5.6, 5.7.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - timeSlot
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Data per la qual executar el sorteig
 *                 example: 2024-12-15
 *               timeSlot:
 *                 type: string
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Franja horària (format HH:mm)
 *                 example: "10:00"
 *     responses:
 *       200:
 *         description: Sorteig executat correctament
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
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: 2024-12-15
 *                     timeSlot:
 *                       type: string
 *                       example: "10:00"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: integer
 *                           description: Nombre total de sol·licituds
 *                           example: 10
 *                         assigned:
 *                           type: integer
 *                           description: Nombre de sol·licituds assignades
 *                           example: 6
 *                         unassigned:
 *                           type: integer
 *                           description: Nombre de sol·licituds no assignades
 *                           example: 4
 *                     assignments:
 *                       type: array
 *                       description: Llista d'assignacions realitzades
 *                       items:
 *                         type: object
 *                         properties:
 *                           requestId:
 *                             type: string
 *                             format: uuid
 *                             example: 880e8400-e29b-41d4-a716-446655440003
 *                           courtId:
 *                             type: string
 *                             format: uuid
 *                             example: 660e8400-e29b-41d4-a716-446655440001
 *                           bookingId:
 *                             type: string
 *                             format: uuid
 *                             example: 990e8400-e29b-41d4-a716-446655440004
 *                     unassignedRequests:
 *                       type: array
 *                       description: Llista de sol·licituds no assignades
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: 880e8400-e29b-41d4-a716-446655440005
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                             example: 550e8400-e29b-41d4-a716-446655440000
 *                           numberOfPlayers:
 *                             type: integer
 *                             example: 4
 *                           weight:
 *                             type: number
 *                             format: float
 *                             example: 1.54
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/execute',
  authenticate,
  requireAdmin,
  [
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be in ISO 8601 format'),
    body('timeSlot')
      .trim()
      .notEmpty()
      .withMessage('Time slot is required')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time slot must be in HH:mm format'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, timeSlot } = req.body;

      const result = await lotteryService.executeLottery(
        new Date(date),
        timeSlot
      );

      res.status(200).json({
        success: true,
        data: {
          date: new Date(date).toISOString().split('T')[0],
          timeSlot,
          summary: {
            totalRequests: result.assigned.length + result.unassigned.length,
            assigned: result.assigned.length,
            unassigned: result.unassigned.length,
          },
          assignments: result.assigned.map(assignment => ({
            requestId: assignment.requestId,
            courtId: assignment.courtId,
            bookingId: assignment.bookingId,
          })),
          unassignedRequests: result.unassigned.map(request => ({
            id: request.id,
            userId: request.userId,
            numberOfPlayers: request.numberOfPlayers,
            weight: request.weight,
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
 * /api/lottery/results/{date}/{timeSlot}:
 *   get:
 *     tags:
 *       - Lottery
 *     summary: Consultar resultats del sorteig
 *     description: Obté els resultats del sorteig per a una data i franja horària específiques, incloent assignacions i sol·licituds no assignades. Valida els requisits 5.6, 5.7.
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data del sorteig (format YYYY-MM-DD)
 *         example: 2024-12-15
 *       - in: path
 *         name: timeSlot
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *         description: Franja horària (format HH:mm)
 *         example: "10:00"
 *     responses:
 *       200:
 *         description: Resultats del sorteig
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
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: 2024-12-15
 *                     timeSlot:
 *                       type: string
 *                       example: "10:00"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalAssigned:
 *                           type: integer
 *                           description: Nombre de reserves assignades
 *                           example: 6
 *                         totalUnassigned:
 *                           type: integer
 *                           description: Nombre de sol·licituds no assignades
 *                           example: 4
 *                         totalRequests:
 *                           type: integer
 *                           description: Nombre total de sol·licituds
 *                           example: 10
 *                     assignedBookings:
 *                       type: array
 *                       description: Reserves creades pel sorteig
 *                       items:
 *                         type: object
 *                         properties:
 *                           bookingId:
 *                             type: string
 *                             format: uuid
 *                             example: 990e8400-e29b-41d4-a716-446655440004
 *                           requestId:
 *                             type: string
 *                             format: uuid
 *                             example: 880e8400-e29b-41d4-a716-446655440003
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                             example: 550e8400-e29b-41d4-a716-446655440000
 *                           courtId:
 *                             type: string
 *                             format: uuid
 *                             example: 660e8400-e29b-41d4-a716-446655440001
 *                           numberOfPlayers:
 *                             type: integer
 *                             example: 4
 *                           status:
 *                             type: string
 *                             example: CONFIRMED
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-21T16:00:00Z
 *                     unassignedRequests:
 *                       type: array
 *                       description: Sol·licituds que no van obtenir pista
 *                       items:
 *                         type: object
 *                         properties:
 *                           requestId:
 *                             type: string
 *                             format: uuid
 *                             example: 880e8400-e29b-41d4-a716-446655440005
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                             example: 550e8400-e29b-41d4-a716-446655440000
 *                           numberOfPlayers:
 *                             type: integer
 *                             example: 4
 *                           weight:
 *                             type: number
 *                             format: float
 *                             example: 1.54
 *                           status:
 *                             type: string
 *                             example: REQUESTED
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-20T15:30:00Z
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/results/:date/:timeSlot',
  [
    param('date')
      .notEmpty()
      .withMessage('Date parameter is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
    param('timeSlot')
      .trim()
      .notEmpty()
      .withMessage('Time slot parameter is required')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time slot must be in HH:mm format'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, timeSlot } = req.params;

      // Parse the date string to a Date object
      const targetDate = new Date(date);

      // Get all bookings for this date and time slot that came from requests
      const bookings = await bookingRepository.findByDateAndTimeSlot(
        targetDate,
        timeSlot
      );

      // Filter to only include bookings that have a requestId (came from lottery)
      const lotteryBookings = bookings.filter((booking: Booking) => booking.requestId !== null);

      // Get all pending requests for this date/time (unassigned)
      const pendingRequests = await bookingRequestRepository.findPendingByDateAndTimeSlot(
        targetDate,
        timeSlot
      );

      res.status(200).json({
        success: true,
        data: {
          date,
          timeSlot,
          summary: {
            totalAssigned: lotteryBookings.length,
            totalUnassigned: pendingRequests.length,
            totalRequests: lotteryBookings.length + pendingRequests.length,
          },
          assignedBookings: lotteryBookings.map((booking: Booking) => ({
            bookingId: booking.id,
            requestId: booking.requestId,
            userId: booking.userId,
            courtId: booking.courtId,
            numberOfPlayers: booking.numberOfPlayers,
            status: booking.status,
            createdAt: booking.createdAt,
          })),
          unassignedRequests: pendingRequests.map(request => ({
            requestId: request.id,
            userId: request.userId,
            numberOfPlayers: request.numberOfPlayers,
            weight: request.weight,
            status: request.status,
            createdAt: request.createdAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as lotteryController };
