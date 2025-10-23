import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class ArtistDTO {
  @ApiProperty({
    description: 'Artist UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Artist name',
    example: 'Bruno Mars',
  })
  @IsString()
  name: string;
}
