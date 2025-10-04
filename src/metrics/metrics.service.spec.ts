import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);

    jest.clearAllMocks();
  });

  describe('recordUserRegistration', () => {
    it('should successfully record user registration', async () => {
      const userId = 'test-user-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordUserRegistration(userId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/users/${userId}/registration`,
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      const userId = 'test-user-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      // Should not throw
      await expect(
        service.recordUserRegistration(userId),
      ).resolves.toBeUndefined();
    });
  });

  describe('recordUserLogin', () => {
    it('should successfully record user login', async () => {
      const userId = 'test-user-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordUserLogin(userId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/users/${userId}/login`,
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      const userId = 'test-user-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.recordUserLogin(userId)).resolves.toBeUndefined();
    });
  });

  describe('recordUserActivity', () => {
    it('should successfully record user activity', async () => {
      const userId = 'test-user-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordUserActivity(userId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/users/${userId}/activity`,
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      const userId = 'test-user-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.recordUserActivity(userId)).resolves.toBeUndefined();
    });
  });

  describe('trackUserActivity', () => {
    it('should track user activity with action context', async () => {
      const userId = 'test-user-123';
      const action = 'song_played';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.trackUserActivity(userId, action);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/users/${userId}/activity`,
      );
    });

    it('should handle errors gracefully', async () => {
      const userId = 'test-user-123';
      const action = 'song_played';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(
        service.trackUserActivity(userId, action),
      ).resolves.toBeUndefined();
    });
  });

  describe('Analytics methods', () => {
    describe('getNewRegistrations', () => {
      it('should return new registrations data', async () => {
        const startDate = '2024-01-01';
        const endDate = '2024-12-31';
        const mockData = { count: 150, registrations: [] };
        const mockResponse = { data: mockData };

        mockHttpService.get.mockReturnValue(of(mockResponse));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await service.getNewRegistrations(startDate, endDate);

        expect(mockHttpService.get).toHaveBeenCalledWith(
          '/metrics/users/analytics/registrations',
          { params: { startDate, endDate } },
        );
        expect(result).toEqual(mockData);
      });
    });

    describe('getActiveUsers', () => {
      it('should return active users data', async () => {
        const startDate = '2024-01-01';
        const endDate = '2024-12-31';
        const mockData = { count: 85, activeUsers: [] };
        const mockResponse = { data: mockData };

        mockHttpService.get.mockReturnValue(of(mockResponse));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await service.getActiveUsers(startDate, endDate);

        expect(mockHttpService.get).toHaveBeenCalledWith(
          '/metrics/users/analytics/active',
          { params: { startDate, endDate } },
        );
        expect(result).toEqual(mockData);
      });
    });

    describe('getUserRetention', () => {
      it('should return user retention data with daysAfter parameter', async () => {
        const cohortStartDate = '2024-01-01';
        const cohortEndDate = '2024-01-31';
        const daysAfter = 7;
        const mockData = { retentionRate: 0.75, details: [] };
        const mockResponse = { data: mockData };

        mockHttpService.get.mockReturnValue(of(mockResponse));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await service.getUserRetention(
          cohortStartDate,
          cohortEndDate,
          daysAfter,
        );

        expect(mockHttpService.get).toHaveBeenCalledWith(
          '/metrics/users/analytics/retention',
          {
            params: {
              cohortStartDate,
              cohortEndDate,
              daysAfter,
            },
          },
        );
        expect(result).toEqual(mockData);
      });

      it('should return user retention data without daysAfter parameter', async () => {
        const cohortStartDate = '2024-01-01';
        const cohortEndDate = '2024-01-31';
        const mockData = { retentionRate: 0.68, details: [] };
        const mockResponse = { data: mockData };

        mockHttpService.get.mockReturnValue(of(mockResponse));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await service.getUserRetention(
          cohortStartDate,
          cohortEndDate,
        );

        expect(mockHttpService.get).toHaveBeenCalledWith(
          '/metrics/users/analytics/retention',
          {
            params: {
              cohortStartDate,
              cohortEndDate,
            },
          },
        );
        expect(result).toEqual(mockData);
      });
    });
  });
});
