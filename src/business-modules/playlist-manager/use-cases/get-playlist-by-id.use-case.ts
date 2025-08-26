import { Injectable, NotFoundException } from '@nestjs/common';
import { UUID } from 'crypto';
import { PlaylistRepository } from 'src/entity-modules/playlist/playlist.repository';
import { PlaylistDTO } from '../dtos/playlist.dto';

@Injectable()
export class GetPlaylistByIdUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(id: UUID): Promise<PlaylistDTO> {
    const playlist = await this.playlistRepository.findOne(
      { id },
      { populate: ['songs', 'songs.song'] },
    );
    if (playlist === null)
      throw new NotFoundException(
        `Playlist with ID ${id} not found`,
        'Playlist not found',
      );
    return playlist.toDTO(PlaylistDTO);
  }
}
