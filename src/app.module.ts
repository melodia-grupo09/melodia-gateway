import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from 'mikro-orm.config';
import { SongManagerModule } from './business-modules/song-manager/song-manager.module';
import { ResponseFormatInterceptor } from './framework/interceptors/response-format.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PlaylistManagerModule } from './business-modules/playlist-manager/playlist-manager.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    MikroOrmModule.forRoot({
      ...mikroOrmConfig,
    }),
    SongManagerModule,
    PlaylistManagerModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
  ],
})
export class AppModule {}
