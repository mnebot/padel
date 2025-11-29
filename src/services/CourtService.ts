import { Court } from '@prisma/client';
import { CourtRepository, CourtData } from '../repositories/CourtRepository';
import { CourtHasActiveBookingsError, CourtNotFoundError } from '../errors';

export class CourtService {
  constructor(private courtRepository: CourtRepository) {}

  async createCourt(courtData: CourtData): Promise<Court> {
    return this.courtRepository.create(courtData);
  }

  async getCourtById(courtId: string): Promise<Court | null> {
    return this.courtRepository.findById(courtId);
  }

  async updateCourt(courtId: string, courtData: Partial<CourtData>): Promise<Court> {
    const court = await this.courtRepository.findById(courtId);
    if (!court) {
      throw new CourtNotFoundError();
    }
    return this.courtRepository.update(courtId, courtData);
  }

  async deactivateCourt(courtId: string): Promise<Court> {
    const court = await this.courtRepository.findById(courtId);
    if (!court) {
      throw new CourtNotFoundError();
    }
    return this.courtRepository.deactivate(courtId);
  }

  async deleteCourt(courtId: string): Promise<void> {
    const court = await this.courtRepository.findById(courtId);
    if (!court) {
      throw new CourtNotFoundError();
    }
    const hasBookings = await this.courtRepository.hasActiveBookings(courtId);
    if (hasBookings) {
      throw new CourtHasActiveBookingsError();
    }
    await this.courtRepository.delete(courtId);
  }

  async getActiveCourts(): Promise<Court[]> {
    return this.courtRepository.findActiveCourts();
  }

  async hasActiveBookings(courtId: string): Promise<boolean> {
    return this.courtRepository.hasActiveBookings(courtId);
  }
}
