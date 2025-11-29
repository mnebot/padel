import fc from 'fast-check';
import {
  validateRequestWindow,
  validateDirectBookingWindow,
  isWithinRequestWindow,
  isWithinDirectBookingWindow,
} from '../dateValidation';

describe('Date Validation Property-Based Tests', () => {
  // **Feature: gestio-reserves-padel, Property 4: Comportament segons finestra temporal**
  // **Validates: Requirements 2.2, 2.3, 6.1**
  describe('Property 4: Comportament segons finestra temporal', () => {
    it('dates within request window (5-2 days) should be valid for requests', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 2, max: 5 }),
          (currentDate, daysInAdvance) => {
            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() + daysInAdvance);

            // Within request window should return true
            expect(isWithinRequestWindow(targetDate, currentDate)).toBe(true);
            expect(validateRequestWindow(targetDate, currentDate)).toBe(true);

            // Should NOT be within direct booking window
            expect(isWithinDirectBookingWindow(targetDate, currentDate)).toBe(false);
            expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('dates within direct booking window (< 2 days) should be valid for direct bookings', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 0, max: 1 }),
          (currentDate, daysInAdvance) => {
            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() + daysInAdvance);

            // Within direct booking window should return true
            expect(isWithinDirectBookingWindow(targetDate, currentDate)).toBe(true);
            expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(true);

            // Should NOT be within request window
            expect(isWithinRequestWindow(targetDate, currentDate)).toBe(false);
            expect(validateRequestWindow(targetDate, currentDate)).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('dates outside both windows should be rejected', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 6, max: 365 }),
          (currentDate, daysInAdvance) => {
            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() + daysInAdvance);

            // Outside both windows
            expect(isWithinRequestWindow(targetDate, currentDate)).toBe(false);
            expect(validateRequestWindow(targetDate, currentDate)).toBe(false);
            expect(isWithinDirectBookingWindow(targetDate, currentDate)).toBe(false);
            expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('dates in the past should be rejected by both windows', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 1, max: 365 }),
          (currentDate, daysInPast) => {
            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() - daysInPast);

            // Past dates should be rejected
            expect(isWithinRequestWindow(targetDate, currentDate)).toBe(false);
            expect(validateRequestWindow(targetDate, currentDate)).toBe(false);
            expect(isWithinDirectBookingWindow(targetDate, currentDate)).toBe(false);
            expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('windows should be mutually exclusive', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 0, max: 10 }),
          (currentDate, daysInAdvance) => {
            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() + daysInAdvance);

            const inRequestWindow = isWithinRequestWindow(targetDate, currentDate);
            const inDirectWindow = isWithinDirectBookingWindow(targetDate, currentDate);

            // A date cannot be in both windows simultaneously
            expect(inRequestWindow && inDirectWindow).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('validation should be consistent regardless of time of day', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 0, max: 10 }),
          fc.integer({ min: 0, max: 23 }),
          fc.integer({ min: 0, max: 59 }),
          (baseDate, daysInAdvance, hour, minute) => {
            const currentDate = new Date(baseDate);
            currentDate.setHours(hour, minute, 0, 0);

            const targetDate = new Date(currentDate);
            targetDate.setDate(targetDate.getDate() + daysInAdvance);
            targetDate.setHours((hour + 5) % 24, (minute + 30) % 60, 0, 0);

            const requestResult1 = isWithinRequestWindow(targetDate, currentDate);
            const directResult1 = isWithinDirectBookingWindow(targetDate, currentDate);

            // Change times but keep same dates
            currentDate.setHours(0, 0, 0, 0);
            targetDate.setHours(23, 59, 59, 999);

            const requestResult2 = isWithinRequestWindow(targetDate, currentDate);
            const directResult2 = isWithinDirectBookingWindow(targetDate, currentDate);

            // Results should be the same regardless of time
            expect(requestResult1).toBe(requestResult2);
            expect(directResult1).toBe(directResult2);
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
