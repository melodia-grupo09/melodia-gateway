import { Injectable } from "@nestjs/common";
import { PlaylistRepository } from "src/entity-modules/playlist/playlist.repository";
import { CreatePlaylistDTO, PlaylistDTO } from "../dtos/playlist.dto";

@Injectable()
export class CreatePlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository
  ) {}

  async execute(playlistCreateDto: CreatePlaylistDTO): Promise<PlaylistDTO> {
    const playlist = this.playlistRepository.create(playlistCreateDto);
    await this.playlistRepository.flush();
    return playlist.toDTO(PlaylistDTO);
  }
}
