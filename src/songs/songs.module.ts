import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('SONGS_SERVICE_URL') ?? '',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
