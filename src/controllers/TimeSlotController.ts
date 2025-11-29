import { Request, Response, NextFunction, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { PrismaClient, TimeSlotType } from '@prisma/client';
import { TimeSlotService } from '../services/TimeSlotService';
import { TimeSlotRepository } from '../repositories/TimeSlotRepository';
import { authenticate, requireAdmin } from '../middleware/auth';

// Initialize Prisma client, repositories, and services
const prisma = new PrismaClient();
const timeSlotRepository = new TimeSlotRepository(prisma);
const timeSlotService = new TimeSlotService(timeSlotRepository);

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
 * /api/timeslots:
 *   post:
 *     tags:
 *       - TimeSlots
 *     summary: Crear una nova franja horària (operació d'administrador)
 *     description: Crea una nova franja horària amb classificació Hora Vall o Hora Punta. Valida els requisits 10.1 i 10.4.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *               - duration
 *               - type
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: Dia de la setmana (0=Diumenge, 1=Dilluns, ..., 6=Dissabte)
 *                 example: 1
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Hora d'inici en format HH:mm
 *                 example: '09:00'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Hora de fi en format HH:mm (ha de ser posterior a startTime)
 *                 example: '10:00'
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 description: Durada en minuts
 *                 example: 60
 *               type:
 *                 type: string
 *                 enum: [OFF_PEAK, PEAK]
 *                 description: Tipus de franja (OFF_PEAK=Hora Vall, PEAK=Hora Punta)
 *                 example: PEAK
 *     responses:
 *       201:
 *         description: Franja horària creada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TimeSlot'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('dayOfWeek')
      .notEmpty()
      .withMessage('Day of week is required')
      .isInt({ min: 0, max: 6 })
      .withMessage('Day of week must be an integer between 0 (Sunday) and 6 (Saturday)'),
    body('startTime')
      .trim()
      .notEmpty()
      .withMessage('Start time is required')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:mm format'),
    body('endTime')
      .trim()
      .notEmpty()
      .withMessage('End time is required')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:mm format'),
    body('duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer (minutes)'),
    body('type')
      .notEmpty()
      .withMessage('Time slot type is required')
      .isIn([TimeSlotType.OFF_PEAK, TimeSlotType.PEAK])
      .withMessage('Time slot type must be OFF_PEAK or PEAK'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dayOfWeek, startTime, endTime, duration, type } = req.body;

      const timeSlot = await timeSlotService.createTimeSlot({
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        duration: parseInt(duration),
        type: type as TimeSlotType,
      });

      res.status(201).json({
        success: true,
        data: {
          id: timeSlot.id,
          dayOfWeek: timeSlot.dayOfWeek,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          duration: timeSlot.duration,
          type: timeSlot.type,
          createdAt: timeSlot.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/timeslots:
 *   get:
 *     tags:
 *       - TimeSlots
 *     summary: Llistar totes les franges horàries
 *     description: Obté una llista de totes les franges horàries configurades al sistema. Valida el requisit 10.1.
 *     responses:
 *       200:
 *         description: Llista de franges horàries
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
 *                     $ref: '#/components/schemas/TimeSlot'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const timeSlots = await timeSlotRepository.findAll();

      res.status(200).json({
        success: true,
        data: timeSlots.map(slot => ({
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          type: slot.type,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/timeslots/date/{date}:
 *   get:
 *     tags:
 *       - TimeSlots
 *     summary: Obtenir franges horàries per data
 *     description: Consulta les franges horàries disponibles per una data específica. Valida el requisit 10.2.
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data en format ISO 8601 (YYYY-MM-DD)
 *         example: '2024-01-25'
 *     responses:
 *       200:
 *         description: Franges horàries per la data especificada
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
 *                       example: '2024-01-25'
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       example: 4
 *                     timeSlots:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimeSlot'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/date/:date',
  [
    param('date')
      .trim()
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;
      const parsedDate = new Date(date);

      const timeSlots = await timeSlotService.getTimeSlotsForDate(parsedDate);

      res.status(200).json({
        success: true,
        data: {
          date: parsedDate.toISOString().split('T')[0],
          dayOfWeek: parsedDate.getDay(),
          timeSlots: timeSlots.map(slot => ({
            id: slot.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: slot.duration,
            type: slot.type,
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
 * /api/timeslots/day/{dayOfWeek}:
 *   get:
 *     tags:
 *       - TimeSlots
 *     summary: Obtenir franges horàries per dia de la setmana
 *     description: Consulta les franges horàries configurades per un dia específic de la setmana. Valida el requisit 10.2.
 *     parameters:
 *       - in: path
 *         name: dayOfWeek
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         description: Dia de la setmana (0=Diumenge, 1=Dilluns, ..., 6=Dissabte)
 *         example: 1
 *     responses:
 *       200:
 *         description: Franges horàries per al dia de la setmana especificat
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
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       example: 1
 *                     timeSlots:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimeSlot'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/day/:dayOfWeek',
  [
    param('dayOfWeek')
      .trim()
      .notEmpty()
      .withMessage('Day of week is required')
      .isInt({ min: 0, max: 6 })
      .withMessage('Day of week must be an integer between 0 (Sunday) and 6 (Saturday)'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dayOfWeek } = req.params;
      const dayOfWeekInt = parseInt(dayOfWeek);

      const timeSlots = await timeSlotService.getTimeSlotsForDayOfWeek(dayOfWeekInt);

      res.status(200).json({
        success: true,
        data: {
          dayOfWeek: dayOfWeekInt,
          timeSlots: timeSlots.map(slot => ({
            id: slot.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: slot.duration,
            type: slot.type,
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
 * /api/timeslots/{id}:
 *   patch:
 *     tags:
 *       - TimeSlots
 *     summary: Actualitzar franja horària (operació d'administrador)
 *     description: Modifica la informació d'una franja horària existent. Els canvis no afecten reserves existents. Valida els requisits 10.4 i 10.5.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la franja horària
 *         example: 770e8400-e29b-41d4-a716-446655440002
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: Nou dia de la setmana
 *                 example: 2
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Nova hora d'inici
 *                 example: '10:00'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Nova hora de fi
 *                 example: '11:00'
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 description: Nova durada en minuts
 *                 example: 60
 *               type:
 *                 type: string
 *                 enum: [OFF_PEAK, PEAK]
 *                 description: Nou tipus de franja
 *                 example: OFF_PEAK
 *     responses:
 *       200:
 *         description: Franja horària actualitzada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TimeSlot'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Time slot ID is required'),
    body('dayOfWeek')
      .optional()
      .isInt({ min: 0, max: 6 })
      .withMessage('Day of week must be an integer between 0 (Sunday) and 6 (Saturday)'),
    body('startTime')
      .optional()
      .trim()
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:mm format'),
    body('endTime')
      .optional()
      .trim()
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:mm format'),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer (minutes)'),
    body('type')
      .optional()
      .isIn([TimeSlotType.OFF_PEAK, TimeSlotType.PEAK])
      .withMessage('Time slot type must be OFF_PEAK or PEAK'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { dayOfWeek, startTime, endTime, duration, type } = req.body;

      const updateData: any = {};
      if (dayOfWeek !== undefined) updateData.dayOfWeek = parseInt(dayOfWeek);
      if (startTime !== undefined) updateData.startTime = startTime;
      if (endTime !== undefined) updateData.endTime = endTime;
      if (duration !== undefined) updateData.duration = parseInt(duration);
      if (type !== undefined) updateData.type = type;

      const timeSlot = await timeSlotService.updateTimeSlot(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          id: timeSlot.id,
          dayOfWeek: timeSlot.dayOfWeek,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          duration: timeSlot.duration,
          type: timeSlot.type,
          updatedAt: timeSlot.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/timeslots/{id}:
 *   delete:
 *     tags:
 *       - TimeSlots
 *     summary: Eliminar franja horària (operació d'administrador)
 *     description: Elimina una franja horària del sistema. Valida el requisit 10.1.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la franja horària
 *         example: 770e8400-e29b-41d4-a716-446655440002
 *     responses:
 *       200:
 *         description: Franja horària eliminada correctament
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
 *                   example: Time slot deleted successfully
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
  requireAdmin,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Time slot ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await timeSlotService.deleteTimeSlot(id);

      res.status(200).json({
        success: true,
        message: 'Time slot deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as timeSlotController };
