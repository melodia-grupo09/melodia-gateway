import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HttpErrorInterceptor } from '../users/interceptors/http-error.interceptor';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@ApiTags('artists')
@UseInterceptors(HttpErrorInterceptor)
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new artist' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Artist data with optional image',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the artist',
          example: 'J Balvin',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Artist profile image',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Artist created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 409,
    description: 'Artist name already exists',
  })
  async createArtist(
    @Body() createArtistDto: CreateArtistDto,
    @UploadedFile() image?: any,
  ): Promise<any> {
    const formData = new FormData();
    formData.append('name', createArtistDto.name);

    if (
      image &&
      typeof image === 'object' &&
      'buffer' in image &&
      'originalname' in image
    ) {
      const imageFile = image as { buffer: Buffer; originalname: string };
      const blob = new Blob([new Uint8Array(imageFile.buffer)]);
      formData.append('image', blob, imageFile.originalname);
    }

    return this.artistsService.createArtist(formData);
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
    @UploadedFiles() files?: any,
  ): Promise<any> {
    const formData = new FormData();

    if (files?.image?.[0]) {
      const imageFile = files.image[0];
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
    }

    if (files?.cover?.[0]) {
      const coverFile = files.cover[0];
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
    }

    return this.artistsService.updateArtistMedia(id, formData);
  }

  // Release endpoints
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
    return this.artistsService.createRelease(artistId, createReleaseDto);
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
    return this.artistsService.addSongsToRelease(artistId, releaseId, songData);
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

  @Patch(':id/follow')
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
  async followArtist(@Param('id') id: string): Promise<any> {
    return this.artistsService.followArtist(id);
  }

  @Patch(':id/unfollow')
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
  async unfollowArtist(@Param('id') id: string): Promise<any> {
    return this.artistsService.unfollowArtist(id);
  }
}
