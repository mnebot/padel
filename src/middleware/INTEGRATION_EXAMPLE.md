# Integration Example: Applying Authentication Middleware

This document shows exactly how to integrate the authentication middleware into the existing controllers.

## Step 1: Import Middleware in Controllers

Add the following import to each controller file that needs authentication:

```typescript
import { authenticate, requireAdmin, requireOwnerOrAdmin, AuthenticatedRequest } from '../middleware/auth';
```

## Step 2: Apply Middleware to Routes

### Example 1: UserController.ts

```typescript
// Before (no authentication):
router.patch(
  '/:id/type',
  [validations...],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    // handler code
  }
);

// After (with admin authentication):
router.patch(
  '/:id/type',
  authenticate,              // Add authentication
  requireAdmin,              // Add admin authorization
  [validations...],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // handler code - req.user is now available
  }
);
```

### Example 2: BookingController.ts

```typescript
// Public route - no changes needed
router.get(
  '/available',
  [validations...],
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    // handler code
  }
);

// Authenticated route
router.post(
  '/',
  authenticate,              // Add authentication
  [validations...],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // handler code - req.user is now available
  }
);

// Owner or admin route
router.get(
  '/user/:userId',
  authenticate,                      // Add authentication
  requireOwnerOrAdmin('userId'),     // Add owner/admin check
  [validations...],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // handler code - req.user is now available
  }
);

// Admin-only route
router.patch(
  '/:id/complete',
  authenticate,              // Add authentication
  requireAdmin,              // Add admin authorization
  [validations...],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // handler code - req.user is now available
  }
);
```

### Example 3: CourtController.ts

```typescript
// Public route - no changes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  // handler code
});

// Admin-only routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  [validations...],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // handler code
  }
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  [validations...],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // handler code
  }
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [validations...],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // handler code
  }
);
```

## Complete Route Protection Matrix

| Route | Method | Middleware | Notes |
|-------|--------|-----------|-------|
| `/api/users` | POST | None | Public registration |
| `/api/users/:id` | GET | `authenticate`, `requireOwnerOrAdmin('id')` | Own data or admin |
| `/api/users/:id/type` | PATCH | `authenticate`, `requireAdmin` | Admin only |
| `/api/users/:id/usage` | GET | `authenticate`, `requireOwnerOrAdmin('id')` | Own data or admin |
| `/api/courts` | GET | None | Public |
| `/api/courts` | POST | `authenticate`, `requireAdmin` | Admin only |
| `/api/courts/:id` | GET | None | Public |
| `/api/courts/:id` | PATCH | `authenticate`, `requireAdmin` | Admin only |
| `/api/courts/:id` | DELETE | `authenticate`, `requireAdmin` | Admin only |
| `/api/courts/:id/deactivate` | PATCH | `authenticate`, `requireAdmin` | Admin only |
| `/api/timeslots` | GET | None | Public |
| `/api/timeslots` | POST | `authenticate`, `requireAdmin` | Admin only |
| `/api/timeslots/:id` | PATCH | `authenticate`, `requireAdmin` | Admin only |
| `/api/timeslots/:id` | DELETE | `authenticate`, `requireAdmin` | Admin only |
| `/api/timeslots/date/:date` | GET | None | Public |
| `/api/timeslots/day/:dayOfWeek` | GET | None | Public |
| `/api/requests` | POST | `authenticate` | Authenticated users |
| `/api/requests/user/:userId` | GET | `authenticate`, `requireOwnerOrAdmin('userId')` | Own data or admin |
| `/api/requests/pending` | GET | `authenticate`, `requireAdmin` | Admin only |
| `/api/requests/:id` | DELETE | `authenticate`, check ownership in handler | Owner or admin |
| `/api/bookings` | POST | `authenticate` | Authenticated users |
| `/api/bookings/user/:userId` | GET | `authenticate`, `requireOwnerOrAdmin('userId')` | Own data or admin |
| `/api/bookings/available` | GET | None | Public |
| `/api/bookings/:id` | DELETE | `authenticate`, check ownership in handler | Owner or admin |
| `/api/bookings/:id/complete` | PATCH | `authenticate`, `requireAdmin` | Admin only |
| `/api/lottery/execute` | POST | `authenticate`, `requireAdmin` | Admin only |
| `/api/lottery/results/:date/:timeSlot` | GET | `authenticate`, `requireAdmin` | Admin only |

## Step 3: Update Type Definitions

Change `Request` to `AuthenticatedRequest` in handlers that use authentication:

```typescript
// Before
async (req: Request, res: Response, next: NextFunction) => {

// After
async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Now you can access req.user
  const userId = req.user?.id;
```

## Step 4: Use Authenticated User Information

Once authenticated, you can access user information:

```typescript
router.post(
  '/bookings',
  authenticate,
  [validations...],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Access authenticated user
      const authenticatedUserId = req.user?.id;
      const userType = req.user?.type;
      
      // Use in business logic
      const booking = await bookingService.createDirectBooking({
        userId: authenticatedUserId,
        ...req.body
      });
      
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }
);
```

## Step 5: Testing with Authentication

When testing authenticated routes, include the `X-User-Id` header:

```bash
# Create a booking (authenticated)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "courtId": "...",
    "date": "2024-01-15",
    "timeSlot": "10:00",
    "numberOfPlayers": 4
  }'

# Update user type (admin only)
curl -X PATCH http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000/type \
  -H "Content-Type: application/json" \
  -H "X-User-Id: admin-user-id" \
  -d '{"type": "MEMBER"}'
```

## Notes

1. **Middleware Order Matters**: Always apply middleware in this order:
   - `authenticate` (first)
   - `requireAdmin` or `requireOwnerOrAdmin` (second)
   - Validation middleware (third)
   - Handler (last)

2. **Type Safety**: Use `AuthenticatedRequest` instead of `Request` for authenticated routes

3. **Error Handling**: The middleware handles authentication errors automatically

4. **Production**: Replace header-based auth with JWT tokens before deploying to production
