// Validation schemas using Zod for User App

import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correu electrònic és obligatori')
    .email('El correu electrònic no és vàlid'),
  password: z
    .string()
    .min(1, 'La contrasenya és obligatòria')
    .min(6, 'La contrasenya ha de tenir almenys 6 caràcters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Booking request form validation schema
 * For requests made more than 2 days in advance
 */
export const bookingRequestSchema = z.object({
  date: z.date({
    message: 'La data és obligatòria i ha de ser vàlida',
  }),
  timeSlot: z
    .string()
    .min(1, 'La franja horària és obligatòria')
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format de franja horària no vàlid (HH:mm)'),
  numberOfPlayers: z
    .number({
      message: 'El nombre de jugadors és obligatori i ha de ser un número',
    })
    .int('El nombre de jugadors ha de ser un número enter')
    .min(2, 'El nombre de jugadors ha de ser entre 2 i 4')
    .max(4, 'El nombre de jugadors ha de ser entre 2 i 4'),
});

export type BookingRequestFormData = z.infer<typeof bookingRequestSchema>;

/**
 * Direct booking form validation schema
 * For bookings made within 2 days
 */
export const directBookingSchema = z.object({
  date: z.date({
    message: 'La data és obligatòria i ha de ser vàlida',
  }),
  timeSlot: z
    .string()
    .min(1, 'La franja horària és obligatòria')
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format de franja horària no vàlid (HH:mm)'),
  courtId: z
    .string()
    .min(1, 'La pista és obligatòria')
    .uuid('ID de pista no vàlid'),
  numberOfPlayers: z
    .number({
      message: 'El nombre de jugadors és obligatori i ha de ser un número',
    })
    .int('El nombre de jugadors ha de ser un número enter')
    .min(2, 'El nombre de jugadors ha de ser entre 2 i 4')
    .max(4, 'El nombre de jugadors ha de ser entre 2 i 4'),
});

export type DirectBookingFormData = z.infer<typeof directBookingSchema>;

/**
 * User profile update validation schema
 */
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'El nom és obligatori')
    .min(2, 'El nom ha de tenir almenys 2 caràcters')
    .max(100, 'El nom no pot superar els 100 caràcters'),
  email: z
    .string()
    .min(1, 'El correu electrònic és obligatori')
    .email('El correu electrònic no és vàlid'),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

/**
 * Validate number of players (standalone function)
 * @param numberOfPlayers - Number of players to validate
 * @returns true if valid (2-4), false otherwise
 */
export const validatePlayerCount = (numberOfPlayers: number): boolean => {
  return Number.isInteger(numberOfPlayers) && numberOfPlayers >= 2 && numberOfPlayers <= 4;
};

/**
 * Validate time slot format (HH:mm)
 * @param timeSlot - Time slot string to validate
 * @returns true if valid format, false otherwise
 */
export const validateTimeSlotFormat = (timeSlot: string): boolean => {
  const timeSlotRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeSlotRegex.test(timeSlot);
};

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if valid email, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
