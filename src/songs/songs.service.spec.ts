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

  describe('getSongById', () => {
    it('should get a song by id', async () => {
      const songId = 'song-123';
      const mockSong = {
        id: songId,
        title: 'Test Song',
        artist: 'Test Artist',
      };
      const mockResponse = {
        data: mockSong,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as unknown as AxiosResponse;

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getSongById(songId);

      expect(result).toEqual(mockSong);
      expect(mockHttpService.get).toHaveBeenCalledWith(`/songs/id/${songId}`);
    });

    it('should handle errors when getting song by id', async () => {
      const songId = 'nonexistent-song';
      const error = new Error('Song not found');

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getSongById(songId)).rejects.toThrow(
        'Song not found',
      );
    });
  });

  describe('getRandom', () => {
    it('should get random songs without parameters', async () => {
      const mockSongs = [
        { id: 'song1', title: 'Song 1' },
        { id: 'song2', title: 'Song 2' },
      ];
      const mockResponse = {
        data: mockSongs,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as unknown as AxiosResponse;

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getRandom();

      expect(result).toEqual(mockSongs);
      expect(mockHttpService.get).toHaveBeenCalledWith('/songs/random', {
        params: {},
      });
    });

    it('should get random songs with limit parameter', async () => {
      const limit = 5;
      const mockSongs = [{ id: 'song1', title: 'Song 1' }];
      const mockResponse = {
        data: mockSongs,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as unknown as AxiosResponse;

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getRandom(limit);

      expect(result).toEqual(mockSongs);
      expect(mockHttpService.get).toHaveBeenCalledWith('/songs/random', {
        params: { limit },
      });
    });

    it('should get random songs with limit and page parameters', async () => {
      const limit = 10;
      const page = 2;
      const mockSongs = [{ id: 'song3', title: 'Song 3' }];
      const mockResponse = {
        data: mockSongs,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as unknown as AxiosResponse;

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getRandom(limit, page);

      expect(result).toEqual(mockSongs);
      expect(mockHttpService.get).toHaveBeenCalledWith('/songs/random', {
        params: { limit, page },
      });
    });

    it('should handle errors when getting random songs', async () => {
      const error = new Error('Service unavailable');

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getRandom()).rejects.toThrow('Service unavailable');
    });
  });

  describe('searchSongs', () => {
    it('should search songs with query', async () => {
      const query = 'test';
      const limit = 20;
      const page = 1;
      const mockSongs = [
        { id: 'song1', title: 'Test Song 1' },
        { id: 'song2', title: 'Test Song 2' },
      ];
      const mockResponse = {
        data: mockSongs,
        status: 200,
        statusText: 'OK',
        headers: {},
      } as unknown as AxiosResponse;

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.searchSongs(query, limit, page);

      expect(result).toEqual(mockSongs);
      expect(mockHttpService.get).toHaveBeenCalledWith('/songs/search', {
        params: { query, limit, page },
      });
    });

    it('should handle errors when searching songs', async () => {
      const error = new Error('Search failed');

      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.searchSongs('test', 20, 1)).rejects.toThrow(
        'Search failed',
      );
    });
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

      const userId = 'test-user';
      const artistId = 'test-artist';

      const result = await service.streamSong(
        songId,
        undefined,
        userId,
        artistId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(
        songId,
        userId,
        artistId,
      );
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

      const userId = 'test-user-2';
      const artistId = 'test-artist-2';

      const result = await service.streamSong(songId, range, userId, artistId);

      expect(result).toEqual(mockResponse);
      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(
        songId,
        userId,
        artistId,
      );
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

      const userId = 'test-user-3';
      const artistId = 'test-artist-3';

      const result = await service.streamSong(
        songId,
        rangeArray,
        userId,
        artistId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(
        songId,
        userId,
        artistId,
      );
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

      const userId = 'test-user-4';
      const artistId = 'test-artist-4';

      await expect(
        service.streamSong(songId, undefined, userId, artistId),
      ).rejects.toThrow('Song not found');
      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(
        songId,
        userId,
        artistId,
      );
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

      const userId = 'test-user-5';
      const artistId = 'test-artist-5';

      await service.streamSong(songId, undefined, userId, artistId);

      expect(mockMetricsService.recordSongPlay).toHaveBeenCalledWith(
        songId,
        userId,
        artistId,
      );
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
