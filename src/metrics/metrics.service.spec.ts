import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { ArtistsService } from '../artists/artists.service';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  };

  const mockArtistsService = {
    getReleaseById: jest.fn(),
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
        {
          provide: ArtistsService,
          useValue: mockArtistsService,
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
    it('should return enhanced top albums without limit', async () => {
      const mockAlbumsData = [
        { albumId: 'album1', likes: 10, shares: 5 },
        { albumId: 'album2', likes: 8, shares: 3 },
      ];

      const mockReleaseInfo1 = {
        id: 'album1',
        title: 'Album 1',
        artist: { name: 'Artist 1' },
        coverUrl: 'cover1.jpg',
      };

      const mockReleaseInfo2 = {
        id: 'album2',
        title: 'Album 2',
        artist: { name: 'Artist 2' },
        coverUrl: 'cover2.jpg',
      };

      mockHttpService.get.mockReturnValue(of({ data: mockAlbumsData }));
      mockArtistsService.getReleaseById
        .mockResolvedValueOnce(mockReleaseInfo1)
        .mockResolvedValueOnce(mockReleaseInfo2);

      const result = await service.getTopAlbums();

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/albums', {
        params: {},
      });
      expect(mockArtistsService.getReleaseById).toHaveBeenCalledWith('album1');
      expect(mockArtistsService.getReleaseById).toHaveBeenCalledWith('album2');
      expect(result).toEqual([
        { ...mockAlbumsData[0], ...mockReleaseInfo1 },
        { ...mockAlbumsData[1], ...mockReleaseInfo2 },
      ]);
    });

    it('should return enhanced top albums with limit', async () => {
      const limit = 1;
      const mockAlbumsData = [{ albumId: 'album1', likes: 10, shares: 5 }];

      const mockReleaseInfo = {
        id: 'album1',
        title: 'Album 1',
        artist: { name: 'Artist 1' },
        coverUrl: 'cover1.jpg',
      };

      mockHttpService.get.mockReturnValue(of({ data: mockAlbumsData }));
      mockArtistsService.getReleaseById.mockResolvedValue(mockReleaseInfo);

      const result = await service.getTopAlbums(limit);

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/albums', {
        params: { limit },
      });
      expect(mockArtistsService.getReleaseById).toHaveBeenCalledWith('album1');
      expect(result).toEqual([{ ...mockAlbumsData[0], ...mockReleaseInfo }]);
    });

    it('should handle errors when getting release info and return original album data', async () => {
      const mockAlbumsData = [{ albumId: 'album1', likes: 10, shares: 5 }];

      mockHttpService.get.mockReturnValue(of({ data: mockAlbumsData }));
      mockArtistsService.getReleaseById.mockRejectedValue(
        new Error('Release not found'),
      );

      const result = await service.getTopAlbums();

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/albums', {
        params: {},
      });
      expect(mockArtistsService.getReleaseById).toHaveBeenCalledWith('album1');
      expect(result).toEqual(mockAlbumsData);
    });

    it('should handle errors when getting top albums', async () => {
      const error = new Error('HTTP error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getTopAlbums()).rejects.toThrow('HTTP error');
    });

    it('should handle non-array response from metrics service', async () => {
      const mockNonArrayData = { message: 'No albums found' };

      mockHttpService.get.mockReturnValue(of({ data: mockNonArrayData }));

      const result = await service.getTopAlbums();

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/albums', {
        params: {},
      });
      expect(result).toEqual([]);
    });

    it('should handle invalid album objects missing albumId', async () => {
      const mockAlbumsData = [
        { likes: 10, shares: 5 }, // Missing albumId
        { albumId: 'album2', likes: 8, shares: 3 },
      ];

      const mockReleaseInfo = {
        id: 'album2',
        title: 'Album 2',
        artist: { name: 'Artist 2' },
      };

      mockHttpService.get.mockReturnValue(of({ data: mockAlbumsData }));
      mockArtistsService.getReleaseById.mockResolvedValue(mockReleaseInfo);

      const result = await service.getTopAlbums();

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/albums', {
        params: {},
      });
      expect(mockArtistsService.getReleaseById).toHaveBeenCalledWith('album2');
      expect(result).toEqual([
        { likes: 10, shares: 5 }, // Original invalid object returned as-is
        { ...mockAlbumsData[1], ...mockReleaseInfo },
      ]);
    });

    it('should handle Promise.allSettled rejections', async () => {
      const mockAlbumsData = [{ albumId: 'album1', likes: 10, shares: 5 }];

      mockHttpService.get.mockReturnValue(of({ data: mockAlbumsData }));
      // Force Promise.allSettled to have a rejection by making getReleaseById throw synchronously
      mockArtistsService.getReleaseById.mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      const result = await service.getTopAlbums();

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/albums', {
        params: {},
      });
      expect(result).toEqual(mockAlbumsData); // Should return original data when release fetch fails
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
        { artistId, userId, region: 'unknown' },
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
        { artistId, userId, region: 'unknown' },
      );
    });
  });

  describe('getTopArtists', () => {
    it('should return top artists without limit', async () => {
      const mockData = {
        artists: [
          { id: 'artist1', name: 'Artist 1', monthlyListeners: 1000000 },
          { id: 'artist2', name: 'Artist 2', monthlyListeners: 800000 },
        ],
      };

      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getTopArtists();

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/artists/top', {
        params: {},
      });
      expect(result).toEqual(mockData);
    });

    it('should return top artists with limit', async () => {
      const limit = 3;
      const mockData = {
        artists: [
          { id: 'artist1', name: 'Artist 1', monthlyListeners: 1000000 },
          { id: 'artist2', name: 'Artist 2', monthlyListeners: 800000 },
          { id: 'artist3', name: 'Artist 3', monthlyListeners: 600000 },
        ],
      };

      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getTopArtists(limit);

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/artists/top', {
        params: { limit },
      });
      expect(result).toEqual(mockData);
    });

    it('should handle errors when getting top artists', async () => {
      const error = new Error('HTTP error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getTopArtists()).rejects.toThrow('HTTP error');
    });
  });

  describe('recordArtistCreation', () => {
    it('should successfully record artist creation', async () => {
      const artistId = 'artist-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordArtistCreation(artistId);

      expect(mockHttpService.post).toHaveBeenCalledWith('/metrics/artists', {
        artistId,
      });
    });

    it('should handle errors gracefully and not throw', async () => {
      const artistId = 'artist-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(
        service.recordArtistCreation(artistId),
      ).resolves.toBeUndefined();
    });
  });

  describe('recordAlbumCreation', () => {
    it('should successfully record album creation', async () => {
      const albumId = 'album-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordAlbumCreation(albumId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/albums/${albumId}`,
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      const albumId = 'album-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(
        service.recordAlbumCreation(albumId),
      ).resolves.toBeUndefined();
    });
  });

  describe('recordAlbumLike', () => {
    it('should successfully record album like', async () => {
      const albumId = 'album-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordAlbumLike(albumId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/albums/${albumId}/likes`,
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      const albumId = 'album-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.recordAlbumLike(albumId)).resolves.toBeUndefined();
    });
  });

  describe('recordAlbumShare', () => {
    it('should successfully record album share', async () => {
      const albumId = 'album-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordAlbumShare(albumId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/albums/${albumId}/shares`,
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      const albumId = 'album-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.recordAlbumShare(albumId)).resolves.toBeUndefined();
    });
  });

  describe('recordSongLike', () => {
    it('should successfully record song like', async () => {
      const songId = 'song-123';
      const userId = 'user-123';
      const artistId = 'artist-123';
      const region = 'US';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordSongLike(songId, userId, artistId, region);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/songs/${songId}/likes`,
        { artistId, userId, region },
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      const songId = 'song-123';
      const userId = 'user-123';
      const artistId = 'artist-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(
        service.recordSongLike(songId, userId, artistId),
      ).resolves.toBeUndefined();
    });
  });

  describe('recordSongShare', () => {
    it('should successfully record song share', async () => {
      const songId = 'song-123';
      const userId = 'user-123';
      const artistId = 'artist-123';
      const region = 'US';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.recordSongShare(songId, userId, artistId, region);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/songs/${songId}/shares`,
        { artistId, userId, region },
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      const songId = 'song-123';
      const userId = 'user-123';
      const artistId = 'artist-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(
        service.recordSongShare(songId, userId, artistId),
      ).resolves.toBeUndefined();
    });
  });

  describe('getAllArtistsMetrics', () => {
    it('should return all artists metrics with parameters', async () => {
      const page = 1;
      const limit = 10;
      const period = 'monthly';
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const expectedResult = { items: [], total: 0 };

      mockHttpService.get.mockReturnValue(of({ data: expectedResult }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getAllArtistsMetrics(
        page,
        limit,
        period,
        startDate,
        endDate,
      );

      expect(mockHttpService.get).toHaveBeenCalledWith('/metrics/artists', {
        params: { page, limit, period, startDate, endDate },
      });
      expect(result).toBe(expectedResult);
    });
  });

  describe('addArtistListener', () => {
    it('should successfully add artist listener', async () => {
      const artistId = 'artist-123';
      const userId = 'user-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.addArtistListener(artistId, userId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/artists/${artistId}/listeners`,
        { userId },
      );
    });

    it('should throw error on failure', async () => {
      const artistId = 'artist-123';
      const userId = 'user-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.addArtistListener(artistId, userId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getArtistMonthlyListeners', () => {
    it('should return monthly listeners count', async () => {
      const artistId = 'artist-123';
      const expectedResult = { count: 100 };

      mockHttpService.get.mockReturnValue(of({ data: expectedResult }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getArtistMonthlyListeners(artistId);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/metrics/artists/${artistId}/monthly-listeners`,
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('deleteArtist', () => {
    it('should successfully delete artist metrics', async () => {
      const artistId = 'artist-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      await service.deleteArtist(artistId);

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/metrics/artists/${artistId}`,
      );
    });

    it('should throw error on failure', async () => {
      const artistId = 'artist-123';
      const error = new Error('Network error');

      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(service.deleteArtist(artistId)).rejects.toThrow(error);
    });
  });

  describe('getArtistMetrics', () => {
    it('should return full artist metrics', async () => {
      const artistId = 'artist-123';
      const expectedResult = { id: artistId, metrics: {} };

      mockHttpService.get.mockReturnValue(of({ data: expectedResult }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getArtistMetrics(artistId);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/metrics/artists/${artistId}`,
        { params: {} },
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('addArtistFollower', () => {
    it('should successfully add artist follower', async () => {
      const artistId = 'artist-123';
      const userId = 'user-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.addArtistFollower(artistId, userId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/metrics/artists/${artistId}/followers`,
        { userId },
      );
    });

    it('should throw error on failure', async () => {
      const artistId = 'artist-123';
      const userId = 'user-123';
      const error = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.addArtistFollower(artistId, userId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('removeArtistFollower', () => {
    it('should successfully remove artist follower', async () => {
      const artistId = 'artist-123';
      const userId = 'user-123';
      const mockResponse = { data: { success: true } };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      await service.removeArtistFollower(artistId, userId);

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/metrics/artists/${artistId}/followers/${userId}`,
      );
    });

    it('should throw error on failure', async () => {
      const artistId = 'artist-123';
      const userId = 'user-123';
      const error = new Error('Network error');

      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(
        service.removeArtistFollower(artistId, userId),
      ).rejects.toThrow(error);
    });
  });

  describe('exportArtistsMetrics', () => {
    it('should return exported metrics data', async () => {
      const period = 'monthly';
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const expectedResult = 'csv-data';

      mockHttpService.get.mockReturnValue(of({ data: expectedResult }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.exportArtistsMetrics(
        period,
        startDate,
        endDate,
      );

      expect(mockHttpService.get).toHaveBeenCalledWith(
        '/metrics/artists/export',
        {
          params: { period, startDate, endDate },
        },
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('getArtistTopSongs', () => {
    it('should return top songs for an artist', async () => {
      const artistId = 'artist-123';
      const region = 'AR';
      const sortBy = 'likes';
      const expectedResult = [{ id: 'song-1', title: 'Song 1' }];

      mockHttpService.get.mockReturnValue(of({ data: expectedResult }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getArtistTopSongs(artistId, region, sortBy);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/metrics/artists/${artistId}/top-songs`,
        {
          params: { region, sortBy },
        },
      );
      expect(result).toBe(expectedResult);
    });
  });
});
