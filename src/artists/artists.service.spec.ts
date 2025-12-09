import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ArtistsService } from './artists.service';

describe('ArtistsService', () => {
  let service: ArtistsService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersService = {
    getFollowers: jest.fn().mockResolvedValue({
      followers: [{ uid: 'follower1' }, { uid: 'follower2' }],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        total_pages: 1,
      },
    }),
  };

  const mockNotificationsService = {
    sendNotificationToUserDevices: jest.fn().mockResolvedValue(undefined),
    sendNotificationToUsersDevicesBatch: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createArtist', () => {
    it('should create an artist successfully', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Artist');

      const mockResponse = {
        data: {
          id: '123',
          name: 'Test Artist',
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = (await service.createArtist(formData)) as {
        id: string;
        name: string;
        createdAt: string;
      };

      expect(mockHttpService.post).toHaveBeenCalledWith('/artists', formData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when artist creation fails', async () => {
      const formData = new FormData();
      const error = new Error('Creation failed');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.createArtist(formData)).rejects.toThrow(
        'Creation failed',
      );
    });
  });

  describe('getArtist', () => {
    it('should get an artist by id successfully', async () => {
      const artistId = '123';
      const mockResponse = {
        data: {
          id: '123',
          name: 'Test Artist',
          bio: 'Test bio',
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.getArtist(artistId)) as {
        id: string;
        name: string;
        bio: string;
      };

      expect(mockHttpService.get).toHaveBeenCalledWith(`/artists/${artistId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when getting artist fails', async () => {
      const artistId = '123';
      const error = new Error('Not found');

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getArtist(artistId)).rejects.toThrow('Not found');
    });
  });

  describe('getSimilarArtists', () => {
    it('should get similar artists successfully', async () => {
      const artistId = '123';
      const mockResponse = {
        data: [
          {
            id: '456',
            name: 'Similar Artist 1',
          },
          {
            id: '789',
            name: 'Similar Artist 2',
          },
        ],
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getSimilarArtists(artistId);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/artists/${artistId}/similar`,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when getting similar artists fails', async () => {
      const artistId = '123';
      const error = new Error('Fetch failed');

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getSimilarArtists(artistId)).rejects.toThrow(
        'Fetch failed',
      );
    });
  });

  describe('getLatestRelease', () => {
    it('should get latest release successfully', async () => {
      const artistIds = ['123', '456'];
      const mockResponse = {
        data: {
          id: 'release-1',
          title: 'Latest Hit',
          artistId: '123',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getLatestRelease(artistIds);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/artists/latest-release',
        { artistIds },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when getting latest release fails', async () => {
      const artistIds = ['123'];
      const error = new Error('Fetch failed');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.getLatestRelease(artistIds)).rejects.toThrow(
        'Fetch failed',
      );
    });
  });

  describe('updateArtist', () => {});

  describe('searchArtists', () => {
    it('should search artists with default parameters', async () => {
      const query = 'test artist';
      const mockResponse = {
        data: {
          artists: [
            {
              id: '123',
              name: 'Test Artist',
              bio: 'Test bio',
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.searchArtists(query);

      expect(mockHttpService.get).toHaveBeenCalledWith('/artists/search', {
        params: {
          query,
          page: 1,
          limit: 20,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search artists with custom parameters', async () => {
      const query = 'test artist';
      const page = 2;
      const limit = 10;
      const mockResponse = {
        data: {
          artists: [
            {
              id: '456',
              name: 'Another Artist',
              bio: 'Another bio',
            },
          ],
          total: 1,
          page: 2,
          limit: 10,
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.searchArtists(query, page, limit);

      expect(mockHttpService.get).toHaveBeenCalledWith('/artists/search', {
        params: {
          query,
          page,
          limit,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when search fails', async () => {
      const query = 'test artist';
      const error = new Error('Search failed');

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.searchArtists(query)).rejects.toThrow(
        'Search failed',
      );
    });
  });

  describe('updateArtist', () => {
    it('should update an artist successfully', async () => {
      const artistId = '123';
      const updateData = { name: 'Updated Artist' };
      const mockResponse = {
        data: {
          id: '123',
          name: 'Updated Artist',
        },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.updateArtist(artistId, updateData)) as {
        id: string;
        name: string;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}`,
        updateData,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteArtist', () => {
    it('should delete an artist successfully', async () => {
      const artistId = '123';
      const mockResponse = {
        data: { message: 'Artist deleted successfully' },
      };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = (await service.deleteArtist(artistId)) as {
        message: string;
      };

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/artists/${artistId}`,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateArtistMedia', () => {
    it('should update artist media successfully', async () => {
      const artistId = '123';
      const mediaData = new FormData();
      const mockResponse = {
        data: { message: 'Media updated successfully' },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.updateArtistMedia(artistId, mediaData)) as {
        message: string;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/media`,
        mediaData,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('followArtist', () => {
    it('should follow an artist successfully', async () => {
      const artistId = '123';
      const mockResponse = {
        data: { followersCount: 1 },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.followArtist(artistId)) as {
        followersCount: number;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/follow`,
        {},
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('unfollowArtist', () => {
    it('should unfollow an artist successfully', async () => {
      const artistId = '123';
      const mockResponse = {
        data: { followersCount: 0 },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.unfollowArtist(artistId)) as {
        followersCount: number;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/unfollow`,
        {},
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getArtistReleases', () => {
    it('should get artist releases successfully', async () => {
      const artistId = '123';
      const mockResponse = {
        data: [
          {
            id: 'release-1',
            title: 'Album 1',
            type: 'album',
            releaseDate: '2024-01-01',
          },
        ],
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.getArtistReleases(artistId)) as any[];

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/artists/${artistId}/releases`,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUpcomingReleases', () => {
    it('should get upcoming releases successfully', async () => {
      const artistId = '123';
      const mockResponse = {
        data: [
          {
            id: 'release-1',
            title: 'Upcoming Album',
            type: 'album',
            releaseDate: '2024-12-01',
            status: 'SCHEDULED',
          },
        ],
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.getUpcomingReleases(artistId)) as any[];

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/upcoming`,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getPublishedReleases', () => {
    it('should get published releases successfully', async () => {
      const artistId = '123';
      const mockResponse = {
        data: [
          {
            id: 'release-1',
            title: 'Published Album',
            type: 'album',
            releaseDate: '2024-01-01',
            status: 'PUBLISHED',
          },
        ],
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.getPublishedReleases(artistId)) as any[];

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/published`,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createRelease', () => {
    it('should create a release successfully', async () => {
      const artistId = '123';
      const createReleaseDto = {
        title: 'New Album',
        type: 'album' as const,
        releaseDate: '2024-01-01',
        coverUrl: 'https://example.com/cover.jpg',
        songIds: ['song-1', 'song-2'],
      };
      const mockResponse = {
        data: {
          id: 'release-123',
          ...createReleaseDto,
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = (await service.createRelease(
        artistId,
        createReleaseDto,
      )) as {
        id: string;
        title: string;
        type: string;
        releaseDate: string;
        coverUrl: string;
        songIds: string[];
      };

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/artists/${artistId}/releases`,
        createReleaseDto,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should send notifications to followers when creating a release', async () => {
      const artistId = '123';
      const createReleaseDto = {
        title: 'Exciting New Album',
        type: 'album' as const,
        releaseDate: '2024-01-01',
      };

      const mockResponse = {
        data: {
          id: 'release-123',
          ...createReleaseDto,
        },
      };

      // Mock the getArtist call to return artist with user_id
      const mockArtistResponse = {
        data: {
          id: artistId,
          user_id: 'user-456',
          name: 'Test Artist',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockHttpService.get.mockReturnValue(of(mockArtistResponse));

      // Mock getFollowers to return 2 pages
      mockUsersService.getFollowers.mockImplementation((_userId, page) => {
        if (page === 1) {
          return Promise.resolve({
            followers: [{ uid: 'follower1' }, { uid: 'follower2' }],
            pagination: {
              page: 1,
              limit: 50,
              total: 3,
              total_pages: 2,
            },
          });
        } else if (page === 2) {
          return Promise.resolve({
            followers: [{ uid: 'follower3' }],
            pagination: {
              page: 2,
              limit: 50,
              total: 3,
              total_pages: 2,
            },
          });
        }
        return Promise.resolve({
          followers: [],
          pagination: { total_pages: 2 },
        });
      });

      await service.createRelease(artistId, createReleaseDto);

      // Give time for async notification to potentially be called
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/artists/${artistId}/releases`,
        createReleaseDto,
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(`/artists/${artistId}`);

      // Check calls for both pages
      expect(mockUsersService.getFollowers).toHaveBeenCalledWith(
        'user-456',
        1,
        50,
      );
      expect(mockUsersService.getFollowers).toHaveBeenCalledWith(
        'user-456',
        2,
        50,
      );

      // Check notifications for first page
      expect(
        mockNotificationsService.sendNotificationToUsersDevicesBatch,
      ).toHaveBeenCalledWith({
        userIds: ['follower1', 'follower2'],
        title: 'New Release',
        body: `An artist you follow has released a new album: ${createReleaseDto.title}`,
        data: {
          type: 'release_created',
          releaseTitle: createReleaseDto.title,
          createdId: 'release-123',
          artistId,
          userId: 'user-456',
        },
      });

      // Check notifications for second page
      expect(
        mockNotificationsService.sendNotificationToUsersDevicesBatch,
      ).toHaveBeenCalledWith({
        userIds: ['follower3'],
        title: 'New Release',
        body: `An artist you follow has released a new album: ${createReleaseDto.title}`,
        data: {
          type: 'release_created',
          releaseTitle: createReleaseDto.title,
          createdId: 'release-123',
          artistId,
          userId: 'user-456',
        },
      });
    });
  });

  describe('getArtistRelease', () => {
    it('should get a specific release successfully', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const mockResponse = {
        data: {
          id: releaseId,
          title: 'Album 1',
          type: 'album',
          releaseDate: '2024-01-01',
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = (await service.getArtistRelease(artistId, releaseId)) as {
        id: string;
        title: string;
        type: string;
        releaseDate: string;
      };

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/${releaseId}`,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateRelease', () => {
    it('should update a release successfully', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const updateReleaseDto = {
        title: 'Updated Album Title',
        type: 'album' as const,
      };
      const mockResponse = {
        data: {
          id: releaseId,
          ...updateReleaseDto,
        },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.updateRelease(
        artistId,
        releaseId,
        updateReleaseDto,
      )) as {
        id: string;
        title: string;
        type: string;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/${releaseId}`,
        updateReleaseDto,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteRelease', () => {
    it('should delete a release successfully', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const mockResponse = {
        data: { message: 'Release deleted successfully' },
      };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = (await service.deleteRelease(artistId, releaseId)) as {
        message: string;
      };

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/${releaseId}`,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateReleaseCover', () => {
    it('should update release cover successfully', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const coverData = new FormData();
      const mockResponse = {
        data: { message: 'Release cover updated successfully' },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.updateReleaseCover(
        artistId,
        releaseId,
        coverData,
      )) as {
        message: string;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/${releaseId}/cover`,
        coverData,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('addSongsToRelease', () => {
    it('should add songs to release successfully', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const songData = { songIds: ['song-1', 'song-2', 'song-3'] };
      const mockResponse = {
        data: { message: 'Songs added to release successfully' },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.addSongsToRelease(
        artistId,
        releaseId,
        songData,
      )) as {
        message: string;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/${releaseId}/songs/add`,
        songData,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('removeSongsFromRelease', () => {
    it('should remove songs from release successfully', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const songData = { songIds: ['song-1', 'song-2'] };
      const mockResponse = {
        data: { message: 'Songs removed from release successfully' },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.removeSongsFromRelease(
        artistId,
        releaseId,
        songData,
      )) as {
        message: string;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/${releaseId}/songs/remove`,
        songData,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
