import { AppError } from './AppError';

/**
 * Error thrown when the number of players is not between 2 and 4
 */
export class InvalidNumberOfPlayersError extends AppError {
  constructor(message: string = 'El nombre de jugadors ha de ser entre 2 i 4') {
    super(message);
  }
}
