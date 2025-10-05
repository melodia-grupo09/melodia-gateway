import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { ArtistsService } from './artists.service';

describe('ArtistsService', () => {
  let service: ArtistsService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
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

    it('should throw error when artist not found', async () => {
      const artistId = '123';
      const error = new Error('Artist not found');

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getArtist(artistId)).rejects.toThrow(
        'Artist not found',
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

  describe('updateArtistBio', () => {
    it('should update artist bio successfully', async () => {
      const artistId = '123';
      const bioData = {
        bio: 'Updated bio',
        socialLinks: { instagram: 'https://instagram.com/artist' },
      };
      const mockResponse = {
        data: {
          id: '123',
          bio: 'Updated bio',
          socialLinks: { instagram: 'https://instagram.com/artist' },
        },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.updateArtistBio(artistId, bioData)) as {
        id: string;
        bio: string;
        socialLinks: { instagram: string };
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/bio`,
        bioData,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateArtistImage', () => {
    it('should update artist image successfully', async () => {
      const artistId = '123';
      const imageData = new FormData();
      const mockResponse = {
        data: { message: 'Image updated successfully' },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.updateArtistImage(artistId, imageData)) as {
        message: string;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/image`,
        imageData,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateArtistCover', () => {
    it('should update artist cover successfully', async () => {
      const artistId = '123';
      const coverData = new FormData();
      const mockResponse = {
        data: { message: 'Cover updated successfully' },
      };

      mockHttpService.patch.mockReturnValue(of(mockResponse));

      const result = (await service.updateArtistCover(artistId, coverData)) as {
        message: string;
      };

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/artists/${artistId}/cover`,
        coverData,
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

  describe('createRelease', () => {
    it('should create a release successfully', async () => {
      const artistId = '123';
      const createReleaseDto = {
        title: 'New Album',
        type: 'album' as const,
        releaseDate: '2024-01-01',
        coverUrl: 'https://example.com/cover.jpg',
        artistId: '123',
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
        artistId: string;
        songIds: string[];
      };

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/artists/${artistId}/releases`,
        createReleaseDto,
      );
      expect(result).toEqual(mockResponse.data);
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

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = (await service.addSongsToRelease(
        artistId,
        releaseId,
        songData,
      )) as {
        message: string;
      };

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/${releaseId}/songs`,
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

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = (await service.removeSongsFromRelease(
        artistId,
        releaseId,
        songData,
      )) as {
        message: string;
      };

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/artists/${artistId}/releases/${releaseId}/songs`,
        { data: songData },
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
