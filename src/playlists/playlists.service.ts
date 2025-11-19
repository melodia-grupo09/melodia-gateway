/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { AddSongToPlaylistDto } from './dto/add-song-to-playlist.dto';
import { CreateHistoryEntryDto } from './dto/create-history-entry.dto';
import { CreateLikedSongDto } from './dto/create-liked-song.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { GetHistoryQueryDto } from './dto/get-history-query.dto';
import { ReorderSongDto } from './dto/reorder-song.dto';
import { SearchPlaylistsDto } from './dto/search-playlists.dto';

@Injectable()
export class PlaylistsService {
  private readonly logger = new Logger(PlaylistsService.name);
  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => MetricsService))
    private readonly metricsService: MetricsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Playlist endpoints
  async searchPlaylists(searchPlaylistsDto: SearchPlaylistsDto) {
    const params: Record<string, any> = {
      page: searchPlaylistsDto.page || 1,
      limit: searchPlaylistsDto.limit || 10,
    };

    if (searchPlaylistsDto.search) {
      params.search = searchPlaylistsDto.search;
    }

    if (searchPlaylistsDto.user_id) {
      params.user_id = searchPlaylistsDto.user_id;
    }

    const response = await firstValueFrom(
      this.httpService.get('/playlists/search', { params }),
    );
    return response.data;
  }

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

    // Send notifications to followers if playlist is public (non-blocking)
    this.logger.log(
      `Playlist "${createPlaylistDto.name}" created by user ${userId}. Public: ${createPlaylistDto.is_public}. Response data: ${JSON.stringify(response.data)}`,
    );
    if (createPlaylistDto.is_public && response.data?.id) {
      this.sendPlaylistNotificationToFollowers(
        userId,
        createPlaylistDto.name,
        response.data.id,
      );
    }

    return response.data;
  }

  /**
   * Send notification to user's followers about new public playlist (non-blocking)
   */
  private sendPlaylistNotificationToFollowers(
    userId: string,
    playlistName: string,
    playlistId: string,
  ): void {
    this.notifyFollowersAboutPlaylist(userId, playlistName, playlistId).catch(
      (error) => {
        this.logger.error(
          `Failed to notify followers about playlist for user ${userId}:`,
          error,
        );
      },
    );
  }

  /**
   * Internal method to handle the actual notification logic
   */
  private async notifyFollowersAboutPlaylist(
    userId: string,
    playlistName: string,
    playlistId: string,
  ): Promise<void> {
    try {
      // Get user's followers
      const followersResponse = await this.usersService.getFollowers(
        userId,
        1,
        50,
      );

      this.logger.log(
        `Notifying followers of user ${userId} about new playlist "${playlistName}" with ID ${playlistId}`,
      );
      this.logger.log(`Followers data: ${JSON.stringify(followersResponse)}`);

      if (
        followersResponse.followers &&
        Array.isArray(followersResponse.followers)
      ) {
        const notificationPromises = followersResponse.followers.map(
          async (follower) => {
            const notificationData = {
              userId: follower.uid,
              title: 'Nueva Playlist Pública',
              body: `Un usuario que sigues ha creado una nueva playlist: "${playlistName}"`,
              data: {
                type: 'playlist_created',
                playlistName,
                createdId: playlistId,
                creatorId: userId,
              },
            };

            return this.notificationsService
              .sendNotificationToUserDevices(notificationData)
              .catch((error) => {
                console.error(
                  `Failed to send notification to user ${follower.uid}:`,
                  error,
                );
              });
          },
        );

        this.logger.log(
          `Prepared ${notificationPromises.length} notification(s) for followers of user ${userId}`,
        );

        // Execute all notifications concurrently but don't wait for them
        Promise.all(notificationPromises).catch((error) => {
          console.error('Some notifications failed to send:', error);
        });
      }
    } catch (error) {
      console.error(
        'Error getting followers for playlist notification:',
        error,
      );
    }
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
  async getHistory(userId: string, queryParams?: GetHistoryQueryDto) {
    const params: Record<string, string | number> = {};

    if (queryParams?.page) {
      params.page = queryParams.page;
    }
    if (queryParams?.limit) {
      params.limit = queryParams.limit;
    }
    if (queryParams?.search) {
      params.search = queryParams.search;
    }
    if (queryParams?.artist) {
      params.artist = queryParams.artist;
    }

    const response = await firstValueFrom(
      this.httpService.get('/history/', {
        headers: { 'user-id': userId },
        params: params,
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
