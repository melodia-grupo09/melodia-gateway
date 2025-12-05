import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { Readable } from 'stream';
import { MetricsService } from '../metrics/metrics.service';
import { UsersService } from '../users/users.service';
import { UploadSongDTO } from './dto/upload-song.dto';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';

// Mock the pipeline function from stream/promises
jest.mock('stream/promises', () => ({
  pipeline: jest.fn(),
}));

import { pipeline } from 'stream/promises';
const mockPipeline = pipeline as jest.MockedFunction<typeof pipeline>;

describe('SongsController', () => {
  let controller: SongsController;
  let mockResponse: Response;
  let mockRequest: Request;
  let mockWriteHead: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let mockDestroy: jest.Mock;

  const mockSongsService = {
    streamSong: jest.fn(),
    uploadSong: jest.fn(),
    getSongById: jest.fn(),
  };

  const mockMetricsService = {
    recordSongPlay: jest.fn(),
    recordSongUpload: jest.fn(),
    recordSongLike: jest.fn(),
    recordSongShare: jest.fn(),
    trackUserActivity: jest.fn(),
  };

  const mockUsersService = {
    getUserRegion: jest.fn().mockResolvedValue('AR'),
  };

  beforeEach(async () => {
    mockWriteHead = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn().mockReturnThis();
    mockDestroy = jest.fn();

    mockResponse = {
      writeHead: mockWriteHead,
      headersSent: false,
      status: mockStatus,
      send: mockSend,
      destroy: mockDestroy,
    } as unknown as Response;

    mockRequest = {
      headers: {},
    } as Request;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [
        {
          provide: SongsService,
          useValue: mockSongsService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
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

    controller = module.get<SongsController>(SongsController);

    jest.clearAllMocks();
    mockPipeline.mockClear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('streamSong', () => {
    it('should stream a song successfully without range headers', async () => {
      const songId = 'song123';
      const mockUser = { uid: 'user123', email: 'test@example.com' };
      const artistId = 'artist123';
      const mockStream = new Readable();
      const mockServiceResponse = {
        status: 200,
        headers: {
          'content-type': 'audio/mpeg',
          'content-length': '1024000',
          'accept-ranges': 'bytes',
        },
        data: mockStream,
      };

      mockSongsService.streamSong.mockResolvedValue(mockServiceResponse);
      mockMetricsService.trackUserActivity.mockResolvedValue(undefined);
      mockPipeline.mockResolvedValue(undefined);

      await controller.streamSong(
        songId,
        mockUser,
        mockResponse,
        mockRequest,
        artistId,
      );

      expect(mockSongsService.streamSong).toHaveBeenCalledWith(
        songId,
        undefined,
        'user123',
        artistId,
        'unknown',
      );
      expect(mockMetricsService.trackUserActivity).toHaveBeenCalledWith(
        'user123',
        'song_play',
      );
      expect(mockWriteHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': '1024000',
        'Accept-Ranges': 'bytes',
      });
      expect(mockPipeline).toHaveBeenCalledWith(mockStream, mockResponse);
    });

    it('should pass user region when authorization token is present', async () => {
      const songId = 'song123';
      const mockUser = { uid: 'user123', email: 'test@example.com' };
      const artistId = 'artist123';
      const mockStream = new Readable();
      const mockServiceResponse = {
        status: 200,
        headers: {
          'content-type': 'audio/mpeg',
        },
        data: mockStream,
      };

      const requestWithAuth = {
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as Request;

      mockSongsService.streamSong.mockResolvedValue(mockServiceResponse);
      mockMetricsService.trackUserActivity.mockResolvedValue(undefined);
      mockPipeline.mockResolvedValue(undefined);

      await controller.streamSong(
        songId,
        mockUser,
        mockResponse,
        requestWithAuth,
        artistId,
      );

      expect(mockUsersService.getUserRegion).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(mockSongsService.streamSong).toHaveBeenCalledWith(
        songId,
        undefined,
        'user123',
        artistId,
        'AR',
      );
    });

    it('should stream a song successfully with range headers', async () => {
      const songId = 'song456';
      const mockUser = { uid: 'user456', email: 'test@example.com' };
      const artistId = 'artist456';
      const rangeHeader = 'bytes=0-1023';
      const mockStream = new Readable();
      const mockServiceResponse = {
        status: 206,
        headers: {
          'content-type': 'audio/mpeg',
          'content-length': '1024',
          'content-range': 'bytes 0-1023/1024000',
          'accept-ranges': 'bytes',
        },
        data: mockStream,
      };

      const requestWithRange = {
        headers: { range: rangeHeader },
      } as Request;

      mockSongsService.streamSong.mockResolvedValue(mockServiceResponse);
      mockMetricsService.trackUserActivity.mockResolvedValue(undefined);
      mockPipeline.mockResolvedValue(undefined);

      await controller.streamSong(
        songId,
        mockUser,
        mockResponse,
        requestWithRange,
        artistId,
      );

      expect(mockSongsService.streamSong).toHaveBeenCalledWith(
        songId,
        rangeHeader,
        'user456',
        artistId,
        'unknown',
      );
      expect(mockMetricsService.trackUserActivity).toHaveBeenCalledWith(
        'user456',
        'song_play',
      );
      expect(mockWriteHead).toHaveBeenCalledWith(206, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': '1024',
        'Content-Range': 'bytes 0-1023/1024000',
        'Accept-Ranges': 'bytes',
      });
      expect(mockPipeline).toHaveBeenCalledWith(mockStream, mockResponse);
    });

    it('should filter out null headers', async () => {
      const songId = 'song789';
      const mockUser = { uid: 'user789', email: 'test@example.com' };
      const artistId = 'artist789';
      const mockStream = new Readable();
      const mockServiceResponse = {
        status: 200,
        headers: {
          'content-type': 'audio/mpeg',
          'content-length': null,
          'content-range': undefined,
          'accept-ranges': 'bytes',
        },
        data: mockStream,
      };

      mockSongsService.streamSong.mockResolvedValue(mockServiceResponse);
      mockMetricsService.trackUserActivity.mockResolvedValue(undefined);
      mockPipeline.mockResolvedValue(undefined);

      await controller.streamSong(
        songId,
        mockUser,
        mockResponse,
        mockRequest,
        artistId,
      );

      expect(mockSongsService.streamSong).toHaveBeenCalledWith(
        songId,
        undefined,
        'user789',
        artistId,
        'unknown',
      );
      expect(mockMetricsService.trackUserActivity).toHaveBeenCalledWith(
        'user789',
        'song_play',
      );
      expect(mockWriteHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
      });
    });

    it('should handle service error with response object', async () => {
      const songId = 'song404';
      const mockUser = { uid: 'user404', email: 'test@example.com' };
      const artistId = 'artist404';
      const error = {
        response: {
          status: 404,
          data: 'Song not found',
        },
      };

      mockSongsService.streamSong.mockRejectedValue(error);

      await controller.streamSong(
        songId,
        mockUser,
        mockResponse,
        mockRequest,
        artistId,
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('Song not found');
    });

    it('should handle generic error without response object', async () => {
      const songId = 'song500';
      const mockUser = { uid: 'user500', email: 'test@example.com' };
      const artistId = 'artist500';
      const error = new Error('Generic error');

      mockSongsService.streamSong.mockRejectedValue(error);

      await controller.streamSong(
        songId,
        mockUser,
        mockResponse,
        mockRequest,
        artistId,
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith(
        'An unexpected error occurred while streaming.',
      );
    });

    it('should destroy response if headers already sent on error', async () => {
      const songId = 'song500';
      const mockUser = { uid: 'user500b', email: 'test@example.com' };
      const artistId = 'artist500b';
      const error = new Error('Pipeline error');

      mockSongsService.streamSong.mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
        data: new Readable(),
      });

      // Simulate headers already sent
      mockResponse.headersSent = true;
      mockPipeline.mockRejectedValue(error);

      await controller.streamSong(
        songId,
        mockUser,
        mockResponse,
        mockRequest,
        artistId,
      );

      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should handle pipeline errors when headers not sent', async () => {
      const songId = 'song500';
      const mockUser = { uid: 'user500c', email: 'test@example.com' };
      const artistId = 'artist500c';
      const mockStream = new Readable();
      const mockServiceResponse = {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
        data: mockStream,
      };

      mockSongsService.streamSong.mockResolvedValue(mockServiceResponse);
      mockPipeline.mockRejectedValue(new Error('Pipeline failed'));

      await controller.streamSong(
        songId,
        mockUser,
        mockResponse,
        mockRequest,
        artistId,
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith(
        'An unexpected error occurred while streaming.',
      );
    });
  });

  describe('uploadSong', () => {
    it('should upload a song successfully', async () => {
      const uploadDTO: UploadSongDTO = {
        title: 'Test Song',
        artists: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Artist',
          },
        ],
        albumId: 'album-123',
      };

      const mockFile = {
        buffer: Buffer.from('test audio data'),
        originalname: 'test-song.mp3',
        mimetype: 'audio/mpeg',
      };

      const mockResponse = {
        id: 'song-123',
        title: 'Test Song',
        message: 'Song uploaded successfully',
      };

      mockSongsService.uploadSong.mockResolvedValue(mockResponse);

      const result: unknown = await controller.uploadSong(uploadDTO, mockFile);

      expect(mockSongsService.uploadSong).toHaveBeenCalledWith(
        expect.any(FormData),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException when file is missing', async () => {
      const uploadDTO: UploadSongDTO = {
        title: 'Test Song',
        artists: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Artist',
          },
        ],
      };

      await expect(controller.uploadSong(uploadDTO, undefined)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.uploadSong(uploadDTO, undefined)).rejects.toThrow(
        'File is required',
      );
    });

    it('should handle upload without albumId', async () => {
      const uploadDTO: UploadSongDTO = {
        title: 'Test Song',
        artists: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Artist',
          },
        ],
        // No albumId provided
      };

      const mockFile = {
        buffer: Buffer.from('test audio data'),
        originalname: 'test-song.mp3',
        mimetype: 'audio/mpeg',
      };

      const mockResponse = {
        id: 'song-123',
        title: 'Test Song',
        message: 'Song uploaded successfully',
      };

      mockSongsService.uploadSong.mockResolvedValue(mockResponse);

      const result: unknown = await controller.uploadSong(uploadDTO, mockFile);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('likeSong', () => {
    it('should like a song', async () => {
      const songId = 'song-123';
      const mockUser = { uid: 'user-123', email: 'test@example.com' };

      const mockSongData = {
        id: songId,
        title: 'Test Song',
        artists: [{ id: 'artist-123' }],
      };
      mockSongsService.getSongById.mockResolvedValue(mockSongData);
      mockMetricsService.recordSongLike.mockResolvedValue(undefined);

      const result = await controller.likeSong(songId, mockUser, mockRequest);

      expect(mockSongsService.getSongById).toHaveBeenCalledWith(songId);
      expect(mockMetricsService.recordSongLike).toHaveBeenCalledWith(
        songId,
        'user-123',
        'artist-123',
        'unknown',
      );
      expect(result).toEqual({ message: 'Song like recorded successfully' });
    });
  });

  describe('shareSong', () => {
    it('should share a song', async () => {
      const songId = 'song-123';
      const mockUser = { uid: 'user-123', email: 'test@example.com' };

      const mockSongData = {
        id: songId,
        title: 'Test Song',
        artists: [{ id: 'artist-123' }],
      };
      mockSongsService.getSongById.mockResolvedValue(mockSongData);
      mockMetricsService.recordSongShare.mockResolvedValue(undefined);
      mockMetricsService.trackUserActivity.mockResolvedValue(undefined);

      const result = await controller.shareSong(songId, mockUser, mockRequest);

      expect(mockSongsService.getSongById).toHaveBeenCalledWith(songId);
      expect(mockMetricsService.recordSongShare).toHaveBeenCalledWith(
        songId,
        'user-123',
        'artist-123',
        'unknown',
      );
      expect(mockMetricsService.trackUserActivity).toHaveBeenCalledWith(
        'user-123',
        'song_share',
      );
      expect(result).toEqual({ message: 'Song share recorded successfully' });
    });
  });
});
