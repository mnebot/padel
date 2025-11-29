import * as fc from 'fast-check';

/**
 * Fast-check arbitraries for property-based testing
 * These generate random valid instances of our data models
 */

// Enums
export const userTypeArbitrary = fc.constantFrom('MEMBER', 'NON_MEMBER');
export const timeSlotTypeArbitrary = fc.constantFrom('OFF_PEAK', 'PEAK');
export const bookingStatusArbitrary = fc.constantFrom(
  'REQUESTED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED'
);

// Basic types
export const uuidArbitrary = fc.uuid();
export const emailArbitrary = fc.emailAddress();
export const nameArbitrary = fc.string({ minLength: 1, maxLength: 100 });
export const descriptionArbitrary = fc.string({ minLength: 0, maxLength: 500 });

// Date arbitraries
export const dateStringArbitrary = fc
  .tuple(
    fc.integer({ min: 2024, max: 2026 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
  )
  .map(([year, month, day]) => 
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );

export const isoDateTimeArbitrary = fc
  .tuple(
    fc.integer({ min: 2024, max: 2026 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 }),
    fc.integer({ min: 0, max: 59 })
  )
  .map(([year, month, day, hour, minute, second]) => {
    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.toISOString();
  });

// Time arbitraries (HH:MM format)
export const timeStringArbitrary = fc
  .tuple(
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 })
  )
  .map(([hour, minute]) => 
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  );

// Player count (2-4 players)
export const playerCountArbitrary = fc.integer({ min: 2, max: 4 });

// Day of week (0-6)
export const dayOfWeekArbitrary = fc.integer({ min: 0, max: 6 });

// Duration in minutes
export const durationArbitrary = fc.integer({ min: 30, max: 180 });

// User arbitrary
export const userArbitrary = fc.record({
  id: uuidArbitrary,
  name: nameArbitrary,
  email: emailArbitrary,
  type: userTypeArbitrary,
  usageCount: fc.integer({ min: 0, max: 100 }),
  createdAt: isoDateTimeArbitrary,
  updatedAt: isoDateTimeArbitrary,
});

// Court arbitrary
export const courtArbitrary = fc.record({
  id: uuidArbitrary,
  name: nameArbitrary,
  description: descriptionArbitrary,
  isActive: fc.boolean(),
  createdAt: isoDateTimeArbitrary,
  updatedAt: isoDateTimeArbitrary,
});

// TimeSlot arbitrary
export const timeSlotArbitrary = fc.record({
  id: uuidArbitrary,
  dayOfWeek: dayOfWeekArbitrary,
  startTime: timeStringArbitrary,
  endTime: timeStringArbitrary,
  duration: durationArbitrary,
  type: timeSlotTypeArbitrary,
  createdAt: isoDateTimeArbitrary,
  updatedAt: isoDateTimeArbitrary,
});

// BookingRequest arbitrary
export const bookingRequestArbitrary = fc.record({
  id: uuidArbitrary,
  userId: uuidArbitrary,
  date: dateStringArbitrary,
  timeSlot: timeStringArbitrary,
  numberOfPlayers: playerCountArbitrary,
  status: bookingStatusArbitrary,
  weight: fc.option(fc.float({ min: 0, max: 1 }), { nil: undefined }),
  createdAt: isoDateTimeArbitrary,
  updatedAt: isoDateTimeArbitrary,
  user: fc.option(userArbitrary, { nil: undefined }),
});

// Booking arbitrary
export const bookingArbitrary = fc.record({
  id: uuidArbitrary,
  userId: uuidArbitrary,
  courtId: uuidArbitrary,
  date: dateStringArbitrary,
  timeSlot: timeStringArbitrary,
  numberOfPlayers: playerCountArbitrary,
  status: bookingStatusArbitrary,
  requestId: fc.option(uuidArbitrary, { nil: undefined }),
  createdAt: isoDateTimeArbitrary,
  updatedAt: isoDateTimeArbitrary,
  completedAt: fc.option(isoDateTimeArbitrary, { nil: undefined }),
  cancelledAt: fc.option(isoDateTimeArbitrary, { nil: undefined }),
  user: fc.option(userArbitrary, { nil: undefined }),
  court: fc.option(courtArbitrary, { nil: undefined }),
});

// Booking with related entities (for testing rendering)
export const bookingWithRelationsArbitrary = fc.record({
  id: uuidArbitrary,
  userId: uuidArbitrary,
  courtId: uuidArbitrary,
  date: dateStringArbitrary,
  timeSlot: timeStringArbitrary,
  numberOfPlayers: playerCountArbitrary,
  status: bookingStatusArbitrary,
  requestId: fc.option(uuidArbitrary, { nil: undefined }),
  createdAt: isoDateTimeArbitrary,
  updatedAt: isoDateTimeArbitrary,
  completedAt: fc.option(isoDateTimeArbitrary, { nil: undefined }),
  cancelledAt: fc.option(isoDateTimeArbitrary, { nil: undefined }),
  user: userArbitrary,
  court: courtArbitrary,
});

// AvailabilitySlot arbitrary
export const availabilitySlotArbitrary = fc.record({
  timeSlot: timeStringArbitrary,
  type: timeSlotTypeArbitrary,
  availableCourts: fc.array(courtArbitrary, { minLength: 0, maxLength: 10 }),
  isAvailable: fc.boolean(),
});

// DayAvailability arbitrary
export const dayAvailabilityArbitrary = fc.record({
  date: dateStringArbitrary,
  slots: fc.array(availabilitySlotArbitrary, { minLength: 0, maxLength: 20 }),
  isInRequestWindow: fc.boolean(),
  isInDirectBookingWindow: fc.boolean(),
});

// API Error arbitrary
export const apiErrorArbitrary = fc.record({
  error: fc.string({ minLength: 1, maxLength: 50 }),
  message: fc.string({ minLength: 1, maxLength: 200 }),
  details: fc.option(fc.array(fc.anything()), { nil: undefined }),
});

// Form data arbitraries
export const bookingFormDataArbitrary = fc.record({
  date: fc.tuple(
    fc.integer({ min: 2024, max: 2026 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 })
  ).map(([year, month, day]) => new Date(year, month - 1, day)),
  timeSlot: timeStringArbitrary,
  courtId: fc.option(uuidArbitrary, { nil: undefined }),
  numberOfPlayers: playerCountArbitrary,
});

export const courtFormDataArbitrary = fc.record({
  name: nameArbitrary,
  description: descriptionArbitrary,
  isActive: fc.boolean(),
});

export const timeSlotFormDataArbitrary = fc.record({
  dayOfWeek: dayOfWeekArbitrary,
  startTime: timeStringArbitrary,
  endTime: timeStringArbitrary,
  duration: durationArbitrary,
  type: timeSlotTypeArbitrary,
});

export const userFormDataArbitrary = fc.record({
  name: nameArbitrary,
  email: emailArbitrary,
  type: userTypeArbitrary,
  password: fc.option(fc.string({ minLength: 8, maxLength: 50 }), { nil: undefined }),
});
