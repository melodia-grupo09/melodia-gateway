import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CreateArtistMetricDto } from './dto/create-artist-metric.dto';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
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
    required: true,
    type: String,
    example: '2024-01-01',
    description: 'Start date of the cohort period (YYYY-MM-DD format)',
  })
  @ApiQuery({
    name: 'cohortEndDate',
    required: true,
    type: String,
    example: '2024-01-31',
    description: 'End date of the cohort period (YYYY-MM-DD format)',
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
    @Query('cohortStartDate') cohortStartDate: string,
    @Query('cohortEndDate') cohortEndDate: string,
    @Query('daysAfter') daysAfter?: number,
  ): Promise<unknown> {
    return this.metricsService.getUserRetention(
      cohortStartDate,
      cohortEndDate,
      daysAfter,
    );
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

  @Post('artists')
  @ApiOperation({
    summary: 'Create a new artist',
    description: 'Record the creation of a new artist in the metrics system',
  })
  @ApiBody({
    type: CreateArtistMetricDto,
    description: 'Artist creation data',
    examples: {
      createArtist: {
        summary: 'Create artist example',
        value: {
          artistId: 'artist-123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Artist created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createArtist(
    @Body() createArtistMetricDto: CreateArtistMetricDto,
  ): Promise<void> {
    await this.metricsService.recordArtistCreation(
      createArtistMetricDto.artistId,
    );
  }
}
