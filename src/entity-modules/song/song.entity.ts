import { Entity, EntityRepositoryType, Property } from "@mikro-orm/core";
import { BaseEntity } from "../base.entity";
import { SongRepository } from "./song.repository";


@Entity({ repository: () => SongRepository })
export class Song extends BaseEntity<Song> {
  [EntityRepositoryType]: SongRepository;

  @Property({ nullable: false })
  name: string;

  @Property({ nullable: false })
  artist: string;

  constructor(
    name: string,
    artist: string,
  ) {
    super();
    this.name = name;
    this.artist = artist;
  }
}
