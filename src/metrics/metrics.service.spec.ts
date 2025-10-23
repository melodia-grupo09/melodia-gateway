import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
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
    // Mock Logger to suppress error logs during tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

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

  afterEach(() => {
    jest.restoreAllMocks();
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

    it('should handle errors gracefully without action context', async () => {
      const userId = 'test-user-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.trackUserActivity(userId)).resolves.toBeUndefined();
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

  describe('getTopSongs', () => {
    it('should return top songs without limit', async () => {
      const mockData = {
        songs: [
          { id: 'song1', title: 'Song 1', plays: 1000 },
          { id: 'song2', title: 'Song 2', plays: 800 },
        ],
      };

      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getTopSongs();

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/songs', {
        params: {},
      });
      expect(result).toEqual(mockData);
    });

    it('should return top songs with limit', async () => {
      const limit = 5;
      const mockData = {
        songs: [
          { id: 'song1', title: 'Song 1', plays: 1000 },
          { id: 'song2', title: 'Song 2', plays: 800 },
          { id: 'song3', title: 'Song 3', plays: 600 },
          { id: 'song4', title: 'Song 4', plays: 400 },
          { id: 'song5', title: 'Song 5', plays: 200 },
        ],
      };

      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getTopSongs(limit);

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/songs', {
        params: { limit },
      });
      expect(result).toEqual(mockData);
    });

    it('should handle errors when getting top songs', async () => {
      const error = new Error('HTTP error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getTopSongs()).rejects.toThrow('HTTP error');
    });
  });

  describe('getTopAlbums', () => {
    it('should return top albums without limit', async () => {
      const mockData = {
        albums: [
          { id: 'album1', title: 'Album 1', totalPlays: 1800 },
          { id: 'album2', title: 'Album 2', totalPlays: 1000 },
        ],
      };

      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getTopAlbums();

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/albums/top', {
        params: {},
      });
      expect(result).toEqual(mockData);
    });

    it('should return top albums with limit', async () => {
      const limit = 3;
      const mockData = {
        albums: [
          { id: 'album1', title: 'Album 1', totalPlays: 1800 },
          { id: 'album2', title: 'Album 2', totalPlays: 1000 },
          { id: 'album3', title: 'Album 3', totalPlays: 800 },
        ],
      };

      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getTopAlbums(limit);

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/albums/top', {
        params: { limit },
      });
      expect(result).toEqual(mockData);
    });

    it('should handle errors when getting top albums', async () => {
      const error = new Error('HTTP error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getTopAlbums()).rejects.toThrow('HTTP error');
    });
  });

  describe('recordSongUpload', () => {
    it('should successfully record song upload', async () => {
      const songId = 'song-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordSongUpload(songId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/songs/${songId}`,
      );
    });

    it('should handle errors when recording song upload', async () => {
      const songId = 'song-123';
      const error = new Error('HTTP error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      // Should not throw error, just log it
      await expect(service.recordSongUpload(songId)).resolves.toBeUndefined();

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/songs/${songId}`,
      );
    });
  });

  describe('recordSongPlay', () => {
    it('should successfully record song play', async () => {
      const songId = 'song-456';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const userId = 'user123';
      const artistId = 'artist456';

      await service.recordSongPlay(songId, userId, artistId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/songs/${songId}/plays`,
        { artistId, userId },
      );
    });

    it('should handle errors when recording song play', async () => {
      const songId = 'song-456';
      const error = new Error('HTTP error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      const userId = 'user123';
      const artistId = 'artist456';

      // Should not throw error, just log it
      await expect(
        service.recordSongPlay(songId, userId, artistId),
      ).resolves.toBeUndefined();

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/songs/${songId}/plays`,
        { artistId, userId },
      );
    });
  });
});
