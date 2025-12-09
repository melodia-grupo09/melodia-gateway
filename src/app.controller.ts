import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetricsService } from './metrics/metrics.service';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';

interface HealthCheckResponse {
  status: string;
  topSongs?: unknown;
  topAlbums?: unknown;
  topArtists?: unknown;
  metricsError?: string;
}

@ApiTags('health')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller()
export class AppController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint with top content' })
  @ApiResponse({
    status: 200,
    description: 'APIs healthcheck with top 10 songs, albums, and artists',
  })
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      // Get top 10 songs
      const topSongs: unknown = await this.metricsService.getTopSongs(10);

      // Get top 10 albums
      const topAlbums: unknown = await this.metricsService.getTopAlbums(10);

      // Get top 10 artists
      const topArtists: unknown = await this.metricsService.getTopArtists(10);

      return {
        status: 'ok',
        topSongs,
        topAlbums,
        topArtists,
      };
    } catch (error) {
      // If metrics service fails, still return healthy status but without metrics
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch metrics';

      return {
        status: 'ok',
        topSongs: undefined,
        topAlbums: undefined,
        topArtists: undefined,
        metricsError: errorMessage,
      };
    }
  }
}
