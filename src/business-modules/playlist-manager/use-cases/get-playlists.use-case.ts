import { Injectable, NotFoundException } from "@nestjs/common";
import { SongDTO } from "src/business-modules/song-manager/dtos/song.dto";
import { PlaylistRepository } from "src/entity-modules/playlist/playlist.repository";
import { SongRepository } from "src/entity-modules/song/song.repository";
import { PlaylistDTO } from "../dtos/playlist.dto";

@Injectable()
export class GetPlaylistsUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository
  ) {}

  async execute(): Promise<PlaylistDTO[]> {
    const playlists = await this.playlistRepository.findAll({ populate: ['songs', 'songs.song'] });
    return playlists.map(playlist => playlist.toDTO(PlaylistDTO));
  }
}
