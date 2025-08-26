import { Injectable, NotFoundException } from '@nestjs/common';
import { UUID } from 'crypto';
import { PlaylistRepository } from 'src/entity-modules/playlist/playlist.repository';

@Injectable()
export class DeletePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(id: UUID): Promise<void> {
    const playlist = await this.playlistRepository.findOne({ id });
    if (playlist === null)
      throw new NotFoundException(
        `Playlist with ID ${id} not found`,
        'Playlist not found',
      );
    this.playlistRepository.delete(playlist);
    await this.playlistRepository.flush();
  }
}
