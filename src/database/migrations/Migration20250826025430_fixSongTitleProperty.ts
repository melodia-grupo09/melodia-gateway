import { Migration } from '@mikro-orm/migrations';

export class Migration20250826025430_fixSongTitleProperty extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "song" rename column "name" to "title";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "song" rename column "title" to "name";`);
  }
}
