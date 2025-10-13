import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { Readable } from 'stream';
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
    } as unknown as Request;

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
    mockPipeline.mockClear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('streamSong', () => {
    it('should stream a song successfully without range headers', async () => {
      const songId = 'song123';
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
      mockPipeline.mockResolvedValue(undefined);

      await controller.streamSong(songId, mockResponse, mockRequest);

      expect(mockSongsService.streamSong).toHaveBeenCalledWith(
        songId,
        undefined,
      );
      expect(mockWriteHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': '1024000',
        'Accept-Ranges': 'bytes',
      });
      expect(mockPipeline).toHaveBeenCalledWith(mockStream, mockResponse);
    });

    it('should stream a song successfully with range headers', async () => {
      const songId = 'song456';
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
      } as unknown as Request;

      mockSongsService.streamSong.mockResolvedValue(mockServiceResponse);
      mockPipeline.mockResolvedValue(undefined);

      await controller.streamSong(songId, mockResponse, requestWithRange);

      expect(mockSongsService.streamSong).toHaveBeenCalledWith(
        songId,
        rangeHeader,
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
      mockPipeline.mockResolvedValue(undefined);

      await controller.streamSong(songId, mockResponse, mockRequest);

      expect(mockWriteHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
      });
    });

    it('should handle service error with response object', async () => {
      const songId = 'song404';
      const error = {
        response: {
          status: 404,
          data: 'Song not found',
        },
      };

      mockSongsService.streamSong.mockRejectedValue(error);

      await controller.streamSong(songId, mockResponse, mockRequest);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('Song not found');
    });

    it('should handle generic error without response object', async () => {
      const songId = 'song500';
      const error = new Error('Generic error');

      mockSongsService.streamSong.mockRejectedValue(error);

      await controller.streamSong(songId, mockResponse, mockRequest);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith(
        'An unexpected error occurred while streaming.',
      );
    });

    it('should destroy response if headers already sent on error', async () => {
      const songId = 'song500';
      const error = new Error('Pipeline error');

      mockSongsService.streamSong.mockResolvedValue({
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
        data: new Readable(),
      });

      // Simulate headers already sent
      mockResponse.headersSent = true;
      mockPipeline.mockRejectedValue(error);

      await controller.streamSong(songId, mockResponse, mockRequest);

      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should handle pipeline errors when headers not sent', async () => {
      const songId = 'song500';
      const mockStream = new Readable();
      const mockServiceResponse = {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
        data: mockStream,
      };

      mockSongsService.streamSong.mockResolvedValue(mockServiceResponse);
      mockPipeline.mockRejectedValue(new Error('Pipeline failed'));

      await controller.streamSong(songId, mockResponse, mockRequest);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith(
        'An unexpected error occurred while streaming.',
      );
    });
  });
});
