# Document de Disseny - Aplicacions Web Frontend

## Overview

Aquest document descriu el disseny de dues aplicacions web frontend per al sistema de gestió de reserves de pàdel:

1. **User App**: Aplicació per als usuaris finals (socis i no socis)
2. **Admin App**: Aplicació per als administradors del sistema

Ambdues aplicacions seran Single Page Applications (SPA) construïdes amb React i TypeScript, consumint l'API REST existent.

### Tecnologies Principals

- **Framework**: React 18+ amb TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API + Custom Hooks
- **HTTP Client**: Axios
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Form Management**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library

### Estructura de Projectes

```
frontend/
├── user-app/          # Aplicació d'usuari
│   ├── src/
│   ├── public/
│   └── package.json
└── admin-app/         # Aplicació d'administrador
    ├── src/
    ├── public/
    └── package.json
```

## Architecture

### Arquitectura General

Ambdues aplicacions seguiran una arquitectura de capes:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Components, Pages, Layouts)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Application Layer           │
│   (Hooks, Context, State Management)│
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Service Layer              │
│      (API Clients, Services)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│            API REST                 │
│    (Backend Express Server)         │
└─────────────────────────────────────┘
```


### Patrons de Disseny

1. **Container/Presentational Pattern**: Separació entre components amb lògica i components de presentació
2. **Custom Hooks Pattern**: Encapsulació de lògica reutilitzable
3. **Service Layer Pattern**: Abstracció de les crides a l'API
4. **Context Pattern**: Gestió d'estat global (autenticació, usuari actual)
5. **Compound Components**: Components composables per a UI complexa

### Flux de Dades

```
User Action → Component → Custom Hook → Service → API
                ↓                                   ↓
            UI Update ← State Update ← Response ←──┘
```

## Components and Interfaces

### Estructura de Directoris (User App)

```
user-app/src/
├── components/
│   ├── ui/                    # Components base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── booking/
│   │   ├── BookingCalendar.tsx
│   │   ├── BookingForm.tsx
│   │   ├── BookingCard.tsx
│   │   ├── BookingList.tsx
│   │   └── TimeSlotSelector.tsx
│   ├── dashboard/
│   │   ├── DashboardStats.tsx
│   │   ├── UpcomingBookings.tsx
│   │   └── PendingRequests.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── BookingsPage.tsx
│   ├── NewBookingPage.tsx
│   ├── HistoryPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   ├── api.ts              # Axios instance configuration
│   ├── authService.ts
│   ├── bookingService.ts
│   ├── bookingRequestService.ts
│   └── userService.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useBookings.ts
│   ├── useBookingRequests.ts
│   ├── useAvailability.ts
│   └── useToast.ts
├── context/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── types/
│   ├── api.ts              # API response types
│   ├── booking.ts
│   ├── user.ts
│   └── index.ts
├── utils/
│   ├── dateUtils.ts
│   ├── validationSchemas.ts
│   └── constants.ts
├── App.tsx
├── main.tsx
└── router.tsx
```


### Estructura de Directoris (Admin App)

```
admin-app/src/
├── components/
│   ├── ui/                    # Components base (shadcn/ui)
│   ├── layout/
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminLayout.tsx
│   ├── auth/
│   │   ├── AdminLoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── courts/
│   │   ├── CourtList.tsx
│   │   ├── CourtForm.tsx
│   │   └── CourtCard.tsx
│   ├── timeslots/
│   │   ├── TimeSlotList.tsx
│   │   ├── TimeSlotForm.tsx
│   │   └── TimeSlotCard.tsx
│   ├── users/
│   │   ├── UserList.tsx
│   │   ├── UserForm.tsx
│   │   ├── UserCard.tsx
│   │   └── UserFilters.tsx
│   ├── bookings/
│   │   ├── BookingCalendarView.tsx
│   │   ├── BookingListView.tsx
│   │   ├── BookingDetails.tsx
│   │   └── BookingFilters.tsx
│   ├── lottery/
│   │   ├── LotteryDashboard.tsx
│   │   ├── LotteryExecutor.tsx
│   │   └── LotteryResults.tsx
│   ├── stats/
│   │   ├── StatsOverview.tsx
│   │   ├── UsageChart.tsx
│   │   └── UserStatsTable.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── pages/
│   ├── AdminLoginPage.tsx
│   ├── AdminDashboardPage.tsx
│   ├── CourtsPage.tsx
│   ├── TimeSlotsPage.tsx
│   ├── UsersPage.tsx
│   ├── BookingsPage.tsx
│   ├── LotteryPage.tsx
│   ├── StatsPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── courtService.ts
│   ├── timeSlotService.ts
│   ├── userService.ts
│   ├── bookingService.ts
│   ├── lotteryService.ts
│   └── statsService.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useCourts.ts
│   ├── useTimeSlots.ts
│   ├── useUsers.ts
│   ├── useBookings.ts
│   ├── useLottery.ts
│   └── useToast.ts
├── context/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── types/
│   ├── api.ts
│   ├── court.ts
│   ├── timeSlot.ts
│   ├── user.ts
│   ├── booking.ts
│   └── index.ts
├── utils/
│   ├── dateUtils.ts
│   ├── validationSchemas.ts
│   └── constants.ts
├── App.tsx
├── main.tsx
└── router.tsx
```


### Interfícies Principals

#### Types Compartits

```typescript
// types/user.ts
export enum UserType {
  MEMBER = 'MEMBER',
  NON_MEMBER = 'NON_MEMBER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// types/court.ts
export interface Court {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// types/timeSlot.ts
export enum TimeSlotType {
  OFF_PEAK = 'OFF_PEAK',
  PEAK = 'PEAK'
}

export interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  type: TimeSlotType;
  createdAt: string;
  updatedAt: string;
}

// types/booking.ts
export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface BookingRequest {
  id: string;
  userId: string;
  date: string;
  timeSlot: string;
  numberOfPlayers: number;
  status: BookingStatus;
  weight?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  date: string;
  timeSlot: string;
  numberOfPlayers: number;
  status: BookingStatus;
  requestId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  user?: User;
  court?: Court;
}

// types/api.ts
export interface ApiError {
  error: string;
  message: string;
  details?: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```


## Data Models

### Context State Models

#### AuthContext

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

#### ToastContext

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}
```

### Form Models

#### BookingFormData

```typescript
interface BookingFormData {
  date: Date;
  timeSlot: string;
  courtId?: string;  // Only for direct bookings
  numberOfPlayers: number;
}
```

#### CourtFormData

```typescript
interface CourtFormData {
  name: string;
  description: string;
  isActive: boolean;
}
```

#### TimeSlotFormData

```typescript
interface TimeSlotFormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  type: TimeSlotType;
}
```

#### UserFormData

```typescript
interface UserFormData {
  name: string;
  email: string;
  type: UserType;
  password?: string;  // Only for creation
}
```

### View Models

#### AvailabilitySlot

```typescript
interface AvailabilitySlot {
  timeSlot: string;
  type: TimeSlotType;
  availableCourts: Court[];
  isAvailable: boolean;
}

interface DayAvailability {
  date: string;
  slots: AvailabilitySlot[];
  isInRequestWindow: boolean;
  isInDirectBookingWindow: boolean;
}
```

#### DashboardStats (User)

```typescript
interface UserDashboardStats {
  usageCount: number;
  upcomingBookings: Booking[];
  pendingRequests: BookingRequest[];
  recentActivity: (Booking | BookingRequest)[];
}
```

#### DashboardStats (Admin)

```typescript
interface AdminDashboardStats {
  totalActiveBookings: number;
  pendingRequests: number;
  totalUsers: number;
  totalCourts: number;
  courtUsage: {
    courtId: string;
    courtName: string;
    bookingCount: number;
  }[];
  upcomingLotteries: {
    date: string;
    requestCount: number;
  }[];
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:

- Properties 4.2 and 5.3 both test player number validation (2-4) - can be combined
- Properties 4.4, 7.3, 14.5, and 16.3 all test API error handling - can be combined
- Properties 1.4 and 8.4 both test session persistence - can be combined
- Properties 6.2, 12.2, and 17.3 all test that specific fields are displayed - can be combined into a general rendering property
- Properties 12.5, 13.2, and 17.2 all test filtering functionality - can be combined
- Properties 15.2, 15.3, and 15.4 all test notification/loading states - can be combined

### Core Properties

Property 1: Session persistence across navigation
*For any* authenticated user, navigating between pages should maintain the authentication state without requiring re-login
**Validates: Requirements 1.4, 8.4**

Property 2: Player number validation
*For any* booking or request form, the number of players field should only accept values between 2 and 4 inclusive, and reject all other values
**Validates: Requirements 4.2, 5.3**

Property 3: API error display
*For any* API call that returns an error, the system should display a user-friendly error message derived from the API response
**Validates: Requirements 4.4, 7.3, 14.5, 16.3**

Property 4: Time slot visual distinction
*For any* time slot displayed, the system should visually distinguish between OFF_PEAK and PEAK types
**Validates: Requirements 3.4**

Property 5: Required field validation
*For any* form with required fields, attempting to submit without filling all required fields should prevent submission and display field-level error messages
**Validates: Requirements 16.1, 16.2**

Property 6: Complete data rendering
*For any* entity displayed (booking, user, request), all specified fields for that entity type should be present in the rendered output
**Validates: Requirements 6.2, 12.2, 17.3**

Property 7: Filter functionality
*For any* list with filters applied, the displayed items should only include those matching all active filter criteria
**Validates: Requirements 12.5, 13.2, 17.2**

Property 8: Async operation feedback
*For any* asynchronous operation, the system should display a loading indicator while processing, and show a success or error notification upon completion
**Validates: Requirements 15.2, 15.3, 15.4**

Property 9: Time validation
*For any* time slot form, the end time must be after the start time, and the system should reject invalid time ranges
**Validates: Requirements 11.2**

Property 10: Historical data ordering
*For any* historical booking list, items should be ordered by date in descending order (most recent first)
**Validates: Requirements 17.5**


## Error Handling

### Error Handling Strategy

#### API Error Handling

```typescript
// services/api.ts
export class ApiClient {
  private handleError(error: AxiosError<ApiError>): never {
    if (error.response) {
      // Server responded with error
      const apiError = error.response.data;
      throw new AppError(
        apiError.error,
        this.translateErrorMessage(apiError.message),
        error.response.status
      );
    } else if (error.request) {
      // Request made but no response
      throw new AppError(
        'NetworkError',
        'No s\'ha pogut connectar amb el servidor. Comprova la teva connexió.',
        0
      );
    } else {
      // Something else happened
      throw new AppError(
        'UnknownError',
        'S\'ha produït un error inesperat.',
        0
      );
    }
  }

  private translateErrorMessage(message: string): string {
    const translations: Record<string, string> = {
      'User not found': 'Usuari no trobat',
      'Court not available': 'Pista no disponible',
      'Invalid number of players': 'El nombre de jugadors ha de ser entre 2 i 4',
      // ... more translations
    };
    return translations[message] || message;
  }
}
```

#### Component Error Boundaries

```typescript
// components/common/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### Form Validation Errors

```typescript
// Using Zod for validation
const bookingSchema = z.object({
  date: z.date(),
  timeSlot: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  numberOfPlayers: z.number().min(2).max(4),
  courtId: z.string().uuid().optional(),
});

// React Hook Form integration
const { handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(bookingSchema),
});
```

### Error Types

1. **Network Errors**: Connection issues, timeouts
2. **Validation Errors**: Client-side form validation failures
3. **API Errors**: Server-side errors (400, 404, 409, 500)
4. **Authentication Errors**: Unauthorized, session expired
5. **Business Logic Errors**: Court not available, invalid booking window

### Error Display

- **Toast Notifications**: For transient errors and success messages
- **Inline Form Errors**: For validation errors next to form fields
- **Error Pages**: For critical errors (404, 500)
- **Modal Dialogs**: For errors requiring user acknowledgment


## Testing Strategy

### Dual Testing Approach

The frontend applications will use both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and component behavior
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing

#### Testing Library: Vitest + React Testing Library

Unit tests will cover:

- **Component Rendering**: Verify components render correctly with given props
- **User Interactions**: Test button clicks, form submissions, navigation
- **Conditional Rendering**: Test different UI states (loading, error, success)
- **Integration Points**: Test hooks and context interactions
- **API Service Mocking**: Test service layer with mocked API responses

#### Example Unit Tests

```typescript
// components/booking/__tests__/BookingForm.test.tsx
describe('BookingForm', () => {
  it('renders form fields correctly', () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre de jugadors/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid player count', async () => {
    render(<BookingForm />);
    const input = screen.getByLabelText(/nombre de jugadors/i);
    await userEvent.type(input, '5');
    await userEvent.click(screen.getByRole('button', { name: /reservar/i }));
    expect(screen.getByText(/entre 2 i 4/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);
    // Fill form and submit
    await userEvent.click(screen.getByRole('button', { name: /reservar/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      numberOfPlayers: expect.any(Number),
    }));
  });
});
```

### Property-Based Testing

#### Testing Library: fast-check

Property-based tests will verify universal properties using fast-check to generate random test data.

Each property-based test will:
- Run a minimum of 100 iterations
- Be tagged with a comment referencing the design document property
- Use the format: `**Feature: frontend-web-padel, Property {number}: {property_text}**`

#### Example Property Tests

```typescript
// utils/__tests__/validation.property.test.ts
import fc from 'fast-check';

describe('Property Tests - Validation', () => {
  /**
   * Feature: frontend-web-padel, Property 2: Player number validation
   * For any booking or request form, the number of players field should only 
   * accept values between 2 and 4 inclusive, and reject all other values
   */
  it('validates player count correctly for all inputs', () => {
    fc.assert(
      fc.property(fc.integer(), (playerCount) => {
        const isValid = validatePlayerCount(playerCount);
        const shouldBeValid = playerCount >= 2 && playerCount <= 4;
        return isValid === shouldBeValid;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: frontend-web-padel, Property 9: Time validation
   * For any time slot form, the end time must be after the start time
   */
  it('validates time ranges correctly', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 })),
        fc.tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 })),
        ([startHour, startMin], [endHour, endMin]) => {
          const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
          
          const isValid = validateTimeRange(startTime, endTime);
          const shouldBeValid = (endHour > startHour) || (endHour === startHour && endMin > startMin);
          
          return isValid === shouldBeValid;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// components/__tests__/filtering.property.test.ts
import fc from 'fast-check';

describe('Property Tests - Filtering', () => {
  /**
   * Feature: frontend-web-padel, Property 7: Filter functionality
   * For any list with filters applied, the displayed items should only 
   * include those matching all active filter criteria
   */
  it('filters bookings correctly for any filter combination', () => {
    fc.assert(
      fc.property(
        fc.array(bookingArbitrary),
        fc.record({
          status: fc.option(fc.constantFrom('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
          courtId: fc.option(fc.uuid()),
          dateFrom: fc.option(fc.date()),
          dateTo: fc.option(fc.date()),
        }),
        (bookings, filters) => {
          const filtered = applyBookingFilters(bookings, filters);
          
          // All filtered items must match all active filters
          return filtered.every(booking => {
            if (filters.status && booking.status !== filters.status) return false;
            if (filters.courtId && booking.courtId !== filters.courtId) return false;
            if (filters.dateFrom && new Date(booking.date) < filters.dateFrom) return false;
            if (filters.dateTo && new Date(booking.date) > filters.dateTo) return false;
            return true;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// components/__tests__/rendering.property.test.ts
import fc from 'fast-check';

describe('Property Tests - Rendering', () => {
  /**
   * Feature: frontend-web-padel, Property 6: Complete data rendering
   * For any entity displayed, all specified fields should be present
   */
  it('renders all booking fields', () => {
    fc.assert(
      fc.property(bookingArbitrary, (booking) => {
        const { container } = render(<BookingCard booking={booking} />);
        const text = container.textContent || '';
        
        // All required fields must be present in rendered output
        return (
          text.includes(booking.court.name) &&
          text.includes(booking.date) &&
          text.includes(booking.timeSlot) &&
          text.includes(booking.numberOfPlayers.toString()) &&
          text.includes(booking.status)
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: frontend-web-padel, Property 4: Time slot visual distinction
   * For any time slot displayed, the system should visually distinguish 
   * between OFF_PEAK and PEAK types
   */
  it('visually distinguishes time slot types', () => {
    fc.assert(
      fc.property(
        fc.record({
          timeSlot: fc.string(),
          type: fc.constantFrom('OFF_PEAK', 'PEAK'),
        }),
        (slot) => {
          const { container } = render(<TimeSlotBadge slot={slot} />);
          
          // Different types should have different visual indicators
          const hasOffPeakClass = container.querySelector('.off-peak') !== null;
          const hasPeakClass = container.querySelector('.peak') !== null;
          
          if (slot.type === 'OFF_PEAK') {
            return hasOffPeakClass && !hasPeakClass;
          } else {
            return hasPeakClass && !hasOffPeakClass;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
});
```

### Testing Best Practices

1. **Test user behavior, not implementation details**
2. **Use semantic queries** (getByRole, getByLabelText) over test IDs
3. **Mock external dependencies** (API calls, localStorage)
4. **Test accessibility** (ARIA labels, keyboard navigation)
5. **Keep tests isolated** and independent
6. **Use property tests for validation logic** and data transformations
7. **Use unit tests for UI interactions** and component behavior


## Service Layer Design

### API Client Configuration

```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  public get<T>(url: string, params?: any): Promise<T> {
    return this.client.get<T>(url, { params }).then(res => res.data);
  }

  public post<T>(url: string, data?: any): Promise<T> {
    return this.client.post<T>(url, data).then(res => res.data);
  }

  public put<T>(url: string, data?: any): Promise<T> {
    return this.client.put<T>(url, data).then(res => res.data);
  }

  public delete<T>(url: string): Promise<T> {
    return this.client.delete<T>(url).then(res => res.data);
  }
}

export const apiClient = new ApiClient();
```

### Service Implementations

```typescript
// services/bookingService.ts
export class BookingService {
  async getBookings(userId: string): Promise<Booking[]> {
    return apiClient.get<Booking[]>(`/bookings/user/${userId}`);
  }

  async createDirectBooking(data: CreateBookingDto): Promise<Booking> {
    return apiClient.post<Booking>('/bookings', data);
  }

  async cancelBooking(bookingId: string): Promise<void> {
    return apiClient.delete(`/bookings/${bookingId}`);
  }

  async getAvailability(date: string): Promise<AvailabilitySlot[]> {
    return apiClient.get<AvailabilitySlot[]>('/bookings/availability', { date });
  }
}

export const bookingService = new BookingService();
```

```typescript
// services/bookingRequestService.ts
export class BookingRequestService {
  async getRequests(userId: string): Promise<BookingRequest[]> {
    return apiClient.get<BookingRequest[]>(`/booking-requests/user/${userId}`);
  }

  async createRequest(data: CreateBookingRequestDto): Promise<BookingRequest> {
    return apiClient.post<BookingRequest>('/booking-requests', data);
  }

  async cancelRequest(requestId: string): Promise<void> {
    return apiClient.delete(`/booking-requests/${requestId}`);
  }
}

export const bookingRequestService = new BookingRequestService();
```

## Routing Structure

### User App Routes

```typescript
// router.tsx (User App)
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'bookings',
        element: <BookingsPage />,
      },
      {
        path: 'bookings/new',
        element: <NewBookingPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

### Admin App Routes

```typescript
// router.tsx (Admin App)
const router = createBrowserRouter([
  {
    path: '/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'courts',
        element: <CourtsPage />,
      },
      {
        path: 'timeslots',
        element: <TimeSlotsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'bookings',
        element: <BookingsPage />,
      },
      {
        path: 'lottery',
        element: <LotteryPage />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

## State Management

### Authentication Context

```typescript
// context/AuthContext.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      refreshUser();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login(email, password);
      localStorage.setItem('authToken', response.token);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Custom Hooks

```typescript
// hooks/useBookings.ts
export const useBookings = (userId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingService.getBookings(userId);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = async (bookingId: string) => {
    await bookingService.cancelBooking(bookingId);
    await fetchBookings(); // Refresh list
  };

  return {
    bookings,
    isLoading,
    error,
    refetch: fetchBookings,
    cancelBooking,
  };
};
```

## UI Component Library

### Using shadcn/ui

The applications will use shadcn/ui components for consistent, accessible UI:

- **Button**: Primary actions, secondary actions, destructive actions
- **Card**: Content containers for bookings, courts, users
- **Dialog**: Modals for confirmations, forms
- **Form**: Form components with validation
- **Input**: Text inputs, number inputs, date pickers
- **Select**: Dropdowns for filters and selections
- **Table**: Data tables for lists
- **Toast**: Notifications for success/error messages
- **Badge**: Status indicators (PEAK/OFF_PEAK, booking status)
- **Calendar**: Date selection for bookings
- **Tabs**: Navigation within pages

### Tailwind CSS Configuration

```typescript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // ... more colors
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

## Deployment Considerations

### Environment Variables

```env
# .env.example
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Gestió Reserves Pàdel
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### Production Optimizations

1. **Code Splitting**: Lazy load routes and heavy components
2. **Asset Optimization**: Compress images, minify CSS/JS
3. **Caching Strategy**: Service worker for offline support
4. **CDN**: Serve static assets from CDN
5. **Error Tracking**: Integrate Sentry or similar for error monitoring

