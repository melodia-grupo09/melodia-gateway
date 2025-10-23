import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PlaySongDTO {
  @ApiProperty({
    description: 'ID of the user playing the song',
    example: 'BkmRgBIizfWC7MaFVhyNHRTRa4A2',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description:
      'ID of the artist (optional, can be retrieved from song metadata)',
    example: 'BkmRgBIizfWC7MaFVhyNHRTRa4A2',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  artistId?: string;
}
