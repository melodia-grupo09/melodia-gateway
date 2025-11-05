import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { ReleasesService } from './releases.service';

describe('ReleasesService', () => {
  let service: ReleasesService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchReleases', () => {
    it('should search releases successfully with all parameters', async () => {
      const mockResponse = {
        data: {
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
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.searchReleases('Test Album', 1, 20)) as {
        releases: Array<{
          id: string;
          title: string;
          artist: { id: string; name: string };
          releaseDate: string;
        }>;
        pagination: { page: number; limit: number; total: number };
      };

      expect(mockHttpService.get).toHaveBeenCalledWith('/releases/search', {
        params: {
          query: 'Test Album',
          page: 1,
          limit: 20,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search releases with default parameters', async () => {
      const mockResponse = {
        data: {
          releases: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.searchReleases('Test')) as {
        releases: any[];
        pagination: { page: number; limit: number; total: number };
      };

      expect(mockHttpService.get).toHaveBeenCalledWith('/releases/search', {
        params: {
          query: 'Test',
          page: 1,
          limit: 20,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search releases with custom pagination', async () => {
      const mockResponse = {
        data: {
          releases: [
            {
              id: '456e7890-e89b-12d3-a456-426614174001',
              title: 'Another Album',
              artist: {
                id: 'artist-456',
                name: 'Another Artist',
              },
              releaseDate: '2024-02-01',
            },
          ],
          pagination: {
            page: 2,
            limit: 10,
            total: 15,
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.searchReleases('Album', 2, 10)) as {
        releases: Array<{
          id: string;
          title: string;
          artist: { id: string; name: string };
          releaseDate: string;
        }>;
        pagination: { page: number; limit: number; total: number };
      };

      expect(mockHttpService.get).toHaveBeenCalledWith('/releases/search', {
        params: {
          query: 'Album',
          page: 2,
          limit: 10,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle HTTP errors during search', async () => {
      const error = new Error('HTTP Error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.searchReleases('Test')).rejects.toThrow(
        'HTTP Error',
      );

      expect(mockHttpService.get).toHaveBeenCalledWith('/releases/search', {
        params: {
          query: 'Test',
          page: 1,
          limit: 20,
        },
      });
    });
  });

  describe('getReleaseById', () => {
    it('should get release by ID successfully', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResponse = {
        data: {
          id: releaseId,
          title: 'Test Album',
          artist: {
            id: 'artist-123',
            name: 'Test Artist',
            bio: 'Test artist bio',
            followers: 1000,
          },
          releaseDate: '2024-01-01',
          genre: 'Pop',
          songs: [
            {
              id: 'song-1',
              title: 'Song 1',
              duration: 180,
              trackNumber: 1,
            },
            {
              id: 'song-2',
              title: 'Song 2',
              duration: 200,
              trackNumber: 2,
            },
          ],
          coverImageUrl: 'https://example.com/cover.jpg',
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.getReleaseById(releaseId)) as {
        id: string;
        title: string;
        artist: {
          id: string;
          name: string;
          bio: string;
          followers: number;
        };
        releaseDate: string;
        genre: string;
        songs: Array<{
          id: string;
          title: string;
          duration: number;
          trackNumber: number;
        }>;
        coverImageUrl: string;
      };

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/releases/${releaseId}`,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle release not found error', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new Error('Release not found');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getReleaseById(releaseId)).rejects.toThrow(
        'Release not found',
      );

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/releases/${releaseId}`,
      );
    });

    it('should handle invalid UUID format error', async () => {
      const invalidId = 'invalid-uuid';
      const error = new Error('Invalid UUID format');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getReleaseById(invalidId)).rejects.toThrow(
        'Invalid UUID format',
      );

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/releases/${invalidId}`,
      );
    });

    it('should handle network errors', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new Error('Network error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getReleaseById(releaseId)).rejects.toThrow(
        'Network error',
      );

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/releases/${releaseId}`,
      );
    });
  });
});
