import { Test, TestingModule } from '@nestjs/testing';
import { ShareSongsDto } from './dto/share-songs.dto';
import { FeedController } from './feed.controller';
import { UsersService } from './users.service';

describe('FeedController', () => {
  let controller: FeedController;

  const mockUsersService = {
    shareSongs: jest.fn(),
    getUserFeed: jest.fn(),
    removeSongsFromFeed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeedController>(FeedController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shareSongs', () => {
    it('should share songs successfully', async () => {
      const uid = 'user123';
      const shareSongsDto: ShareSongsDto = {
        song_ids: ['song1', 'song2'],
      };
      const mockUser = { uid: 'sender123', name: 'Sender' };
      const mockResult = { message: 'Songs shared successfully' };

      mockUsersService.shareSongs.mockResolvedValue(mockResult);

      const result = await controller.shareSongs(uid, shareSongsDto, mockUser);

      expect(mockUsersService.shareSongs).toHaveBeenCalledWith(
        uid,
        shareSongsDto,
        mockUser,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserFeed', () => {
    it('should get user feed successfully', async () => {
      const uid = 'user123';
      const mockResult = {
        feed: [
          { id: 'song1', title: 'Song 1' },
          { id: 'song2', title: 'Song 2' },
        ],
      };

      mockUsersService.getUserFeed.mockResolvedValue(mockResult);

      const result = await controller.getUserFeed(uid);

      expect(mockUsersService.getUserFeed).toHaveBeenCalledWith(uid);
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeSongsFromFeed', () => {
    it('should remove songs from feed successfully', async () => {
      const uid = 'user123';
      const songIds = ['song1', 'song2'];
      const mockResult = { message: 'Songs removed successfully' };

      mockUsersService.removeSongsFromFeed.mockResolvedValue(mockResult);

      const result = await controller.removeSongsFromFeed(uid, songIds);

      expect(mockUsersService.removeSongsFromFeed).toHaveBeenCalledWith(
        uid,
        songIds,
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle single song id as string', async () => {
      const uid = 'user123';
      const songId = 'song1';
      const mockResult = { message: 'Songs removed successfully' };

      mockUsersService.removeSongsFromFeed.mockResolvedValue(mockResult);

      // @ts-expect-error testing runtime behavior of query param
      const result = await controller.removeSongsFromFeed(uid, songId);

      expect(mockUsersService.removeSongsFromFeed).toHaveBeenCalledWith(uid, [
        songId,
      ]);
      expect(result).toEqual(mockResult);
    });
  });
});
