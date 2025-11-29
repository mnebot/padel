# Authentication and Authorization Middleware

This directory contains middleware for authentication and authorization in the Gestió de Reserves de Pàdel application.

## Overview

The authentication system uses a simple header-based approach where clients send a `X-User-Id` header with each request. In a production environment, this would be replaced with JWT tokens or session-based authentication.

## Middleware Functions

### `authenticate`

Verifies that the user is authenticated by checking the `X-User-Id` header and validating the user exists in the database.

**Usage:**
```typescript
import { authenticate } from './middleware/auth';

router.get('/protected', authenticate, (req: AuthenticatedRequest, res) => {
  // req.user is now available
  res.json({ user: req.user });
});
```

### `requireUser`

Ensures the request has an authenticated user. Should be used after `authenticate` middleware.

**Usage:**
```typescript
import { authenticate, requireUser } from './middleware/auth';

router.get('/user-only', authenticate, requireUser, (req, res) => {
  // Only authenticated users can access this route
});
```

### `requireAdmin`

Ensures the authenticated user has admin privileges (MEMBER type users are considered admins).

**Usage:**
```typescript
import { authenticate, requireAdmin } from './middleware/auth';

router.post('/admin-only', authenticate, requireAdmin, (req, res) => {
  // Only admin users can access this route
});
```

### `requireOwnerOrAdmin`

Ensures the authenticated user is either the owner of the resource or an admin.

**Usage:**
```typescript
import { authenticate, requireOwnerOrAdmin } from './middleware/auth';

router.get('/users/:userId/bookings', 
  authenticate, 
  requireOwnerOrAdmin('userId'), 
  (req, res) => {
    // User can only access their own bookings unless they're an admin
  }
);
```

## Example Integration

Here's how to apply middleware to different routes based on security requirements:

```typescript
import { Router } from 'express';
import { authenticate, requireAdmin, requireOwnerOrAdmin } from './middleware/auth';

const router = Router();

// Public route - no authentication required
router.get('/courts', courtController.getActiveCourts);

// User route - requires authentication
router.post('/bookings', authenticate, bookingController.createBooking);

// Owner or admin route - user can only access their own data
router.get('/users/:userId/bookings', 
  authenticate, 
  requireOwnerOrAdmin('userId'),
  bookingController.getUserBookings
);

// Admin-only route
router.patch('/users/:id/type', 
  authenticate, 
  requireAdmin, 
  userController.updateUserType
);
```

## Routes That Should Use Middleware

### Admin-Only Routes
- `PATCH /api/users/:id/type` - Update user type
- `POST /api/courts` - Create court
- `PATCH /api/courts/:id` - Update court
- `DELETE /api/courts/:id` - Delete court
- `PATCH /api/courts/:id/deactivate` - Deactivate court
- `POST /api/timeslots` - Create time slot
- `PATCH /api/timeslots/:id` - Update time slot
- `DELETE /api/timeslots/:id` - Delete time slot
- `POST /api/lottery/execute` - Execute lottery
- `PATCH /api/bookings/:id/complete` - Complete booking

### User Routes (Owner or Admin)
- `GET /api/users/:id` - Get user (own data or admin)
- `GET /api/users/:id/usage` - Get usage count (own data or admin)
- `GET /api/bookings/user/:userId` - Get user bookings (own data or admin)
- `GET /api/requests/user/:userId` - Get user requests (own data or admin)
- `DELETE /api/bookings/:id` - Cancel booking (owner or admin)
- `DELETE /api/requests/:id` - Cancel request (owner or admin)

### Authenticated User Routes
- `POST /api/requests` - Create booking request
- `POST /api/bookings` - Create direct booking

### Public Routes (No Authentication)
- `GET /api/courts` - List active courts
- `GET /api/timeslots` - List time slots
- `GET /api/bookings/available` - Get available courts
- `POST /api/users` - Register user (public registration)

## Testing

To test authenticated routes, include the `X-User-Id` header in your requests:

```bash
curl -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
     http://localhost:3000/api/bookings/user/123e4567-e89b-12d3-a456-426614174000
```

## Security Considerations

**Current Implementation:**
- Uses simple header-based authentication
- User ID is sent in plain text
- No encryption or token validation

**Production Recommendations:**
1. Implement JWT-based authentication
2. Use HTTPS for all communications
3. Add rate limiting to prevent brute force attacks
4. Implement proper session management
5. Add CSRF protection
6. Consider OAuth2 for third-party integrations
7. Add audit logging for sensitive operations
8. Implement proper password hashing (bcrypt, argon2)
9. Add multi-factor authentication for admin accounts
10. Implement proper role-based access control (RBAC)

## Future Enhancements

- Add JWT token generation and validation
- Implement refresh tokens
- Add password-based authentication
- Create separate admin role instead of using MEMBER type
- Add permission-based authorization
- Implement API key authentication for system-to-system calls
