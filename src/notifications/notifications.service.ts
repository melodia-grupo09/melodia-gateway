/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AddDevicePayloadDTO } from './dtos/add-device.dto';
import { SendNotificationToUserPayloadDTO } from './dtos/send-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly httpService: HttpService) {}

  async addDevice(addDeviceDto: AddDevicePayloadDTO) {
    const response = await firstValueFrom(
      this.httpService.post('/device/', addDeviceDto),
    );
    return response.data;
  }

  async deleteDevice(deviceToken: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`/device/${deviceToken}`),
    );
    return response.data;
  }

  async sendNotificationToUserDevices(dto: SendNotificationToUserPayloadDTO) {
    const response = await firstValueFrom(this.httpService.post('/send', dto));
    return response.data;
  }

  async sendTestNotification(deviceToken: string) {
    const response = await firstValueFrom(
      this.httpService.post(`/test/${deviceToken}`),
    );
    return response.data;
  }
}
