import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  userArbitrary,
  courtArbitrary,
  bookingArbitrary,
  bookingRequestArbitrary,
  timeSlotArbitrary,
  playerCountArbitrary,
  timeStringArbitrary,
} from './arbitraries';

/**
 * Tests to verify that our arbitraries generate valid data
 * These tests ensure the arbitraries themselves are working correctly
 */

describe('Arbitraries - Data Generation', () => {
  it('generates valid user objects', () => {
    fc.assert(
      fc.property(userArbitrary, (user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('type');
        expect(user).toHaveProperty('usageCount');
        expect(['MEMBER', 'NON_MEMBER']).toContain(user.type);
        expect(user.usageCount).toBeGreaterThanOrEqual(0);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('generates valid court objects', () => {
    fc.assert(
      fc.property(courtArbitrary, (court) => {
        expect(court).toHaveProperty('id');
        expect(court).toHaveProperty('name');
        expect(court).toHaveProperty('description');
        expect(court).toHaveProperty('isActive');
        expect(typeof court.isActive).toBe('boolean');
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('generates valid booking objects', () => {
    fc.assert(
      fc.property(bookingArbitrary, (booking) => {
        expect(booking).toHaveProperty('id');
        expect(booking).toHaveProperty('userId');
        expect(booking).toHaveProperty('courtId');
        expect(booking).toHaveProperty('date');
        expect(booking).toHaveProperty('timeSlot');
        expect(booking).toHaveProperty('numberOfPlayers');
        expect(booking).toHaveProperty('status');
        expect(['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).toContain(booking.status);
        expect(booking.numberOfPlayers).toBeGreaterThanOrEqual(2);
        expect(booking.numberOfPlayers).toBeLessThanOrEqual(4);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('generates valid booking request objects', () => {
    fc.assert(
      fc.property(bookingRequestArbitrary, (request) => {
        expect(request).toHaveProperty('id');
        expect(request).toHaveProperty('userId');
        expect(request).toHaveProperty('date');
        expect(request).toHaveProperty('timeSlot');
        expect(request).toHaveProperty('numberOfPlayers');
        expect(request.numberOfPlayers).toBeGreaterThanOrEqual(2);
        expect(request.numberOfPlayers).toBeLessThanOrEqual(4);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('generates valid time slot objects', () => {
    fc.assert(
      fc.property(timeSlotArbitrary, (timeSlot) => {
        expect(timeSlot).toHaveProperty('id');
        expect(timeSlot).toHaveProperty('dayOfWeek');
        expect(timeSlot).toHaveProperty('startTime');
        expect(timeSlot).toHaveProperty('endTime');
        expect(timeSlot).toHaveProperty('type');
        expect(timeSlot.dayOfWeek).toBeGreaterThanOrEqual(0);
        expect(timeSlot.dayOfWeek).toBeLessThanOrEqual(6);
        expect(['OFF_PEAK', 'PEAK']).toContain(timeSlot.type);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('generates valid player counts (2-4)', () => {
    fc.assert(
      fc.property(playerCountArbitrary, (count) => {
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThanOrEqual(4);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('generates valid time strings (HH:MM format)', () => {
    fc.assert(
      fc.property(timeStringArbitrary, (time) => {
        expect(time).toMatch(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/);
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
