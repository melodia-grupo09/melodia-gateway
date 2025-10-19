import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateHistoryEntryDto {
  @ApiProperty({ description: 'Song ID to add to history' })
  @IsString()
  song_id: string;
}
