import { BookingRequest, BookingStatus } from '@prisma/client';
import { BookingRequestRepository, BookingRequestData } from '../repositories/BookingRequestRepository';
import { validateRequestWindow } from '../utils/dateValidation';
import { InvalidRequestWindowError, InvalidNumberOfPlayersError, BookingNotFoundError } from '../errors';

export class BookingRequestService {
  constructor(private bookingRequestRepository: BookingRequestRepository) {}

  /**
   * Create a booking request with temporal window validation
   * Validates: Requirements 3.1, 3.2, 3.5
   */
  async createRequest(requestData: BookingRequestData): Promise<BookingRequest> {
    // Validate temporal window (5-2 days in advance)
    if (!validateRequestWindow(requestData.date)) {
      throw new InvalidRequestWindowError();
    }

    // Validate number of players (2-4)
    if (requestData.numberOfPlayers < 2 || requestData.numberOfPlayers > 4) {
      throw new InvalidNumberOfPlayersError();
    }

    // Validate that participantIds match numberOfPlayers
    if (requestData.participantIds.length !== requestData.numberOfPlayers) {
      throw new Error('Number of participant IDs must match number of players');
    }

    // Validate required fields
    if (!requestData.userId || requestData.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!requestData.timeSlot || requestData.timeSlot.trim().length === 0) {
      throw new Error('Time slot is required');
    }

    // Validate time slot format (HH:mm)
    const timeSlotRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeSlotRegex.test(requestData.timeSlot)) {
      throw new Error('Time slot must be in HH:mm format');
    }

    // Create request with REQUESTED status (no court assigned)
    return this.bookingRequestRepository.create({
      ...requestData,
      status: BookingStatus.REQUESTED,
    });
  }

  /**
   * Cancel a booking request
   * Validates: Requirements 8.1
   */
  async cancelRequest(requestId: string): Promise<void> {
    if (!requestId || requestId.trim().length === 0) {
      throw new Error('Request ID is required');
    }

    // Verify request exists
    const request = await this.bookingRequestRepository.findById(requestId);
    if (!request) {
      throw new BookingNotFoundError('Sol·licitud de reserva no trobada');
    }

    // Check if request can be cancelled (only REQUESTED status can be cancelled)
    if (request.status !== BookingStatus.REQUESTED) {
      throw new Error('Only pending requests can be cancelled');
    }

    // Delete the request (removes it from lottery)
    await this.bookingRequestRepository.delete(requestId);
  }

  /**
   * Get all requests for a specific user
   * Validates: Requirements 3.4
   */
  async getRequestsByUser(userId: string): Promise<BookingRequest[]> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    return this.bookingRequestRepository.findByUserId(userId);
  }

  /**
   * Get all pending requests for a specific date and time slot
   * Validates: Requirements 3.5
   */
  async getPendingRequestsForDate(date: Date, timeSlot: string): Promise<BookingRequest[]> {
    if (!date) {
      throw new Error('Date is required');
    }

    if (!timeSlot || timeSlot.trim().length === 0) {
      throw new Error('Time slot is required');
    }

    // Validate time slot format (HH:mm)
    const timeSlotRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeSlotRegex.test(timeSlot)) {
      throw new Error('Time slot must be in HH:mm format');
    }

    return this.bookingRequestRepository.findPendingByDateAndTimeSlot(date, timeSlot);
  }
}
