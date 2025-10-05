import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { UpdateBioDto } from './dto/update-bio.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

describe('ArtistsController', () => {
  let controller: ArtistsController;

  const mockArtistsService = {
    createArtist: jest.fn(),
    getArtist: jest.fn(),
    updateArtist: jest.fn(),
    deleteArtist: jest.fn(),
    updateArtistBio: jest.fn(),
    updateArtistImage: jest.fn(),
    updateArtistCover: jest.fn(),
    // Release methods
    getArtistReleases: jest.fn(),
    createRelease: jest.fn(),
    getArtistRelease: jest.fn(),
    updateRelease: jest.fn(),
    deleteRelease: jest.fn(),
    updateReleaseCover: jest.fn(),
    addSongsToRelease: jest.fn(),
    removeSongsFromRelease: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        {
          provide: ArtistsService,
          useValue: mockArtistsService,
        },
      ],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createArtist', () => {
    it('should create an artist successfully', async () => {
      const createArtistDto: CreateArtistDto = {
        name: 'Test Artist',
      };

      const mockResult = {
        id: '123',
        name: 'Test Artist',
        createdAt: '2024-01-01T00:00:00Z',
      };

      mockArtistsService.createArtist.mockResolvedValue(mockResult);

      const result = (await controller.createArtist(createArtistDto)) as {
        id: string;
        name: string;
        createdAt: string;
      };

      expect(mockArtistsService.createArtist).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should create an artist with image', async () => {
      const createArtistDto: CreateArtistDto = {
        name: 'Test Artist',
      };

      const mockImage = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      };

      const mockResult = {
        id: '123',
        name: 'Test Artist',
        imageUrl: 'http://example.com/image.jpg',
      };

      mockArtistsService.createArtist.mockResolvedValue(mockResult);

      const result = (await controller.createArtist(
        createArtistDto,
        mockImage,
      )) as {
        id: string;
        name: string;
        imageUrl: string;
      };

      expect(mockArtistsService.createArtist).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
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

  describe('updateArtistBio', () => {
    it('should update artist bio', async () => {
      const artistId = '123';
      const updateBioDto: UpdateBioDto = {
        bio: 'Updated bio',
        socialLinks: {
          instagram: 'https://instagram.com/artist',
        },
      };

      const mockResult = {
        id: '123',
        bio: 'Updated bio',
        socialLinks: {
          instagram: 'https://instagram.com/artist',
        },
      };

      mockArtistsService.updateArtistBio.mockResolvedValue(mockResult);

      const result = (await controller.updateArtistBio(
        artistId,
        updateBioDto,
      )) as {
        id: string;
        bio: string;
        socialLinks: { instagram: string };
      };

      expect(mockArtistsService.updateArtistBio).toHaveBeenCalledWith(
        artistId,
        updateBioDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateArtistImage', () => {
    it('should update artist image', async () => {
      const artistId = '123';
      const mockImage = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      };

      const mockResult = { message: 'Image updated successfully' };

      mockArtistsService.updateArtistImage.mockResolvedValue(mockResult);

      const result = (await controller.updateArtistImage(
        artistId,
        mockImage,
      )) as {
        message: string;
      };

      expect(mockArtistsService.updateArtistImage).toHaveBeenCalledWith(
        artistId,
        expect.any(FormData),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateArtistCover', () => {
    it('should update artist cover', async () => {
      const artistId = '123';
      const mockCover = {
        buffer: Buffer.from('test'),
        originalname: 'cover.jpg',
      };

      const mockResult = { message: 'Cover updated successfully' };

      mockArtistsService.updateArtistCover.mockResolvedValue(mockResult);

      const result = (await controller.updateArtistCover(
        artistId,
        mockCover,
      )) as {
        message: string;
      };

      expect(mockArtistsService.updateArtistCover).toHaveBeenCalledWith(
        artistId,
        expect.any(FormData),
      );
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
    it('should create a release', async () => {
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

      const result = await controller.createRelease(artistId, createReleaseDto);

      expect(mockArtistsService.createRelease).toHaveBeenCalledWith(
        artistId,
        createReleaseDto,
      );
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

      const result = await controller.getArtistRelease(artistId, releaseId);

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

      const result = await controller.updateRelease(
        artistId,
        releaseId,
        updateReleaseDto,
      );

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

      const result = await controller.deleteRelease(artistId, releaseId);

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

      const result = await controller.updateReleaseCover(
        artistId,
        releaseId,
        mockCover,
      );

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

      const result = await controller.addSongsToRelease(
        artistId,
        releaseId,
        songData,
      );

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

      const result = await controller.removeSongsFromRelease(
        artistId,
        releaseId,
        songData,
      );

      expect(mockArtistsService.removeSongsFromRelease).toHaveBeenCalledWith(
        artistId,
        releaseId,
        songData,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
