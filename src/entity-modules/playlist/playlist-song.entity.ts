import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Playlist } from './playlist.entity';
import { Song } from '../song/song.entity';

@Entity()
export class PlaylistSong {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => Playlist)
  playlist: Playlist;

  @ManyToOne(() => Song)
  song: Song;

  @Property()
  addedAt: Date = new Date();

  constructor(playlist: Playlist, song: Song) {
    this.playlist = playlist;
    this.song = song;
  }
}
