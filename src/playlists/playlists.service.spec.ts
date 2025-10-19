import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AddSongToPlaylistDto } from './dto/add-song-to-playlist.dto';
import { CreateHistoryEntryDto } from './dto/create-history-entry.dto';
import { CreateLikedSongDto } from './dto/create-liked-song.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderSongDto } from './dto/reorder-song.dto';
import { PlaylistsService } from './playlists.service';

describe('PlaylistsService', () => {
  let service: PlaylistsService;

  const mockHttpService = {
    post: jest.fn().mockReturnValue(of({ data: {} })),
    get: jest.fn().mockReturnValue(of({ data: {} })),
    delete: jest.fn().mockReturnValue(of({ data: {} })),
    put: jest.fn().mockReturnValue(of({ data: {} })),
    patch: jest.fn().mockReturnValue(of({ data: {} })),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('https://test-playlist-service.com'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PlaylistsService>(PlaylistsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPlaylist', () => {
    it('should create a playlist successfully', async () => {
      const userId = 'user-123';
      const createPlaylistDto: CreatePlaylistDto = {
        name: 'Test Playlist',
        cover_url: 'https://example.com/cover.jpg',
        is_public: true,
      };

      const mockResponse = {
        data: {
          id: 'playlist-123',
          name: 'Test Playlist',
          cover_url: 'https://example.com/cover.jpg',
          is_public: true,
          owner_id: userId,
          created_at: '2025-10-18T00:00:00Z',
          songs: [],
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.createPlaylist(userId, createPlaylistDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/playlists/',
        createPlaylistDto,
        {
          params: { user_id: userId },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getPlaylists', () => {
    it('should get all playlists successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 'playlist-1',
            name: 'Playlist 1',
            cover_url: 'https://example.com/cover1.jpg',
            is_public: false,
            owner_id: 'user-123',
            created_at: '2025-10-18T00:00:00Z',
          },
        ],
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPlaylists();

      expect(mockHttpService.get).toHaveBeenCalledWith('/playlists/', {
        params: {},
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get playlists filtered by user ID', async () => {
      const userId = 'user-123';
      const mockResponse = {
        data: [
          {
            id: 'playlist-1',
            name: 'User Playlist',
            cover_url: 'https://example.com/cover1.jpg',
            is_public: false,
            owner_id: userId,
            created_at: '2025-10-18T00:00:00Z',
          },
        ],
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPlaylists(userId);

      expect(mockHttpService.get).toHaveBeenCalledWith('/playlists/', {
        params: { user_id: userId },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getPlaylist', () => {
    it('should get a specific playlist successfully', async () => {
      const playlistId = 'playlist-123';
      const mockResponse = {
        data: {
          id: playlistId,
          name: 'Test Playlist',
          cover_url: 'https://example.com/cover.jpg',
          is_public: true,
          owner_id: 'user-123',
          created_at: '2025-10-18T00:00:00Z',
          songs: [],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPlaylist(playlistId);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/playlists/${playlistId}`,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deletePlaylist', () => {
    it('should delete a playlist successfully', async () => {
      const playlistId = 'playlist-123';
      const userId = 'user-123';
      const mockResponse = { data: {} };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = await service.deletePlaylist(playlistId, userId);

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/playlists/${playlistId}`,
        {
          headers: { 'user-id': userId },
        },
      );
      expect(result).toBeUndefined();
    });
  });

  describe('addSongToPlaylist', () => {
    it('should add a song to playlist successfully', async () => {
      const playlistId = 'playlist-123';
      const addSongDto: AddSongToPlaylistDto = {
        song_id: 'song-123',
      };

      const mockResponse = {
        data: {
          song_id: 'song-123',
          id: 'playlist-song-1',
          playlist_id: playlistId,
          position: 1,
          added_at: '2025-10-18T01:00:00Z',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.addSongToPlaylist(playlistId, addSongDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/playlists/${playlistId}/songs`,
        addSongDto,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('removeSongFromPlaylist', () => {
    it('should remove a song from playlist successfully', async () => {
      const playlistId = 'playlist-123';
      const songId = 'song-123';
      const mockResponse = { data: {} };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = await service.removeSongFromPlaylist(playlistId, songId);

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/playlists/${playlistId}/songs/${songId}`,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('reorderPlaylistSongs', () => {
    it('should reorder playlist songs successfully', async () => {
      const playlistId = 'playlist-123';
      const songPositions: ReorderSongDto[] = [
        { song_id: 'song-1', position: 2 },
        { song_id: 'song-2', position: 1 },
      ];

      const mockResponse = {
        data: { message: 'Songs reordered successfully' },
      };

      mockHttpService.put.mockReturnValueOnce(of(mockResponse));

      const result = await service.reorderPlaylistSongs(
        playlistId,
        songPositions,
      );

      expect(mockHttpService.put).toHaveBeenCalledWith(
        `/playlists/${playlistId}/songs/reorder`,
        songPositions,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getLikedSongs', () => {
    it('should get liked songs successfully', async () => {
      const userId = 'user-123';
      const mockResponse = {
        data: [
          {
            song_id: 'song-123',
            id: 'liked-1',
            user_id: userId,
            position: 1,
            created_at: '2025-10-18T00:00:00Z',
          },
        ],
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getLikedSongs(userId);

      expect(mockHttpService.get).toHaveBeenCalledWith('/liked-songs/', {
        headers: { 'user-id': userId },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('addLikedSong', () => {
    it('should add a liked song successfully', async () => {
      const userId = 'user-123';
      const createLikedSongDto: CreateLikedSongDto = {
        song_id: 'song-123',
      };

      const mockResponse = {
        data: {
          song_id: 'song-123',
          id: 'liked-1',
          user_id: userId,
          position: 1,
          created_at: '2025-10-18T00:00:00Z',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.addLikedSong(userId, createLikedSongDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/liked-songs/',
        createLikedSongDto,
        {
          headers: { 'user-id': userId },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('removeLikedSong', () => {
    it('should remove a liked song successfully', async () => {
      const songId = 'song-123';
      const userId = 'user-123';
      const mockResponse = { data: {} };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = await service.removeLikedSong(songId, userId);

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/liked-songs/${songId}`,
        {
          headers: { 'user-id': userId },
        },
      );
      expect(result).toBeUndefined();
    });
  });

  describe('reorderLikedSongs', () => {
    it('should reorder liked songs successfully', async () => {
      const userId = 'user-123';
      const songPositions: ReorderSongDto[] = [
        { song_id: 'song-1', position: 2 },
        { song_id: 'song-2', position: 1 },
      ];

      const mockResponse = {
        data: { message: 'Liked songs reordered successfully' },
      };

      mockHttpService.put.mockReturnValueOnce(of(mockResponse));

      const result = await service.reorderLikedSongs(userId, songPositions);

      expect(mockHttpService.put).toHaveBeenCalledWith(
        '/liked-songs/reorder',
        songPositions,
        {
          headers: { 'user-id': userId },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getHistory', () => {
    it('should get playback history successfully', async () => {
      const userId = 'user-123';
      const mockResponse = {
        data: [
          {
            song_id: 'song-123',
            id: 'history-1',
            user_id: userId,
            position: 1,
            played_at: '2025-10-18T00:00:00Z',
          },
        ],
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getHistory(userId);

      expect(mockHttpService.get).toHaveBeenCalledWith('/history/', {
        headers: { 'user-id': userId },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('addToHistory', () => {
    it('should add a song to history successfully', async () => {
      const userId = 'user-123';
      const createHistoryEntryDto: CreateHistoryEntryDto = {
        song_id: 'song-123',
      };

      const mockResponse = {
        data: {
          song_id: 'song-123',
          id: 'history-1',
          user_id: userId,
          position: 1,
          played_at: '2025-10-18T00:00:00Z',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.addToHistory(userId, createHistoryEntryDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/history/',
        createHistoryEntryDto,
        {
          headers: { 'user-id': userId },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history successfully', async () => {
      const userId = 'user-123';
      const mockResponse = { data: {} };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = await service.clearHistory(userId);

      expect(mockHttpService.delete).toHaveBeenCalledWith('/history/', {
        headers: { 'user-id': userId },
      });
      expect(result).toBeUndefined();
    });
  });

  describe('removeFromHistory', () => {
    it('should remove a song from history successfully', async () => {
      const songId = 'song-123';
      const userId = 'user-123';
      const mockResponse = { data: {} };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = await service.removeFromHistory(songId, userId);

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/history/${songId}`,
        {
          headers: { 'user-id': userId },
        },
      );
      expect(result).toBeUndefined();
    });
  });
});
