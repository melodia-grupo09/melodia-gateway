import { MikroORM } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateSongDTO, SongDTO } from "src/entity-modules/song/song.dto";
import { SongRepository } from "src/entity-modules/song/song.repository";

@Injectable()
export class CreateSongUseCase {
  constructor(
    private readonly em: EntityManager,
    private readonly songRepository: SongRepository
  ) {}

  async execute(songCreateDto: CreateSongDTO): Promise<SongDTO> {
    const song = this.songRepository.create(songCreateDto);
    await this.em.persistAndFlush(song);
    return song.toDTO(SongDTO);
  }
}
