import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateLikedSongDto {
  @ApiProperty({ description: 'Song ID to add to liked songs' })
  @IsUUID()
  song_id: string;
}
