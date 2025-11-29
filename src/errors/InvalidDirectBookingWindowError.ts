import { AppError } from './AppError';

/**
 * Error thrown when a direct booking is attempted outside the valid window (< 2 days in advance)
 */
export class InvalidDirectBookingWindowError extends AppError {
  constructor(message: string = 'Les reserves directes només es poden fer amb menys de 2 dies d\'antelació') {
    super(message);
  }
}
