import { Booking, BookingStatus, Court } from '@prisma/client';
import { BookingRepository, BookingData } from '../repositories/BookingRepository';
import { CourtRepository } from '../repositories/CourtRepository';
import { UsageCounterRepository } from '../repositories/UsageCounterRepository';
import { isWithinDirectBookingWindow } from '../utils/dateValidation';
import {
  InvalidDirectBookingWindowError,
  InvalidNumberOfPlayersError,
  CourtNotFoundError,
  CourtInactiveError,
  CourtNotAvailableError,
  BookingNotFoundError,
  CannotCancelCompletedBookingError
} from '../errors';

export class BookingService {
  constructor(
    private bookingRepository: BookingRepository,
    private courtRepository: CourtRepository,
    private usageCounterRepository: UsageCounterRepository
  ) {}

  /**
   * Create a direct booking (less than 2 days in advance)
   * Validates: Requirements 6.1, 6.2, 6.3, 6.4
   */
  async createDirectBooking(bookingData: BookingData): Promise<Booking> {
    // Validate temporal window (less than 2 days)
    if (!isWithinDirectBookingWindow(bookingData.date)) {
      throw new InvalidDirectBookingWindowError();
    }

    // Validate number of players (2-4)
    if (bookingData.numberOfPlayers < 2 || bookingData.numberOfPlayers > 4) {
      throw new InvalidNumberOfPlayersError();
    }

    // Validate that participantIds match numberOfPlayers
    if (bookingData.participantIds.length !== bookingData.numberOfPlayers) {
      throw new Error('Number of participant IDs must match number of players');
    }

    // Validate court exists and is active
    const court = await this.courtRepository.findById(bookingData.courtId);
    if (!court) {
      throw new CourtNotFoundError();
    }
    if (!court.isActive) {
      throw new CourtInactiveError();
    }

    // Check for conflicts (no double bookings)
    const hasConflict = await this.bookingRepository.hasConflict(
      bookingData.courtId,
      bookingData.date,
      bookingData.timeSlot
    );
    if (hasConflict) {
      throw new CourtNotAvailableError();
    }

    // Create booking with CONFIRMED status
    return this.bookingRepository.create({
      ...bookingData,
      status: BookingStatus.CONFIRMED,
    });
  }

  /**
   * Cancel a booking
   * Validates: Requirements 8.2, 8.3
   */
  async cancelBooking(bookingId: string): Promise<void> {
    if (!bookingId || bookingId.trim().length === 0) {
      throw new Error('Booking ID is required');
    }

    // Verify booking exists
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }

    // Validate: Cannot cancel completed bookings (Requirement 8.3)
    if (booking.status === BookingStatus.COMPLETED) {
      throw new CannotCancelCompletedBookingError();
    }

    // Validate: Can only cancel confirmed bookings
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new Error('Only confirmed bookings can be cancelled');
    }

    // Cancel the booking (frees up the court)
    await this.bookingRepository.cancel(bookingId);
  }

  /**
   * Complete a booking and increment usage counter
   * Validates: Requirements 4.1
   */
  async completeBooking(bookingId: string): Promise<void> {
    if (!bookingId || bookingId.trim().length === 0) {
      throw new Error('Booking ID is required');
    }

    // Verify booking exists
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }

    // Validate: Can only complete confirmed bookings
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new Error('Only confirmed bookings can be completed');
    }

    // Mark booking as completed
    await this.bookingRepository.complete(bookingId);

    // Increment usage counter for the user
    await this.usageCounterRepository.increment(booking.userId);
  }

  /**
   * Get all bookings for a specific user
   * Validates: Requirements 7.1
   */
  async getBookingsByUser(userId: string): Promise<Booking[]> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    return this.bookingRepository.findByUserId(userId);
  }

  /**
   * Get available courts for a specific date and time slot
   * Validates: Requirements 6.1
   */
  async getAvailableCourts(date: Date, timeSlot: string): Promise<Court[]> {
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

    const availableCourtIds = await this.bookingRepository.findAvailableCourts(date, timeSlot);
    
    // Get full court details for available courts
    const courts: Court[] = [];
    for (const courtId of availableCourtIds) {
      const court = await this.courtRepository.findById(courtId);
      if (court && court.isActive) {
        courts.push(court);
      }
    }

    return courts;
  }

  /**
   * Check if there's a conflict for a specific court, date, and time slot
   * Validates: Requirements 6.4, 12.1
   */
  async hasConflict(courtId: string, date: Date, timeSlot: string): Promise<boolean> {
    return this.bookingRepository.hasConflict(courtId, date, timeSlot);
  }
}
