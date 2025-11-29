// Application constants for Admin App

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
 * Day of week labels in Catalan
 */
export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Diumenge',
  1: 'Dilluns',
  2: 'Dimarts',
  3: 'Dimecres',
  4: 'Dijous',
  5: 'Divendres',
  6: 'Dissabte',
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
  COURTS: {
    BASE: '/courts',
    BY_ID: (courtId: string) => `/courts/${courtId}`,
  },
  TIME_SLOTS: {
    BASE: '/time-slots',
    BY_ID: (timeSlotId: string) => `/time-slots/${timeSlotId}`,
  },
  USERS: {
    BASE: '/users',
    BY_ID: (userId: string) => `/users/${userId}`,
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (bookingId: string) => `/bookings/${bookingId}`,
    BY_FILTERS: '/bookings/filter',
  },
  BOOKING_REQUESTS: {
    BASE: '/booking-requests',
    BY_ID: (requestId: string) => `/booking-requests/${requestId}`,
  },
  LOTTERY: {
    EXECUTE: '/lottery/execute',
    RESULTS: '/lottery/results',
    PENDING: '/lottery/pending',
  },
  STATS: {
    OVERVIEW: '/stats/overview',
    COURT_USAGE: '/stats/court-usage',
    USER_STATS: '/stats/user-stats',
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
  FETCHING_COURTS: 'Carregant pistes...',
  CREATING_COURT: 'Creant pista...',
  UPDATING_COURT: 'Actualitzant pista...',
  DELETING_COURT: 'Eliminant pista...',
  FETCHING_TIME_SLOTS: 'Carregant franges horàries...',
  CREATING_TIME_SLOT: 'Creant franja horària...',
  UPDATING_TIME_SLOT: 'Actualitzant franja horària...',
  DELETING_TIME_SLOT: 'Eliminant franja horària...',
  FETCHING_USERS: 'Carregant usuaris...',
  CREATING_USER: 'Creant usuari...',
  UPDATING_USER: 'Actualitzant usuari...',
  FETCHING_BOOKINGS: 'Carregant reserves...',
  FETCHING_STATS: 'Carregant estadístiques...',
  EXECUTING_LOTTERY: 'Executant sorteig...',
  LOGGING_IN: 'Iniciant sessió...',
  LOADING: 'Carregant...',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'No s\'ha pogut connectar amb el servidor. Comprova la teva connexió.',
  UNAUTHORIZED: 'No tens autorització per accedir a aquest recurs.',
  COURT_NOT_FOUND: 'Pista no trobada.',
  COURT_HAS_BOOKINGS: 'No es pot eliminar la pista perquè té reserves actives.',
  TIME_SLOT_NOT_FOUND: 'Franja horària no trobada.',
  TIME_SLOT_CONFLICT: 'Hi ha un conflicte amb una franja horària existent.',
  USER_NOT_FOUND: 'Usuari no trobat.',
  EMAIL_ALREADY_EXISTS: 'Aquest correu electrònic ja està registrat.',
  BOOKING_NOT_FOUND: 'Reserva no trobada.',
  INVALID_TIME_RANGE: 'L\'hora de fi ha de ser posterior a l\'hora d\'inici.',
  INVALID_PLAYER_COUNT: 'El nombre de jugadors ha de ser entre 2 i 4.',
  LOTTERY_FAILED: 'El sorteig ha fallat. Si us plau, torna-ho a intentar.',
  GENERIC_ERROR: 'S\'ha produït un error. Si us plau, torna-ho a intentar.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  COURT_CREATED: 'Pista creada correctament.',
  COURT_UPDATED: 'Pista actualitzada correctament.',
  COURT_DELETED: 'Pista eliminada correctament.',
  COURT_ACTIVATED: 'Pista activada correctament.',
  COURT_DEACTIVATED: 'Pista desactivada correctament.',
  TIME_SLOT_CREATED: 'Franja horària creada correctament.',
  TIME_SLOT_UPDATED: 'Franja horària actualitzada correctament.',
  TIME_SLOT_DELETED: 'Franja horària eliminada correctament.',
  USER_CREATED: 'Usuari creat correctament.',
  USER_UPDATED: 'Usuari actualitzat correctament.',
  LOTTERY_EXECUTED: 'Sorteig executat correctament.',
  LOGIN_SUCCESS: 'Sessió iniciada correctament.',
} as const;

/**
 * Confirmation messages
 */
export const CONFIRMATION_MESSAGES = {
  DELETE_COURT: 'Estàs segur que vols eliminar aquesta pista?',
  DEACTIVATE_COURT: 'Estàs segur que vols desactivar aquesta pista?',
  DELETE_TIME_SLOT: 'Estàs segur que vols eliminar aquesta franja horària?',
  EXECUTE_LOTTERY: 'Estàs segur que vols executar el sorteig per aquesta data?',
  LOGOUT: 'Estàs segur que vols tancar la sessió?',
} as const;

/**
 * Navigation routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  COURTS: '/courts',
  TIME_SLOTS: '/timeslots',
  USERS: '/users',
  BOOKINGS: '/bookings',
  LOTTERY: '/lottery',
  STATS: '/stats',
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

/**
 * Time slot duration options (in minutes)
 */
export const TIME_SLOT_DURATION_OPTIONS = [
  { value: 30, label: '30 minuts' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 minuts' },
  { value: 120, label: '2 hores' },
] as const;

/**
 * Stats period options
 */
export const STATS_PERIOD_OPTIONS = [
  { value: 'week', label: 'Última setmana' },
  { value: 'month', label: 'Últim mes' },
  { value: 'year', label: 'Últim any' },
] as const;

/**
 * Chart colors for statistics
 */
export const CHART_COLORS = {
  PRIMARY: '#0ea5e9',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
} as const;

/**
 * Table row limits
 */
export const TABLE_LIMITS = {
  MIN_ROWS: 5,
  MAX_ROWS: 100,
  DEFAULT_ROWS: 10,
} as const;
