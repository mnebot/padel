import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { LotteryService } from './LotteryService';
import { UsageCounterService } from './UsageCounterService';
import { BookingService } from './BookingService';
import { BookingRequestRepository } from '../repositories/BookingRequestRepository';
import { TimeSlotRepository } from '../repositories/TimeSlotRepository';

export class SchedulerService {
  private lotteryTask?: cron.ScheduledTask;
  private monthlyResetTask?: cron.ScheduledTask;
  private bookingCompletionTask?: cron.ScheduledTask;

  constructor(
    private prisma: PrismaClient,
    private lotteryService: LotteryService,
    private usageCounterService: UsageCounterService,
    private bookingService: BookingService,
    private bookingRequestRepository: BookingRequestRepository,
    private timeSlotRepository: TimeSlotRepository
  ) {}

  /**
   * Schedule lottery execution to run automatically 2 days before each date
   * This runs daily at midnight to check for dates that need lottery execution
   * Validates: Requirements 5.1
   */
  scheduleLotteryExecution(): void {
    // Run every day at 00:00 (midnight)
    this.lotteryTask = cron.schedule('0 0 * * *', async () => {
      try {
        console.log('Running scheduled lottery execution check...');
        
        // Calculate the target date (2 days from now)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 2);
        targetDate.setHours(0, 0, 0, 0);

        // Get the day of week for the target date
        const dayOfWeek = targetDate.getDay();

        // Get all time slots configured for this day of week
        const timeSlots = await this.timeSlotRepository.findByDayOfWeek(dayOfWeek);

        // Execute lottery for each time slot that has pending requests
        for (const timeSlot of timeSlots) {
          const pendingRequests = await this.bookingRequestRepository.findPendingByDateAndTimeSlot(
            targetDate,
            timeSlot.startTime
          );

          if (pendingRequests.length > 0) {
            console.log(`Executing lottery for ${targetDate.toISOString().split('T')[0]} at ${timeSlot.startTime}`);
            const result = await this.lotteryService.executeLottery(targetDate, timeSlot.startTime);
            console.log(`Lottery completed: ${result.assigned.length} assigned, ${result.unassigned.length} unassigned`);
          }
        }

        console.log('Scheduled lottery execution check completed');
      } catch (error) {
        console.error('Error during scheduled lottery execution:', error);
      }
    });

    console.log('Lottery execution scheduler started (runs daily at midnight)');
  }

  /**
   * Schedule monthly reset of usage counters
   * Runs on the 1st day of each month at 00:00
   * Validates: Requirements 4.4
   */
  scheduleMonthlyReset(): void {
    // Run on the 1st day of every month at 00:00
    this.monthlyResetTask = cron.schedule('0 0 1 * *', async () => {
      try {
        console.log('Running scheduled monthly usage counter reset...');
        await this.usageCounterService.resetAllCounters();
        console.log('Monthly usage counter reset completed successfully');
      } catch (error) {
        console.error('Error during scheduled monthly reset:', error);
      }
    });

    console.log('Monthly reset scheduler started (runs on 1st of each month at midnight)');
  }

  /**
   * Schedule booking completion check
   * Runs every hour to mark bookings as completed after their date/time has passed
   * Validates: Requirements 4.1
   */
  scheduleBookingCompletion(): void {
    // Run every hour at minute 0
    this.bookingCompletionTask = cron.schedule('0 * * * *', async () => {
      try {
        console.log('Running scheduled booking completion check...');
        
        const now = new Date();
        
        // Find all confirmed bookings that should be completed
        // (date/time has passed)
        const bookingsToComplete = await this.prisma.booking.findMany({
          where: {
            status: 'CONFIRMED',
            OR: [
              {
                date: {
                  lt: new Date(now.setHours(0, 0, 0, 0))
                }
              },
              {
                AND: [
                  {
                    date: {
                      gte: new Date(now.setHours(0, 0, 0, 0)),
                      lt: new Date(now.setHours(23, 59, 59, 999))
                    }
                  },
                  {
                    timeSlot: {
                      lt: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
                    }
                  }
                ]
              }
            ]
          }
        });

        // Complete each booking
        for (const booking of bookingsToComplete) {
          try {
            await this.bookingService.completeBooking(booking.id);
            console.log(`Booking ${booking.id} marked as completed`);
          } catch (error) {
            console.error(`Error completing booking ${booking.id}:`, error);
          }
        }

        console.log(`Booking completion check completed: ${bookingsToComplete.length} bookings processed`);
      } catch (error) {
        console.error('Error during scheduled booking completion check:', error);
      }
    });

    console.log('Booking completion scheduler started (runs every hour)');
  }

  /**
   * Start all scheduled tasks
   * Validates: Requirements 4.4, 5.1
   */
  startScheduler(): void {
    console.log('Starting all scheduled tasks...');
    
    this.scheduleLotteryExecution();
    this.scheduleMonthlyReset();
    this.scheduleBookingCompletion();
    
    console.log('All scheduled tasks started successfully');
  }

  /**
   * Stop all scheduled tasks
   * Useful for graceful shutdown or testing
   */
  stopScheduler(): void {
    console.log('Stopping all scheduled tasks...');
    
    if (this.lotteryTask) {
      this.lotteryTask.stop();
      console.log('Lottery execution scheduler stopped');
    }
    
    if (this.monthlyResetTask) {
      this.monthlyResetTask.stop();
      console.log('Monthly reset scheduler stopped');
    }
    
    if (this.bookingCompletionTask) {
      this.bookingCompletionTask.stop();
      console.log('Booking completion scheduler stopped');
    }
    
    console.log('All scheduled tasks stopped');
  }
}
