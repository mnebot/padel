/**
 * Date validation utilities for booking system
 * 
 * Request Window: 5 to 2 days in advance
 * Direct Booking Window: Less than 2 days in advance
 */

/**
 * Validates if a date is within the request window (5 to 2 days in advance)
 * @param targetDate - The date to validate
 * @param currentDate - The current date (defaults to now)
 * @returns true if the date is within 5 to 2 days in advance
 */
export function validateRequestWindow(targetDate: Date, currentDate: Date = new Date()): boolean {
  return isWithinRequestWindow(targetDate, currentDate);
}

/**
 * Validates if a date is within the direct booking window (less than 2 days in advance)
 * @param targetDate - The date to validate
 * @param currentDate - The current date (defaults to now)
 * @returns true if the date is less than 2 days in advance
 */
export function validateDirectBookingWindow(targetDate: Date, currentDate: Date = new Date()): boolean {
  return isWithinDirectBookingWindow(targetDate, currentDate);
}

/**
 * Checks if a date is within the request window (5 to 2 days in advance)
 * @param targetDate - The date to check
 * @param currentDate - The current date (defaults to now)
 * @returns true if the date is within the request window
 */
export function isWithinRequestWindow(targetDate: Date, currentDate: Date = new Date()): boolean {
  const daysDifference = getDaysDifference(currentDate, targetDate);
  return daysDifference >= 2 && daysDifference <= 5;
}

/**
 * Checks if a date is within the direct booking window (less than 2 days in advance)
 * @param targetDate - The date to check
 * @param currentDate - The current date (defaults to now)
 * @returns true if the date is within the direct booking window
 */
export function isWithinDirectBookingWindow(targetDate: Date, currentDate: Date = new Date()): boolean {
  const daysDifference = getDaysDifference(currentDate, targetDate);
  return daysDifference >= 0 && daysDifference < 2;
}

/**
 * Calculates the difference in days between two dates
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The number of days between the dates (can be negative if endDate is before startDate)
 */
function getDaysDifference(startDate: Date, endDate: Date): number {
  // Normalize dates to UTC midnight to avoid DST issues
  const start = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  const diffInMs = end - start;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  return diffInDays;
}
