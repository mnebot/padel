import { PrismaClient } from '@prisma/client';
import { SchedulerService } from '../SchedulerService';
import { LotteryService } from '../LotteryService';
import { UsageCounterService } from '../UsageCounterService';
import { BookingService } from '../BookingService';
import { BookingRequestRepository } from '../../repositories/BookingRequestRepository';
import { TimeSlotRepository } from '../../repositories/TimeSlotRepository';

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({
    stop: jest.fn(),
  })),
}));

describe('SchedulerService', () => {
  let prisma: PrismaClient;
  let schedulerService: SchedulerService;
  let lotteryService: LotteryService;
  let usageCounterService: UsageCounterService;
  let bookingService: BookingService;
  let bookingRequestRepository: BookingRequestRepository;
  let timeSlotRepository: TimeSlotRepository;

  beforeEach(() => {
    prisma = new PrismaClient();
    
    // Create mock services
    lotteryService = {} as LotteryService;
    usageCounterService = {} as UsageCounterService;
    bookingService = {} as BookingService;
    bookingRequestRepository = {} as BookingRequestRepository;
    timeSlotRepository = {} as TimeSlotRepository;

    schedulerService = new SchedulerService(
      prisma,
      lotteryService,
      usageCounterService,
      bookingService,
      bookingRequestRepository,
      timeSlotRepository
    );
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('startScheduler', () => {
    it('should start all scheduled tasks', () => {
      const cron = require('node-cron');
      
      schedulerService.startScheduler();
      
      // Verify that cron.schedule was called 3 times (lottery, monthly reset, booking completion)
      expect(cron.schedule).toHaveBeenCalledTimes(3);
      
      // Verify lottery execution schedule (daily at midnight)
      expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
      
      // Verify monthly reset schedule (1st of month at midnight)
      expect(cron.schedule).toHaveBeenCalledWith('0 0 1 * *', expect.any(Function));
      
      // Verify booking completion schedule (every hour)
      expect(cron.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
    });
  });

  describe('stopScheduler', () => {
    it('should stop all scheduled tasks', () => {
      const mockStop = jest.fn();
      const cron = require('node-cron');
      cron.schedule.mockReturnValue({ stop: mockStop });
      
      schedulerService.startScheduler();
      schedulerService.stopScheduler();
      
      // Verify that stop was called on all tasks
      expect(mockStop).toHaveBeenCalledTimes(3);
    });
  });

  describe('scheduleLotteryExecution', () => {
    it('should schedule lottery execution with correct cron expression', () => {
      const cron = require('node-cron');
      
      schedulerService.scheduleLotteryExecution();
      
      // Verify daily at midnight schedule
      expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
    });
  });

  describe('scheduleMonthlyReset', () => {
    it('should schedule monthly reset with correct cron expression', () => {
      const cron = require('node-cron');
      
      schedulerService.scheduleMonthlyReset();
      
      // Verify 1st of month at midnight schedule
      expect(cron.schedule).toHaveBeenCalledWith('0 0 1 * *', expect.any(Function));
    });
  });

  describe('scheduleBookingCompletion', () => {
    it('should schedule booking completion with correct cron expression', () => {
      const cron = require('node-cron');
      
      schedulerService.scheduleBookingCompletion();
      
      // Verify hourly schedule
      expect(cron.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
    });
  });
});
