import { Injectable } from '@nestjs/common';
import { PlaylistRepository } from 'src/entity-modules/playlist/playlist.repository';
import { PlaylistDTO } from '../dtos/playlist.dto';

@Injectable()
export class GetPlaylistsUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(
    onlyPublished: boolean,
    {
      sortField,
      sortDirection,
    }: { sortField: keyof PlaylistDTO; sortDirection: 'asc' | 'desc' },
  ): Promise<PlaylistDTO[]> {
    const whereCondition = onlyPublished ? { isPublished: true } : {};
    const playlists = await this.playlistRepository.findAll({
      where: whereCondition,
      populate: ['songs', 'songs.song'],
      orderBy: {
        [sortField]: sortDirection,
      },
    });
    return playlists.map((playlist) => playlist.toDTO(PlaylistDTO));
  }
}
