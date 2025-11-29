// Booking types for the User App

import type { User } from './user';
import type { Court } from './court';

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const BookingStatus = {
  REQUESTED: 'REQUESTED' as const,
  CONFIRMED: 'CONFIRMED' as const,
  COMPLETED: 'COMPLETED' as const,
  CANCELLED: 'CANCELLED' as const,
};

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
