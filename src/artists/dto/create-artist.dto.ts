import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArtistDto {
  @ApiProperty({
    description: 'The name of the artist',
    example: 'J Balvin',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
