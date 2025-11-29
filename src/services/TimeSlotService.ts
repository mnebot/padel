import { TimeSlot } from '@prisma/client';
import { TimeSlotRepository, TimeSlotData } from '../repositories/TimeSlotRepository';
import { InvalidTimeSlotError } from '../errors';

export class TimeSlotService {
  constructor(private timeSlotRepository: TimeSlotRepository) {}

  async createTimeSlot(timeSlotData: TimeSlotData): Promise<TimeSlot> {
    // Validate that endTime is after startTime
    if (timeSlotData.endTime <= timeSlotData.startTime) {
      throw new InvalidTimeSlotError();
    }
    
    return this.timeSlotRepository.create(timeSlotData);
  }

  async getTimeSlotById(timeSlotId: string): Promise<TimeSlot | null> {
    return this.timeSlotRepository.findById(timeSlotId);
  }

  async updateTimeSlot(timeSlotId: string, timeSlotData: Partial<TimeSlotData>): Promise<TimeSlot> {
    // Validate that endTime is after startTime if both are provided
    if (timeSlotData.startTime && timeSlotData.endTime) {
      if (timeSlotData.endTime <= timeSlotData.startTime) {
        throw new InvalidTimeSlotError();
      }
    }
    
    return this.timeSlotRepository.update(timeSlotId, timeSlotData);
  }

  async getTimeSlotsForDate(date: Date): Promise<TimeSlot[]> {
    // Get day of week from date (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay();
    return this.timeSlotRepository.findByDayOfWeek(dayOfWeek);
  }

  async getTimeSlotsForDayOfWeek(dayOfWeek: number): Promise<TimeSlot[]> {
    return this.timeSlotRepository.findByDayOfWeek(dayOfWeek);
  }

  async deleteTimeSlot(timeSlotId: string): Promise<void> {
    await this.timeSlotRepository.delete(timeSlotId);
  }
}
