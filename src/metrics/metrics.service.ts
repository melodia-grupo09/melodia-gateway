import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ArtistsService } from '../artists/artists.service';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => ArtistsService))
    private readonly artistsService: ArtistsService,
  ) {}

  async recordUserRegistration(userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/metrics/users/${userId}/registration`),
      );
      this.logger.log(`User registration recorded for userId: ${userId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record user registration for userId: ${userId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async recordUserLogin(userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/metrics/users/${userId}/login`),
      );
      this.logger.log(`User login recorded for userId: ${userId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record user login for userId: ${userId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async recordUserActivity(userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/metrics/users/${userId}/activity`),
      );
      this.logger.log(`User activity recorded for userId: ${userId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record user activity for userId: ${userId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Utility method to track user activity with action context
  async trackUserActivity(userId: string, action?: string): Promise<void> {
    try {
      await this.recordUserActivity(userId);
      this.logger.log(
        `User activity tracked for userId: ${userId}${action ? ` (${action})` : ''}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to track user activity for userId: ${userId}${action ? ` (${action})` : ''}: ${message}`,
      );
    }
  }

  async getNewRegistrations(startDate: string, endDate: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('/metrics/users/analytics/registrations', {
        params: { startDate, endDate },
      }),
    );
    return response.data;
  }

  async getActiveUsers(startDate: string, endDate: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('/metrics/users/analytics/active', {
        params: { startDate, endDate },
      }),
    );
    return response.data;
  }

  async getUserRetention(
    cohortStartDate: string,
    cohortEndDate: string,
    daysAfter?: number,
  ): Promise<any> {
    const params: Record<string, string | number> = {
      cohortStartDate,
      cohortEndDate,
    };
    if (daysAfter !== undefined) {
      params.daysAfter = daysAfter;
    }

    const response = await firstValueFrom(
      this.httpService.get('/metrics/users/analytics/retention', { params }),
    );
    return response.data;
  }

  async getTopSongs(limit?: number): Promise<any> {
    const params: Record<string, number> = {};
    if (limit !== undefined) {
      params.limit = limit;
    }

    const response = await firstValueFrom(
      this.httpService.get('/metrics/songs', { params }),
    );
    return response.data;
  }

  async getTopAlbums(limit?: number): Promise<unknown[]> {
    const params: Record<string, number> = {};
    if (limit !== undefined) {
      params.limit = limit;
    }

    const response = await firstValueFrom(
      this.httpService.get('/metrics/albums', { params }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const topAlbums: unknown[] = response.data;

    // Ensure topAlbums is an array
    if (!Array.isArray(topAlbums)) {
      this.logger.warn(
        'Expected topAlbums to be an array, received:',
        typeof topAlbums,
      );
      return [];
    }

    // Enhance each album with additional release information
    const enhancedAlbums = await Promise.allSettled(
      topAlbums.map(async (album: unknown) => {
        try {
          // Type guard to ensure album has albumId property
          if (!album || typeof album !== 'object' || !('albumId' in album)) {
            this.logger.warn('Invalid album object, missing albumId');
            return album;
          }

          const albumWithId = album as { albumId: string };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const releaseInfo = await this.artistsService.getReleaseById(
            albumWithId.albumId,
          );

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return {
            ...album,
            ...releaseInfo,
          };
        } catch (error) {
          // Type guard for album to access albumId safely
          const albumId =
            album && typeof album === 'object' && 'albumId' in album
              ? (album as { albumId: string }).albumId
              : 'unknown';

          this.logger.warn(
            `Failed to fetch release info for album ${albumId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          // Return original album data if release info fetch fails
          return album;
        }
      }),
    );

    // Extract fulfilled values and handle any rejections
    return enhancedAlbums
      .map((result) => {
        if (result.status === 'fulfilled') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return result.value;
        } else {
          this.logger.error(`Promise rejected: ${String(result.reason)}`);
          return null;
        }
      })
      .filter((item): item is NonNullable<unknown> => item !== null);
  }

  async recordSongUpload(songId: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.post(`/metrics/songs/${songId}`));
      this.logger.log(`Song upload recorded for songId: ${songId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record song upload for songId: ${songId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async recordSongPlay(
    songId: string,
    userId: string,
    artistId: string,
    region?: string,
  ): Promise<void> {
    try {
      // The metrics service requires artistId and userId in the request body
      const requestBody = {
        artistId: artistId,
        userId: userId,
        region: region || 'unknown',
      };

      const response = await firstValueFrom(
        this.httpService.post(`/metrics/songs/${songId}/plays`, requestBody),
      );
      this.logger.log(
        `Song play recorded for songId: ${songId}, userId: ${userId}. Status: ${response.status}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record song play for songId: ${songId}, userId: ${userId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async getTopArtists(limit?: number): Promise<any> {
    const params: Record<string, number> = {};
    if (limit !== undefined) {
      params.limit = limit;
    }

    const response = await firstValueFrom(
      this.httpService.get('/metrics/artists/top', { params }),
    );
    return response.data;
  }

  async recordArtistCreation(artistId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post('/metrics/artists', { artistId }),
      );
      this.logger.log(`Artist creation recorded for artistId: ${artistId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record artist creation for artistId: ${artistId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async recordAlbumCreation(albumId: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.post(`/metrics/albums/${albumId}`));
      this.logger.log(`Album creation recorded for albumId: ${albumId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record album creation for albumId: ${albumId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async recordAlbumLike(albumId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/metrics/albums/${albumId}/likes`),
      );
      this.logger.log(`Album like recorded for albumId: ${albumId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record album like for albumId: ${albumId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async recordAlbumShare(albumId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/metrics/albums/${albumId}/shares`),
      );
      this.logger.log(`Album share recorded for albumId: ${albumId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record album share for albumId: ${albumId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async recordSongLike(
    songId: string,
    userId: string,
    artistId: string,
    region?: string,
  ): Promise<void> {
    try {
      const requestBody = {
        artistId: artistId,
        userId: userId,
        region: region || 'unknown',
      };

      await firstValueFrom(
        this.httpService.post(`/metrics/songs/${songId}/likes`, requestBody),
      );
      this.logger.log(`Song like recorded for songId: ${songId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record song like for songId: ${songId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async recordSongShare(
    songId: string,
    userId: string,
    artistId: string,
    region?: string,
  ): Promise<void> {
    try {
      const requestBody = {
        artistId: artistId,
        userId: userId,
        region: region || 'unknown',
      };

      await firstValueFrom(
        this.httpService.post(`/metrics/songs/${songId}/shares`, requestBody),
      );
      this.logger.log(`Song share recorded for songId: ${songId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record song share for songId: ${songId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  // New endpoints for user analytics and export

  async getUserContentAnalytics(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await firstValueFrom(
      this.httpService.get(`/metrics/users/${userId}/analytics/content`, {
        params,
      }),
    );
    return response.data;
  }

  async getUserActivityPatterns(userId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/metrics/users/${userId}/analytics/patterns`),
    );
    return response.data;
  }

  async exportUserMetrics(
    startDate: string,
    endDate: string,
    format?: 'csv' | 'json',
  ): Promise<any> {
    const params: Record<string, string> = {
      startDate,
      endDate,
    };
    if (format) params.format = format;

    const response = await firstValueFrom(
      this.httpService.get('/metrics/users/export', { params }),
    );
    return response.data;
  }

  // Internal method to delete user metrics (called by users service)
  async deleteUserMetrics(userId: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.delete(`/metrics/users/${userId}`));
      this.logger.log(`User metrics deleted for userId: ${userId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete user metrics for userId: ${userId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }

  async getAllArtistsMetrics(
    page?: number,
    limit?: number,
    period?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const params: Record<string, string | number> = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    if (period) params.period = period;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await firstValueFrom(
      this.httpService.get('/metrics/artists', { params }),
    );
    return response.data;
  }

  async addArtistListener(artistId: string, userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/metrics/artists/${artistId}/listeners`, {
          userId,
        }),
      );
      this.logger.log(
        `Artist listener recorded for artistId: ${artistId}, userId: ${userId}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record artist listener for artistId: ${artistId}: ${message}`,
      );
      throw error;
    }
  }

  async getArtistMonthlyListeners(artistId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/metrics/artists/${artistId}/monthly-listeners`),
    );
    return response.data;
  }

  async deleteArtist(artistId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`/metrics/artists/${artistId}`),
      );
      this.logger.log(`Artist metrics deleted for artistId: ${artistId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete artist metrics for artistId: ${artistId}: ${message}`,
      );
      throw error;
    }
  }

  async getArtistMetrics(artistId: string, region?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (region) params.region = region;

    const response = await firstValueFrom(
      this.httpService.get(`/metrics/artists/${artistId}`, { params }),
    );
    return response.data;
  }

  async getArtistTopSongs(
    artistId: string,
    region?: string,
    sortBy?: string,
  ): Promise<any> {
    const params: Record<string, string> = {};
    if (region) params.region = region;
    if (sortBy) params.sortBy = sortBy;

    const response = await firstValueFrom(
      this.httpService.get(`/metrics/artists/${artistId}/top-songs`, {
        params,
      }),
    );
    return response.data;
  }

  async addArtistFollower(artistId: string, userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/metrics/artists/${artistId}/followers`, {
          userId,
        }),
      );
      this.logger.log(
        `Artist follower recorded for artistId: ${artistId}, userId: ${userId}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record artist follower for artistId: ${artistId}: ${message}`,
      );
      throw error;
    }
  }

  async removeArtistFollower(artistId: string, userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `/metrics/artists/${artistId}/followers/${userId}`,
        ),
      );
      this.logger.log(
        `Artist follower removed for artistId: ${artistId}, userId: ${userId}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to remove artist follower for artistId: ${artistId}: ${message}`,
      );
      throw error;
    }
  }

  async exportArtistsMetrics(
    period?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const params: Record<string, string> = {};
    if (period) params.period = period;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await firstValueFrom(
      this.httpService.get('/metrics/artists/export', { params }),
    );
    return response.data;
  }
}
