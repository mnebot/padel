import { Request, Response, NextFunction, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { CourtService } from '../services/CourtService';
import { CourtRepository } from '../repositories/CourtRepository';
import { CourtNotFoundError } from '../errors';
import { authenticate, requireAdmin } from '../middleware/auth';

// Initialize Prisma client, repositories, and services
const prisma = new PrismaClient();
const courtRepository = new CourtRepository(prisma);
const courtService = new CourtService(courtRepository);

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
 * /api/courts:
 *   post:
 *     tags:
 *       - Courts
 *     summary: Crear una nova pista (operació d'administrador)
 *     description: Crea una nova pista de pàdel al sistema. Aquesta operació requereix permisos d'administrador. Valida el requisit 9.1.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nom de la pista
 *                 example: Pista 1
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripció de la pista
 *                 example: Pista exterior amb il·luminació
 *               isActive:
 *                 type: boolean
 *                 description: Indica si la pista està activa (per defecte true)
 *                 example: true
 *     responses:
 *       201:
 *         description: Pista creada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Court'
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
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 0, max: 1000 })
      .withMessage('Description must be at most 1000 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, isActive } = req.body;

      const court = await courtService.createCourt({
        name,
        description: description || '',
        isActive: isActive ?? true,
      });

      res.status(201).json({
        success: true,
        data: {
          id: court.id,
          name: court.name,
          description: court.description,
          isActive: court.isActive,
          createdAt: court.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/courts:
 *   get:
 *     tags:
 *       - Courts
 *     summary: Llistar totes les pistes actives
 *     description: Obté una llista de totes les pistes actives disponibles per reserves. Valida el requisit 9.1.
 *     responses:
 *       200:
 *         description: Llista de pistes actives
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const courts = await courtService.getActiveCourts();

      res.status(200).json({
        success: true,
        data: courts.map(court => ({
          id: court.id,
          name: court.name,
          description: court.description,
          isActive: court.isActive,
          createdAt: court.createdAt,
          updatedAt: court.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/courts/{id}:
 *   get:
 *     tags:
 *       - Courts
 *     summary: Obtenir pista per ID
 *     description: Consulta la informació d'una pista específica pel seu identificador. Valida el requisit 9.1.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la pista
 *         example: 660e8400-e29b-41d4-a716-446655440001
 *     responses:
 *       200:
 *         description: Pista trobada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Court'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/:id',
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Court ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const court = await courtService.getCourtById(id);

      if (!court) {
        throw new CourtNotFoundError();
      }

      res.status(200).json({
        success: true,
        data: {
          id: court.id,
          name: court.name,
          description: court.description,
          isActive: court.isActive,
          createdAt: court.createdAt,
          updatedAt: court.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/courts/{id}:
 *   patch:
 *     tags:
 *       - Courts
 *     summary: Actualitzar informació de la pista (operació d'administrador)
 *     description: Modifica la informació d'una pista existent mantenint el seu identificador. Aquesta operació requereix permisos d'administrador. Valida el requisit 9.2.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la pista
 *         example: 660e8400-e29b-41d4-a716-446655440001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nou nom de la pista
 *                 example: Pista 1 - Renovada
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Nova descripció de la pista
 *                 example: Pista exterior amb il·luminació LED
 *               isActive:
 *                 type: boolean
 *                 description: Nou estat actiu/inactiu
 *                 example: true
 *     responses:
 *       200:
 *         description: Pista actualitzada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Court'
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
      .withMessage('Court ID is required'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Description must be between 1 and 1000 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;

      const court = await courtService.updateCourt(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          id: court.id,
          name: court.name,
          description: court.description,
          isActive: court.isActive,
          updatedAt: court.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/courts/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Courts
 *     summary: Desactivar una pista (operació d'administrador)
 *     description: Desactiva una pista impedint noves reserves però mantenint les reserves existents. Aquesta operació requereix permisos d'administrador. Valida el requisit 9.3.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la pista
 *         example: 660e8400-e29b-41d4-a716-446655440001
 *     responses:
 *       200:
 *         description: Pista desactivada correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Court'
 *                 message:
 *                   type: string
 *                   example: Court deactivated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  requireAdmin,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('Court ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const court = await courtService.deactivateCourt(id);

      res.status(200).json({
        success: true,
        data: {
          id: court.id,
          name: court.name,
          description: court.description,
          isActive: court.isActive,
          updatedAt: court.updatedAt,
        },
        message: 'Court deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/courts/{id}:
 *   delete:
 *     tags:
 *       - Courts
 *     summary: Eliminar una pista (operació d'administrador)
 *     description: Elimina una pista del sistema. Només es pot eliminar si no té reserves actives. Aquesta operació requereix permisos d'administrador. Valida el requisit 9.4.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de la pista
 *         example: 660e8400-e29b-41d4-a716-446655440001
 *     responses:
 *       200:
 *         description: Pista eliminada correctament
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
 *                   example: Court deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
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
      .withMessage('Court ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await courtService.deleteCourt(id);

      res.status(200).json({
        success: true,
        message: 'Court deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as courtController };
