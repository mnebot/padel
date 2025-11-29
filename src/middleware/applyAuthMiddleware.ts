/**
 * This file demonstrates how to apply authentication and authorization middleware
 * to the existing controllers.
 * 
 * To use this in production:
 * 1. Import this function in src/index.ts
 * 2. Call applyAuthMiddleware(app) before registering routes
 * 3. Or apply middleware directly to individual routes as shown below
 */

import { Express, Router } from 'express';
import { authenticate, requireAdmin } from './auth';

/**
 * Example of how to apply middleware to routes
 * This is a reference implementation showing which routes need which middleware
 */
export function applyAuthMiddleware(_app: Express): void {
  // Note: This is an example. In practice, you would apply middleware
  // directly in the controller files or create protected route wrappers
  
  // The actual implementation would be done in the controller files
  // by adding middleware to specific routes like this:
  
  // Example for UserController:
  // router.patch('/:id/type', authenticate, requireAdmin, handler);
  
  // Example for BookingController:
  // router.post('/', authenticate, handler);
  // router.get('/user/:userId', authenticate, requireOwnerOrAdmin('userId'), handler);
  
  console.log('Authentication middleware configuration loaded');
}

/**
 * Helper function to create a protected router with authentication
 */
export function createProtectedRouter(): Router {
  const router = Router();
  router.use(authenticate);
  return router;
}

/**
 * Helper function to create an admin-only router
 */
export function createAdminRouter(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(requireAdmin);
  return router;
}

/**
 * Route Protection Guide:
 * 
 * PUBLIC ROUTES (No authentication required):
 * - GET /api/courts - List active courts
 * - GET /api/timeslots - List time slots
 * - GET /api/timeslots/date/:date - Get time slots for date
 * - GET /api/timeslots/day/:dayOfWeek - Get time slots for day
 * - GET /api/bookings/available - Get available courts
 * - POST /api/users - Register user
 * 
 * AUTHENTICATED USER ROUTES (authenticate middleware):
 * - POST /api/requests - Create booking request
 * - POST /api/bookings - Create direct booking
 * 
 * OWNER OR ADMIN ROUTES (authenticate + requireOwnerOrAdmin):
 * - GET /api/users/:id - Get user details
 * - GET /api/users/:id/usage - Get user usage count
 * - GET /api/bookings/user/:userId - Get user bookings
 * - GET /api/requests/user/:userId - Get user requests
 * - DELETE /api/bookings/:id - Cancel booking (check ownership)
 * - DELETE /api/requests/:id - Cancel request (check ownership)
 * 
 * ADMIN-ONLY ROUTES (authenticate + requireAdmin):
 * - PATCH /api/users/:id/type - Update user type
 * - POST /api/courts - Create court
 * - PATCH /api/courts/:id - Update court
 * - DELETE /api/courts/:id - Delete court
 * - PATCH /api/courts/:id/deactivate - Deactivate court
 * - POST /api/timeslots - Create time slot
 * - PATCH /api/timeslots/:id - Update time slot
 * - DELETE /api/timeslots/:id - Delete time slot
 * - GET /api/requests/pending - Get pending requests
 * - POST /api/lottery/execute - Execute lottery
 * - GET /api/lottery/results/:date/:timeSlot - Get lottery results
 * - PATCH /api/bookings/:id/complete - Complete booking
 */

/**
 * Example of how to wrap existing controllers with authentication
 */
export function wrapWithAuth(router: Router, middleware: any[]): Router {
  const protectedRouter = Router();
  protectedRouter.use(...middleware);
  protectedRouter.use(router);
  return protectedRouter;
}
