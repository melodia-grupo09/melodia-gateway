import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class GetTopAlbumsDto {
  @ApiProperty({
    description:
      'Mapping of album IDs to their song IDs to calculate total plays',
    example: {
      album123: ['song1', 'song2', 'song3'],
      album456: ['song4', 'song5'],
    },
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  @IsObject()
  albumSongs: Record<string, string[]>;
}
