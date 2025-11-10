import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateReleaseDto {
  @ApiProperty({
    description: 'The title of the release',
    example: 'Vida Rockstar',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Type of release',
    enum: ['album', 'single', 'ep'],
    example: 'album',
  })
  @IsNotEmpty()
  @IsString()
  type: 'album' | 'single' | 'ep';

  @ApiProperty({
    description: 'Release date in ISO format',
    example: '2023-05-12',
  })
  @IsNotEmpty()
  @IsDateString()
  releaseDate: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://cloudinary.com/cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiProperty({
    description: 'Artist ID who owns this release (Firebase UID or UUID)',
    example: 'BkmRgBIizfWC7MaFVhyNHRTRa4A2',
  })
  @IsNotEmpty()
  @IsString()
  artistId: string;

  @ApiProperty({
    description: 'Array of song IDs from the songs microservice',
    example: ['song-id-1', 'song-id-2', 'song-id-3'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  songIds?: string[];

  @ApiProperty({
    description:
      'Scheduled publication date in ISO format (for smart publication logic)',
    example: '2024-06-15T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledPublishAt?: string;

  @ApiProperty({
    description: 'Array of genre strings (optional for legacy compatibility)',
    example: ['reggaeton', 'latin pop'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];
}
