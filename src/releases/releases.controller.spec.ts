import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';

describe('ReleasesController', () => {
  let controller: ReleasesController;

  const mockReleasesService = {
    searchReleases: jest.fn(),
    getReleaseById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReleasesController],
      providers: [
        {
          provide: ReleasesService,
          useValue: mockReleasesService,
        },
      ],
    }).compile();

    controller = module.get<ReleasesController>(ReleasesController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchReleases', () => {
    it('should search releases successfully with all parameters', async () => {
      const mockReleases = {
        releases: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Album',
            artist: {
              id: 'artist-123',
              name: 'Test Artist',
            },
            releaseDate: '2024-01-01',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
        },
      };

      mockReleasesService.searchReleases.mockResolvedValue(mockReleases);

      const result = await controller.searchReleases('Test Album', 1, 20);

      expect(mockReleasesService.searchReleases).toHaveBeenCalledWith(
        'Test Album',
        1,
        20,
      );
      expect(result).toEqual(mockReleases);
    });

    it('should search releases successfully with default pagination', async () => {
      const mockReleases = {
        releases: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Album',
            artist: {
              id: 'artist-123',
              name: 'Test Artist',
            },
            releaseDate: '2024-01-01',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
        },
      };

      mockReleasesService.searchReleases.mockResolvedValue(mockReleases);

      const result = await controller.searchReleases('Test Album');

      expect(mockReleasesService.searchReleases).toHaveBeenCalledWith(
        'Test Album',
        1,
        20,
      );
      expect(result).toEqual(mockReleases);
    });

    it('should search releases successfully with custom pagination', async () => {
      const mockReleases = {
        releases: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
        },
      };

      mockReleasesService.searchReleases.mockResolvedValue(mockReleases);

      const result = await controller.searchReleases('Nonexistent', 2, 10);

      expect(mockReleasesService.searchReleases).toHaveBeenCalledWith(
        'Nonexistent',
        2,
        10,
      );
      expect(result).toEqual(mockReleases);
    });

    it('should handle search releases service error', async () => {
      const error = new Error('Service error');
      mockReleasesService.searchReleases.mockRejectedValue(error);

      await expect(controller.searchReleases('Test')).rejects.toThrow(
        'Service error',
      );

      expect(mockReleasesService.searchReleases).toHaveBeenCalledWith(
        'Test',
        1,
        20,
      );
    });
  });

  describe('getReleaseById', () => {
    it('should get release by ID successfully', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174000';
      const mockRelease = {
        id: releaseId,
        title: 'Test Album',
        artist: {
          id: 'artist-123',
          name: 'Test Artist',
          bio: 'Test artist bio',
        },
        releaseDate: '2024-01-01',
        genre: 'Pop',
        songs: [
          {
            id: 'song-1',
            title: 'Song 1',
            duration: 180,
          },
          {
            id: 'song-2',
            title: 'Song 2',
            duration: 200,
          },
        ],
      };

      mockReleasesService.getReleaseById.mockResolvedValue(mockRelease);

      const result = await controller.getReleaseById(releaseId);

      expect(mockReleasesService.getReleaseById).toHaveBeenCalledWith(
        releaseId,
      );
      expect(result).toEqual(mockRelease);
    });

    it('should handle get release by ID service error', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new Error('Release not found');
      mockReleasesService.getReleaseById.mockRejectedValue(error);

      await expect(controller.getReleaseById(releaseId)).rejects.toThrow(
        'Release not found',
      );

      expect(mockReleasesService.getReleaseById).toHaveBeenCalledWith(
        releaseId,
      );
    });

    it('should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const error = new Error('Invalid UUID format');
      mockReleasesService.getReleaseById.mockRejectedValue(error);

      await expect(controller.getReleaseById(invalidId)).rejects.toThrow(
        'Invalid UUID format',
      );

      expect(mockReleasesService.getReleaseById).toHaveBeenCalledWith(
        invalidId,
      );
    });
  });
});
