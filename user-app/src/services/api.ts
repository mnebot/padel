import axios, { type AxiosInstance, type AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ApiError {
  error: string;
  message: string;
  details?: any[];
}

class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

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

  private handleError(error: AxiosError<ApiError>): AppError {
    if (error.response) {
      // Server responded with error
      const apiError = error.response.data;
      return new AppError(
        apiError.error,
        this.translateErrorMessage(apiError.message),
        error.response.status
      );
    } else if (error.request) {
      // Request made but no response
      return new AppError(
        'NetworkError',
        'No s\'ha pogut connectar amb el servidor. Comprova la teva connexió.',
        0
      );
    } else {
      // Something else happened
      return new AppError(
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
      'Court not found': 'Pista no trobada',
      'Invalid number of players': 'El nombre de jugadors ha de ser entre 2 i 4',
      'Booking not found': 'Reserva no trobada',
      'Cannot cancel completed booking': 'No es pot cancel·lar una reserva completada',
      'Court is inactive': 'La pista està inactiva',
      'Invalid time slot': 'Franja horària no vàlida',
      'Invalid request window': 'Finestra de sol·licitud no vàlida',
      'Invalid direct booking window': 'Finestra de reserva directa no vàlida',
      'Unauthorized': 'No autoritzat',
      'Invalid credentials': 'Credencials no vàlides',
      'Email already exists': 'L\'email ja existeix',
      'Validation error': 'Error de validació',
    };
    return translations[message] || message;
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
