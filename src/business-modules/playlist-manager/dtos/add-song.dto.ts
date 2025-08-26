import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { type UUID } from "crypto";

export class AddSongToPlaylistDTO {
  @ApiProperty({
    description: 'The UUID of the song to add to the playlist',
    type: String,
  })
  @IsUUID()
  songId: UUID;
}