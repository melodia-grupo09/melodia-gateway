import { Injectable, NotFoundException } from '@nestjs/common';
import { UUID } from 'crypto';
import { PlaylistRepository } from 'src/entity-modules/playlist/playlist.repository';
import { PlaylistDTO } from '../dtos/playlist.dto';

@Injectable()
export class PublishPlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(playlistId: UUID): Promise<PlaylistDTO> {
    const playlist = await this.playlistRepository.findOne(
      { id: playlistId },
      { populate: ['songs', 'songs.song'] },
    );

    if (!playlist) {
      throw new NotFoundException(
        `Playlist with ID ${playlistId} not found`,
        'Playlist not found',
      );
    }

    playlist.publish();
    await this.playlistRepository.persistAndFlush(playlist);
    return playlist.toDTO(PlaylistDTO);
  }
}
