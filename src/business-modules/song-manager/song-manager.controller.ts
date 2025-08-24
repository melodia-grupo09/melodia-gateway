import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { CreateSongDTO, SongDTO } from "src/entity-modules/song/song.dto";
import { CreateSongUseCase } from "./use-cases/create-song.use-case";
import { GetSongsUseCase } from "./use-cases/get-songs.use-case";

@ApiTags("Songs")
@ApiExtraModels(CreateSongDTO, SongDTO)
@Controller("songs")
export class SongsController {
  constructor(
    private readonly createSongUseCase: CreateSongUseCase,
    private readonly getSongsUseCase: GetSongsUseCase
  ) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get songs" })
  @ApiOkResponse({
    description: "Get all songs",
    type: SongDTO,
    schema: {
      $ref: getSchemaPath(SongDTO),
    },
    isArray: true,
  })
  async getSongs(
  ): Promise<SongDTO[]> {
    return this.getSongsUseCase.execute();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create song" })
  @ApiOkResponse({
    description: "Create a new song",
    type: SongDTO,
    schema: {
      $ref: getSchemaPath(SongDTO),
    },
  })
  async createSong(
    @Body() createSongDto: CreateSongDTO
  ): Promise<SongDTO> {
    return this.createSongUseCase.execute(createSongDto);
  }
}