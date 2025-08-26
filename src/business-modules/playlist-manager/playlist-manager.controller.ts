import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBody, ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { CreateSongDTO, SongDTO, UpdateSongDTO } from "src/business-modules/song-manager/dtos/song.dto";
import type { UUID } from "crypto";
import { CreatePlaylistDTO, PlaylistDTO, PlaylistSongDTO } from "./dtos/playlist.dto";
import { CreatePlaylistUseCase } from "./use-cases/create-playlist.use-case";
import { GetPlaylistsUseCase } from "./use-cases/get-playlists.use-case";
import { GetPlaylistByIdUseCase } from "./use-cases/get-playlist-by-id.use-case";
import { DeletePlaylistUseCase } from "./use-cases/delete-playlist.use-case";
import { AddSongToPlaylistUseCase } from "./use-cases/add-song-to-playlist.use-case";
import { AddSongToPlaylistDTO } from "./dtos/add-song.dto";

@ApiTags("Playlists")
@ApiExtraModels(CreatePlaylistDTO, PlaylistDTO, PlaylistSongDTO)
@Controller("playlists")
export class PlaylistManagerController {
  constructor(
    private readonly createPlaylistUseCase: CreatePlaylistUseCase,
    private readonly getPlaylistsUseCase: GetPlaylistsUseCase,
    private readonly getPlaylistByIdUseCase: GetPlaylistByIdUseCase,
    private readonly deletePlaylistUseCase: DeletePlaylistUseCase,
    private readonly addSongToPlaylistUseCase: AddSongToPlaylistUseCase
  ) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get playlists" })
  @ApiOkResponse({
    description: "Get all playlists",
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
    isArray: true,
  })
  async getPlaylists(
  ): Promise<PlaylistDTO[]> {
    return this.getPlaylistsUseCase.execute();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get playlist by ID" })
  @ApiOkResponse({
    description: "Get a playlist by ID",
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the playlist to retrieve',
    type: String,
  })
  async getPlaylistById(
    @Param('id', ParseUUIDPipe) id: UUID
  ): Promise<PlaylistDTO> {
    return this.getPlaylistByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create playlist" })
  @ApiOkResponse({
    description: "Create a new playlist",
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
  })
  @ApiBody({
    description: "New Playlist data",
    type: CreatePlaylistDTO,
    schema: {
      $ref: getSchemaPath(CreatePlaylistDTO),
    },
  })
  async createPlaylist(
    @Body() createPlaylistDto: CreatePlaylistDTO
  ): Promise<PlaylistDTO> {
    return this.createPlaylistUseCase.execute(createPlaylistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete playlist" })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the playlist to delete',
    type: String,
  })
  async deletePlaylist(
    @Param('id', ParseUUIDPipe) id: UUID
  ): Promise<void> {
    await this.deletePlaylistUseCase.execute(id);
  }

  @Post(':id/songs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add song to playlist" })
  @ApiOkResponse({
    description: "Add a song to an existing playlist",
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
  })
  @ApiBody({
    description: "Song data to add to the playlist",
    type: AddSongToPlaylistDTO,
    schema: {
      $ref: getSchemaPath(AddSongToPlaylistDTO),
    },
  })
  async addSongToPlaylist(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() addSongDto: AddSongToPlaylistDTO
  ): Promise<PlaylistDTO> {
    return this.addSongToPlaylistUseCase.execute(id, addSongDto.songId);
  }
}