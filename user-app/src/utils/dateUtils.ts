// Date utility functions for User App

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
 * Check if a date is in the request window (more than 2 days from now)
 * Request window: from 2 days in the future onwards
 * @param date - Date to check
 * @returns true if date is in request window
 */
export const isInRequestWindow = (date: Date | string): boolean => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const today = getToday();
  const twoDaysFromNow = addDays(today, 2);
  
  return isAfter(startOfDay(targetDate), twoDaysFromNow) || 
         format(startOfDay(targetDate), 'yyyy-MM-dd') === format(twoDaysFromNow, 'yyyy-MM-dd');
};

/**
 * Check if a date is in the direct booking window (within 2 days from now)
 * Direct booking window: today and tomorrow (less than 2 days)
 * @param date - Date to check
 * @returns true if date is in direct booking window
 */
export const isInDirectBookingWindow = (date: Date | string): boolean => {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const today = getToday();
  const twoDaysFromNow = addDays(today, 2);
  
  return (isAfter(startOfDay(targetDate), today) || 
          format(startOfDay(targetDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) &&
         isBefore(startOfDay(targetDate), twoDaysFromNow);
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
 * Convert a Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date object
 * @returns ISO date string
 */
export const toISODateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get booking window type for a given date
 * @param date - Date to check
 * @returns 'request' | 'direct' | 'past' | null
 */
export const getBookingWindowType = (date: Date | string): 'request' | 'direct' | 'past' | null => {
  if (isPastDate(date)) {
    return 'past';
  }
  if (isInDirectBookingWindow(date)) {
    return 'direct';
  }
  if (isInRequestWindow(date)) {
    return 'request';
  }
  return null;
};
