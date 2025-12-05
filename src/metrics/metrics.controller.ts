import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@ApiBearerAuth()
@Controller('metrics')
@UseGuards(FirebaseAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('users/analytics/registrations')
  @ApiOperation({
    summary: 'Get new registrations',
    description:
      'Retrieve the count of new user registrations within a date range',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    example: '2024-01-01',
    description: 'Start date for the analytics period (YYYY-MM-DD format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    example: '2024-12-31',
    description: 'End date for the analytics period (YYYY-MM-DD format)',
  })
  @ApiResponse({
    status: 200,
    description: 'New registrations count retrieved successfully',
  })
  async getNewRegistrations(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<unknown> {
    return this.metricsService.getNewRegistrations(startDate, endDate);
  }

  @Get('users/analytics/active')
  @ApiOperation({
    summary: 'Get active users',
    description: 'Retrieve the count of active users within a date range',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    example: '2024-01-01',
    description: 'Start date for the analytics period (YYYY-MM-DD format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    example: '2024-12-31',
    description: 'End date for the analytics period (YYYY-MM-DD format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active users count retrieved successfully',
  })
  async getActiveUsers(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<unknown> {
    return this.metricsService.getActiveUsers(startDate, endDate);
  }

  @Get('users/analytics/retention')
  @ApiOperation({
    summary: 'Get user retention',
    description: 'Retrieve user retention metrics for a specific cohort',
  })
  @ApiQuery({
    name: 'cohortStartDate',
    required: false,
    type: String,
    example: '2024-01-01',
    description:
      'Start date of the cohort period (YYYY-MM-DD format). Can also use startDate.',
  })
  @ApiQuery({
    name: 'cohortEndDate',
    required: false,
    type: String,
    example: '2024-01-31',
    description:
      'End date of the cohort period (YYYY-MM-DD format). Can also use endDate.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Alias for cohortStartDate',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Alias for cohortEndDate',
  })
  @ApiQuery({
    name: 'daysAfter',
    required: false,
    type: Number,
    example: 7,
    description: 'Days after registration to check retention (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'User retention metrics retrieved successfully',
  })
  async getUserRetention(
    @Query('cohortStartDate') cohortStartDate?: string,
    @Query('cohortEndDate') cohortEndDate?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('daysAfter') daysAfter?: number,
  ): Promise<unknown> {
    const start = cohortStartDate || startDate;
    const end = cohortEndDate || endDate;

    if (!start || !end) {
      throw new BadRequestException(
        'Both start date and end date are required (use cohortStartDate/cohortEndDate or startDate/endDate)',
      );
    }

    return this.metricsService.getUserRetention(start, end, daysAfter);
  }

  @Get('songs/top')
  @ApiOperation({
    summary: 'Get top songs by plays',
    description: 'Retrieve the top songs based on play count',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of top songs to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top songs retrieved successfully',
  })
  async getTopSongs(@Query('limit') limit?: number): Promise<unknown> {
    return this.metricsService.getTopSongs(limit);
  }

  @Get('albums/top')
  @ApiOperation({
    summary: 'Get top albums by plays',
    description: 'Retrieve the top albums based on total plays of their songs',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of top albums to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top albums retrieved successfully',
  })
  async getTopAlbums(@Query('limit') limit?: number): Promise<unknown> {
    return this.metricsService.getTopAlbums(limit);
  }

  @Get('artists/top')
  @ApiOperation({
    summary: 'Get top artists by monthly listeners',
    description: 'Retrieve the top artists based on monthly listeners',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of top artists to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top artists retrieved successfully',
  })
  async getTopArtists(@Query('limit') limit?: number): Promise<unknown> {
    return this.metricsService.getTopArtists(limit);
  }

  @Get('users/:userId/analytics/content')
  @ApiOperation({
    summary: 'Get user content preferences and listening stats',
    description:
      'Retrieve user content analytics including top songs, artists, and listening statistics',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    type: String,
    example: 'user-123',
    description: 'Unique identifier for the user',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2024-01-01',
    description: 'Start date for filtering (optional)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2024-12-31',
    description: 'End date for filtering (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'User content analytics retrieved successfully',
  })
  async getUserContentAnalytics(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<unknown> {
    return this.metricsService.getUserContentAnalytics(
      userId,
      startDate,
      endDate,
    );
  }

  @Get('users/:userId/analytics/patterns')
  @ApiOperation({
    summary: 'Get user activity patterns',
    description:
      'Retrieve user activity patterns including peak hours and activity statistics',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    type: String,
    example: 'user-123',
    description: 'Unique identifier for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User activity patterns retrieved successfully',
  })
  async getUserActivityPatterns(
    @Param('userId') userId: string,
  ): Promise<unknown> {
    return this.metricsService.getUserActivityPatterns(userId);
  }

  @Get('users/export')
  @ApiOperation({
    summary: 'Export user metrics to CSV or JSON',
    description:
      'Export user metrics data within a date range in CSV or JSON format',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    example: '2024-01-01',
    description: 'Start date for export',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    example: '2024-12-31',
    description: 'End date for export',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    type: String,
    example: 'csv',
    description: 'Export format (csv or json)',
    enum: ['csv', 'json'],
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics exported successfully',
  })
  async exportUserMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format?: 'csv' | 'json',
  ): Promise<unknown> {
    return this.metricsService.exportUserMetrics(startDate, endDate, format);
  }

  @Post('artists')
  @ApiOperation({
    summary: 'Create a new artist',
    description: 'Create a new artist metrics record',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        artistId: {
          type: 'string',
          description: 'Unique identifier for the artist',
          example: 'artist-123',
        },
      },
      required: ['artistId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Artist created successfully',
  })
  async createArtist(@Body('artistId') artistId: string): Promise<void> {
    return this.metricsService.recordArtistCreation(artistId);
  }

  @Get('artists')
  @ApiOperation({
    summary: 'Get metrics for all artists',
    description:
      'Retrieve metrics for all artists with pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    description: 'Time period for metrics (default: monthly)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for custom period (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for custom period (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'All artists metrics retrieved successfully',
  })
  async getAllArtistsMetrics(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<unknown> {
    return this.metricsService.getAllArtistsMetrics(
      page,
      limit,
      period,
      startDate,
      endDate,
    );
  }

  @Get('artists/export')
  @ApiOperation({
    summary: 'Export metrics for all artists as CSV',
    description: 'Export metrics for all artists as CSV',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    description: 'Time period for metrics (default: monthly)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for custom period (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for custom period (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file exported successfully',
  })
  async exportArtistsMetrics(
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<unknown> {
    return this.metricsService.exportArtistsMetrics(period, startDate, endDate);
  }

  @Post('artists/:artistId/listeners')
  @ApiOperation({
    summary: 'Add a listener to an artist',
    description: 'Record a new listener for an artist',
  })
  @ApiParam({
    name: 'artistId',
    required: true,
    type: String,
    description: 'Unique identifier for the artist',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'Unique identifier for the user',
          example: 'user-456',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Artist listener recorded successfully',
  })
  async addArtistListener(
    @Param('artistId') artistId: string,
    @Body('userId') userId: string,
  ): Promise<void> {
    return this.metricsService.addArtistListener(artistId, userId);
  }

  @Get('artists/:artistId/monthly-listeners')
  @ApiOperation({
    summary: 'Get monthly listeners for an artist',
    description: 'Retrieve the count of monthly listeners for an artist',
  })
  @ApiParam({
    name: 'artistId',
    required: true,
    type: String,
    description: 'Unique identifier for the artist',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly listeners retrieved successfully',
  })
  async getArtistMonthlyListeners(
    @Param('artistId') artistId: string,
  ): Promise<unknown> {
    return this.metricsService.getArtistMonthlyListeners(artistId);
  }

  @Delete('artists/:artistId')
  @ApiOperation({
    summary: 'Delete an artist',
    description: 'Delete an artist metrics record',
  })
  @ApiParam({
    name: 'artistId',
    required: true,
    type: String,
    description: 'Unique identifier for the artist',
  })
  @ApiResponse({
    status: 200,
    description: 'Artist deleted successfully',
  })
  async deleteArtist(@Param('artistId') artistId: string): Promise<void> {
    return this.metricsService.deleteArtist(artistId);
  }

  @Get('artists/:artistId')
  @ApiOperation({
    summary: 'Get full metrics for an artist',
    description: 'Retrieve full metrics for a specific artist',
  })
  @ApiParam({
    name: 'artistId',
    required: true,
    type: String,
    description: 'Unique identifier for the artist',
  })
  @ApiQuery({
    name: 'region',
    required: false,
    type: String,
    description: 'Filter metrics by region',
  })
  @ApiResponse({
    status: 200,
    description: 'Artist metrics retrieved successfully',
  })
  async getArtistMetrics(
    @Param('artistId') artistId: string,
    @Query('region') region?: string,
  ): Promise<unknown> {
    return this.metricsService.getArtistMetrics(artistId, region);
  }

  @Post('artists/:artistId/followers')
  @ApiOperation({
    summary: 'Add a follower to an artist',
    description: 'Record a new follower for an artist',
  })
  @ApiParam({
    name: 'artistId',
    required: true,
    type: String,
    description: 'Unique identifier for the artist',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'Unique identifier for the user',
          example: 'user-456',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Artist follower recorded successfully',
  })
  async addArtistFollower(
    @Param('artistId') artistId: string,
    @Body('userId') userId: string,
  ): Promise<void> {
    return this.metricsService.addArtistFollower(artistId, userId);
  }

  @Delete('artists/:artistId/followers/:userId')
  @ApiOperation({
    summary: 'Remove a follower from an artist',
    description: 'Remove a follower from an artist',
  })
  @ApiParam({
    name: 'artistId',
    required: true,
    type: String,
    description: 'Unique identifier for the artist',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    type: String,
    description: 'Unique identifier for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Artist follower removed successfully',
  })
  async removeArtistFollower(
    @Param('artistId') artistId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.metricsService.removeArtistFollower(artistId, userId);
  }
}
