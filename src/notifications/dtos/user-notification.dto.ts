import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
import type { UUID } from 'crypto';

export class UserNotificationDTO {
  @ApiProperty({
    description: 'Title of the notification',
    type: String,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Message content of the notification',
    type: String,
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'ID of the user to whom the notification is sent',
    type: String,
  })
  @IsString()
  userId: string;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the entity',
  })
  @IsString()
  id: UUID;

  @ApiProperty({
    type: String,
    example: '2023-10-01T12:00:00Z',
    description: 'Date when the entity was created',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    type: String,
    example: '2023-10-01T12:00:00Z',
    description: 'Date when the entity was last updated',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
