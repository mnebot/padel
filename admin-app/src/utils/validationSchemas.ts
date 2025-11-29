// Validation schemas using Zod for Admin App

import { z } from 'zod';
import { validateTimeRange } from './dateUtils';

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
 * Court form validation schema
 */
export const courtSchema = z.object({
  name: z
    .string()
    .min(1, 'El nom és obligatori')
    .min(2, 'El nom ha de tenir almenys 2 caràcters')
    .max(100, 'El nom no pot superar els 100 caràcters'),
  description: z
    .string()
    .max(500, 'La descripció no pot superar els 500 caràcters')
    .optional()
    .default(''),
  isActive: z
    .boolean()
    .default(true),
});

export type CourtFormData = z.infer<typeof courtSchema>;

/**
 * Time slot form validation schema
 */
export const timeSlotSchema = z.object({
  dayOfWeek: z
    .number({
      message: 'El dia de la setmana és obligatori i ha de ser un número',
    })
    .int('El dia de la setmana ha de ser un número enter')
    .min(0, 'El dia de la setmana ha de ser entre 0 (Diumenge) i 6 (Dissabte)')
    .max(6, 'El dia de la setmana ha de ser entre 0 (Diumenge) i 6 (Dissabte)'),
  startTime: z
    .string()
    .min(1, 'L\'hora d\'inici és obligatòria')
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'hora no vàlid (HH:mm)'),
  endTime: z
    .string()
    .min(1, 'L\'hora de fi és obligatòria')
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'hora no vàlid (HH:mm)'),
  duration: z
    .number({
      message: 'La durada és obligatòria i ha de ser un número',
    })
    .int('La durada ha de ser un número enter')
    .positive('La durada ha de ser positiva')
    .min(30, 'La durada mínima és de 30 minuts')
    .max(240, 'La durada màxima és de 240 minuts'),
  type: z.enum(['OFF_PEAK', 'PEAK'], {
    message: 'El tipus de franja horària és obligatori',
  }),
}).refine(
  (data) => validateTimeRange(data.startTime, data.endTime),
  {
    message: 'L\'hora de fi ha de ser posterior a l\'hora d\'inici',
    path: ['endTime'],
  }
);

export type TimeSlotFormData = z.infer<typeof timeSlotSchema>;

/**
 * User form validation schema (for creation)
 */
export const userCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'El nom és obligatori')
    .min(2, 'El nom ha de tenir almenys 2 caràcters')
    .max(100, 'El nom no pot superar els 100 caràcters'),
  email: z
    .string()
    .min(1, 'El correu electrònic és obligatori')
    .email('El correu electrònic no és vàlid'),
  type: z.enum(['MEMBER', 'NON_MEMBER'], {
    message: 'El tipus d\'usuari és obligatori',
  }),
  password: z
    .string()
    .min(1, 'La contrasenya és obligatòria')
    .min(6, 'La contrasenya ha de tenir almenys 6 caràcters'),
});

export type UserCreateFormData = z.infer<typeof userCreateSchema>;

/**
 * User form validation schema (for update)
 */
export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'El nom és obligatori')
    .min(2, 'El nom ha de tenir almenys 2 caràcters')
    .max(100, 'El nom no pot superar els 100 caràcters'),
  email: z
    .string()
    .min(1, 'El correu electrònic és obligatori')
    .email('El correu electrònic no és vàlid'),
  type: z.enum(['MEMBER', 'NON_MEMBER'], {
    message: 'El tipus d\'usuari és obligatori',
  }),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      { message: 'La contrasenya ha de tenir almenys 6 caràcters' }
    ),
});

export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

/**
 * Booking filter validation schema
 */
export const bookingFilterSchema = z.object({
  status: z.enum(['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  courtId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type BookingFilterFormData = z.infer<typeof bookingFilterSchema>;

/**
 * Stats period validation schema
 */
export const statsPeriodSchema = z.object({
  period: z.enum(['week', 'month', 'year'], {
    message: 'El període és obligatori',
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type StatsPeriodFormData = z.infer<typeof statsPeriodSchema>;

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

/**
 * Validate UUID format
 * @param uuid - UUID string to validate
 * @returns true if valid UUID, false otherwise
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
