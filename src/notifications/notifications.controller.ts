/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { AddDevicePayloadDTO } from './dtos/add-device.dto';
import { SendNotificationToUserPayloadDTO } from './dtos/send-notification.dto';
import { UserNotificationDTO } from './dtos/user-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@UseGuards(FirebaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The ID of the user to retrieve devices for',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Number of notifications to retrieve (default is 20)',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number for pagination (default is 1)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user notifications',
    type: [UserNotificationDTO],
  })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('page', new DefaultValuePipe(1)) page: number,
  ) {
    return this.notificationsService.getUserNotifications(userId, limit, page);
  }

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
