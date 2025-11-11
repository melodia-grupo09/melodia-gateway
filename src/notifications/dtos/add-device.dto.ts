import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddDevicePayloadDTO {
  @ApiProperty({
    type: String,
    description: 'The device token used for push notifications',
    example: 'abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx',
  })
  @IsString()
  deviceToken: string;

  @ApiProperty({
    type: String,
    description: 'The ID of the user associated with the device',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string;
}
