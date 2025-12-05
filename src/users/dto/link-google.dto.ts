import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkGoogleDto {
  @ApiProperty({
    description: 'Google ID Token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZm...',
  })
  @IsString()
  @IsNotEmpty()
  id_token: string;
}
