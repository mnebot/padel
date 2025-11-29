import { AppError } from './AppError';

/**
 * Error thrown when a court is not found in the system
 */
export class CourtNotFoundError extends AppError {
  constructor(message: string = 'Pista no trobada') {
    super(message);
  }
}
