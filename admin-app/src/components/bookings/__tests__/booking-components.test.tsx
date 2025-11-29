import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingDetails } from '../BookingDetails';
import { BookingListView } from '../BookingListView';
import type { Booking } from '@/types/booking';

describe('Booking Components', () => {
  const mockBooking: Booking = {
    id: '1',
    userId: 'user-1',
    courtId: 'court-1',
    date: '2024-01-15',
    timeSlot: '10:00-11:00',
    numberOfPlayers: 4,
    status: 'CONFIRMED',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    court: {
      id: 'court-1',
      name: 'Pista 1',
      description: 'Pista principal',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      type: 'MEMBER',
      usageCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  };

  describe('BookingDetails', () => {
    it('renders booking details correctly', () => {
      render(<BookingDetails booking={mockBooking} />);
      
      expect(screen.getByText('Detalls de la Reserva')).toBeInTheDocument();
      expect(screen.getByText('Pista 1')).toBeInTheDocument();
      expect(screen.getByText('10:00-11:00')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('displays status badge', () => {
      render(<BookingDetails booking={mockBooking} />);
      
      expect(screen.getByText('Confirmada')).toBeInTheDocument();
    });
  });

  describe('BookingListView', () => {
    it('renders empty state when no bookings', () => {
      render(<BookingListView bookings={[]} />);
      
      expect(screen.getByText(/No s'han trobat reserves/i)).toBeInTheDocument();
    });

    it('renders booking list correctly', () => {
      render(<BookingListView bookings={[mockBooking]} />);
      
      expect(screen.getByText('Pista 1')).toBeInTheDocument();
      expect(screen.getByText('10:00-11:00')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('renders multiple bookings', () => {
      const mockBooking2: Booking = {
        ...mockBooking,
        id: '2',
        timeSlot: '11:00-12:00',
      };

      render(<BookingListView bookings={[mockBooking, mockBooking2]} />);
      
      expect(screen.getByText('10:00-11:00')).toBeInTheDocument();
      expect(screen.getByText('11:00-12:00')).toBeInTheDocument();
    });
  });
});
