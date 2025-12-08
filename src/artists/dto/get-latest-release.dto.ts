import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class GetLatestReleaseDto {
  @ApiProperty({
    description: 'List of artist IDs to search for the latest release',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43f7-9abc-426614174000',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  artistIds: string[];
}
