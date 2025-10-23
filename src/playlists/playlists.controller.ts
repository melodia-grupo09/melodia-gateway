/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { AddSongToPlaylistDto } from './dto/add-song-to-playlist.dto';
import { CreateHistoryEntryDto } from './dto/create-history-entry.dto';
import { CreateLikedSongDto } from './dto/create-liked-song.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderSongDto } from './dto/reorder-song.dto';
import { PlaylistsService } from './playlists.service';

@ApiTags('playlists')
@UseGuards(FirebaseAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  // Liked songs endpoints (must be before dynamic routes)
  @Get('liked-songs')
  @ApiOperation({ summary: 'Get all liked songs for a user' })
  @ApiResponse({
    status: 200,
    description: 'Liked songs retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          song_id: { type: 'string' },
          id: { type: 'string' },
          user_id: { type: 'string' },
          position: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async getLikedSongs(@Headers('user-id') userId: string) {
    return this.playlistsService.getLikedSongs(userId);
  }

  @Post('liked-songs')
  @ApiOperation({
    summary: 'Add a song to liked songs',
    description: "Adds a song to the user's liked songs collection",
  })
  @ApiResponse({
    status: 201,
    description: 'Song added to liked songs successfully',
    schema: {
      type: 'object',
      properties: {
        song_id: { type: 'string' },
        id: { type: 'string' },
        user_id: { type: 'string' },
        position: { type: 'number' },
        created_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async addLikedSong(
    @Headers('user-id') userId: string,
    @Body() createLikedSongDto: CreateLikedSongDto,
  ) {
    return this.playlistsService.addLikedSong(userId, createLikedSongDto);
  }

  @Delete('liked-songs/:songId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a song from liked songs' })
  @ApiResponse({
    status: 204,
    description: 'Song removed from liked songs successfully',
  })
  @ApiParam({ name: 'songId', description: 'Song ID' })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async removeLikedSong(
    @Param('songId') songId: string,
    @Headers('user-id') userId: string,
  ) {
    return this.playlistsService.removeLikedSong(songId, userId);
  }

  @Put('liked-songs/reorder')
  @ApiOperation({ summary: 'Reorder liked songs' })
  @ApiResponse({
    status: 200,
    description: 'Liked songs reordered successfully',
  })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async reorderLikedSongs(
    @Headers('user-id') userId: string,
    @Body() songPositions: ReorderSongDto[],
  ) {
    return this.playlistsService.reorderLikedSongs(userId, songPositions);
  }

  @Get('liked-songs/is-liked')
  @ApiOperation({
    summary: 'Check if song is liked',
    description: "Check if a song is in the user's liked songs collection",
  })
  @ApiResponse({
    status: 200,
    description: 'Returns true if the song is liked, false otherwise',
    schema: {
      type: 'boolean',
    },
  })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  @ApiHeader({ name: 'song-id', description: 'Song ID', required: true })
  async isLikedSong(
    @Headers('user-id') userId: string,
    @Headers('song-id') songId: string,
  ) {
    return this.playlistsService.isLikedSong(userId, songId);
  }

  // History endpoints (must be before dynamic routes)
  @Get('history')
  @ApiOperation({ summary: 'Get playback history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async getHistory(@Headers('user-id') userId: string) {
    return this.playlistsService.getHistory(userId);
  }

  @Post('history')
  @ApiOperation({ summary: 'Add a song to playback history' })
  @ApiResponse({
    status: 201,
    description: 'Song added to history successfully',
  })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async addToHistory(
    @Headers('user-id') userId: string,
    @Body() createHistoryEntryDto: CreateHistoryEntryDto,
  ) {
    return this.playlistsService.addToHistory(userId, createHistoryEntryDto);
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all history' })
  @ApiResponse({ status: 204, description: 'History cleared successfully' })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async clearHistory(@Headers('user-id') userId: string) {
    return this.playlistsService.clearHistory(userId);
  }

  @Delete('history/:songId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a song from history' })
  @ApiResponse({
    status: 204,
    description: 'Song removed from history successfully',
  })
  @ApiParam({ name: 'songId', description: 'Song ID' })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async removeFromHistory(
    @Param('songId') songId: string,
    @Headers('user-id') userId: string,
  ) {
    return this.playlistsService.removeFromHistory(songId, userId);
  }

  // Playlist endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiResponse({ status: 201, description: 'Playlist created successfully' })
  async createPlaylist(
    @Query('user_id') userId: string,
    @Body() createPlaylistDto: CreatePlaylistDto,
  ) {
    return this.playlistsService.createPlaylist(userId, createPlaylistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all playlists' })
  @ApiResponse({ status: 200, description: 'Playlists retrieved successfully' })
  @ApiQuery({
    name: 'user_id',
    required: false,
    description: 'Filter by user ID',
  })
  async getPlaylists(@Query('user_id') userId?: string) {
    return this.playlistsService.getPlaylists(userId);
  }

  @Get(':playlistId')
  @ApiOperation({ summary: 'Get a specific playlist' })
  @ApiResponse({ status: 200, description: 'Playlist retrieved successfully' })
  @ApiParam({ name: 'playlistId', description: 'Playlist ID' })
  async getPlaylist(@Param('playlistId') playlistId: string) {
    return this.playlistsService.getPlaylist(playlistId);
  }

  @Delete(':playlistId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a playlist' })
  @ApiResponse({ status: 204, description: 'Playlist deleted successfully' })
  @ApiParam({ name: 'playlistId', description: 'Playlist ID' })
  @ApiHeader({ name: 'user-id', description: 'User ID', required: true })
  async deletePlaylist(
    @Param('playlistId') playlistId: string,
    @Headers('user-id') userId: string,
  ) {
    return this.playlistsService.deletePlaylist(playlistId, userId);
  }

  @Post(':playlistId/songs')
  @ApiOperation({ summary: 'Add a song to playlist' })
  @ApiResponse({
    status: 201,
    description: 'Song added to playlist successfully',
  })
  @ApiParam({ name: 'playlistId', description: 'Playlist ID' })
  async addSongToPlaylist(
    @Param('playlistId') playlistId: string,
    @Body() addSongDto: AddSongToPlaylistDto,
  ) {
    return this.playlistsService.addSongToPlaylist(playlistId, addSongDto);
  }

  @Delete(':playlistId/songs/:songId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a song from playlist' })
  @ApiResponse({
    status: 204,
    description: 'Song removed from playlist successfully',
  })
  @ApiParam({ name: 'playlistId', description: 'Playlist ID' })
  @ApiParam({ name: 'songId', description: 'Song ID' })
  async removeSongFromPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string,
  ) {
    return this.playlistsService.removeSongFromPlaylist(playlistId, songId);
  }

  @Put(':playlistId/songs/reorder')
  @ApiOperation({ summary: 'Reorder songs in playlist' })
  @ApiResponse({ status: 200, description: 'Songs reordered successfully' })
  @ApiParam({ name: 'playlistId', description: 'Playlist ID' })
  async reorderPlaylistSongs(
    @Param('playlistId') playlistId: string,
    @Body() songPositions: ReorderSongDto[],
  ) {
    return this.playlistsService.reorderPlaylistSongs(
      playlistId,
      songPositions,
    );
  }
}
