import { Module } from '@nestjs/common';
import { ResponseFormatInterceptor } from './framework/interceptors/response-format.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
  ],
})
export class AppModule {}
