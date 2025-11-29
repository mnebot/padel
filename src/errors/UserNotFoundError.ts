import { AppError } from './AppError';

/**
 * Error thrown when a user is not found in the system
 */
export class UserNotFoundError extends AppError {
  constructor(message: string = 'Usuari no trobat') {
    super(message);
  }
}
