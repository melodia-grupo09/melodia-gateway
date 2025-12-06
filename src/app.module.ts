import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { ArtistsModule } from './artists/artists.module';
import { CatalogModule } from './catalog/catalog.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
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
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        url:
          configService.get('REDIS_URL') ||
          configService.get('REDISCLOUD_URL') ||
          'redis://localhost:6379',
      }),
      inject: [ConfigService],
    }),
    ArtistsModule,
    MetricsModule,
    PlaylistsModule,
    ReleasesModule,
    SongsModule,
    UsersModule,
    NotificationsModule,
    CatalogModule,
  ],
  providers: [],
})
export class AppModule {}
