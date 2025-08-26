import { Collection, Entity, EntityRepositoryType, ManyToMany, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "../base.entity";
import { SongRepository } from "./song.repository";
import { Playlist } from "../playlist/playlist.entity";
import { PlaylistSong } from "../playlist/playlist-song.entity";


@Entity({ repository: () => SongRepository })
export class Song extends BaseEntity<Song> {
  [EntityRepositoryType]: SongRepository;

  @Property({ nullable: false })
  name: string;

  @Property({ nullable: false })
  artist: string;

  @OneToMany(() => PlaylistSong, playlistSong => playlistSong.song)
  playlistLinks = new Collection<PlaylistSong>(this);

  constructor(
    name: string,
    artist: string,
  ) {
    super();
    this.name = name;
    this.artist = artist;
  }
}
