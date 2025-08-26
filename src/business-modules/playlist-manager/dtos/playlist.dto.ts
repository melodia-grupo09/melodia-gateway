import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsDateString, IsDefined, IsString, ValidateNested } from "class-validator";
import { SongDTO } from "src/business-modules/song-manager/dtos/song.dto";
import { BaseEntityDTO } from "src/entity-modules/base.dto";

export class PlaylistSongDTO extends SongDTO {
  @ApiProperty({
    description: "The date when the song was added to the playlist",
    example: "2023-01-01T00:00:00Z",
  })
  @IsDate()
  addedAt: Date;
}

export class PlaylistDTO extends BaseEntityDTO {
  @ApiProperty({
    description: "The name of the playlist",
    example: "My Playlist",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The description of the playlist",
    example: "A collection of my favorite songs",
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: "Indicates whether the playlist is published",
    example: true,
  })
  @IsBoolean()
  isPublished: boolean;

  @ApiProperty({
    description: "The date when the playlist was published",
    example: "2023-01-01T00:00:00Z",
  })
  @IsDate()
  publishedAt: Date;

  @ApiProperty({
    type: [PlaylistSongDTO],
    description: "The songs in the playlist",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaylistSongDTO)
  songs: PlaylistSongDTO[];
}

export class CreatePlaylistDTO {
  @ApiProperty({
    description: "The name of the playlist",
    example: "My Playlist",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The description of the playlist",
    example: "A collection of my favorite songs",
  })
  @IsString()
  description: string;
}