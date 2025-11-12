import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('ARTISTS_SERVICE_URL') ?? '',
        timeout: 10000,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ReleasesController],
  providers: [ReleasesService],
})
export class ReleasesModule {}
