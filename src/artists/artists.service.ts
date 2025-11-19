import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { SendNotificationToUsersBatchPayloadDTO } from 'src/notifications/dtos/send-notification.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

interface User {
  id: string;
  [key: string]: unknown;
}

interface FollowersResponse {
  data: {
    users: User[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Artist {
  id: string;
  user_id: string;
  [key: string]: unknown;
}

@Injectable()
export class ArtistsService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createArtist(createArtistData: FormData): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/artists', createArtistData),
    );
    return response.data;
  }

  async getArtist(id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/${id}`),
    );
    return response.data;
  }

  async updateArtist(id: string, updateData: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/artists/${id}`, updateData),
    );
    return response.data;
  }

  async deleteArtist(id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.delete(`/artists/${id}`),
    );
    return response.data;
  }

  async updateArtistMedia(id: string, mediaData: FormData): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/artists/${id}/media`, mediaData),
    );
    return response.data;
  }

  // Release methods
  async getArtistReleases(artistId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/${artistId}/releases`),
    );
    return response.data;
  }

  async createRelease(
    artistId: string,
    createReleaseDto: CreateReleaseDto,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`/artists/${artistId}/releases`, createReleaseDto),
    );

    // Send notifications to artist's followers about new release (non-blocking)
    if (response.data?.id) {
      this.sendReleaseNotificationToFollowers(
        artistId,
        createReleaseDto.title,
        response.data.id,
      );
    }

    return response.data;
  }

  /**
   * Send notification to artist's followers about new release (non-blocking)
   */
  private sendReleaseNotificationToFollowers(
    artistId: string,
    releaseTitle: string,
    releaseId: string,
  ): void {
    // Non-blocking call - no await
    this.notifyFollowersAboutRelease(artistId, releaseTitle, releaseId).catch(
      (error) => {
        console.error(
          `Failed to notify followers about release for artist ${artistId}:`,
          error,
        );
      },
    );
  }

  /**
   * Internal method to handle the actual notification logic for releases
   */
  private async notifyFollowersAboutRelease(
    artistId: string,
    releaseTitle: string,
    releaseId: string,
  ): Promise<void> {
    try {
      // Get artist details to find the associated user
      const artist = (await this.getArtist(artistId)) as Artist;

      if (!artist?.user_id) {
        console.warn(
          `Artist ${artistId} has no associated user_id for notifications`,
        );
        return;
      }

      // Get user's followers
      const followers = await this.usersService.getFollowers(
        artist.user_id,
        1,
        50,
      );

      if (!followers.followers || !Array.isArray(followers.followers)) {
        return;
      }
      // Send notification to each follower (non-blocking)
      const followerIds = followers.followers.map((follower) => follower.uid);
      const notificationData: SendNotificationToUsersBatchPayloadDTO = {
        userIds: followerIds,
        title: 'Nuevo Release',
        body: `Un artista que sigues ha lanzado un nuevo release: ${releaseTitle}`,
        data: {
          type: 'release_created',
          releaseTitle,
          createdId: releaseId,
          artistId,
          userId: artist.user_id,
        },
      };

      return this.notificationsService
        .sendNotificationToUsersDevicesBatch(notificationData)
        .catch((error) => {
          console.error(
            `Failed to send notification to user ${followerIds}:`,
            error,
          );
        });
    } catch (error) {
      console.error('Error getting followers for release notification:', error);
    }
  }

  async getArtistRelease(artistId: string, releaseId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/${artistId}/releases/${releaseId}`),
    );
    return response.data;
  }

  async updateRelease(
    artistId: string,
    releaseId: string,
    updateReleaseDto: UpdateReleaseDto,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `/artists/${artistId}/releases/${releaseId}`,
        updateReleaseDto,
      ),
    );
    return response.data;
  }

  async deleteRelease(artistId: string, releaseId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.delete(`/artists/${artistId}/releases/${releaseId}`),
    );
    return response.data;
  }

  async updateReleaseCover(
    artistId: string,
    releaseId: string,
    coverData: FormData,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `/artists/${artistId}/releases/${releaseId}/cover`,
        coverData,
      ),
    );
    return response.data;
  }

  async addSongsToRelease(
    artistId: string,
    releaseId: string,
    songData: { songIds: string[] },
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `/artists/${artistId}/releases/${releaseId}/songs/add`,
        songData,
      ),
    );
    return response.data;
  }

  async removeSongsFromRelease(
    artistId: string,
    releaseId: string,
    songData: { songIds: string[] },
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `/artists/${artistId}/releases/${releaseId}/songs/remove`,
        songData,
      ),
    );
    return response.data;
  }

  async followArtist(id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/artists/${id}/follow`, {}),
    );
    return response.data;
  }

  async unfollowArtist(id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/artists/${id}/unfollow`, {}),
    );
    return response.data;
  }

  async getReleaseById(releaseId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/releases/${releaseId}`),
    );
    return response.data;
  }

  async searchArtists(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/search`, {
        params: {
          query,
          page,
          limit,
        },
      }),
    );
    return response.data;
  }

  async getUpcomingReleases(artistId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/${artistId}/releases/upcoming`),
    );
    return response.data;
  }

  async getPublishedReleases(artistId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/${artistId}/releases/published`),
    );
    return response.data;
  }
}
