import { MikroORM } from "@mikro-orm/core";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UUID } from "crypto";
import { CreateSongDTO, SongDTO } from "src/business-modules/song-manager/dtos/song.dto";
import { SongRepository } from "src/entity-modules/song/song.repository";

@Injectable()
export class GetSongByIdUseCase {
  constructor(
    private readonly songRepository: SongRepository
  ) {}

  async execute(id: UUID): Promise<SongDTO> {
    const song = await this.songRepository.findOne({ id })
    if (song === null) throw new NotFoundException(`Song with ID ${id} not found`);
    return song.toDTO(SongDTO);
  }
}
