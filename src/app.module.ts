import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from 'mikro-orm.config';
import { SongManagerModule } from './business-modules/song-manager/song-manager.module';

@Module({
  imports: [
    SongManagerModule,
    MikroOrmModule.forRoot({
      ...mikroOrmConfig,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
