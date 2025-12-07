import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ShareSongsDto {
  @ApiProperty({
    description: 'List of song IDs to share',
    type: [String],
    example: ['song1', 'song2'],
  })
  @IsArray()
  @IsString({ each: true })
  song_ids: string[];
}
