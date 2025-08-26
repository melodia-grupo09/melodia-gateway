import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CreateSongDTO,
  SongDTO,
  UpdateSongDTO,
} from 'src/business-modules/song-manager/dtos/song.dto';
import { CreateSongUseCase } from './use-cases/create-song.use-case';
import { GetSongsUseCase } from './use-cases/get-songs.use-case';
import { GetSongByIdUseCase } from './use-cases/get-song-by-id.use-case';
import type { UUID } from 'crypto';
import { UpdateSongUseCase } from './use-cases/update-song.use-case';
import { DeleteSongUseCase } from './use-cases/delete-song.use-case';

@ApiTags('Songs')
@ApiExtraModels(CreateSongDTO, SongDTO)
@Controller('songs')
export class SongsController {
  constructor(
    private readonly createSongUseCase: CreateSongUseCase,
    private readonly getSongsUseCase: GetSongsUseCase,
    private readonly getSongByIdUseCase: GetSongByIdUseCase,
    private readonly updateSongUseCase: UpdateSongUseCase,
    private readonly deleteSongUseCase: DeleteSongUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get songs' })
  @ApiOkResponse({
    description: 'Get all songs',
    type: SongDTO,
    schema: {
      $ref: getSchemaPath(SongDTO),
    },
    isArray: true,
  })
  async getSongs(): Promise<SongDTO[]> {
    return this.getSongsUseCase.execute();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get song by ID' })
  @ApiOkResponse({
    description: 'Get a song by ID',
    type: SongDTO,
    schema: {
      $ref: getSchemaPath(SongDTO),
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the song to retrieve',
    type: String,
  })
  async getSongById(@Param('id', ParseUUIDPipe) id: UUID): Promise<SongDTO> {
    return this.getSongByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create song' })
  @ApiOkResponse({
    description: 'Create a new song',
    type: SongDTO,
    schema: {
      $ref: getSchemaPath(SongDTO),
    },
  })
  @ApiBody({
    description: 'New Song data',
    type: CreateSongDTO,
    schema: {
      $ref: getSchemaPath(CreateSongDTO),
    },
  })
  async createSong(@Body() createSongDto: CreateSongDTO): Promise<SongDTO> {
    return this.createSongUseCase.execute(createSongDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update song' })
  @ApiOkResponse({
    description: 'Update an existing song',
    type: SongDTO,
    schema: {
      $ref: getSchemaPath(SongDTO),
    },
  })
  @ApiBody({
    description: 'Updated Song data',
    type: UpdateSongDTO,
    schema: {
      $ref: getSchemaPath(UpdateSongDTO),
    },
  })
  async updateSong(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateSongDto: UpdateSongDTO,
  ): Promise<SongDTO> {
    return this.updateSongUseCase.execute(id, updateSongDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete song' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the song to delete',
    type: String,
  })
  async deleteSong(@Param('id', ParseUUIDPipe) id: UUID): Promise<void> {
    await this.deleteSongUseCase.execute(id);
  }
}
