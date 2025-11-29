import { AppError } from './AppError';

/**
 * Error thrown when attempting to book an inactive court
 */
export class CourtInactiveError extends AppError {
  constructor(message: string = 'La pista està inactiva i no accepta noves reserves') {
    super(message);
  }
}
