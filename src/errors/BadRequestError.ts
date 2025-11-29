import { AppError } from './AppError';

/**
 * Error thrown when request validation fails
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message);
  }
}
