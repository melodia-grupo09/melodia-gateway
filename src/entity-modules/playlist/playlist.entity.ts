import {
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from '../base.entity';
import { PlaylistRepository } from './playlist.repository';
import { PlaylistSong } from './playlist-song.entity';
import { Song } from '../song/song.entity';

@Entity({ repository: () => PlaylistRepository })
export class Playlist extends BaseEntity<
  Playlist,
  'isPublished' | 'publishedAt' | 'songs'
> {
  [EntityRepositoryType]: PlaylistRepository;

  @Property({ nullable: false })
  name: string;

  @Property({ nullable: false })
  description: string;

  @Property({ nullable: false })
  isPublished: boolean = true;

  @Property({ nullable: false })
  publishedAt: Date = new Date();

  @OneToMany(() => PlaylistSong, (playlistSong) => playlistSong.playlist, {
    serializer: (value: PlaylistSong[]) =>
      value
        .map(
          (link: PlaylistSong) =>
            Object.assign(link.song, { addedAt: link.addedAt }) as Song & {
              addedAt: Date;
            },
        )
        .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime()),
  })
  songs = new Collection<PlaylistSong>(this);

  constructor(name: string, description: string) {
    super();
    this.name = name;
    this.description = description;
  }

  addSong(song: Song) {
    const playlistSong = new PlaylistSong(this, song);
    this.songs.add(playlistSong);
  }

  publish() {
    this.isPublished = true;
    this.publishedAt = new Date();
  }
}
