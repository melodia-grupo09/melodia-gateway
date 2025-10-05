import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateArtistDto {
  @ApiProperty({
    description: 'The name of the artist',
    example: 'J Balvin',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
