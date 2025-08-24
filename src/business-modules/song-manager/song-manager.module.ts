import { Module } from "@nestjs/common";
import { SongModule } from "src/entity-modules/song/song.module";
import { SongsController } from "./song-manager.controller";
import { GetSongsUseCase } from "./use-cases/get-songs.use-case";
import { CreateSongUseCase } from "./use-cases/create-song.use-case";
import { GetSongByIdUseCase } from "./use-cases/get-song-by-id.use-case";
import { UpdateSongUseCase } from "./use-cases/update-song.use-case";
import { DeleteSongUseCase } from "./use-cases/delete-song.use-case";

@Module({
  controllers: [SongsController],
  providers: [
    GetSongsUseCase,
    CreateSongUseCase,
    GetSongByIdUseCase,
    UpdateSongUseCase,
    DeleteSongUseCase
    
  ],
  imports: [SongModule],
})
export class SongManagerModule {}
