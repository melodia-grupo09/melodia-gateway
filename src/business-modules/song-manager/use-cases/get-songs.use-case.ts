import { Injectable } from '@nestjs/common';
import { SongDTO } from 'src/business-modules/song-manager/dtos/song.dto';
import { SongRepository } from 'src/entity-modules/song/song.repository';

@Injectable()
export class GetSongsUseCase {
  constructor(private readonly songRepository: SongRepository) {}

  async execute(): Promise<SongDTO[]> {
    const songs = await this.songRepository.findAll();
    return songs.map((song) => song.toDTO(SongDTO));
  }
}
