import { AppError } from './AppError';

/**
 * Error thrown when attempting to cancel a booking that has already been completed
 */
export class CannotCancelCompletedBookingError extends AppError {
  constructor(message: string = 'No es pot cancel·lar una reserva ja completada') {
    super(message);
  }
}
