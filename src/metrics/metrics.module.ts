import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('METRICS_SERVICE_URL') ?? '',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
