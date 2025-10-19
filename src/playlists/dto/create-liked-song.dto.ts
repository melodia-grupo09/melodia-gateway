import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateLikedSongDto {
  @ApiProperty({ description: 'Song ID to add to liked songs' })
  @IsString()
  song_id: string;
}
