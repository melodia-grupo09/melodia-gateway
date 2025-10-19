import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ReorderSongDto {
  @ApiProperty({ description: 'Song ID' })
  @IsString()
  song_id: string;

  @ApiProperty({ description: 'New position for the song' })
  @IsNumber()
  position: number;
}
