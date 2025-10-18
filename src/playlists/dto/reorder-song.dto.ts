import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class ReorderSongDto {
  @ApiProperty({ description: 'Song ID' })
  @IsUUID()
  song_id: string;

  @ApiProperty({ description: 'New position for the song' })
  @IsNumber()
  position: number;
}
