import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateArtistDto {
  @ApiProperty({
    description: 'The name of the artist',
    example: 'J Balvin',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Biography of the artist',
    example: 'Colombian reggaeton singer, songwriter, and record producer.',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Social media links for the artist',
    example: {
      instagram: 'https://instagram.com/jbalvin',
      twitter: 'https://twitter.com/jbalvin',
      spotify: 'https://open.spotify.com/artist/1vyhD5VmyZ7KMfW5gqLgo5',
      youtube: 'https://youtube.com/c/JBalvinOfficial',
      website: 'https://jbalvin.com',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;
}
