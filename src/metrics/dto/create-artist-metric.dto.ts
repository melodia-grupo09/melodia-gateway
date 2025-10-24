import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArtistMetricDto {
  @ApiProperty({
    description: 'ID of the artist',
    example: 'artist-123',
  })
  @IsNotEmpty({ message: 'Artist ID is required' })
  @IsString({ message: 'Artist ID must be a string' })
  artistId: string;
}
