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
      this.logger.error(
        `Failed to record user registration for userId: ${userId}`,
        error,
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
      this.logger.error(
        `Failed to record user login for userId: ${userId}`,
        error,
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
      this.logger.error(
        `Failed to record user activity for userId: ${userId}`,
        error,
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
      this.logger.error(
        `Failed to track user activity for userId: ${userId}${action ? ` (${action})` : ''}`,
        error,
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
}
