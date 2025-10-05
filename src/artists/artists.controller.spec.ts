import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { UpdateBioDto } from './dto/update-bio.dto';

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
});
