import {
  validateRequestWindow,
  validateDirectBookingWindow,
  isWithinRequestWindow,
  isWithinDirectBookingWindow,
} from '../dateValidation';

describe('Date Validation Utilities', () => {
  describe('validateRequestWindow', () => {
    it('should accept date 5 days in advance', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-06T10:00:00');
      expect(validateRequestWindow(targetDate, currentDate)).toBe(true);
    });

    it('should accept date 3 days in advance', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-04T10:00:00');
      expect(validateRequestWindow(targetDate, currentDate)).toBe(true);
    });

    it('should accept date 2 days in advance', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-03T10:00:00');
      expect(validateRequestWindow(targetDate, currentDate)).toBe(true);
    });

    it('should reject date 6 days in advance', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-07T10:00:00');
      expect(validateRequestWindow(targetDate, currentDate)).toBe(false);
    });

    it('should reject date 1 day in advance', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-02T10:00:00');
      expect(validateRequestWindow(targetDate, currentDate)).toBe(false);
    });

    it('should reject date in the past', () => {
      const currentDate = new Date('2024-01-05T10:00:00');
      const targetDate = new Date('2024-01-01T10:00:00');
      expect(validateRequestWindow(targetDate, currentDate)).toBe(false);
    });
  });

  describe('validateDirectBookingWindow', () => {
    it('should accept date 1 day in advance', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-02T10:00:00');
      expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(true);
    });

    it('should accept date same day', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-01T18:00:00');
      expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(true);
    });

    it('should reject date 2 days in advance', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-03T10:00:00');
      expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(false);
    });

    it('should reject date 3 days in advance', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      const targetDate = new Date('2024-01-04T10:00:00');
      expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(false);
    });

    it('should reject date in the past', () => {
      const currentDate = new Date('2024-01-05T10:00:00');
      const targetDate = new Date('2024-01-01T10:00:00');
      expect(validateDirectBookingWindow(targetDate, currentDate)).toBe(false);
    });
  });

  describe('isWithinRequestWindow', () => {
    it('should return true for dates within 5-2 days', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      
      expect(isWithinRequestWindow(new Date('2024-01-03T10:00:00'), currentDate)).toBe(true); // 2 days
      expect(isWithinRequestWindow(new Date('2024-01-04T10:00:00'), currentDate)).toBe(true); // 3 days
      expect(isWithinRequestWindow(new Date('2024-01-05T10:00:00'), currentDate)).toBe(true); // 4 days
      expect(isWithinRequestWindow(new Date('2024-01-06T10:00:00'), currentDate)).toBe(true); // 5 days
    });

    it('should return false for dates outside the window', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      
      expect(isWithinRequestWindow(new Date('2024-01-02T10:00:00'), currentDate)).toBe(false); // 1 day
      expect(isWithinRequestWindow(new Date('2024-01-07T10:00:00'), currentDate)).toBe(false); // 6 days
    });
  });

  describe('isWithinDirectBookingWindow', () => {
    it('should return true for dates less than 2 days', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      
      expect(isWithinDirectBookingWindow(new Date('2024-01-01T18:00:00'), currentDate)).toBe(true); // same day
      expect(isWithinDirectBookingWindow(new Date('2024-01-02T10:00:00'), currentDate)).toBe(true); // 1 day
    });

    it('should return false for dates 2 days or more', () => {
      const currentDate = new Date('2024-01-01T10:00:00');
      
      expect(isWithinDirectBookingWindow(new Date('2024-01-03T10:00:00'), currentDate)).toBe(false); // 2 days
      expect(isWithinDirectBookingWindow(new Date('2024-01-04T10:00:00'), currentDate)).toBe(false); // 3 days
    });
  });

  describe('Edge cases', () => {
    it('should handle dates with different times correctly', () => {
      const currentDate = new Date('2024-01-01T23:59:59');
      const targetDate = new Date('2024-01-03T00:00:01');
      
      // Should be 2 days difference (normalized to midnight)
      expect(isWithinRequestWindow(targetDate, currentDate)).toBe(true);
    });

    it('should handle month boundaries', () => {
      const currentDate = new Date('2024-01-30T10:00:00');
      const targetDate = new Date('2024-02-02T10:00:00');
      
      // 3 days difference
      expect(isWithinRequestWindow(targetDate, currentDate)).toBe(true);
    });

    it('should handle year boundaries', () => {
      const currentDate = new Date('2024-12-30T10:00:00');
      const targetDate = new Date('2025-01-02T10:00:00');
      
      // 3 days difference
      expect(isWithinRequestWindow(targetDate, currentDate)).toBe(true);
    });
  });
});
