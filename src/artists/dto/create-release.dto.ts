import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
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
    description: 'Artist ID who owns this release',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
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
}
