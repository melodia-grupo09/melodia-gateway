import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { FirebaseUser } from '../auth/user.decorator';
import { User } from '../auth/user.decorator';
import { MetricsService } from '../metrics/metrics.service';
import { HttpErrorInterceptor } from '../users/interceptors/http-error.interceptor';
import { ArtistsService } from './artists.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { GetLatestReleaseDto } from './dto/get-latest-release.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@ApiTags('artists')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@UseInterceptors(HttpErrorInterceptor)
@Controller('artists')
export class ArtistsController {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search artists by name or bio' })
  @ApiResponse({
    status: 200,
    description: 'Artists found matching the search query',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters',
  })
  async searchArtists(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.artistsService.searchArtists(query, page, limit);
  }

  @Post('latest-release')
  @ApiOperation({ summary: 'Get the latest release from a list of artists' })
  @ApiBody({ type: GetLatestReleaseDto })
  @ApiResponse({
    status: 200,
    description: 'The latest release found among the provided artists',
  })
  @ApiResponse({
    status: 404,
    description: 'No releases found for the provided artists',
  })
  async getLatestRelease(
    @Body() getLatestReleaseDto: GetLatestReleaseDto,
  ): Promise<any> {
    return this.artistsService.getLatestRelease(getLatestReleaseDto.artistIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artist by ID' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Artist found',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async getArtist(@Param('id') id: string): Promise<any> {
    return this.artistsService.getArtist(id);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar artists' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of similar artists based on genres',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async getSimilarArtists(@Param('id') id: string): Promise<any> {
    return this.artistsService.getSimilarArtists(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update artist information' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiBody({
    description: 'Artist data to update (all fields are optional)',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'J Balvin',
        },
        bio: {
          type: 'string',
          example:
            'Colombian reggaeton singer, songwriter, and record producer.',
        },
        socialLinks: {
          type: 'object',
          example: {
            instagram: 'https://instagram.com/jbalvin',
            twitter: 'https://twitter.com/jbalvin',
            spotify: 'https://open.spotify.com/artist/1vyhD5VmyZ7KMfW5gqLgo5',
            youtube: 'https://youtube.com/c/JBalvinOfficial',
            website: 'https://jbalvin.com',
          },
        },
      },
    },
    examples: {
      'Update all fields': {
        value: {
          name: 'J Balvin',
          bio: 'Colombian reggaeton singer, songwriter, and record producer.',
          socialLinks: {
            instagram: 'https://instagram.com/jbalvin',
            twitter: 'https://twitter.com/jbalvin',
            spotify: 'https://open.spotify.com/artist/1vyhD5VmyZ7KMfW5gqLgo5',
            youtube: 'https://youtube.com/c/JBalvinOfficial',
            website: 'https://jbalvin.com',
          },
        },
      },
      'Update only name': {
        value: {
          name: 'New Artist Name',
        },
      },
      'Update only bio': {
        value: {
          bio: 'New artist biography with updated information about their career and achievements.',
        },
      },
      'Update only social links': {
        value: {
          socialLinks: {
            instagram: 'https://instagram.com/newhandle',
            spotify: 'https://open.spotify.com/artist/newid',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Artist updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async updateArtist(
    @Param('id') id: string,
    @Body() updateArtistDto: UpdateArtistDto,
  ): Promise<any> {
    return this.artistsService.updateArtist(id, updateArtistDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete artist' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Artist deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async deleteArtist(@Param('id') id: string): Promise<any> {
    return this.artistsService.deleteArtist(id);
  }

  @Patch(':id/media')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Update artist media (profile image and/or cover)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Artist profile image',
        },
        cover: {
          type: 'string',
          format: 'binary',
          description: 'Artist cover image',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Media updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async updateArtistMedia(
    @Param('id') id: string,
    @UploadedFiles()
    files?: { image?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<any> {
    const formData = new FormData();

    const imageFile = files?.image?.[0];
    if (
      imageFile &&
      typeof imageFile === 'object' &&
      'buffer' in imageFile &&
      'originalname' in imageFile
    ) {
      const file = imageFile as { buffer: Buffer; originalname: string };
      const blob = new Blob([new Uint8Array(file.buffer)]);
      formData.append('image', blob, file.originalname);
    }

    const coverFile = files?.cover?.[0];
    if (
      coverFile &&
      typeof coverFile === 'object' &&
      'buffer' in coverFile &&
      'originalname' in coverFile
    ) {
      const file = coverFile as { buffer: Buffer; originalname: string };
      const blob = new Blob([new Uint8Array(file.buffer)]);
      formData.append('cover', blob, file.originalname);
    }

    return this.artistsService.updateArtistMedia(id, formData);
  }

  // Release endpoints - Specific routes MUST come before general routes
  @Get(':artistId/releases/upcoming')
  @ApiOperation({ summary: 'Get upcoming/scheduled releases for an artist' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming releases retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async getUpcomingReleases(@Param('artistId') artistId: string): Promise<any> {
    return this.artistsService.getUpcomingReleases(artistId);
  }

  @Get(':artistId/releases/published')
  @ApiOperation({ summary: 'Get published releases for an artist' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Published releases retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async getPublishedReleases(
    @Param('artistId') artistId: string,
  ): Promise<any> {
    return this.artistsService.getPublishedReleases(artistId);
  }

  @Get(':artistId/releases')
  @ApiOperation({ summary: 'Get all releases for an artist' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Releases retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async getArtistReleases(@Param('artistId') artistId: string): Promise<any> {
    return this.artistsService.getArtistReleases(artistId);
  }

  @Post(':artistId/releases')
  @ApiOperation({ summary: 'Create a new release for an artist' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Release created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async createRelease(
    @Param('artistId') artistId: string,
    @Body() createReleaseDto: CreateReleaseDto,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const release = await this.artistsService.createRelease(
      artistId,
      createReleaseDto,
    );

    try {
      if (release && typeof release === 'object' && 'id' in release) {
        const releaseWithId = release as { id: string };
        if (releaseWithId.id && typeof releaseWithId.id === 'string') {
          await this.metricsService.recordAlbumCreation(releaseWithId.id);
        }
      }
    } catch (error) {
      // Log error but don't break the main flow
      console.error('Failed to record album creation in metrics:', error);
    }

    return release;
  }

  @Get(':artistId/releases/:releaseId')
  @ApiOperation({ summary: 'Get a specific release' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Release retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist or release not found',
  })
  async getArtistRelease(
    @Param('artistId') artistId: string,
    @Param('releaseId') releaseId: string,
  ): Promise<any> {
    return this.artistsService.getArtistRelease(artistId, releaseId);
  }

  @Patch(':artistId/releases/:releaseId')
  @ApiOperation({ summary: 'Update a release' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Release updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist or release not found',
  })
  async updateRelease(
    @Param('artistId') artistId: string,
    @Param('releaseId') releaseId: string,
    @Body() updateReleaseDto: UpdateReleaseDto,
  ): Promise<any> {
    return this.artistsService.updateRelease(
      artistId,
      releaseId,
      updateReleaseDto,
    );
  }

  @Delete(':artistId/releases/:releaseId')
  @ApiOperation({ summary: 'Delete a release' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Release deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist or release not found',
  })
  async deleteRelease(
    @Param('artistId') artistId: string,
    @Param('releaseId') releaseId: string,
  ): Promise<any> {
    return this.artistsService.deleteRelease(artistId, releaseId);
  }

  @Patch(':artistId/releases/:releaseId/cover')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Update release cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Release cover updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist or release not found',
  })
  async updateReleaseCover(
    @Param('artistId') artistId: string,
    @Param('releaseId') releaseId: string,
    @UploadedFile() cover: any,
  ): Promise<any> {
    const formData = new FormData();

    if (
      cover &&
      typeof cover === 'object' &&
      'buffer' in cover &&
      'originalname' in cover
    ) {
      const coverFile = cover as { buffer: Buffer; originalname: string };
      const blob = new Blob([new Uint8Array(coverFile.buffer)]);
      formData.append('cover', blob, coverFile.originalname);
    }

    return this.artistsService.updateReleaseCover(
      artistId,
      releaseId,
      formData,
    );
  }

  @Patch(':artistId/releases/:releaseId/songs/add')
  @ApiOperation({ summary: 'Add songs to release' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release UUID',
    type: String,
  })
  @ApiBody({
    description: 'Song IDs to add to the release',
    schema: {
      type: 'object',
      properties: {
        songIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['new-song-1', 'new-song-2'],
          description: 'Array of song IDs to add to the release',
        },
      },
      required: ['songIds'],
    },
    examples: {
      'Add single song': {
        summary: 'Add single song',
        description: 'Add one song to the release',
        value: {
          songIds: ['bonus-track-id'],
        },
      },
      'Add multiple songs': {
        summary: 'Add multiple songs',
        description: 'Add several songs to the release',
        value: {
          songIds: ['bonus-track-1', 'bonus-track-2', 'deluxe-song'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Songs added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist or release not found',
  })
  async addSongsToRelease(
    @Param('artistId') artistId: string,
    @Param('releaseId') releaseId: string,
    @Body() songData: { songIds: string[] },
  ): Promise<any> {
    // Validate input
    if (!songData || !songData.songIds) {
      throw new HttpException(
        {
          status: 'error',
          message: 'songIds array is required',
          code: 'validation_error',
        },
        400,
      );
    }

    if (!Array.isArray(songData.songIds)) {
      throw new HttpException(
        {
          status: 'error',
          message: 'songIds must be an array of strings',
          code: 'validation_error',
          received: typeof songData.songIds,
          expected: 'array',
        },
        400,
      );
    }

    if (songData.songIds.length === 0) {
      throw new HttpException(
        {
          status: 'error',
          message: 'songIds array cannot be empty',
          code: 'validation_error',
        },
        400,
      );
    }

    // Validate each songId is a string
    const invalidSongIds = songData.songIds.filter(
      (id) => typeof id !== 'string' || id.trim() === '',
    );
    if (invalidSongIds.length > 0) {
      throw new HttpException(
        {
          status: 'error',
          message: 'All songIds must be non-empty strings',
          code: 'validation_error',
          invalidIds: invalidSongIds,
        },
        400,
      );
    }

    try {
      return await this.artistsService.addSongsToRelease(
        artistId,
        releaseId,
        songData,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Enhanced error logging for debugging
      console.error('Error adding songs to release:', {
        artistId,
        releaseId,
        songData,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to add songs to release',
          code: 'add_songs_error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500,
      );
    }
  }

  @Patch(':artistId/releases/:releaseId/songs/remove')
  @ApiOperation({ summary: 'Remove songs from release' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release UUID',
    type: String,
  })
  @ApiBody({
    description: 'Song IDs to remove from the release',
    schema: {
      type: 'object',
      properties: {
        songIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['song-to-remove-1', 'song-to-remove-2'],
          description: 'Array of song IDs to remove from the release',
        },
      },
      required: ['songIds'],
    },
    examples: {
      'Remove single song': {
        summary: 'Remove single song',
        description: 'Remove one song from the release',
        value: {
          songIds: ['unwanted-track-id'],
        },
      },
      'Remove multiple songs': {
        summary: 'Remove multiple songs',
        description: 'Remove several songs from the release',
        value: {
          songIds: ['old-demo-1', 'old-demo-2', 'duplicate-track'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Songs removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist or release not found',
  })
  async removeSongsFromRelease(
    @Param('artistId') artistId: string,
    @Param('releaseId') releaseId: string,
    @Body() songData: { songIds: string[] },
  ): Promise<any> {
    return this.artistsService.removeSongsFromRelease(
      artistId,
      releaseId,
      songData,
    );
  }

  @Post(':artistId/releases/:releaseId/like')
  @ApiOperation({ summary: 'Like an album/release' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release/Album UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Album like recorded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist or release not found',
  })
  async likeAlbum(
    @Param('artistId') artistId: string,
    @Param('releaseId') releaseId: string,
  ): Promise<{ message: string }> {
    // Verify the release exists for the artist
    await this.artistsService.getReleaseById(releaseId);

    await this.metricsService.recordAlbumLike(releaseId);

    return { message: 'Album like recorded successfully' };
  }

  @Post(':artistId/releases/:releaseId/share')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Share an album/release' })
  @ApiParam({
    name: 'artistId',
    description: 'Artist UUID',
    type: String,
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release/Album UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Album share recorded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist or release not found',
  })
  async shareAlbum(
    @Param('artistId') artistId: string,
    @Param('releaseId') releaseId: string,
    @User() user: FirebaseUser,
  ): Promise<{ message: string }> {
    // Verify the release exists for the artist
    await this.artistsService.getReleaseById(releaseId);

    // Record the share in metrics service and track user activity
    await Promise.all([
      this.metricsService.recordAlbumShare(releaseId),
      this.metricsService.trackUserActivity(user.uid, 'album_share'),
    ]);

    return { message: 'Album share recorded successfully' };
  }

  @Patch(':id/follow')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Follow artist (increment followers count)' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Follower count incremented successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async followArtist(
    @Param('id') id: string,
    @User() user: FirebaseUser,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.artistsService.followArtist(id);

    // Track user activity for following artist
    try {
      await this.metricsService.trackUserActivity(user.uid, 'artist_follow');
    } catch (error) {
      console.error('Failed to track artist follow activity:', error);
    }

    return result;
  }

  @Patch(':id/unfollow')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Unfollow artist (decrement followers count)' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Follower count decremented successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async unfollowArtist(
    @Param('id') id: string,
    @User() user: FirebaseUser,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.artistsService.unfollowArtist(id);

    // Track user activity for unfollowing artist
    try {
      await this.metricsService.trackUserActivity(user.uid, 'artist_unfollow');
    } catch (error) {
      console.error('Failed to track artist unfollow activity:', error);
    }

    return result;
  }
}
