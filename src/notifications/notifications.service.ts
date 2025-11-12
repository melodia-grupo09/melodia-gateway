/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { AddDevicePayloadDTO } from './dtos/add-device.dto';
import { SendNotificationToUserPayloadDTO } from './dtos/send-notification.dto';
import { UserNotificationDTO } from './dtos/user-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly httpService: HttpService) {}

  async getUserNotifications(
    userId: string,
    limit: number,
    page: number,
  ): Promise<UserNotificationDTO[]> {
    const response = await firstValueFrom(
      this.httpService.get('/notifications/' + userId, {
        params: { limit, page },
      }),
    );
    return response.data;
  }

  async addDevice(addDeviceDto: AddDevicePayloadDTO) {
    const response = await firstValueFrom(
      this.httpService.post('/notifications/device/', addDeviceDto),
    );
    return response.data;
  }

  async deleteDevice(deviceToken: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`/notifications/device/${deviceToken}`),
    );
    return response.data;
  }

  async sendNotificationToUserDevices(dto: SendNotificationToUserPayloadDTO) {
    const response = await firstValueFrom(
      this.httpService.post('/notifications/send', dto),
    );
    return response.data;
  }

  async sendTestNotification(deviceToken: string) {
    const response = await firstValueFrom(
      this.httpService.post(`/notifications/test/${deviceToken}`),
    );
    return response.data;
  }

  async deleteNotification(notificationId: UUID) {
    const response = await firstValueFrom(
      this.httpService.delete(`/notifications/${notificationId}`),
    );
    return response.data;
  }

  async clearNotitications(userId: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`/notifications/clear/${userId}`),
    );
    return response.data;
  }
}
