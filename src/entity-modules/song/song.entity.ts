import {
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from '../base.entity';
import { SongRepository } from './song.repository';
import { PlaylistSong } from '../playlist/playlist-song.entity';

@Entity({ repository: () => SongRepository })
export class Song extends BaseEntity<Song> {
  [EntityRepositoryType]: SongRepository;

  @Property({ nullable: false })
  title: string;

  @Property({ nullable: false })
  artist: string;

  @OneToMany(() => PlaylistSong, (playlistSong) => playlistSong.song)
  playlistLinks = new Collection<PlaylistSong>(this);

  constructor(title: string, artist: string) {
    super();
    this.title = title;
    this.artist = artist;
  }
}
