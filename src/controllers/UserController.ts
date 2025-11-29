import { Request, Response, NextFunction, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { PrismaClient, UserType } from '@prisma/client';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { UserNotFoundError } from '../errors';
import { authenticate, requireAdmin, requireOwnerOrAdmin } from '../middleware/auth';

// Initialize Prisma client, repositories, and services
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);

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
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Registrar un nou usuari
 *     description: Crea un nou usuari al sistema amb el tipus especificat (Soci o No Soci). Valida els requisits 1.1 i 1.2.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nom de l'usuari
 *                 example: Joan Garcia
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correu electrònic de l'usuari
 *                 example: joan.garcia@example.com
 *               type:
 *                 type: string
 *                 enum: [MEMBER, NON_MEMBER]
 *                 description: Tipus d'usuari (MEMBER = Soci, NON_MEMBER = No Soci)
 *                 example: MEMBER
 *     responses:
 *       201:
 *         description: Usuari creat correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// NOTE: User registration is now handled by /api/auth/register
// This endpoint is deprecated and should not be used
// router.post(
//   '/',
//   [
//     body('name')
//       .trim()
//       .notEmpty()
//       .withMessage('Name is required')
//       .isLength({ min: 1, max: 255 })
//       .withMessage('Name must be between 1 and 255 characters'),
//     body('email')
//       .trim()
//       .notEmpty()
//       .withMessage('Email is required')
//       .isEmail()
//       .withMessage('Email must be valid')
//       .normalizeEmail(),
//     body('type')
//       .notEmpty()
//       .withMessage('User type is required')
//       .isIn([UserType.MEMBER, UserType.NON_MEMBER])
//       .withMessage('User type must be MEMBER or NON_MEMBER'),
//   ],
//   handleValidationErrors,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { name, email, type } = req.body;

//       const user = await userService.registerUser({
//         name,
//         email,
//         type: type as UserType,
//       });

//       res.status(201).json({
//         success: true,
//         data: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           type: user.type,
//           createdAt: user.createdAt,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Crear un nou usuari (operació d'administrador)
 *     description: Crea un nou usuari al sistema. Requereix permisos d'administrador.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               type:
 *                 type: string
 *                 enum: [MEMBER, NON_MEMBER]
 *     responses:
 *       201:
 *         description: Usuari creat correctament
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
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email must be valid')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('type')
      .notEmpty()
      .withMessage('User type is required')
      .isIn([UserType.MEMBER, UserType.NON_MEMBER])
      .withMessage('User type must be MEMBER or NON_MEMBER'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, type } = req.body;

      // Hash password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await userService.registerUser({
        name,
        email,
        password: hashedPassword,
        type: type as UserType,
        isAdmin: false,
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtenir tots els usuaris
 *     description: Consulta la llista de tots els usuaris del sistema (requereix autenticació).
 *     responses:
 *       200:
 *         description: Llista d'usuaris
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
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userRepository.findAll();

      res.status(200).json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          isAdmin: user.isAdmin,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtenir usuari per ID
 *     description: Consulta la informació d'un usuari específic pel seu identificador. Valida el requisit 1.2.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de l'usuari
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Usuari trobat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/:id',
  authenticate,
  requireOwnerOrAdmin('id'),
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('User ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      if (!user) {
        throw new UserNotFoundError();
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          usageCount: user.usageCounter?.count || 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Actualitzar usuari (operació d'administrador)
 *     description: Actualitza la informació d'un usuari. La contrasenya és opcional.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de l'usuari
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               type:
 *                 type: string
 *                 enum: [MEMBER, NON_MEMBER]
 *               password:
 *                 type: string
 *                 description: Nova contrasenya (opcional)
 *     responses:
 *       200:
 *         description: Usuari actualitzat correctament
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('User ID is required'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Email must be valid')
      .normalizeEmail(),
    body('type')
      .optional()
      .isIn([UserType.MEMBER, UserType.NON_MEMBER])
      .withMessage('User type must be MEMBER or NON_MEMBER'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, email, type, password } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (type) updateData.type = type;
      if (password) {
        const bcrypt = await import('bcrypt');
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await userService.updateUser(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          isAdmin: user.isAdmin,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/users/{id}/type:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Actualitzar tipus d'usuari (operació d'administrador)
 *     description: Modifica el tipus d'un usuari existent (Soci o No Soci). Aquesta operació requereix permisos d'administrador. Valida el requisit 1.4.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de l'usuari
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [MEMBER, NON_MEMBER]
 *                 description: Nou tipus d'usuari
 *                 example: NON_MEMBER
 *     responses:
 *       200:
 *         description: Tipus d'usuari actualitzat correctament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  '/:id/type',
  authenticate,
  requireAdmin,
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('User ID is required'),
    body('type')
      .notEmpty()
      .withMessage('User type is required')
      .isIn([UserType.MEMBER, UserType.NON_MEMBER])
      .withMessage('User type must be MEMBER or NON_MEMBER'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { type } = req.body;

      const user = await userService.updateUserType(id, type as UserType);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /api/users/{id}/usage:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtenir comptador d'ús de l'usuari
 *     description: Consulta el nombre de reserves completades per l'usuari des de l'últim reset mensual. Valida el requisit 4.2.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador únic de l'usuari
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Comptador d'ús obtingut correctament
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
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     usageCount:
 *                       type: integer
 *                       minimum: 0
 *                       example: 3
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/:id/usage',
  authenticate,
  requireOwnerOrAdmin('id'),
  [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('User ID is required'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const usageCount = await userService.getUserUsageCount(id);

      res.status(200).json({
        success: true,
        data: {
          userId: id,
          usageCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as userController };
