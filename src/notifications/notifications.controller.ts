/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { AddDevicePayloadDTO } from './dtos/add-device.dto';
import { SendNotificationToUserPayloadDTO } from './dtos/send-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@UseGuards(FirebaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('device')
  @ApiOperation({
    summary: 'Add a device for notifications',
    description: 'Adds a device for notifications',
  })
  async addDevice(@Body() addDeviceDto: AddDevicePayloadDTO) {
    return this.notificationsService.addDevice(addDeviceDto);
  }

  @Delete('device/:deviceToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a device from notifications' })
  async removeDevice(@Param('deviceToken') deviceToken: string) {
    return this.notificationsService.deleteDevice(deviceToken);
  }

  @Put('send')
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully',
  })
  async sendNotification(@Body() dto: SendNotificationToUserPayloadDTO) {
    return this.notificationsService.sendNotificationToUserDevices(dto);
  }

  @Post('test/:deviceToken')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 201,
    description: 'Test successful',
  })
  async sendTestNotification(@Param('deviceToken') deviceToken: string) {
    return this.notificationsService.sendTestNotification(deviceToken);
  }
}
