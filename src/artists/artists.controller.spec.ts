import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from '../metrics/metrics.service';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

describe('ArtistsController', () => {
  let controller: ArtistsController;

  const mockArtistsService = {
    getArtist: jest.fn(),
    updateArtist: jest.fn(),
    deleteArtist: jest.fn(),
    updateArtistMedia: jest.fn(),
    followArtist: jest.fn(),
    unfollowArtist: jest.fn(),
    // Release methods
    getArtistReleases: jest.fn(),
    createRelease: jest.fn(),
    getArtistRelease: jest.fn(),
    getReleaseById: jest.fn(),
    updateRelease: jest.fn(),
    deleteRelease: jest.fn(),
    updateReleaseCover: jest.fn(),
    addSongsToRelease: jest.fn(),
    removeSongsFromRelease: jest.fn(),
  };

  const mockMetricsService = {
    recordAlbumLike: jest.fn(),
    recordAlbumShare: jest.fn(),
    recordAlbumCreation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        {
          provide: ArtistsService,
          useValue: mockArtistsService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getArtist', () => {
    it('should get an artist by id', async () => {
      const artistId = '123';
      const mockResult = {
        id: '123',
        name: 'Test Artist',
        bio: 'Test bio',
      };

      mockArtistsService.getArtist.mockResolvedValue(mockResult);

      const result = (await controller.getArtist(artistId)) as {
        id: string;
        name: string;
        bio: string;
      };

      expect(mockArtistsService.getArtist).toHaveBeenCalledWith(artistId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateArtist', () => {
    it('should update an artist', async () => {
      const artistId = '123';
      const updateArtistDto: UpdateArtistDto = {
        name: 'Updated Artist',
      };

      const mockResult = {
        id: '123',
        name: 'Updated Artist',
      };

      mockArtistsService.updateArtist.mockResolvedValue(mockResult);

      const result = (await controller.updateArtist(
        artistId,
        updateArtistDto,
      )) as {
        id: string;
        name: string;
      };

      expect(mockArtistsService.updateArtist).toHaveBeenCalledWith(
        artistId,
        updateArtistDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteArtist', () => {
    it('should delete an artist', async () => {
      const artistId = '123';
      const mockResult = { message: 'Artist deleted successfully' };

      mockArtistsService.deleteArtist.mockResolvedValue(mockResult);

      const result = (await controller.deleteArtist(artistId)) as {
        message: string;
      };

      expect(mockArtistsService.deleteArtist).toHaveBeenCalledWith(artistId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateArtistMedia', () => {
    it('should update artist media', async () => {
      const artistId = '123';
      const mockFiles = {
        image: [
          {
            buffer: Buffer.from('test'),
            originalname: 'test.jpg',
          },
        ],
        cover: [
          {
            buffer: Buffer.from('cover'),
            originalname: 'cover.jpg',
          },
        ],
      };

      const mockResult = { message: 'Media updated successfully' };

      mockArtistsService.updateArtistMedia.mockResolvedValue(mockResult);

      const result = (await controller.updateArtistMedia(
        artistId,
        mockFiles,
      )) as {
        message: string;
      };

      expect(mockArtistsService.updateArtistMedia).toHaveBeenCalledWith(
        artistId,
        expect.any(FormData),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('followArtist', () => {
    it('should follow an artist', async () => {
      const artistId = '123';
      const mockResult = { followersCount: 1 };

      mockArtistsService.followArtist.mockResolvedValue(mockResult);

      const result = await controller.followArtist(artistId);

      expect(mockArtistsService.followArtist).toHaveBeenCalledWith(artistId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('unfollowArtist', () => {
    it('should unfollow an artist', async () => {
      const artistId = '123';
      const mockResult = { followersCount: 0 };

      mockArtistsService.unfollowArtist.mockResolvedValue(mockResult);

      const result = await controller.unfollowArtist(artistId);

      expect(mockArtistsService.unfollowArtist).toHaveBeenCalledWith(artistId);
      expect(result).toEqual(mockResult);
    });
  });

  // Release endpoints tests
  describe('getArtistReleases', () => {
    it('should get artist releases', async () => {
      const artistId = '123';
      const mockResult = [
        {
          id: 'release-1',
          title: 'Album 1',
          type: 'album',
          releaseDate: '2024-01-01',
        },
      ];

      mockArtistsService.getArtistReleases.mockResolvedValue(mockResult);

      const result = (await controller.getArtistReleases(artistId)) as any[];

      expect(mockArtistsService.getArtistReleases).toHaveBeenCalledWith(
        artistId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('createRelease', () => {
    it('should create a release and record album creation in metrics', async () => {
      const artistId = '123';
      const createReleaseDto: CreateReleaseDto = {
        title: 'New Album',
        type: 'album',
        releaseDate: '2024-01-01',
        coverUrl: 'https://example.com/cover.jpg',
        artistId: '123',
        songIds: ['song-1', 'song-2'],
      };

      const mockResult = {
        id: 'release-123',
        ...createReleaseDto,
      };

      mockArtistsService.createRelease.mockResolvedValue(mockResult);
      mockMetricsService.recordAlbumCreation.mockResolvedValue(undefined);

      const result = (await controller.createRelease(
        artistId,
        createReleaseDto,
      )) as {
        id: string;
        title: string;
        type: string;
        releaseDate: string;
        coverUrl: string;
        artistId: string;
        songIds: string[];
      };

      expect(mockArtistsService.createRelease).toHaveBeenCalledWith(
        artistId,
        createReleaseDto,
      );
      expect(mockMetricsService.recordAlbumCreation).toHaveBeenCalledWith(
        'release-123',
      );
      expect(result).toEqual(mockResult);
    });

    it('should create a release and handle metrics recording failure gracefully', async () => {
      const artistId = '123';
      const createReleaseDto: CreateReleaseDto = {
        title: 'New Album',
        type: 'album',
        releaseDate: '2024-01-01',
        coverUrl: 'https://example.com/cover.jpg',
        artistId: '123',
        songIds: ['song-1', 'song-2'],
      };

      const mockResult = {
        id: 'release-123',
        ...createReleaseDto,
      };

      mockArtistsService.createRelease.mockResolvedValue(mockResult);
      mockMetricsService.recordAlbumCreation.mockRejectedValue(
        new Error('Metrics service error'),
      );

      // Mock console.error to verify it's called
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = (await controller.createRelease(
        artistId,
        createReleaseDto,
      )) as {
        id: string;
        title: string;
        type: string;
        releaseDate: string;
        coverUrl: string;
        artistId: string;
        songIds: string[];
      };

      expect(mockArtistsService.createRelease).toHaveBeenCalledWith(
        artistId,
        createReleaseDto,
      );
      expect(mockMetricsService.recordAlbumCreation).toHaveBeenCalledWith(
        'release-123',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to record album creation in metrics:',
        expect.any(Error),
      );
      expect(result).toEqual(mockResult);

      consoleSpy.mockRestore();
    });

    it('should create a release and not call metrics if release has no id', async () => {
      const artistId = '123';
      const createReleaseDto: CreateReleaseDto = {
        title: 'New Album',
        type: 'album',
        releaseDate: '2024-01-01',
        coverUrl: 'https://example.com/cover.jpg',
        artistId: '123',
        songIds: ['song-1', 'song-2'],
      };

      const mockResult = {
        // No id property
        ...createReleaseDto,
      };

      mockArtistsService.createRelease.mockResolvedValue(mockResult);

      const result = await controller.createRelease(artistId, createReleaseDto);

      expect(mockArtistsService.createRelease).toHaveBeenCalledWith(
        artistId,
        createReleaseDto,
      );
      expect(mockMetricsService.recordAlbumCreation).not.toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getArtistRelease', () => {
    it('should get a specific release', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const mockResult = {
        id: releaseId,
        title: 'Album 1',
        type: 'album',
        releaseDate: '2024-01-01',
      };

      mockArtistsService.getArtistRelease.mockResolvedValue(mockResult);

      const result = (await controller.getArtistRelease(
        artistId,
        releaseId,
      )) as {
        id: string;
        title: string;
        type: string;
        releaseDate: string;
      };

      expect(mockArtistsService.getArtistRelease).toHaveBeenCalledWith(
        artistId,
        releaseId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateRelease', () => {
    it('should update a release', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const updateReleaseDto: UpdateReleaseDto = {
        title: 'Updated Album Title',
        type: 'album',
      };

      const mockResult = {
        id: releaseId,
        ...updateReleaseDto,
      };

      mockArtistsService.updateRelease.mockResolvedValue(mockResult);

      const result = (await controller.updateRelease(
        artistId,
        releaseId,
        updateReleaseDto,
      )) as {
        id: string;
        title: string;
        type: string;
      };

      expect(mockArtistsService.updateRelease).toHaveBeenCalledWith(
        artistId,
        releaseId,
        updateReleaseDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteRelease', () => {
    it('should delete a release', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const mockResult = { message: 'Release deleted successfully' };

      mockArtistsService.deleteRelease.mockResolvedValue(mockResult);

      const result = (await controller.deleteRelease(artistId, releaseId)) as {
        message: string;
      };

      expect(mockArtistsService.deleteRelease).toHaveBeenCalledWith(
        artistId,
        releaseId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateReleaseCover', () => {
    it('should update release cover', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const mockCover = {
        buffer: Buffer.from('test'),
        originalname: 'cover.jpg',
      };

      const mockResult = { message: 'Release cover updated successfully' };

      mockArtistsService.updateReleaseCover.mockResolvedValue(mockResult);

      const result = (await controller.updateReleaseCover(
        artistId,
        releaseId,
        mockCover,
      )) as {
        message: string;
      };

      expect(mockArtistsService.updateReleaseCover).toHaveBeenCalledWith(
        artistId,
        releaseId,
        expect.any(FormData),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('addSongsToRelease', () => {
    it('should add songs to release', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const songData = { songIds: ['song-1', 'song-2', 'song-3'] };

      const mockResult = { message: 'Songs added to release successfully' };

      mockArtistsService.addSongsToRelease.mockResolvedValue(mockResult);

      const result = (await controller.addSongsToRelease(
        artistId,
        releaseId,
        songData,
      )) as {
        message: string;
      };

      expect(mockArtistsService.addSongsToRelease).toHaveBeenCalledWith(
        artistId,
        releaseId,
        songData,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeSongsFromRelease', () => {
    it('should remove songs from release', async () => {
      const artistId = '123';
      const releaseId = 'release-123';
      const songData = { songIds: ['song-1', 'song-2'] };

      const mockResult = { message: 'Songs removed from release successfully' };

      mockArtistsService.removeSongsFromRelease.mockResolvedValue(mockResult);

      const result = (await controller.removeSongsFromRelease(
        artistId,
        releaseId,
        songData,
      )) as {
        message: string;
      };

      expect(mockArtistsService.removeSongsFromRelease).toHaveBeenCalledWith(
        artistId,
        releaseId,
        songData,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('likeAlbum', () => {
    it('should like an album', async () => {
      const artistId = '123';
      const releaseId = 'release-123';

      const mockReleaseData = { id: releaseId, title: 'Test Album' };
      mockArtistsService.getReleaseById.mockResolvedValue(mockReleaseData);
      mockMetricsService.recordAlbumLike.mockResolvedValue(undefined);

      const result = await controller.likeAlbum(artistId, releaseId);

      expect(mockArtistsService.getReleaseById).toHaveBeenCalledWith(releaseId);
      expect(mockMetricsService.recordAlbumLike).toHaveBeenCalledWith(
        releaseId,
      );
      expect(result).toEqual({ message: 'Album like recorded successfully' });
    });
  });

  describe('shareAlbum', () => {
    it('should share an album', async () => {
      const artistId = '123';
      const releaseId = 'release-123';

      const mockReleaseData = { id: releaseId, title: 'Test Album' };
      mockArtistsService.getReleaseById.mockResolvedValue(mockReleaseData);
      mockMetricsService.recordAlbumShare.mockResolvedValue(undefined);

      const result = await controller.shareAlbum(artistId, releaseId);

      expect(mockArtistsService.getReleaseById).toHaveBeenCalledWith(releaseId);
      expect(mockMetricsService.recordAlbumShare).toHaveBeenCalledWith(
        releaseId,
      );
      expect(result).toEqual({ message: 'Album share recorded successfully' });
    });
  });
});
