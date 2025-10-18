import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddSongToPlaylistDto {
  @ApiProperty({ description: 'Song ID to add to playlist' })
  @IsUUID()
  song_id: string;
}
