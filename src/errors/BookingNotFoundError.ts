import { AppError } from './AppError';

/**
 * Error thrown when a booking is not found in the system
 */
export class BookingNotFoundError extends AppError {
  constructor(message: string = 'Reserva no trobada') {
    super(message);
  }
}
