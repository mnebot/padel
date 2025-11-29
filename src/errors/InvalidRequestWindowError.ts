import { AppError } from './AppError';

/**
 * Error thrown when a booking request is made outside the valid window (5-2 days in advance)
 */
export class InvalidRequestWindowError extends AppError {
  constructor(message: string = 'La sol·licitud ha de fer-se entre 5 i 2 dies abans de la data desitjada') {
    super(message);
  }
}
