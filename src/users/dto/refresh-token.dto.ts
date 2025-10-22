import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Firebase refresh token obtained from login',
    example: 'AMf-vBywFmjorV2yrPzYrB6DkOq6mV7N870sOkhiVQSFOrv9urExHc1w...',
  })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
  refresh_token: string;
}
