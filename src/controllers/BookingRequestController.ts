import { Request, Response, NextFunction, Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { BookingRequestService } from '../services/BookingRequestService';
import { BookingRequestRepository } from '../repositories/BookingRequestRepository';
import { authenticate, requireAdmin, requireOwnerOrAdmin } from '../middleware/auth';

// Initialize Prisma client, repositories, and services
const prisma = new PrismaClient();
const bookingRequestRepository = new BookingRequestRepository(prisma);
const bookingRequestService = new BookingRequestService(bookingRequestRepository);

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
 * /api/requests:
 *   post:
 *     tags:
 *       - Booking Requests
 *     summary: Crear una sol·licitud de reserva
 *     description: Crea una nova sol·licitud de reserva per a una data entre 5 i 2 dies d'antelació. La sol·licitud no té pista assignada i participarà en el sorteig. Valida els requisits 3.1, 3.2, 3.5.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - date
 *               - timeSlot
 *               - numberOfPlayers
 *               - participantIds
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Identificador de l'usuari que fa la sol·licitud
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Data de la reserva sol·licitada (entre 5 i 2 dies d'antelació)
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
 *         description: Sol·licitud creada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BookingRequest'
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
      const { userId, date, timeSlot, numberOfPlayers, participantIds } = req.body;

      const bookingRequest = await bookingRequestService.createRequest({
        userId,
        date: new Date(date),
        timeSlot,
        numberOfPlayers: parseInt(numberOfPlayers, 10),
        participantIds,
      });

      res.status(201).json({
        success: true,
        data: {
          id: bookingRequest.id,
          userId: bookingRequest.userId,
          date: bookingRequest.date,
          timeSlot: bookingRequest.timeSlot,
          numberOfPlayers: bookingRequest.numberOfPlayers,
          status: bookingRequest.status,
          participants: (bookingRequest as any).participants,
          createdAt: bookingRequest.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/requests/user/{userId}:
 *   get:
 *     tags:
 *       - Booking Requests
 *     summary: Obtenir sol·licituds per usuari
 *     description: Consulta totes les sol·licituds de reserva d'un usuari específic. Valida el requisit 3.4.
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
 *         description: Llista de sol·licituds de l'usuari
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
 *                     $ref: '#/components/schemas/BookingRequest'
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

      const requests = await bookingRequestService.getRequestsByUser(userId);

      res.status(200).json({
        success: true,
        data: requests.map(request => ({
          id: request.id,
          userId: request.userId,
          date: request.date,
          timeSlot: request.timeSlot,
          numberOfPlayers: request.numberOfPlayers,
          status: request.status,
          weight: request.weight,
          participants: (request as any).participants,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/requests/pending:
 *   get:
 *     tags:
 *       - Booking Requests
 *     summary: Obtenir sol·licituds pendents per data i hora (operació d'administrador)
 *     description: Consulta totes les sol·licituds pendents per a una data i franja horària específiques. Aquesta operació requereix permisos d'administrador. Valida el requisit 3.5.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de les sol·licituds
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
 *         description: Llista de sol·licituds pendents
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
 *                     $ref: '#/components/schemas/BookingRequest'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/pending',
  authenticate,
  requireAdmin,
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

      const requests = await bookingRequestService.getPendingRequestsForDate(
        new Date(date as string),
        timeSlot as string
      );

      res.status(200).json({
        success: true,
        data: {
          count: requests.length,
          timeSlot: timeSlot as string,
          requests: requests.map(request => ({
            id: request.id,
            userId: request.userId,
            date: request.date,
            timeSlot: request.timeSlot,
            numberOfPlayers: request.numberOfPlayers,
            status: request.status,
            weight: request.weight,
            participants: (request as any).participants,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
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
 * /api/requests/{id}:
 *   delete:
 *     tags:
 *       - Booking Requests
 *     summary: Cancel·lar una sol·licitud de reserva
 *     description: Cancel·la una sol·licitud de reserva existent, eliminant-la del sorteig. Només es poden cancel·lar sol·licituds amb estat REQUESTED. Valida el requisit 8.1.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la sol·licitud
 *         example: 770e8400-e29b-41d4-a716-446655440002
 *     responses:
 *       200:
 *         description: Sol·licitud cancel·lada correctament
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
 *                   example: Booking request cancelled successfully
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
      .withMessage('Request ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await bookingRequestService.cancelRequest(id);

      res.status(200).json({
        success: true,
        message: 'Booking request cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as bookingRequestController };
