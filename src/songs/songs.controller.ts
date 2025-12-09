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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
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
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/user.decorator';
import { User } from '../auth/user.decorator';
import { MetricsService } from '../metrics/metrics.service';
import { HttpErrorInterceptor } from '../users/interceptors/http-error.interceptor';
import { UsersService } from '../users/users.service';
import { UploadSongDTO } from './dto/upload-song.dto';
import { SongDetails, SongsService, UploadResponse } from './songs.service';

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
@UseInterceptors(HttpErrorInterceptor)
@Controller('songs')
export class SongsController {
  constructor(
    private readonly songsService: SongsService,
    private readonly metricsService: MetricsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('deep-link/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redirect to song deep link' })
  @ApiParam({ name: 'id', description: 'Song ID' })
  @ApiResponse({ status: 302, description: 'Redirect to app' })
  redirectSong(@Param('id') id: string, @Res() res: Response) {
    return res.redirect(`melodiaappfront://song/${id}`);
  }

  @Get('id/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get song by ID',
    description:
      'Retrieves song metadata by ID, including cover URL from the release',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the song to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Song found and returned with cover URL',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '68fae1ba215f18c12d559cab' },
        title: { type: 'string', example: 'The scientist' },
        artists: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          example: [{ id: 'N8UsUphRiJfOaa4uDimu56MCspv1', name: 'Coldplay' }],
        },
        duration: { type: 'number', example: 307.63 },
        coverUrl: {
          type: 'string',
          example: 'https://cdn-images.dzcdn.net/images/cover/example.jpg',
          description: 'Cover URL from the release (if available)',
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Song not found',
  })
  async getSongById(@Param('id') id: string): Promise<SongDetails> {
    return this.songsService.getSongById(id);
  }

  @Get('random')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
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
  ): Promise<SongDetails[]> {
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
  ): Promise<SongDetails[]> {
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
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stream a song' })
  @ApiParam({
    name: 'songId',
    description: 'ID of the song to stream',
    type: String,
  })
  @ApiQuery({
    name: 'artistId',
    description: 'ID of the artist (required for metrics)',
    required: true,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Full song stream' })
  @ApiResponse({ status: 206, description: 'Partial song stream for seeking' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async streamSong(
    @Param('songId') songId: string,
    @User() user: FirebaseUser,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Query('artistId') artistId: string,
  ) {
    try {
      const range = req.headers['range'] as string | string[] | undefined;
      const token = req.headers.authorization?.split(' ')[1];
      let region = 'unknown';
      if (token) {
        region = await this.usersService.getUserRegion(token);
      }

      const responseFromService: AxiosResponse<Readable> =
        await this.songsService.streamSong(
          songId,
          range,
          user.uid,
          artistId,
          region,
        );

      // Track user activity for song play in parallel (don't block streaming)
      try {
        await this.metricsService.recordSongPlay(
          songId,
          user.uid,
          artistId,
          region,
        );
      } catch (error) {
        console.error('Failed to track song play activity:', error);
      }

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

  @Get('player/video/:songId/:filename')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stream a song video (HLS)' })
  @ApiParam({
    name: 'songId',
    description: 'ID of the song to stream',
    type: String,
  })
  @ApiParam({
    name: 'filename',
    description: 'Specific HLS file (playlist.m3u8 or segments .ts)',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Stream content' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async streamVideo(
    @Param('songId') songId: string,
    @Param('filename') filename: string,
    @User() user: FirebaseUser,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    try {
      const range = req.headers['range'] as string | string[] | undefined;

      // Llamada al servicio (Asegúrate de agregar este método a SongsService en el gateway)
      const responseFromService: AxiosResponse<Readable> =
        await this.songsService.streamVideo(songId, filename, range);

      // Solo trakeamos la actividad si se pide la playlist principal (.m3u8)
      // para evitar spam de métricas con cada segmento .ts
      if (filename.endsWith('.m3u8')) {
        try {
          await this.metricsService.trackUserActivity(user.uid, 'video_play');
        } catch (error) {
          console.error('Failed to track video play activity:', error);
        }
      }

      const headers = {
        'Content-Type': responseFromService.headers['content-type'] as string,
        'Content-Length': responseFromService.headers[
          'content-length'
        ] as string,
        'Content-Range': responseFromService.headers['content-range'] as string,
        'Accept-Ranges': responseFromService.headers['accept-ranges'] as string,
        'Cache-Control': responseFromService.headers['cache-control'] as string,
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
          console.error('Error streaming video:', error);
          res
            .status(500)
            .send('An unexpected error occurred while streaming video.');
        }
      } else {
        res.destroy();
      }
    }
  }

  @Post('upload')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
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
  ): Promise<UploadResponse> {
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
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
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
    @User() user: FirebaseUser,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    // Verify the song exists
    const song = await this.songsService.getSongById(songId);
    const artistId = song.artists?.[0]?.id ?? 'unknown';

    const token = req.headers.authorization?.split(' ')[1];
    let region = 'unknown';
    if (token) {
      region = await this.usersService.getUserRegion(token);
    }

    await this.metricsService.recordSongLike(
      songId,
      user.uid,
      artistId,
      region,
    );

    return { message: 'Song like recorded successfully' };
  }

  @Post(':songId/share')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
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
    @User() user: FirebaseUser,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    // Verify the song exists
    const song = await this.songsService.getSongById(songId);
    const artistId = song.artists?.[0]?.id ?? 'unknown';

    const token = req.headers.authorization?.split(' ')[1];
    let region = 'unknown';
    if (token) {
      region = await this.usersService.getUserRegion(token);
    }

    // Record the share in metrics service and track user activity
    await Promise.all([
      this.metricsService.recordSongShare(songId, user.uid, artistId, region),
      this.metricsService.trackUserActivity(user.uid, 'song_share'),
    ]);

    return { message: 'Song share recorded successfully' };
  }
}
