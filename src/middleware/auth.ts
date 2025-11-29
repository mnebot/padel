import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

export interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.isAdmin = decoded.isAdmin;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to verify user is admin
 */
export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.isAdmin) {
    return next(new UnauthorizedError('Admin access required'));
  }
  next();
};

/**
 * Generate JWT token for user
 */
export const generateToken = (userId: string, email: string, isAdmin: boolean): string => {
  return jwt.sign(
    { userId, email, isAdmin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Middleware factory to verify user is owner of resource or admin
 * @param paramName - Name of the route parameter containing the user ID
 */
export const requireOwnerOrAdmin = (paramName: string = 'id') => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const resourceUserId = req.params[paramName];
    
    if (req.isAdmin || req.userId === resourceUserId) {
      return next();
    }
    
    next(new UnauthorizedError('Access denied'));
  };
};
