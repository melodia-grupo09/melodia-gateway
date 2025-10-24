import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;

  const mockMetricsService = {
    getNewRegistrations: jest.fn(),
    getActiveUsers: jest.fn(),
    getUserRetention: jest.fn(),
    getTopSongs: jest.fn(),
    getTopAlbums: jest.fn(),
    getTopArtists: jest.fn(),
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

  describe('getTopSongs', () => {
    it('should return top songs with default limit', async () => {
      const expectedResult = {
        songs: [
          { id: 'song1', title: 'Song 1', plays: 1000 },
          { id: 'song2', title: 'Song 2', plays: 800 },
        ],
      };

      mockMetricsService.getTopSongs.mockResolvedValue(expectedResult);

      const result = await controller.getTopSongs();

      expect(mockMetricsService.getTopSongs).toHaveBeenCalledWith(undefined);
      expect(result).toBe(expectedResult);
    });

    it('should return top songs with custom limit', async () => {
      const limit = 5;
      const expectedResult = {
        songs: [
          { id: 'song1', title: 'Song 1', plays: 1000 },
          { id: 'song2', title: 'Song 2', plays: 800 },
          { id: 'song3', title: 'Song 3', plays: 600 },
          { id: 'song4', title: 'Song 4', plays: 400 },
          { id: 'song5', title: 'Song 5', plays: 200 },
        ],
      };

      mockMetricsService.getTopSongs.mockResolvedValue(expectedResult);

      const result = await controller.getTopSongs(limit);

      expect(mockMetricsService.getTopSongs).toHaveBeenCalledWith(limit);
      expect(result).toBe(expectedResult);
    });

    it('should handle errors when getting top songs', async () => {
      const error = new Error('Service error');

      mockMetricsService.getTopSongs.mockRejectedValue(error);

      await expect(controller.getTopSongs()).rejects.toThrow('Service error');
    });
  });

  describe('getTopAlbums', () => {
    it('should return top albums with default limit', async () => {
      const expectedResult = {
        albums: [
          { id: 'album1', title: 'Album 1', totalPlays: 1800 },
          { id: 'album2', title: 'Album 2', totalPlays: 1000 },
        ],
      };

      mockMetricsService.getTopAlbums.mockResolvedValue(expectedResult);

      const result = await controller.getTopAlbums();

      expect(mockMetricsService.getTopAlbums).toHaveBeenCalledWith(undefined);
      expect(result).toBe(expectedResult);
    });

    it('should return top albums with custom limit', async () => {
      const limit = 3;
      const expectedResult = {
        albums: [
          { id: 'album1', title: 'Album 1', totalPlays: 1800 },
          { id: 'album2', title: 'Album 2', totalPlays: 1000 },
          { id: 'album3', title: 'Album 3', totalPlays: 800 },
        ],
      };

      mockMetricsService.getTopAlbums.mockResolvedValue(expectedResult);

      const result = await controller.getTopAlbums(limit);

      expect(mockMetricsService.getTopAlbums).toHaveBeenCalledWith(limit);
      expect(result).toBe(expectedResult);
    });

    it('should handle errors when getting top albums', async () => {
      const error = new Error('Service error');

      mockMetricsService.getTopAlbums.mockRejectedValue(error);

      await expect(controller.getTopAlbums()).rejects.toThrow('Service error');
    });
  });

  describe('getTopArtists', () => {
    it('should return top artists with default limit', async () => {
      const expectedResult = {
        artists: [
          { id: 'artist1', name: 'Artist 1', monthlyListeners: 1000000 },
          { id: 'artist2', name: 'Artist 2', monthlyListeners: 800000 },
        ],
      };

      mockMetricsService.getTopArtists.mockResolvedValue(expectedResult);

      const result = await controller.getTopArtists();

      expect(mockMetricsService.getTopArtists).toHaveBeenCalledWith(undefined);
      expect(result).toBe(expectedResult);
    });

    it('should return top artists with custom limit', async () => {
      const limit = 5;
      const expectedResult = {
        artists: [
          { id: 'artist1', name: 'Artist 1', monthlyListeners: 1000000 },
          { id: 'artist2', name: 'Artist 2', monthlyListeners: 800000 },
          { id: 'artist3', name: 'Artist 3', monthlyListeners: 600000 },
          { id: 'artist4', name: 'Artist 4', monthlyListeners: 400000 },
          { id: 'artist5', name: 'Artist 5', monthlyListeners: 200000 },
        ],
      };

      mockMetricsService.getTopArtists.mockResolvedValue(expectedResult);

      const result = await controller.getTopArtists(limit);

      expect(mockMetricsService.getTopArtists).toHaveBeenCalledWith(limit);
      expect(result).toBe(expectedResult);
    });

    it('should handle errors when getting top artists', async () => {
      const error = new Error('Service error');

      mockMetricsService.getTopArtists.mockRejectedValue(error);

      await expect(controller.getTopArtists()).rejects.toThrow('Service error');
    });
  });
});
