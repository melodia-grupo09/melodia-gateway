import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateReleaseDto {
  @ApiProperty({
    description: 'The title of the release',
    example: 'Updated Album Title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Type of release',
    enum: ['album', 'single', 'ep'],
    example: 'album',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: 'album' | 'single' | 'ep';

  @ApiProperty({
    description: 'Release date in ISO format',
    example: '2023-05-12',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://cloudinary.com/cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiProperty({
    description: 'Array of song IDs from the songs microservice',
    example: ['song-id-1', 'song-id-2', 'song-id-3'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  songIds?: string[];
}
