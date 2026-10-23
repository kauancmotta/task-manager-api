import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchemas1790874021045 implements MigrationInterface {
  name = 'InitialSchemas1790874021045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "color" character varying NOT NULL, "created_by_user_id" uuid NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_attachments" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "file_url" character varying NOT NULL, "file_name" character varying NOT NULL, "file_size" integer NOT NULL, "mime_type" character varying NOT NULL, "task_id" uuid NOT NULL, "uploaded_by_user_id" uuid NOT NULL, CONSTRAINT "PK_34eb9e5133310a488eaba0be28a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('todo', 'pending', 'in_progress', 'done')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" character varying, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'todo', "priority" integer NOT NULL DEFAULT '1', "due_date" TIMESTAMP WITH TIME ZONE, "created_by_user_id" uuid NOT NULL, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_assignees" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "task_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_e23bc1438f7bb32f41e8d493e78" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "refresh_token" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "email" character varying NOT NULL, "avatar_url" character varying, "password" character varying, "google_id" character varying, "is_email_verified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."email_verifications_type_enum" AS ENUM('email_confirmation', 'email_verified', 'email_change', 'password_reset', 'password_changed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_verifications" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "token" character varying NOT NULL, "type" "public"."email_verifications_type_enum" NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_595be4c36e66b21d3fd14c73a24" UNIQUE ("token"), CONSTRAINT "PK_c1ea2921e767f83cd44c0af203f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_categories" ("task_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_6102b120e4b7cace4607e857094" PRIMARY KEY ("task_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d8679aec1b4057bb0109cc587" ON "task_categories"  ("task_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c980a208989aa8de8a88092b4c" ON "task_categories"  ("category_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_created_by_user_id" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD CONSTRAINT "fk_task_attachments_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD CONSTRAINT "fk_task_attachments_uploaded_by_user_id" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_created_by_user_id" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD CONSTRAINT "fk_task_assignees_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD CONSTRAINT "fk_task_assignees_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verifications" ADD CONSTRAINT "fk_email_verifications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_categories" ADD CONSTRAINT "fk_task_categories_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_categories" ADD CONSTRAINT "fk_task_categories_category_id" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_categories" DROP CONSTRAINT "fk_task_categories_category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_categories" DROP CONSTRAINT "fk_task_categories_task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_verifications" DROP CONSTRAINT "fk_email_verifications_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "fk_refresh_tokens_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP CONSTRAINT "fk_task_assignees_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP CONSTRAINT "fk_task_assignees_task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "fk_tasks_created_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP CONSTRAINT "fk_task_attachments_uploaded_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP CONSTRAINT "fk_task_attachments_task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "fk_categories_created_by_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c980a208989aa8de8a88092b4c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d8679aec1b4057bb0109cc587"`,
    );
    await queryRunner.query(`DROP TABLE "task_categories"`);
    await queryRunner.query(`DROP TABLE "email_verifications"`);
    await queryRunner.query(
      `DROP TYPE "public"."email_verifications_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "task_assignees"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TABLE "task_attachments"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
