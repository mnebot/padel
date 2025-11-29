import { AppError } from './AppError';

/**
 * Error thrown when attempting to delete a court that has active bookings
 */
export class CourtHasActiveBookingsError extends AppError {
  constructor(message: string = 'No es pot eliminar una pista amb reserves actives') {
    super(message);
  }
}
