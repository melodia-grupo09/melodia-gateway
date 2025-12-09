import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { HttpErrorInterceptor } from '../users/interceptors/http-error.interceptor';
import { ReleasesService } from './releases.service';

@ApiTags('releases')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@UseInterceptors(HttpErrorInterceptor)
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search releases by title' })
  @ApiResponse({
    status: 200,
    description: 'Releases found matching the search query',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters',
  })
  async searchReleases(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.releasesService.searchReleases(query, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get release by ID with artist information' })
  @ApiParam({
    name: 'id',
    description: 'Release ID (UUID format)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Release found with artist information',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Release not found',
  })
  async getReleaseById(@Param('id') id: string): Promise<any> {
    return this.releasesService.getReleaseById(id);
  }
}
