export const TimeSlotType = {
  OFF_PEAK: 'OFF_PEAK',
  PEAK: 'PEAK'
} as const;

export type TimeSlotType = typeof TimeSlotType[keyof typeof TimeSlotType];

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
