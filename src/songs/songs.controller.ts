import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
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
import { MetricsService } from '../metrics/metrics.service';
import { UploadSongDTO } from './dto/upload-song.dto';
import { SongsService } from './songs.service';

interface ErrorWithResponse {
  response?: {
    status: number;
    data: unknown;
  };
}

interface UploadedFileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(
    private readonly songsService: SongsService,
    private readonly metricsService: MetricsService,
  ) {}

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
  @ApiQuery({
    name: 'userId',
    description: 'ID of the user playing the song (for metrics)',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'artistId',
    description: 'ID of the artist (optional, for metrics)',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Full song stream' })
  @ApiResponse({ status: 206, description: 'Partial song stream for seeking' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async streamSong(
    @Param('songId') songId: string,
    @Query('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Query('artistId') artistId?: string,
  ) {
    try {
      const range = req.headers['range'] as string | string[] | undefined;
      const responseFromService: AxiosResponse<Readable> =
        await this.songsService.streamSong(songId, range, userId, artistId);

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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new song' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a new song',
    required: true,
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the song',
          example: 'My Awesome Song',
        },
        artists: {
          type: 'string',
          description: 'List of artists (JSON string)',
          example:
            '[{"id":"123e4567-e89b-12d3-a456-426614174000","name":"Artist Name"}]',
        },
        albumId: {
          type: 'string',
          description: 'Album ID',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'The song file to upload',
        },
      },
      required: ['title', 'artists', 'file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Song uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or file',
  })
  async uploadSong(
    @Body() body: UploadSongDTO,
    @UploadedFile() file?: UploadedFileData,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const formData = new FormData();

    // Add form fields
    formData.append('title', body.title);
    formData.append('artists', JSON.stringify(body.artists));
    if (body.albumId) {
      formData.append('albumId', body.albumId);
    }

    // Add file - create a proper blob from buffer
    const blob = new Blob([new Uint8Array(file.buffer)], {
      type: file.mimetype || 'audio/mpeg',
    });
    formData.append('file', blob, file.originalname || 'song.mp3');

    return this.songsService.uploadSong(formData);
  }

  @Post(':songId/like')
  @ApiOperation({ summary: 'Like a song' })
  @ApiParam({
    name: 'songId',
    description: 'Song UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Song like recorded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Song not found',
  })
  async likeSong(
    @Param('songId') songId: string,
  ): Promise<{ message: string }> {
    // Verify the song exists
    await this.songsService.getSongById(songId);

    await this.metricsService.recordSongLike(songId);

    return { message: 'Song like recorded successfully' };
  }

  @Post(':songId/share')
  @ApiOperation({ summary: 'Share a song' })
  @ApiParam({
    name: 'songId',
    description: 'Song UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Song share recorded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Song not found',
  })
  async shareSong(
    @Param('songId') songId: string,
  ): Promise<{ message: string }> {
    // Verify the song exists
    await this.songsService.getSongById(songId);

    await this.metricsService.recordSongShare(songId);

    return { message: 'Song share recorded successfully' };
  }
}
