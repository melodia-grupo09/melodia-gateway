import { Injectable, NotFoundException } from '@nestjs/common';
import { UUID } from 'crypto';
import { PlaylistRepository } from 'src/entity-modules/playlist/playlist.repository';
import { SongRepository } from 'src/entity-modules/song/song.repository';
import { PlaylistDTO } from '../dtos/playlist.dto';

@Injectable()
export class AddSongToPlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly songRepository: SongRepository,
  ) {}

  async execute(playlistId: UUID, songId: UUID): Promise<PlaylistDTO> {
    const song = await this.songRepository.findOne({ id: songId });
    if (song === null) {
      throw new NotFoundException(
        'Song not found',
        `Song with ID ${songId} not found`,
      );
    }
    const playlist = await this.playlistRepository.findOne(
      { id: playlistId },
      { populate: ['songs', 'songs.song'] },
    );

    if (!playlist) {
      throw new NotFoundException(
        'Playlist not found',
        `Playlist with ID ${playlistId} not found`,
      );
    }

    playlist.addSong(song);
    await this.playlistRepository.persistAndFlush(playlist);
    return playlist.toDTO(PlaylistDTO);
  }
}
