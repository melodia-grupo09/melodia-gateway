import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SongsService } from './songs.service';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get('stream/:songId')
  @ApiOperation({
    summary: 'Stream a song',
    description: 'Stream a song by its ID from the external songs service',
  })
  @ApiParam({
    name: 'songId',
    description: 'ID of the song to stream',
    type: String,
    example: 'song123',
  })
  @ApiResponse({
    status: 200,
    description: 'Song streaming data returned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Song not found',
  })
  async streamSong(@Param('songId') songId: string): Promise<unknown> {
    return this.songsService.streamSong(songId);
  }
}
