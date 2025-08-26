import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDTO } from '../../../entity-modules/base.dto';
import { IsString, MaxLength } from 'class-validator';

export class SongDTO extends BaseEntityDTO {
  @ApiProperty({
    description: 'The name of the song',
    example: 'Song Title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The artist of the song',
    example: 'Artist Name',
  })
  @IsString()
  artist: string;
}

export class CreateSongDTO {
  @ApiProperty({
    description: 'The name of the song',
    example: 'Song Title',
  })
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiProperty({
    description: 'The artist of the song',
    example: 'Artist Name',
  })
  @IsString()
  artist: string;
}

export class UpdateSongDTO extends CreateSongDTO {}
