import { Injectable } from '@nestjs/common';
import { PlaylistRepository } from 'src/entity-modules/playlist/playlist.repository';
import { PlaylistDTO } from '../dtos/playlist.dto';

@Injectable()
export class GetPlaylistsUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(): Promise<PlaylistDTO[]> {
    const playlists = await this.playlistRepository.findAll({
      populate: ['songs', 'songs.song'],
    });
    return playlists.map((playlist) => playlist.toDTO(PlaylistDTO));
  }
}
