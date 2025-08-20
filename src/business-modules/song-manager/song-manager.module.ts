import { Module } from "@nestjs/common";
import { SongModule } from "src/entity-modules/song/song.module";
import { SongsController } from "./song-manager.controller";
import { GetSongsUseCase } from "./use-cases/get-songs.use-case";
import { CreateSongUseCase } from "./use-cases/create-song.use-case";

@Module({
  controllers: [SongsController],
  providers: [
    GetSongsUseCase,
    CreateSongUseCase,
    
  ],
  imports: [SongModule],
})
export class SongManagerModule {}
