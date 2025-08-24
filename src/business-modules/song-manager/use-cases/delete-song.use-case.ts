import { Injectable, NotFoundException } from "@nestjs/common";
import { UUID } from "crypto";
import { SongRepository } from "src/entity-modules/song/song.repository";

@Injectable()
export class DeleteSongUseCase {
  constructor(
    private readonly songRepository: SongRepository
  ) {}

  async execute(id: UUID): Promise<void> {
    const song = await this.songRepository.findOne({ id })
    if (song === null) throw new NotFoundException(`Song with ID ${id} not found`);
    this.songRepository.delete(song);
    await this.songRepository.flush();
  }
}
