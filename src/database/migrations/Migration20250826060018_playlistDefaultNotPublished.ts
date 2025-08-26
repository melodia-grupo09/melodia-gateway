import { Migration } from '@mikro-orm/migrations';

export class Migration20250826060018_playlistDefaultNotPublished extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "playlist" alter column "is_published" type boolean using ("is_published"::boolean);`,
    );
    this.addSql(
      `alter table "playlist" alter column "is_published" set default false;`,
    );
    this.addSql(
      `alter table "playlist" alter column "published_at" type timestamptz using ("published_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "playlist" alter column "published_at" drop not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "playlist" alter column "is_published" type boolean using ("is_published"::boolean);`,
    );
    this.addSql(
      `alter table "playlist" alter column "is_published" set default true;`,
    );
    this.addSql(
      `alter table "playlist" alter column "published_at" type timestamptz using ("published_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "playlist" alter column "published_at" set not null;`,
    );
  }
}
