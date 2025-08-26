import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Playlist } from './playlist.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Playlist])],
  controllers: [],
  providers: [],
  exports: [MikroOrmModule.forFeature([Playlist])],
})
export class PlaylistModule {}
