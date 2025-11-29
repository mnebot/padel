import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../models/prisma';
import { BadRequestError, UnauthorizedError, UserNotFoundError } from '../errors';
import { authenticate, generateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req, res: Response) => {
  const { name, email, password, type } = req.body;

  // Validate required fields
  if (!name || !email || !password || !type) {
    throw new BadRequestError('Name, email, password, and type are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new BadRequestError('Invalid email format');
  }

  // Validate password length
  if (password.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters');
  }

  // Validate user type
  if (!['MEMBER', 'NON_MEMBER'].includes(type)) {
    throw new BadRequestError('Invalid user type');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError('Email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      type,
      isAdmin: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      type: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id, user.email, user.isAdmin);

  res.status(201).json({
    token,
    user,
  });
}));

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user.id, user.email, user.isAdmin);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    },
  });
}));

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticate, asyncHandler(async (_req: AuthRequest, res: Response) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token. This endpoint exists for consistency
  // and could be extended to implement token blacklisting if needed.
  res.json({ message: 'Logged out successfully' });
}));

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true,
      type: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  res.json(user);
}));

export const authController = router;
