import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePlaylistDto {
  @ApiProperty({ description: 'Name of the playlist', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Whether the playlist is public',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}
