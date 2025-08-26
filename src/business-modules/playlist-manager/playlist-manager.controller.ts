import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import type { UUID } from 'crypto';
import {
  CreatePlaylistDTO,
  PlaylistDTO,
  PlaylistSongDTO,
} from './dtos/playlist.dto';
import { CreatePlaylistUseCase } from './use-cases/create-playlist.use-case';
import { GetPlaylistsUseCase } from './use-cases/get-playlists.use-case';
import { GetPlaylistByIdUseCase } from './use-cases/get-playlist-by-id.use-case';
import { DeletePlaylistUseCase } from './use-cases/delete-playlist.use-case';
import { AddSongToPlaylistUseCase } from './use-cases/add-song-to-playlist.use-case';
import { AddSongToPlaylistDTO } from './dtos/add-song.dto';
import { PublishPlaylistUseCase } from './use-cases/publish-playlist.use-case';
import { UnpublishPlaylistUseCase } from './use-cases/unpublish-playlist.use-case';

@ApiTags('Playlists')
@ApiExtraModels(CreatePlaylistDTO, PlaylistDTO, PlaylistSongDTO)
@Controller('playlists')
export class PlaylistManagerController {
  constructor(
    private readonly createPlaylistUseCase: CreatePlaylistUseCase,
    private readonly getPlaylistsUseCase: GetPlaylistsUseCase,
    private readonly getPlaylistByIdUseCase: GetPlaylistByIdUseCase,
    private readonly deletePlaylistUseCase: DeletePlaylistUseCase,
    private readonly addSongToPlaylistUseCase: AddSongToPlaylistUseCase,
    private readonly publishPlaylistUseCase: PublishPlaylistUseCase,
    private readonly unpublishPlaylistUseCase: UnpublishPlaylistUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get playlists' })
  @ApiOkResponse({
    description: 'Get all playlists',
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
    isArray: true,
  })
  @ApiQuery({
    name: 'published',
    type: Boolean,
    default: true,
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    default: '-publishedAt',
    required: false,
  })
  async getPlaylists(
    @Query('published', new DefaultValuePipe(true), ParseBoolPipe)
    published: boolean,
    @Query('sort', new DefaultValuePipe('-publishedAt')) sort: string,
  ): Promise<PlaylistDTO[]> {
    const sortDirection = sort[0] === '-' ? 'desc' : 'asc';
    const sortField = sort.replace('-', '') as keyof PlaylistDTO;
    return this.getPlaylistsUseCase.execute(published, {
      sortField,
      sortDirection,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get playlist by ID' })
  @ApiOkResponse({
    description: 'Get a playlist by ID',
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
    @Param('id', ParseUUIDPipe) id: UUID,
  ): Promise<PlaylistDTO> {
    return this.getPlaylistByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create playlist' })
  @ApiOkResponse({
    description: 'Create a new playlist',
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
  })
  @ApiBody({
    description: 'New Playlist data',
    type: CreatePlaylistDTO,
    schema: {
      $ref: getSchemaPath(CreatePlaylistDTO),
    },
  })
  async createPlaylist(
    @Body() createPlaylistDto: CreatePlaylistDTO,
  ): Promise<PlaylistDTO> {
    return this.createPlaylistUseCase.execute(createPlaylistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete playlist' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the playlist to delete',
    type: String,
  })
  async deletePlaylist(@Param('id', ParseUUIDPipe) id: UUID): Promise<void> {
    await this.deletePlaylistUseCase.execute(id);
  }

  @Post(':id/songs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add song to playlist' })
  @ApiOkResponse({
    description: 'Add a song to an existing playlist',
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
  })
  @ApiBody({
    description: 'Song data to add to the playlist',
    type: AddSongToPlaylistDTO,
    schema: {
      $ref: getSchemaPath(AddSongToPlaylistDTO),
    },
  })
  async addSongToPlaylist(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() addSongDto: AddSongToPlaylistDTO,
  ): Promise<PlaylistDTO> {
    return this.addSongToPlaylistUseCase.execute(id, addSongDto.songId);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish playlist' })
  @ApiOkResponse({
    description: 'Publish an existing playlist',
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
  })
  async publishPlaylist(
    @Param('id', ParseUUIDPipe) id: UUID,
  ): Promise<PlaylistDTO> {
    return this.publishPlaylistUseCase.execute(id);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish playlist' })
  @ApiOkResponse({
    description: 'Publish an existing playlist',
    type: PlaylistDTO,
    schema: {
      $ref: getSchemaPath(PlaylistDTO),
    },
  })
  async unpublishPlaylist(
    @Param('id', ParseUUIDPipe) id: UUID,
  ): Promise<PlaylistDTO> {
    return this.unpublishPlaylistUseCase.execute(id);
  }
}
