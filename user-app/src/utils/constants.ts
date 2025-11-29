// Application constants for User App

/**
 * Booking window constants
 */
export const BOOKING_WINDOWS = {
  /** Number of days in advance for direct booking window (0-1 days) */
  DIRECT_BOOKING_DAYS: 2,
  /** Minimum days in advance for request window (2+ days) */
  REQUEST_WINDOW_MIN_DAYS: 2,
} as const;

/**
 * Player count constraints
 */
export const PLAYER_CONSTRAINTS = {
  MIN: 2,
  MAX: 4,
} as const;

/**
 * Booking status labels in Catalan
 */
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Sol·licitada',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancel·lada',
} as const;

/**
 * Time slot type labels in Catalan
 */
export const TIME_SLOT_TYPE_LABELS: Record<string, string> = {
  OFF_PEAK: 'Hora Vall',
  PEAK: 'Hora Punta',
} as const;

/**
 * User type labels in Catalan
 */
export const USER_TYPE_LABELS: Record<string, string> = {
  MEMBER: 'Soci',
  NON_MEMBER: 'No Soci',
} as const;

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  DISPLAY_WITH_DAY: 'EEEE, dd/MM/yyyy',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
} as const;

/**
 * API endpoints (relative to base URL)
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    CURRENT_USER: '/auth/me',
  },
  BOOKINGS: {
    BASE: '/bookings',
    USER: (userId: string) => `/bookings/user/${userId}`,
    AVAILABILITY: '/bookings/availability',
    CANCEL: (bookingId: string) => `/bookings/${bookingId}`,
  },
  BOOKING_REQUESTS: {
    BASE: '/booking-requests',
    USER: (userId: string) => `/booking-requests/user/${userId}`,
    CANCEL: (requestId: string) => `/booking-requests/${requestId}`,
  },
  USERS: {
    BASE: '/users',
    PROFILE: (userId: string) => `/users/${userId}`,
  },
} as const;

/**
 * Toast notification durations (in milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
} as const;

/**
 * Loading states
 */
export const LOADING_MESSAGES = {
  FETCHING_BOOKINGS: 'Carregant reserves...',
  CREATING_BOOKING: 'Creant reserva...',
  CANCELLING_BOOKING: 'Cancel·lant reserva...',
  FETCHING_AVAILABILITY: 'Carregant disponibilitat...',
  LOGGING_IN: 'Iniciant sessió...',
  LOADING: 'Carregant...',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'No s\'ha pogut connectar amb el servidor. Comprova la teva connexió.',
  UNAUTHORIZED: 'No tens autorització per accedir a aquest recurs.',
  BOOKING_NOT_FOUND: 'Reserva no trobada.',
  COURT_NOT_AVAILABLE: 'La pista no està disponible.',
  INVALID_PLAYER_COUNT: 'El nombre de jugadors ha de ser entre 2 i 4.',
  INVALID_DATE: 'La data seleccionada no és vàlida.',
  GENERIC_ERROR: 'S\'ha produït un error. Si us plau, torna-ho a intentar.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Reserva creada correctament.',
  REQUEST_CREATED: 'Sol·licitud creada correctament.',
  BOOKING_CANCELLED: 'Reserva cancel·lada correctament.',
  REQUEST_CANCELLED: 'Sol·licitud cancel·lada correctament.',
  PROFILE_UPDATED: 'Perfil actualitzat correctament.',
  LOGIN_SUCCESS: 'Sessió iniciada correctament.',
} as const;

/**
 * Confirmation messages
 */
export const CONFIRMATION_MESSAGES = {
  CANCEL_BOOKING: 'Estàs segur que vols cancel·lar aquesta reserva?',
  CANCEL_REQUEST: 'Estàs segur que vols cancel·lar aquesta sol·licitud?',
  LOGOUT: 'Estàs segur que vols tancar la sessió?',
} as const;

/**
 * Navigation routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  BOOKINGS: '/bookings',
  NEW_BOOKING: '/bookings/new',
  HISTORY: '/history',
  PROFILE: '/profile',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;
