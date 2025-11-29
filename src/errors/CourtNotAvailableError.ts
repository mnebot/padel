import { AppError } from './AppError';

/**
 * Error thrown when attempting to book a court that is already occupied
 */
export class CourtNotAvailableError extends AppError {
  constructor(message: string = 'La pista no està disponible per a aquesta franja horària') {
    super(message);
  }
}
