import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SongsService } from './songs.service';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get('player/play/:songId')
  @ApiOperation({ summary: 'Stream a song' })
  @ApiParam({
    name: 'songId',
    description: 'ID of the song to stream',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Full song stream' })
  @ApiResponse({ status: 206, description: 'Partial song stream for seeking' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async streamSong(
    @Param('songId') songId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    try {
      let range = req.headers['range'] as string | string[] | undefined;
      if (Array.isArray(range)) {
        range = range[0];
      }

      const responseFromService = await this.songsService.streamSong(
        songId,
        range,
      );
      const headers = {
        'Content-Type': responseFromService.headers['content-type'] as
          | string
          | undefined,
        'Content-Length': responseFromService.headers['content-length'] as
          | string
          | undefined,
        'Content-Range': responseFromService.headers['content-range'] as
          | string
          | undefined,
        'Accept-Ranges': responseFromService.headers['accept-ranges'] as
          | string
          | undefined,
      };

      const cleanHeaders = Object.fromEntries(
        Object.entries(headers).filter(([, value]) => value != null),
      );
      res.writeHead(responseFromService.status, cleanHeaders);
      responseFromService.data.pipe(res);
    } catch {
      throw new InternalServerErrorException('Error streaming song');
    }
  }
}
