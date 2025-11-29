import { AppError } from './AppError';

/**
 * Error thrown when authentication fails
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message);
  }
}
