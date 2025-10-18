import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateHistoryEntryDto {
  @ApiProperty({ description: 'Song ID to add to history' })
  @IsUUID()
  song_id: string;
}
