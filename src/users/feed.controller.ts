import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ShareSongsDto } from './dto/share-songs.dto';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { UsersService } from './users.service';

@ApiTags('feed')
@UseInterceptors(HttpErrorInterceptor)
@Controller('feed')
export class FeedController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':uid/share')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Share songs to user feed' })
  @ApiResponse({
    status: 200,
    description: 'Songs shared successfully',
  })
  async shareSongs(
    @Param('uid') uid: string,
    @Body() shareSongsDto: ShareSongsDto,
  ): Promise<any> {
    return this.usersService.shareSongs(uid, shareSongsDto);
  }

  @Get(':uid')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user feed' })
  @ApiResponse({
    status: 200,
    description: 'User feed retrieved successfully',
  })
  async getUserFeed(@Param('uid') uid: string): Promise<any> {
    return this.usersService.getUserFeed(uid);
  }

  @Delete(':uid/songs')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove songs from feed' })
  @ApiResponse({
    status: 200,
    description: 'Songs removed from feed successfully',
  })
  async removeSongsFromFeed(
    @Param('uid') uid: string,
    @Query('song_ids') songIds: string[],
  ): Promise<any> {
    // Ensure songIds is an array, as single query param might be string
    const ids = Array.isArray(songIds) ? songIds : [songIds];
    return this.usersService.removeSongsFromFeed(uid, ids);
  }
}
