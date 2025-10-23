import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly httpService: HttpService) {}

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

  async getTopAlbums(limit?: number): Promise<any> {
    const params: Record<string, number> = {};
    if (limit !== undefined) {
      params.limit = limit;
    }

    const response = await firstValueFrom(
      this.httpService.get('/metrics/albums/top', { params }),
    );
    return response.data;
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

  async recordSongPlay(songId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`/metrics/songs/${songId}/plays`),
      );
      this.logger.log(`Song play recorded for songId: ${songId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to record song play for songId: ${songId}: ${message}`,
      );
      // Don't throw error to avoid breaking the main flow
    }
  }
}
