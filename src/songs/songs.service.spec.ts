import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { Readable } from 'stream';
import { MetricsService } from '../metrics/metrics.service';
import { SongsService } from './songs.service';

describe('SongsService', () => {
  let service: SongsService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const mockMetricsService = {
    recordSongPlay: jest.fn(),
    recordSongUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
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
    it('should successfully stream a song without range headers', async () => {
      const songId = 'song123';
      const mockStream = new Readable();
      const mockResponse = {
        data: mockStream,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'audio/mpeg',
          'content-length': '1024000',
        },
      } as unknown as AxiosResponse<Readable>;

      mockHttpService.get.mockReturnValue(of(mockResponse));
      mockMetricsService.recordSongPlay.mockResolvedValue(undefined);

      const result = await service.streamSong(songId, undefined);

      expect(result).toEqual(mockResponse);
      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(songId);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        '/songs/player/play/song123',
        {
          headers: {},
          responseType: 'stream',
        },
      );
    });

    it('should successfully stream a song with range headers', async () => {
      const songId = 'song456';
      const range = 'bytes=0-1023';
      const mockStream = new Readable();
      const mockResponse = {
        data: mockStream,
        status: 206,
        statusText: 'Partial Content',
        headers: {
          'content-type': 'audio/mpeg',
          'content-length': '1024',
          'content-range': 'bytes 0-1023/1024000',
          'accept-ranges': 'bytes',
        },
      } as unknown as AxiosResponse<Readable>;

      mockHttpService.get.mockReturnValue(of(mockResponse));
      mockMetricsService.recordSongPlay.mockResolvedValue(undefined);

      const result = await service.streamSong(songId, range);

      expect(result).toEqual(mockResponse);
      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(songId);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        '/songs/player/play/song456',
        {
          headers: { range },
          responseType: 'stream',
        },
      );
    });

    it('should handle range as string array', async () => {
      const songId = 'song789';
      const rangeArray = ['bytes=0-1023', 'bytes=1024-2047'];
      const mockStream = new Readable();
      const mockResponse = {
        data: mockStream,
        status: 206,
        statusText: 'Partial Content',
        headers: {
          'content-type': 'audio/mpeg',
        },
      } as unknown as AxiosResponse<Readable>;

      mockHttpService.get.mockReturnValue(of(mockResponse));
      mockMetricsService.recordSongPlay.mockResolvedValue(undefined);

      const result = await service.streamSong(songId, rangeArray);

      expect(result).toEqual(mockResponse);
      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(songId);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        '/songs/player/play/song789',
        {
          headers: { range: rangeArray },
          responseType: 'stream',
        },
      );
    });

    it('should handle errors when streaming fails', async () => {
      const songId = 'nonexistent-song';
      const error = new Error('Song not found');

      mockMetricsService.recordSongPlay.mockResolvedValue(undefined);
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.streamSong(songId, undefined)).rejects.toThrow(
        'Song not found',
      );
      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(songId);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        '/songs/player/play/nonexistent-song',
        {
          headers: {},
          responseType: 'stream',
        },
      );
    });

    it('should call correct endpoint with different songId parameters', async () => {
      const songId = 'different-song-id-12345';
      const mockStream = new Readable();
      const mockResponse = {
        data: mockStream,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as unknown as AxiosResponse<Readable>;

      mockHttpService.get.mockReturnValue(of(mockResponse));
      mockMetricsService.recordSongPlay.mockResolvedValue(undefined);

      await service.streamSong(songId, undefined);

      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(songId);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        '/songs/player/play/different-song-id-12345',
        {
          headers: {},
          responseType: 'stream',
        },
      );
    });
  });

  describe('uploadSong', () => {
    it('should successfully upload a song and record metrics', async () => {
      const mockFormData = new FormData();
      const mockResponse = {
        data: {
          id: 'new-song-123',
          title: 'Test Song',
          message: 'Song uploaded successfully',
        },
        status: 201,
        statusText: 'Created',
        headers: {},
      } as unknown as AxiosResponse;

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordSongUpload.mockResolvedValue(undefined);

      const result = await service.uploadSong(mockFormData);

      expect(result).toEqual(mockResponse.data);
      expect(mockMetricsService.recordSongUpload).toHaveBeenCalledWith(
        'new-song-123',
      );
      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/songs/upload',
        mockFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    });

    it('should upload song without recording metrics when no id in response', async () => {
      const mockFormData = new FormData();
      const mockResponse = {
        data: {
          message: 'Song uploaded successfully',
          // No id in response
        },
        status: 201,
        statusText: 'Created',
        headers: {},
      } as unknown as AxiosResponse;

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.uploadSong(mockFormData);

      expect(result).toEqual(mockResponse.data);
      expect(mockMetricsService.recordSongUpload).not.toHaveBeenCalled();
      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/songs/upload',
        mockFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    });

    it('should handle upload errors', async () => {
      const mockFormData = new FormData();
      const error = new Error('Upload failed');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.uploadSong(mockFormData)).rejects.toThrow(
        'Upload failed',
      );
      expect(mockMetricsService.recordSongUpload).not.toHaveBeenCalled();
    });
  });
});
