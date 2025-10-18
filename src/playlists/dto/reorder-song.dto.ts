import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber } from 'class-validator';

export class ReorderSongDto {
  @ApiProperty({ description: 'Song ID' })
  @IsUUID()
  song_id: string;

  @ApiProperty({ description: 'New position for the song' })
  @IsNumber()
  position: number;
}