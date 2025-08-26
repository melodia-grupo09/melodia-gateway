import { Migration } from '@mikro-orm/migrations';

export class Migration20250820044252_addSongEntity extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "song" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "artist" varchar(255) not null, constraint "song_pkey" primary key ("id"));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "song" cascade;`);
  }
}
