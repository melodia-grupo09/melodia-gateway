/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
import { AddSongToPlaylistDto } from './dto/add-song-to-playlist.dto';
import { CreateHistoryEntryDto } from './dto/create-history-entry.dto';
import { CreateLikedSongDto } from './dto/create-liked-song.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderSongDto } from './dto/reorder-song.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => MetricsService))
    private readonly metricsService: MetricsService,
  ) {}

  // Playlist endpoints
  async createPlaylist(userId: string, createPlaylistDto: CreatePlaylistDto) {
    const response = await firstValueFrom(
      this.httpService.post('/playlists/', createPlaylistDto, {
        params: { user_id: userId },
      }),
    );

    // Track user activity for playlist creation
    try {
      await this.metricsService.trackUserActivity(userId, 'playlist_creation');
    } catch (error) {
      console.error('Failed to track playlist creation activity:', error);
    }

    return response.data;
  }

  async getPlaylists(userId?: string) {
    const response = await firstValueFrom(
      this.httpService.get('/playlists/', {
        params: userId ? { user_id: userId } : {},
      }),
    );
    return response.data;
  }

  async getPlaylist(playlistId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`/playlists/${playlistId}`),
    );
    return response.data;
  }

  async deletePlaylist(playlistId: string, userId: string) {
    await firstValueFrom(
      this.httpService.delete(`/playlists/${playlistId}`, {
        headers: { 'user-id': userId },
      }),
    );
  }

  async addSongToPlaylist(
    playlistId: string,
    addSongDto: AddSongToPlaylistDto,
  ) {
    const response = await firstValueFrom(
      this.httpService.post(`/playlists/${playlistId}/songs`, addSongDto),
    );
    return response.data;
  }

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    await firstValueFrom(
      this.httpService.delete(`/playlists/${playlistId}/songs/${songId}`),
    );
  }

  async reorderPlaylistSongs(
    playlistId: string,
    songPositions: ReorderSongDto[],
  ) {
    const response = await firstValueFrom(
      this.httpService.put(
        `/playlists/${playlistId}/songs/reorder`,
        songPositions,
      ),
    );
    return response.data;
  }

  // Liked songs endpoints
  async getLikedSongs(userId: string) {
    const response = await firstValueFrom(
      this.httpService.get('/liked-songs/', {
        headers: { 'user-id': userId },
      }),
    );
    return response.data;
  }

  async addLikedSong(userId: string, createLikedSongDto: CreateLikedSongDto) {
    const response = await firstValueFrom(
      this.httpService.post('/liked-songs/', createLikedSongDto, {
        headers: { 'user-id': userId },
      }),
    );

    // Track user activity and song like metrics
    try {
      await Promise.all([
        this.metricsService.trackUserActivity(userId, 'song_like'),
        this.metricsService.recordSongLike(createLikedSongDto.song_id),
      ]);
    } catch (error) {
      console.error('Failed to track song like activity:', error);
    }

    return response.data;
  }

  async removeLikedSong(songId: string, userId: string) {
    await firstValueFrom(
      this.httpService.delete(`/liked-songs/${songId}`, {
        headers: { 'user-id': userId },
      }),
    );
  }

  async reorderLikedSongs(userId: string, songPositions: ReorderSongDto[]) {
    const response = await firstValueFrom(
      this.httpService.put('/liked-songs/reorder', songPositions, {
        headers: { 'user-id': userId },
      }),
    );
    return response.data;
  }

  async isLikedSong(userId: string, songId: string) {
    const response = await firstValueFrom(
      this.httpService.get('/liked-songs/is-liked', {
        headers: { 'user-id': userId, 'song-id': songId },
      }),
    );
    return response.data;
  }

  // History endpoints
  async getHistory(userId: string) {
    const response = await firstValueFrom(
      this.httpService.get('/history/', {
        headers: { 'user-id': userId },
      }),
    );
    return response.data;
  }

  async addToHistory(
    userId: string,
    createHistoryEntryDto: CreateHistoryEntryDto,
  ) {
    const response = await firstValueFrom(
      this.httpService.post('/history/', createHistoryEntryDto, {
        headers: { 'user-id': userId },
      }),
    );
    return response.data;
  }

  async clearHistory(userId: string) {
    await firstValueFrom(
      this.httpService.delete('/history/', {
        headers: { 'user-id': userId },
      }),
    );
  }

  async removeFromHistory(songId: string, userId: string) {
    await firstValueFrom(
      this.httpService.delete(`/history/${songId}`, {
        headers: { 'user-id': userId },
      }),
    );
  }
}
