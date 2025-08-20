import { Module } from "@nestjs/common";
import { SongModule } from "src/entity-modules/song/song.module";

@Module({
  controllers: [],
  providers: [
    
  ],
  imports: [SongModule],
})
export class SongManagerModule {}
