# API Routes Configuration

This directory contains the centralized route configuration for the Padel Booking Management System.

## Overview

All API routes are centralized in `src/routes/index.ts` and mounted under the `/api` prefix in the main application.

## Route Structure

```
/api
├── /users              - User management
├── /courts             - Court management
├── /timeslots          - Time slot management
├── /requests           - Booking request management
├── /bookings           - Booking management
└── /lottery            - Lottery execution and results
```

## Available Endpoints

### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users` | Register new user | No |
| GET | `/api/users/:id` | Get user by ID | Yes (Owner/Admin) |
| PATCH | `/api/users/:id/type` | Update user type | Yes (Admin) |
| GET | `/api/users/:id/usage` | Get user usage count | Yes (Owner/Admin) |

### Court Routes (`/api/courts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/courts` | Create court | Yes (Admin) |
| GET | `/api/courts` | List active courts | No |
| GET | `/api/courts/:id` | Get court by ID | No |
| PATCH | `/api/courts/:id` | Update court | Yes (Admin) |
| PATCH | `/api/courts/:id/deactivate` | Deactivate court | Yes (Admin) |
| DELETE | `/api/courts/:id` | Delete court | Yes (Admin) |

### Time Slot Routes (`/api/timeslots`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/timeslots` | Create time slot | Yes (Admin) |
| GET | `/api/timeslots` | List all time slots | No |
| GET | `/api/timeslots/date/:date` | Get time slots for date | No |
| GET | `/api/timeslots/day/:dayOfWeek` | Get time slots for day | No |
| PATCH | `/api/timeslots/:id` | Update time slot | Yes (Admin) |
| DELETE | `/api/timeslots/:id` | Delete time slot | Yes (Admin) |

### Booking Request Routes (`/api/requests`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/requests` | Create booking request | Yes |
| GET | `/api/requests/user/:userId` | Get requests by user | Yes (Owner/Admin) |
| GET | `/api/requests/pending` | Get pending requests | Yes (Admin) |
| DELETE | `/api/requests/:id` | Cancel booking request | Yes (Owner/Admin) |

### Booking Routes (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings` | Create direct booking | Yes |
| GET | `/api/bookings/user/:userId` | Get bookings by user | Yes (Owner/Admin) |
| GET | `/api/bookings/available` | Get available courts | No |
| DELETE | `/api/bookings/:id` | Cancel booking | Yes (Owner/Admin) |
| PATCH | `/api/bookings/:id/complete` | Complete booking | Yes (Admin) |

### Lottery Routes (`/api/lottery`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/lottery/execute` | Execute lottery | Yes (Admin) |
| GET | `/api/lottery/results/:date/:timeSlot` | Get lottery results | Yes (Admin) |

## Authentication & Authorization

The system uses a header-based authentication mechanism for development purposes:

- **Authentication Header**: `X-User-Id` - Contains the UUID of the authenticated user
- **User Types**: `MEMBER` (Soci) and `NON_MEMBER` (No Soci)
- **Admin Access**: Currently, MEMBER type users have admin privileges

### Middleware

Authentication and authorization middleware are defined in `src/middleware/auth.ts`:

- `authenticate` - Verifies user authentication
- `requireAdmin` - Requires admin privileges
- `requireUser` - Requires authenticated user
- `requireOwnerOrAdmin` - Requires user to be owner or admin

**Note**: Authentication middleware is not yet applied to routes. See `src/middleware/applyAuthMiddleware.ts` for implementation guidance.

## Adding New Routes

To add new routes to the system:

1. Create a new controller in `src/controllers/`
2. Export the router from the controller
3. Import the controller in `src/routes/index.ts`
4. Register the route with `router.use('/path', controllerRouter)`
5. Add documentation to this README

Example:

```typescript
// In src/routes/index.ts
import { newController } from '../controllers/NewController';

router.use('/new-resource', newController);
```

## Error Handling

All routes use the centralized error handling middleware defined in `src/index.ts`:

- Custom application errors (extending `AppError`) return 400 status
- Validation errors return 400 status with details
- Not found errors return 404 status
- Unexpected errors return 500 status

## Testing

Route tests are located in `src/routes/__tests__/index.test.ts` and verify:

- Correct route prefixes
- Route accessibility
- 404 handling for non-existent routes
- Integration with controllers

Run route tests:

```bash
npm test -- --testPathPattern="routes/__tests__"
```

## Requirements Validation

This route configuration validates the following requirements:

- **All Requirements**: Centralized route management provides a single point of configuration for all API endpoints
- **Security**: Prepared for authentication/authorization middleware application
- **Maintainability**: Clear separation of concerns with controllers handling business logic and routes handling HTTP routing
- **Scalability**: Easy to add new routes and controllers as the system grows

## Future Enhancements

1. Apply authentication/authorization middleware to protected routes
2. Add rate limiting middleware
3. Add request logging middleware
4. Add API versioning (e.g., `/api/v1/`)
5. Add OpenAPI/Swagger documentation generation
