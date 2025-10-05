import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;

  const mockMetricsService = {
    getNewRegistrations: jest.fn(),
    getActiveUsers: jest.fn(),
    getUserRetention: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNewRegistrations', () => {
    it('should return new registrations data', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const expectedResult = { count: 150 };

      mockMetricsService.getNewRegistrations.mockResolvedValue(expectedResult);

      const result = await controller.getNewRegistrations(startDate, endDate);

      expect(mockMetricsService.getNewRegistrations).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
      expect(result).toBe(expectedResult);
    });

    it('should handle errors when getting new registrations', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const error = new Error('Service error');

      mockMetricsService.getNewRegistrations.mockRejectedValue(error);

      await expect(
        controller.getNewRegistrations(startDate, endDate),
      ).rejects.toThrow('Service error');
    });
  });

  describe('getActiveUsers', () => {
    it('should return active users data', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const expectedResult = { count: 89 };

      mockMetricsService.getActiveUsers.mockResolvedValue(expectedResult);

      const result = await controller.getActiveUsers(startDate, endDate);

      expect(mockMetricsService.getActiveUsers).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
      expect(result).toBe(expectedResult);
    });

    it('should handle errors when getting active users', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const error = new Error('Service error');

      mockMetricsService.getActiveUsers.mockRejectedValue(error);

      await expect(
        controller.getActiveUsers(startDate, endDate),
      ).rejects.toThrow('Service error');
    });
  });

  describe('getUserRetention', () => {
    it('should return user retention data with all parameters', async () => {
      const cohortStartDate = '2024-01-01';
      const cohortEndDate = '2024-01-31';
      const daysAfter = 7;
      const expectedResult = { retentionRate: 0.75 };

      mockMetricsService.getUserRetention.mockResolvedValue(expectedResult);

      const result = await controller.getUserRetention(
        cohortStartDate,
        cohortEndDate,
        daysAfter,
      );

      expect(mockMetricsService.getUserRetention).toHaveBeenCalledWith(
        cohortStartDate,
        cohortEndDate,
        daysAfter,
      );
      expect(result).toBe(expectedResult);
    });

    it('should return user retention data without optional parameter', async () => {
      const cohortStartDate = '2024-01-01';
      const cohortEndDate = '2024-01-31';
      const expectedResult = { retentionRate: 0.65 };

      mockMetricsService.getUserRetention.mockResolvedValue(expectedResult);

      const result = await controller.getUserRetention(
        cohortStartDate,
        cohortEndDate,
      );

      expect(mockMetricsService.getUserRetention).toHaveBeenCalledWith(
        cohortStartDate,
        cohortEndDate,
        undefined,
      );
      expect(result).toBe(expectedResult);
    });

    it('should handle errors when getting user retention', async () => {
      const cohortStartDate = '2024-01-01';
      const cohortEndDate = '2024-01-31';
      const error = new Error('Service error');

      mockMetricsService.getUserRetention.mockRejectedValue(error);

      await expect(
        controller.getUserRetention(cohortStartDate, cohortEndDate),
      ).rejects.toThrow('Service error');
    });
  });
});
