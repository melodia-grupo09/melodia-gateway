import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { SongsService } from './songs.service';

describe('SongsService', () => {
  let service: SongsService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<SongsService>(SongsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('streamSong', () => {
    it('should successfully stream a song', async () => {
      const songId = 'song123';
      const mockResponse = {
        data: {
          id: 'song123',
          title: 'Test Song',
          artist: 'Test Artist',
          streamUrl: 'http://example.com/stream/song123',
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.streamSong(songId);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        '/songs/player/play/song123',
      );
    });

    it('should handle errors when streaming fails', async () => {
      const songId = 'song123';
      const error = new Error('Song not found');

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.streamSong(songId)).rejects.toThrow(
        'Song not found',
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        '/songs/player/play/song123',
      );
    });

    it('should call correct endpoint with songId parameter', async () => {
      const songId = 'different-song-id';
      const mockResponse = { data: { id: songId } };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      await service.streamSong(songId);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/songs/player/play/${songId}`,
      );
    });
  });
});
