import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ArtistsModule } from './artists/artists.module';
import { MetricsModule } from './metrics/metrics.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { ReleasesModule } from './releases/releases.module';
import { SongsModule } from './songs/songs.module';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ArtistsModule,
    MetricsModule,
    PlaylistsModule,
    ReleasesModule,
    SongsModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
