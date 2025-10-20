import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AxiosResponse } from 'axios';
import type { Request, Response } from 'express';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { SongsService } from './songs.service';

interface ErrorWithResponse {
  response?: {
    status: number;
    data: unknown;
  };
}

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get('id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    description: 'ID of the song to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getSongById(@Param('id') id: string): Promise<any> {
    return this.songsService.getSongById(id);
  }

  @Get('random')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'limit',
    description: 'Number of random songs to retrieve',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
  })
  async getRandom(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<any> {
    return this.songsService.getRandom(limit, page);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for songs' })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query for songs',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Songs found successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          artist: { type: 'string' },
          duration: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
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
      const responseFromService: AxiosResponse<Readable> =
        await this.songsService.streamSong(songId, range);

      const headers = {
        'Content-Type': responseFromService.headers['content-type'] as string,
        'Content-Length': responseFromService.headers[
          'content-length'
        ] as string,
        'Content-Range': responseFromService.headers['content-range'] as string,
        'Accept-Ranges': responseFromService.headers['accept-ranges'] as string,
      };

      const cleanHeaders = Object.fromEntries(
        Object.entries(headers).filter(([, value]) => value != null),
      );

      res.writeHead(responseFromService.status, cleanHeaders);
      await pipeline(responseFromService.data, res);
    } catch (error: unknown) {
      if (!res.headersSent) {
        const errorWithResponse = error as ErrorWithResponse;
        if (errorWithResponse.response) {
          res
            .status(errorWithResponse.response.status)
            .send(errorWithResponse.response.data);
        } else {
          res.status(500).send('An unexpected error occurred while streaming.');
        }
      } else {
        res.destroy();
      }
    }
  }
}
