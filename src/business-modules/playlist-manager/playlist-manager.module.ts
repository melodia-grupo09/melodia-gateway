import { Module } from '@nestjs/common';
import { SongModule } from 'src/entity-modules/song/song.module';
import { PlaylistModule } from 'src/entity-modules/playlist/playlist.module';
import { PlaylistManagerController } from './playlist-manager.controller';
import { GetPlaylistsUseCase } from './use-cases/get-playlists.use-case';
import { GetPlaylistByIdUseCase } from './use-cases/get-playlist-by-id.use-case';
import { CreatePlaylistUseCase } from './use-cases/create-playlist.use-case';
import { DeletePlaylistUseCase } from './use-cases/delete-playlist.use-case';
import { AddSongToPlaylistUseCase } from './use-cases/add-song-to-playlist.use-case';
import { PublishPlaylistUseCase } from './use-cases/publish-playlist.use-case';
import { UnpublishPlaylistUseCase } from './use-cases/unpublish-playlist.use-case';

@Module({
  controllers: [PlaylistManagerController],
  providers: [
    GetPlaylistsUseCase,
    GetPlaylistByIdUseCase,
    CreatePlaylistUseCase,
    DeletePlaylistUseCase,
    AddSongToPlaylistUseCase,
    PublishPlaylistUseCase,
    UnpublishPlaylistUseCase,
  ],
  imports: [SongModule, PlaylistModule],
})
export class PlaylistManagerModule {}
