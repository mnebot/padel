import { Response, NextFunction } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import {
  authenticate,
  requireAdmin,
  requireUser,
  requireOwnerOrAdmin,
  AuthenticatedRequest,
} from '../auth';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    UserType: {
      MEMBER: 'MEMBER',
      NON_MEMBER: 'NON_MEMBER',
    },
  };
});

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let prisma: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Get mocked Prisma instance
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid X-User-Id header', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      mockRequest.headers = {
        'x-user-id': mockUser.id,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
        },
      });
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject request without X-User-Id header', async () => {
      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required. Please provide X-User-Id header.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid UUID format', async () => {
      mockRequest.headers = {
        'x-user-id': 'invalid-uuid',
      };

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid user ID format.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with non-existent user', async () => {
      mockRequest.headers = {
        'x-user-id': '123e4567-e89b-12d3-a456-426614174000',
      };

      prisma.user.findUnique.mockResolvedValue(null);

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'User not found. Invalid authentication credentials.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockRequest.headers = {
        'x-user-id': '123e4567-e89b-12d3-a456-426614174000',
      };

      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'InternalServerError',
        message: 'An error occurred during authentication.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for MEMBER users', () => {
      mockRequest.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Admin User',
        email: 'admin@example.com',
        type: UserType.MEMBER,
      };

      requireAdmin(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for NON_MEMBER users', () => {
      mockRequest.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Regular User',
        email: 'user@example.com',
        type: UserType.NON_MEMBER,
      };

      requireAdmin(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Admin privileges required to access this resource.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated requests', () => {
      requireAdmin(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireUser', () => {
    it('should allow access for authenticated users', () => {
      mockRequest.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.NON_MEMBER,
      };

      requireUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated requests', () => {
      requireUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireOwnerOrAdmin', () => {
    it('should allow access for resource owner', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockRequest.user = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.NON_MEMBER,
      };
      mockRequest.params = { userId };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access for admin accessing other user resources', () => {
      mockRequest.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Admin User',
        email: 'admin@example.com',
        type: UserType.MEMBER,
      };
      mockRequest.params = { userId: 'different-user-id' };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-owner non-admin', () => {
      mockRequest.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.NON_MEMBER,
      };
      mockRequest.params = { userId: 'different-user-id' };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'You can only access your own resources.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated requests', () => {
      mockRequest.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing userId parameter', () => {
      mockRequest.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.NON_MEMBER,
      };
      mockRequest.params = {};

      const middleware = requireOwnerOrAdmin('userId');
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'BadRequest',
        message: 'User ID not provided in request.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
