# Property-Based Testing with fast-check

This directory contains the setup and utilities for property-based testing using [fast-check](https://github.com/dubzzz/fast-check).

## Files

- `setup.ts` - Test environment setup for Vitest and React Testing Library
- `arbitraries.ts` - Fast-check arbitraries for generating random test data
- `arbitraries.test.ts` - Tests to verify arbitraries generate valid data

## What are Arbitraries?

Arbitraries are generators that produce random values for property-based testing. They allow you to test properties across a wide range of inputs rather than just specific examples.

## Available Arbitraries

### Basic Types
- `uuidArbitrary` - Generates valid UUIDs
- `emailArbitrary` - Generates valid email addresses
- `nameArbitrary` - Generates random names (1-100 chars)
- `descriptionArbitrary` - Generates random descriptions (0-500 chars)
- `dateStringArbitrary` - Generates date strings in YYYY-MM-DD format
- `isoDateTimeArbitrary` - Generates ISO 8601 datetime strings
- `timeStringArbitrary` - Generates time strings in HH:MM format
- `playerCountArbitrary` - Generates valid player counts (2-4)
- `dayOfWeekArbitrary` - Generates day of week (0-6)

### Enums
- `userTypeArbitrary` - Generates 'MEMBER' or 'NON_MEMBER'
- `timeSlotTypeArbitrary` - Generates 'OFF_PEAK' or 'PEAK'
- `bookingStatusArbitrary` - Generates booking status values

### Domain Models
- `userArbitrary` - Generates User objects
- `courtArbitrary` - Generates Court objects
- `timeSlotArbitrary` - Generates TimeSlot objects
- `bookingArbitrary` - Generates Booking objects
- `bookingRequestArbitrary` - Generates BookingRequest objects
- `bookingWithRelationsArbitrary` - Generates Booking with user and court populated

### View Models
- `availabilitySlotArbitrary` - Generates AvailabilitySlot objects
- `dayAvailabilityArbitrary` - Generates DayAvailability objects

### Form Data
- `bookingFormDataArbitrary` - Generates booking form data
- `courtFormDataArbitrary` - Generates court form data
- `timeSlotFormDataArbitrary` - Generates time slot form data
- `userFormDataArbitrary` - Generates user form data

## Usage Example

```typescript
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { playerCountArbitrary } from '../test/arbitraries';

describe('Property Tests', () => {
  /**
   * Feature: frontend-web-padel, Property 2: Player number validation
   * For any booking or request form, the number of players field should only 
   * accept values between 2 and 4 inclusive, and reject all other values
   */
  it('validates player count correctly for all inputs', () => {
    fc.assert(
      fc.property(fc.integer(), (playerCount) => {
        const isValid = validatePlayerCount(playerCount);
        const shouldBeValid = playerCount >= 2 && playerCount <= 4;
        return isValid === shouldBeValid;
      }),
      { numRuns: 100 }
    );
  });
});
```

## Best Practices

1. **Run at least 100 iterations** - Property tests should run many times to catch edge cases
2. **Tag tests with property references** - Use comments to link tests to design document properties
3. **Test properties, not examples** - Focus on universal rules that should hold for all inputs
4. **Constrain input domains** - Use arbitraries that generate only valid inputs for the component being tested
5. **Keep properties simple** - Each property should test one clear rule

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/test/arbitraries.test.ts
```

## Resources

- [fast-check documentation](https://github.com/dubzzz/fast-check/tree/main/documentation)
- [Property-Based Testing Guide](https://github.com/dubzzz/fast-check/blob/main/documentation/Guides.md)
- [Vitest documentation](https://vitest.dev/)
