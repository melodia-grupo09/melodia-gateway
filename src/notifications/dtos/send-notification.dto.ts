import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendNotificationToUserPayloadDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the user to whom the notification will be sent',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    type: String,
    description: 'The title of the notification',
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    description: 'The body of the notification',
  })
  @IsString()
  body: string;

  @ApiProperty({
    type: Object,
    description: 'Additional data to include with the notification',
    required: false,
  })
  data?: Record<string, any>;
}

export class SendNotificationToUsersBatchPayloadDTO {
  @ApiProperty({
    type: [String],
    description: 'The IDs of the users to whom the notification will be sent',
  })
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({
    type: String,
    description: 'The title of the notification',
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    description: 'The body of the notification',
  })
  @IsString()
  body: string;

  @ApiProperty({
    type: Object,
    description: 'Additional data to include with the notification',
    required: false,
  })
  data?: Record<string, any>;
}

export class SendNotificationToTopicPayloadDTO {
  @ApiProperty({
    type: String,
    description: 'The topic to which the notification will be sent',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    type: String,
    description: 'The title of the notification',
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    description: 'The body of the notification',
  })
  @IsString()
  body: string;

  @ApiProperty({
    type: Object,
    description: 'Additional data to include with the notification',
    required: false,
  })
  data?: Record<string, any>;
}
