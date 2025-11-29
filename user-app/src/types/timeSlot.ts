// TimeSlot types for the User App

export type TimeSlotType = 'OFF_PEAK' | 'PEAK';

export const TimeSlotType = {
  OFF_PEAK: 'OFF_PEAK' as const,
  PEAK: 'PEAK' as const,
};

export interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  type: TimeSlotType;
  createdAt: string;
  updatedAt: string;
}
