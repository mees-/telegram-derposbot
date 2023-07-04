import { Migration } from '@mikro-orm/migrations';

export class Migration20230407125128 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "user" add column "nickname" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "nickname";');
  }
}
