import { Test, TestingModule } from '@nestjs/testing';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';

describe('SongsController', () => {
  let controller: SongsController;

  const mockSongsService = {
    streamSong: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [
        {
          provide: SongsService,
          useValue: mockSongsService,
        },
      ],
    }).compile();

    controller = module.get<SongsController>(SongsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('streamSong', () => {
    it('should stream a song successfully', async () => {
      const songId = 'song123';
      const mockResult = {
        id: 'song123',
        title: 'Test Song',
        artist: 'Test Artist',
        streamUrl: 'http://example.com/stream/song123',
      };

      mockSongsService.streamSong.mockResolvedValue(mockResult);

      const result = await controller.streamSong(songId);

      expect(result).toEqual(mockResult);
      expect(mockSongsService.streamSong).toHaveBeenCalledWith(songId);
    });

    it('should handle errors when service throws', async () => {
      const songId = 'song123';
      const error = new Error('Song not found');

      mockSongsService.streamSong.mockRejectedValue(error);

      await expect(controller.streamSong(songId)).rejects.toThrow(
        'Song not found',
      );
      expect(mockSongsService.streamSong).toHaveBeenCalledWith(songId);
    });

    it('should call service with correct songId parameter', async () => {
      const songId = 'different-song-id';
      const mockResult = { id: songId };

      mockSongsService.streamSong.mockResolvedValue(mockResult);

      await controller.streamSong(songId);

      expect(mockSongsService.streamSong).toHaveBeenCalledWith(songId);
      expect(mockSongsService.streamSong).toHaveBeenCalledTimes(1);
    });
  });
});
