import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { userController } from '../controllers/UserController';
import { courtController } from '../controllers/CourtController';
import { timeSlotController } from '../controllers/TimeSlotController';
import { bookingRequestController } from '../controllers/BookingRequestController';
import { bookingController } from '../controllers/BookingController';
import { lotteryController } from '../controllers/LotteryController';
import { statsController } from '../controllers/StatsController';

/**
 * Central router configuration
 * Registers all API routes with their respective controllers
 * 
 * Route Structure:
 * - /api/auth - Authentication
 * - /api/users - User management
 * - /api/courts - Court management
 * - /api/timeslots - Time slot management
 * - /api/requests - Booking request management
 * - /api/bookings - Booking management
 * - /api/lottery - Lottery execution and results
 */

const router = Router();

/**
 * Auth routes
 * Handles user authentication and registration
 * 
 * Routes:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login user
 * - POST /api/auth/logout - Logout user
 * - GET /api/auth/me - Get current user
 */
router.use('/auth', authController);

/**
 * User routes
 * Handles user registration, profile management, and usage tracking
 * 
 * Routes:
 * - POST /api/users - Register new user
 * - GET /api/users/:id - Get user by ID
 * - PATCH /api/users/:id/type - Update user type (admin)
 * - GET /api/users/:id/usage - Get user usage count
 */
router.use('/users', userController);

/**
 * Court routes
 * Handles court CRUD operations and availability
 * 
 * Routes:
 * - POST /api/courts - Create court (admin)
 * - GET /api/courts - List active courts
 * - GET /api/courts/:id - Get court by ID
 * - PATCH /api/courts/:id - Update court (admin)
 * - PATCH /api/courts/:id/deactivate - Deactivate court (admin)
 * - DELETE /api/courts/:id - Delete court (admin)
 */
router.use('/courts', courtController);

/**
 * Time slot routes
 * Handles time slot configuration and scheduling
 * 
 * Routes:
 * - POST /api/timeslots - Create time slot (admin)
 * - GET /api/timeslots - List all time slots
 * - GET /api/timeslots/date/:date - Get time slots for specific date
 * - GET /api/timeslots/day/:dayOfWeek - Get time slots for day of week
 * - PATCH /api/timeslots/:id - Update time slot (admin)
 * - DELETE /api/timeslots/:id - Delete time slot (admin)
 */
router.use('/timeslots', timeSlotController);

/**
 * Booking request routes
 * Handles booking requests (5-2 days in advance)
 * 
 * Routes:
 * - POST /api/requests - Create booking request
 * - GET /api/requests/user/:userId - Get requests by user
 * - GET /api/requests/pending - Get pending requests (admin)
 * - DELETE /api/requests/:id - Cancel booking request
 */
router.use('/requests', bookingRequestController);

/**
 * Booking routes
 * Handles direct bookings (less than 2 days in advance)
 * 
 * Routes:
 * - POST /api/bookings - Create direct booking
 * - GET /api/bookings/user/:userId - Get bookings by user
 * - GET /api/bookings/available - Get available courts
 * - DELETE /api/bookings/:id - Cancel booking
 * - PATCH /api/bookings/:id/complete - Complete booking (admin)
 */
router.use('/bookings', bookingController);

/**
 * Lottery routes
 * Handles lottery execution and results
 * 
 * Routes:
 * - POST /api/lottery/execute - Execute lottery (admin)
 * - GET /api/lottery/results/:date/:timeSlot - Get lottery results
 */
router.use('/lottery', lotteryController);

/**
 * Stats routes
 * Handles system statistics and analytics
 * 
 * Routes:
 * - GET /api/stats - Get system statistics (admin)
 * - GET /api/stats/courts - Get court usage statistics (admin)
 * - GET /api/stats/users - Get user statistics (admin)
 */
router.use('/stats', statsController);

export default router;
