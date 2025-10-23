import { Test, TestingModule } from '@nestjs/testing';
import { AddSongToPlaylistDto } from './dto/add-song-to-playlist.dto';
import { CreateHistoryEntryDto } from './dto/create-history-entry.dto';
import { CreateLikedSongDto } from './dto/create-liked-song.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderSongDto } from './dto/reorder-song.dto';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';

interface PlaylistResponse {
  id: string;
  name: string;
  cover_url: string;
  is_public: boolean;
  owner_id: string;
  created_at: string;
  songs: unknown[];
}

describe('PlaylistsController', () => {
  let controller: PlaylistsController;

  const mockPlaylistsService = {
    // Playlist methods
    createPlaylist: jest.fn(),
    getPlaylists: jest.fn(),
    getPlaylist: jest.fn(),
    deletePlaylist: jest.fn(),
    addSongToPlaylist: jest.fn(),
    removeSongFromPlaylist: jest.fn(),
    reorderPlaylistSongs: jest.fn(),
    // Liked songs methods
    getLikedSongs: jest.fn(),
    addLikedSong: jest.fn(),
    removeLikedSong: jest.fn(),
    reorderLikedSongs: jest.fn(),
    isLikedSong: jest.fn(),
    // History methods
    getHistory: jest.fn(),
    addToHistory: jest.fn(),
    clearHistory: jest.fn(),
    removeFromHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [
        {
          provide: PlaylistsService,
          useValue: mockPlaylistsService,
        },
      ],
    }).compile();

    controller = module.get<PlaylistsController>(PlaylistsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createPlaylist', () => {
    it('should create a playlist successfully', async () => {
      const userId = 'user-123';
      const createPlaylistDto: CreatePlaylistDto = {
        name: 'Test Playlist',
        cover_url: 'https://example.com/cover.jpg',
        is_public: true,
      };

      const expectedResult: PlaylistResponse = {
        id: 'playlist-123',
        name: 'Test Playlist',
        cover_url: 'https://example.com/cover.jpg',
        is_public: true,
        owner_id: userId,
        created_at: '2025-10-18T00:00:00Z',
        songs: [],
      };

      mockPlaylistsService.createPlaylist.mockResolvedValue(expectedResult);

      const result: PlaylistResponse = await controller.createPlaylist(
        userId,
        createPlaylistDto,
      );

      expect(mockPlaylistsService.createPlaylist).toHaveBeenCalledWith(
        userId,
        createPlaylistDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPlaylists', () => {
    it('should get all playlists successfully', async () => {
      const expectedResult = [
        {
          id: 'playlist-1',
          name: 'Playlist 1',
          cover_url: 'https://example.com/cover1.jpg',
          is_public: false,
          owner_id: 'user-123',
          created_at: '2025-10-18T00:00:00Z',
        },
        {
          id: 'playlist-2',
          name: 'Playlist 2',
          cover_url: 'https://example.com/cover2.jpg',
          is_public: true,
          owner_id: 'user-456',
          created_at: '2025-10-18T01:00:00Z',
        },
      ];

      mockPlaylistsService.getPlaylists.mockResolvedValue(expectedResult);

      const result = await controller.getPlaylists();

      expect(mockPlaylistsService.getPlaylists).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should get playlists filtered by user ID', async () => {
      const userId = 'user-123';
      const expectedResult = [
        {
          id: 'playlist-1',
          name: 'Playlist 1',
          cover_url: 'https://example.com/cover1.jpg',
          is_public: false,
          owner_id: userId,
          created_at: '2025-10-18T00:00:00Z',
        },
      ];

      mockPlaylistsService.getPlaylists.mockResolvedValue(expectedResult);

      const result = await controller.getPlaylists(userId);

      expect(mockPlaylistsService.getPlaylists).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPlaylist', () => {
    it('should get a specific playlist successfully', async () => {
      const playlistId = 'playlist-123';
      const expectedResult = {
        id: playlistId,
        name: 'Test Playlist',
        cover_url: 'https://example.com/cover.jpg',
        is_public: true,
        owner_id: 'user-123',
        created_at: '2025-10-18T00:00:00Z',
        songs: [
          {
            song_id: 'song-123',
            id: 'playlist-song-1',
            playlist_id: playlistId,
            position: 1,
            added_at: '2025-10-18T01:00:00Z',
          },
        ],
      };

      mockPlaylistsService.getPlaylist.mockResolvedValue(expectedResult);

      const result = await controller.getPlaylist(playlistId);

      expect(mockPlaylistsService.getPlaylist).toHaveBeenCalledWith(playlistId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deletePlaylist', () => {
    it('should delete a playlist successfully', async () => {
      const playlistId = 'playlist-123';
      const userId = 'user-123';

      mockPlaylistsService.deletePlaylist.mockResolvedValue(undefined);

      const result = await controller.deletePlaylist(playlistId, userId);

      expect(mockPlaylistsService.deletePlaylist).toHaveBeenCalledWith(
        playlistId,
        userId,
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

      const expectedResult = {
        song_id: 'song-123',
        id: 'playlist-song-1',
        playlist_id: playlistId,
        position: 1,
        added_at: '2025-10-18T01:00:00Z',
      };

      mockPlaylistsService.addSongToPlaylist.mockResolvedValue(expectedResult);

      const result = await controller.addSongToPlaylist(playlistId, addSongDto);

      expect(mockPlaylistsService.addSongToPlaylist).toHaveBeenCalledWith(
        playlistId,
        addSongDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeSongFromPlaylist', () => {
    it('should remove a song from playlist successfully', async () => {
      const playlistId = 'playlist-123';
      const songId = 'song-123';

      mockPlaylistsService.removeSongFromPlaylist.mockResolvedValue(undefined);

      const result = await controller.removeSongFromPlaylist(
        playlistId,
        songId,
      );

      expect(mockPlaylistsService.removeSongFromPlaylist).toHaveBeenCalledWith(
        playlistId,
        songId,
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

      const expectedResult = {
        message: 'Songs reordered successfully',
      };

      mockPlaylistsService.reorderPlaylistSongs.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.reorderPlaylistSongs(
        playlistId,
        songPositions,
      );

      expect(mockPlaylistsService.reorderPlaylistSongs).toHaveBeenCalledWith(
        playlistId,
        songPositions,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getLikedSongs', () => {
    it('should get liked songs successfully', async () => {
      const userId = 'user-123';
      const expectedResult = [
        {
          song_id: 'song-123',
          id: 'liked-1',
          user_id: userId,
          position: 1,
          created_at: '2025-10-18T00:00:00Z',
        },
        {
          song_id: 'song-456',
          id: 'liked-2',
          user_id: userId,
          position: 2,
          created_at: '2025-10-18T01:00:00Z',
        },
      ];

      mockPlaylistsService.getLikedSongs.mockResolvedValue(expectedResult);

      const result = await controller.getLikedSongs(userId);

      expect(mockPlaylistsService.getLikedSongs).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('addLikedSong', () => {
    it('should add a liked song successfully', async () => {
      const userId = 'user-123';
      const createLikedSongDto: CreateLikedSongDto = {
        song_id: 'song-123',
      };

      const expectedResult = {
        song_id: 'song-123',
        id: 'liked-1',
        user_id: userId,
        position: 1,
        created_at: '2025-10-18T00:00:00Z',
      };

      mockPlaylistsService.addLikedSong.mockResolvedValue(expectedResult);

      const result = await controller.addLikedSong(userId, createLikedSongDto);

      expect(mockPlaylistsService.addLikedSong).toHaveBeenCalledWith(
        userId,
        createLikedSongDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeLikedSong', () => {
    it('should remove a liked song successfully', async () => {
      const songId = 'song-123';
      const userId = 'user-123';

      mockPlaylistsService.removeLikedSong.mockResolvedValue(undefined);

      const result = await controller.removeLikedSong(songId, userId);

      expect(mockPlaylistsService.removeLikedSong).toHaveBeenCalledWith(
        songId,
        userId,
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

      const expectedResult = {
        message: 'Liked songs reordered successfully',
      };

      mockPlaylistsService.reorderLikedSongs.mockResolvedValue(expectedResult);

      const result = await controller.reorderLikedSongs(userId, songPositions);

      expect(mockPlaylistsService.reorderLikedSongs).toHaveBeenCalledWith(
        userId,
        songPositions,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('isLikedSong', () => {
    it('should check if song is liked successfully', async () => {
      const userId = 'user-123';
      const songId = 'song-123';
      const expectedResult = true;

      mockPlaylistsService.isLikedSong.mockResolvedValue(expectedResult);

      const result = await controller.isLikedSong(userId, songId);

      expect(mockPlaylistsService.isLikedSong).toHaveBeenCalledWith(
        userId,
        songId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return false when song is not liked', async () => {
      const userId = 'user-123';
      const songId = 'song-456';
      const expectedResult = false;

      mockPlaylistsService.isLikedSong.mockResolvedValue(expectedResult);

      const result = await controller.isLikedSong(userId, songId);

      expect(mockPlaylistsService.isLikedSong).toHaveBeenCalledWith(
        userId,
        songId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getHistory', () => {
    it('should get playback history successfully', async () => {
      const userId = 'user-123';
      const expectedResult = [
        {
          song_id: 'song-123',
          id: 'history-1',
          user_id: userId,
          position: 1,
          played_at: '2025-10-18T00:00:00Z',
        },
        {
          song_id: 'song-456',
          id: 'history-2',
          user_id: userId,
          position: 2,
          played_at: '2025-10-18T01:00:00Z',
        },
      ];

      mockPlaylistsService.getHistory.mockResolvedValue(expectedResult);

      const result = await controller.getHistory(userId);

      expect(mockPlaylistsService.getHistory).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('addToHistory', () => {
    it('should add a song to history successfully', async () => {
      const userId = 'user-123';
      const createHistoryEntryDto: CreateHistoryEntryDto = {
        song_id: 'song-123',
      };

      const expectedResult = {
        song_id: 'song-123',
        id: 'history-1',
        user_id: userId,
        position: 1,
        played_at: '2025-10-18T00:00:00Z',
      };

      mockPlaylistsService.addToHistory.mockResolvedValue(expectedResult);

      const result = await controller.addToHistory(
        userId,
        createHistoryEntryDto,
      );

      expect(mockPlaylistsService.addToHistory).toHaveBeenCalledWith(
        userId,
        createHistoryEntryDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history successfully', async () => {
      const userId = 'user-123';

      mockPlaylistsService.clearHistory.mockResolvedValue(undefined);

      const result = await controller.clearHistory(userId);

      expect(mockPlaylistsService.clearHistory).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });
  });

  describe('removeFromHistory', () => {
    it('should remove a song from history successfully', async () => {
      const songId = 'song-123';
      const userId = 'user-123';

      mockPlaylistsService.removeFromHistory.mockResolvedValue(undefined);

      const result = await controller.removeFromHistory(songId, userId);

      expect(mockPlaylistsService.removeFromHistory).toHaveBeenCalledWith(
        songId,
        userId,
      );
      expect(result).toBeUndefined();
    });
  });
});
