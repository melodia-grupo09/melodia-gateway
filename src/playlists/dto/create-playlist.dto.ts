import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ description: 'Name of the playlist' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Cover URL for the playlist', required: false })
  @IsOptional()
  @IsString()
  cover_url?: string;

  @ApiProperty({ description: 'Whether the playlist is public', default: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean = false;
}