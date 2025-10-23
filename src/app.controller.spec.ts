import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { MetricsService } from './metrics/metrics.service';

describe('AppController', () => {
  let appController: AppController;

  const mockMetricsService = {
    getTopSongs: jest.fn(),
    getTopAlbums: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return status ok with top songs and albums', async () => {
      const mockTopSongs = {
        songs: [
          { id: 'song1', title: 'Song 1', plays: 1000 },
          { id: 'song2', title: 'Song 2', plays: 800 },
        ],
      };
      const mockTopAlbums = {
        albums: [
          { id: 'album1', title: 'Album 1', totalPlays: 1800 },
          { id: 'album2', title: 'Album 2', totalPlays: 1000 },
        ],
      };

      mockMetricsService.getTopSongs.mockResolvedValue(mockTopSongs);
      mockMetricsService.getTopAlbums.mockResolvedValue(mockTopAlbums);

      const result = await appController.healthCheck();

      expect(mockMetricsService.getTopSongs).toHaveBeenCalledWith(10);
      expect(mockMetricsService.getTopAlbums).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        status: 'ok',
        topSongs: mockTopSongs,
        topAlbums: mockTopAlbums,
      });
    });

    it('should return status ok with null metrics when service fails', async () => {
      const error = new Error('Metrics service error');

      mockMetricsService.getTopSongs.mockRejectedValue(error);
      mockMetricsService.getTopAlbums.mockRejectedValue(error);

      const result = await appController.healthCheck();

      expect(result).toEqual({
        status: 'ok',
        topSongs: null,
        topAlbums: null,
        metricsError: 'Metrics service error',
      });
    });

    it('should handle unknown errors gracefully', async () => {
      mockMetricsService.getTopSongs.mockRejectedValue(null);

      const result = await appController.healthCheck();

      expect(result).toEqual({
        status: 'ok',
        topSongs: null,
        topAlbums: null,
        metricsError: 'Failed to fetch metrics',
      });
    });
  });
});
