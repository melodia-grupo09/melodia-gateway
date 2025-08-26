import { Migration } from '@mikro-orm/migrations';

export class Migration20250825235816_addPlaylistEntities extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "playlist" ("id" uuid not null, "name" varchar(255) not null, "description" varchar(255) not null, "is_published" boolean not null default true, "published_at" timestamptz not null, constraint "playlist_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "playlist_song" ("id" serial primary key, "playlist_id" uuid not null, "song_id" uuid not null, "added_at" timestamptz not null);`,
    );

    this.addSql(
      `alter table "playlist_song" add constraint "playlist_song_playlist_id_foreign" foreign key ("playlist_id") references "playlist" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "playlist_song" add constraint "playlist_song_song_id_foreign" foreign key ("song_id") references "song" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "playlist_song" drop constraint "playlist_song_playlist_id_foreign";`,
    );

    this.addSql(
      `alter table "playlist_song" drop constraint "playlist_song_song_id_foreign";`,
    );

    this.addSql(`drop table if exists "playlist" cascade;`);

    this.addSql(`drop table if exists "playlist_song" cascade;`);
  }
}
