import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddSongToPlaylistDto {
  @ApiProperty({ description: 'Song ID to add to playlist' })
  @IsString()
  song_id: string;
}
