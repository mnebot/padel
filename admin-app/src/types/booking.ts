import type { User } from './user';
import type { Court } from './court';

export const BookingStatus = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface BookingRequest {
  id: string;
  userId: string;
  date: string;
  timeSlot: string;
  numberOfPlayers: number;
  status: BookingStatus;
  weight?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  date: string;
  timeSlot: string;
  numberOfPlayers: number;
  status: BookingStatus;
  requestId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  user?: User;
  court?: Court;
}
