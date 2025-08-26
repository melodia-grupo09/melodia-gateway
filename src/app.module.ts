import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from 'mikro-orm.config';
import { SongManagerModule } from './business-modules/song-manager/song-manager.module';
import { ResponseFormatInterceptor } from './framework/interceptors/response-format.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PlaylistManagerModule } from './business-modules/playlist-manager/playlist-manager.module';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...mikroOrmConfig,
    }),
    SongManagerModule,
    PlaylistManagerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
    AppService
  ],
})
export class AppModule {}
