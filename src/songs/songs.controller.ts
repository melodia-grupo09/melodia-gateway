import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { pipeline } from 'stream/promises';
import { SongsService } from './songs.service';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get('search')
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query for songs',
  })
  @ApiProperty({
    name: 'page',
    required: false,
    default: 1,
    description: 'Page number for pagination',
  })
  @ApiProperty({
    name: 'limit',
    required: false,
    default: 20,
    description: 'Number of results per page',
  })
  async searchSongs(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe())
    page: number,
    @Query('limit', new DefaultValuePipe(20), new ParseIntPipe())
    limit: number,
  ): Promise<any[]> {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    return this.songsService.searchSongs(query, limit, page);
  }

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
      const range = req.headers['range'] as string | string[] | undefined;
      const responseFromService = await this.songsService.streamSong(
        songId,
        range,
      );

      const headers = {
        'Content-Type': responseFromService.headers['content-type'],
        'Content-Length': responseFromService.headers['content-length'],
        'Content-Range': responseFromService.headers['content-range'],
        'Accept-Ranges': responseFromService.headers['accept-ranges'],
      };

      const cleanHeaders = Object.fromEntries(
        Object.entries(headers).filter(([, value]) => value != null),
      );

      res.writeHead(responseFromService.status, cleanHeaders);
      await pipeline(responseFromService.data, res);
    } catch (error) {
      if (!res.headersSent) {
        if (error.response) {
          res.status(error.response.status).send(error.response.data);
        } else {
          res.status(500).send('An unexpected error occurred while streaming.');
        }
      } else {
        res.destroy();
      }
    }
  }
}
