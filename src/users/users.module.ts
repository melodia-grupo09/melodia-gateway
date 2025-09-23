import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.USER_SERVICE_URL || 'https://localhost:8000',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
