import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  // Endpoints will be implemented in the next step
}