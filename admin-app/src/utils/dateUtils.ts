// Date utility functions for Admin App

import { format, parseISO, addDays, differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { ca } from 'date-fns/locale';

/**
 * Format a date string or Date object to a readable format
 * @param date - Date string (ISO) or Date object
 * @param formatStr - Format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ca });
};

/**
 * Format a date with time
 * @param date - Date string (ISO) or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Format a date to display day of week
 * @param date - Date string (ISO) or Date object
 * @returns Formatted date with day of week
 */
export const formatDateWithDay = (date: string | Date): string => {
  return formatDate(date, 'EEEE, dd/MM/yyyy');
};

/**
 * Format time slot string (HH:mm format)
 * @param timeSlot - Time slot string
 * @returns Formatted time slot
 */
export const formatTimeSlot = (timeSlot: string): string => {
  return timeSlot;
};

/**
 * Parse ISO date string to Date object
 * @param dateStr - ISO date string
 * @returns Date object
 */
export const parseDate = (dateStr: string): Date => {
  return parseISO(dateStr);
};

/**
 * Get today's date at start of day
 * @returns Date object for today at 00:00:00
 */
export const getToday = (): Date => {
  return startOfDay(new Date());
};

/**
 * Get the number of days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days difference
 */
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d1, d2);
};

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns true if date is before today
 */
export const isPastDate = (date: Date | string): boolean => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const today = getToday();
  return isBefore(startOfDay(targetDate), today);
};

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns true if date is after today
 */
export const isFutureDate = (date: Date | string): boolean => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const today = getToday();
  return isAfter(startOfDay(targetDate), today);
};

/**
 * Convert a Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date object
 * @returns ISO date string
 */
export const toISODateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get date range for statistics
 * @param period - 'week' | 'month' | 'year'
 * @returns Object with start and end dates
 */
export const getDateRangeForPeriod = (period: 'week' | 'month' | 'year'): { start: Date; end: Date } => {
  const end = getToday();
  let start: Date;

  switch (period) {
    case 'week':
      start = addDays(end, -7);
      break;
    case 'month':
      start = addDays(end, -30);
      break;
    case 'year':
      start = addDays(end, -365);
      break;
    default:
      start = addDays(end, -30);
  }

  return { start, end };
};

/**
 * Get day of week name in Catalan
 * @param dayOfWeek - Day of week number (0 = Sunday, 1 = Monday, etc.)
 * @returns Day name in Catalan
 */
export const getDayOfWeekName = (dayOfWeek: number): string => {
  const days = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
  return days[dayOfWeek] || '';
};

/**
 * Validate time range (end time must be after start time)
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns true if valid range, false otherwise
 */
export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  if (endHour > startHour) {
    return true;
  }
  if (endHour === startHour && endMin > startMin) {
    return true;
  }
  return false;
};
