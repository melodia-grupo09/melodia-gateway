import { Injectable } from '@nestjs/common';
import {
  CreateSongDTO,
  SongDTO,
} from 'src/business-modules/song-manager/dtos/song.dto';
import { SongRepository } from 'src/entity-modules/song/song.repository';

@Injectable()
export class CreateSongUseCase {
  constructor(private readonly songRepository: SongRepository) {}

  async execute(songCreateDto: CreateSongDTO): Promise<SongDTO> {
    const song = this.songRepository.create(songCreateDto);
    await this.songRepository.flush();
    return song.toDTO(SongDTO);
  }
}
