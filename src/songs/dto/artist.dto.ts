import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ArtistDTO {
  @ApiProperty({
    description: 'Artist ID (can be Firebase UID or UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Artist name',
    example: 'Bruno Mars',
  })
  @IsString()
  name: string;
}
