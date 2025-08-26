import { Injectable, NotFoundException } from '@nestjs/common';
import { UUID } from 'crypto';
import {
  SongDTO,
  UpdateSongDTO,
} from 'src/business-modules/song-manager/dtos/song.dto';
import { SongRepository } from 'src/entity-modules/song/song.repository';

@Injectable()
export class UpdateSongUseCase {
  constructor(private readonly songRepository: SongRepository) {}

  async execute(id: UUID, updateSongDto: UpdateSongDTO): Promise<SongDTO> {
    const song = await this.songRepository.findOne({ id });
    if (song === null)
      throw new NotFoundException(`Song with ID ${id} not found`);
    song.assign(updateSongDto);
    await this.songRepository.getEntityManager().persistAndFlush(song);
    return song.toDTO(SongDTO);
  }
}
