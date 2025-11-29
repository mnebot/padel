import { AppError } from './AppError';

/**
 * Error thrown when a time slot has an end time that is not after the start time
 */
export class InvalidTimeSlotError extends AppError {
  constructor(message: string = 'L\'hora de fi ha de ser posterior a l\'hora d\'inici') {
    super(message);
  }
}
