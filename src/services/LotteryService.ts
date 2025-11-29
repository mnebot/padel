import { UserType, BookingRequest, BookingStatus } from '@prisma/client';
import { BookingRequestRepository } from '../repositories/BookingRequestRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { UserRepository } from '../repositories/UserRepository';
import { UsageCounterRepository } from '../repositories/UsageCounterRepository';

export interface LotteryResult {
  assigned: Assignment[];
  unassigned: BookingRequest[];
}

export interface Assignment {
  requestId: string;
  courtId: string;
  bookingId: string;
}

export class LotteryService {
  constructor(
    private bookingRequestRepository: BookingRequestRepository,
    private bookingRepository: BookingRepository,
    private userRepository: UserRepository,
    private usageCounterRepository: UsageCounterRepository
  ) {}

  /**
   * Calculate weight for a booking request based on user type and usage count
   * Formula for Members: weight = 2.0 / (1 + usageCount * 0.15)
   * Formula for Non-Members: weight = 1.0 / (1 + usageCount * 0.15)
   * Validates: Requirements 5.3, 5.4
   */
  calculateWeight(userType: UserType, usageCount: number): number {
    const baseWeight = userType === UserType.MEMBER ? 2.0 : 1.0;
    return baseWeight / (1 + usageCount * 0.15);
  }

  /**
   * Assign courts to requests using weighted random selection
   * Validates: Requirements 5.5, 5.6
   */
  async assignCourts(
    requests: BookingRequest[],
    availableCourts: string[]
  ): Promise<Assignment[]> {
    if (requests.length === 0 || availableCourts.length === 0) {
      return [];
    }

    const assignments: Assignment[] = [];
    const remainingCourts = [...availableCourts];
    const remainingRequests = [...requests];

    // Assign courts using weighted random selection
    while (remainingCourts.length > 0 && remainingRequests.length > 0) {
      // Select a request based on weights
      const selectedRequest = this.weightedRandomSelection(remainingRequests);
      
      if (!selectedRequest) {
        break;
      }

      // Assign the first available court
      const courtId = remainingCourts.shift()!;

      // Get participant IDs from the request
      const requestWithParticipants = await this.bookingRequestRepository.findById(selectedRequest.id);
      if (!requestWithParticipants) {
        continue;
      }

      const participantIds = (requestWithParticipants as any).participants?.map((p: any) => p.userId) || [];

      // Create a confirmed booking
      const booking = await this.bookingRepository.create({
        userId: selectedRequest.userId,
        courtId,
        date: selectedRequest.date,
        timeSlot: selectedRequest.timeSlot,
        numberOfPlayers: selectedRequest.numberOfPlayers,
        participantIds,
        status: BookingStatus.CONFIRMED,
        requestId: selectedRequest.id,
      });

      // Update the request status to CONFIRMED (it has been assigned)
      await this.bookingRequestRepository.updateStatus(selectedRequest.id, BookingStatus.CONFIRMED);

      assignments.push({
        requestId: selectedRequest.id,
        courtId,
        bookingId: booking.id,
      });

      // Remove the selected request from remaining requests
      const index = remainingRequests.findIndex(r => r.id === selectedRequest.id);
      if (index !== -1) {
        remainingRequests.splice(index, 1);
      }
    }

    return assignments;
  }

  /**
   * Perform weighted random selection from a list of requests
   * Uses the weight property of each request
   * Validates: Requirements 5.5
   */
  private weightedRandomSelection(requests: BookingRequest[]): BookingRequest | null {
    if (requests.length === 0) {
      return null;
    }

    // Calculate total weight
    const totalWeight = requests.reduce((sum, req) => sum + (req.weight || 0), 0);

    if (totalWeight === 0) {
      // If all weights are 0, select randomly
      return requests[Math.floor(Math.random() * requests.length)];
    }

    // Generate random number between 0 and totalWeight
    let random = Math.random() * totalWeight;

    // Select request based on cumulative weights
    for (const request of requests) {
      random -= request.weight || 0;
      if (random <= 0) {
        return request;
      }
    }

    // Fallback (should not reach here)
    return requests[requests.length - 1];
  }

  /**
   * Execute the lottery for a specific date and time slot
   * Coordinates the entire lottery process:
   * 1. Get pending requests
   * 2. Calculate weights for each request
   * 3. Get available courts
   * 4. Assign courts using weighted random selection
   * 5. Update request statuses
   * Validates: Requirements 5.1, 5.2, 5.6, 5.7
   */
  async executeLottery(date: Date, timeSlot: string): Promise<LotteryResult> {
    // Get all pending requests for this date and time slot
    const pendingRequests = await this.bookingRequestRepository.findPendingByDateAndTimeSlot(
      date,
      timeSlot
    );

    if (pendingRequests.length === 0) {
      return {
        assigned: [],
        unassigned: [],
      };
    }

    // Calculate weights for each request
    for (const request of pendingRequests) {
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        continue;
      }

      const usageCount = await this.usageCounterRepository.getCount(request.userId);
      const weight = this.calculateWeight(user.type, usageCount);

      // Update the request with calculated weight
      await this.bookingRequestRepository.updateWeight(request.id, weight);
      request.weight = weight;
    }

    // Get available courts for this date and time slot
    const availableCourts = await this.bookingRepository.findAvailableCourts(date, timeSlot);

    // Assign courts to requests
    const assignments = await this.assignCourts(pendingRequests, availableCourts);

    // Determine which requests were assigned and which were not
    const assignedRequestIds = new Set(assignments.map(a => a.requestId));
    const unassignedRequests = pendingRequests.filter(
      req => !assignedRequestIds.has(req.id)
    );

    // Update status of unassigned requests (mark as not assigned)
    // Note: In the current schema, we don't have a specific "NOT_ASSIGNED" status
    // We'll keep them as REQUESTED but they won't have a booking
    // In a real implementation, you might want to add a new status or handle this differently

    return {
      assigned: assignments,
      unassigned: unassignedRequests,
    };
  }
}
