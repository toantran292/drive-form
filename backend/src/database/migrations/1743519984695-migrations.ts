import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1743519984695 implements MigrationInterface {
  name = 'Migrations1743519984695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_code" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c72914cf54969efa1c7780847ec" UNIQUE ("project_code"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectCode" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "creatorUid" character varying, "categoryId" uuid NOT NULL, CONSTRAINT "UQ_14a029aa203bd962ed268ba1bcf" UNIQUE ("projectCode"), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "phases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phaseCode" character varying NOT NULL, "name" character varying NOT NULL, "projectId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ee802b2e713b6d22fa94296c1b0" UNIQUE ("phaseCode"), CONSTRAINT "PK_e93bb53460b28d4daf72735d5d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_users" ("project_id" uuid NOT NULL, "user_uid" character varying NOT NULL, CONSTRAINT "PK_cada25ed0043d97b1fdec977bd8" PRIMARY KEY ("project_id", "user_uid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3a53b25fef9b1ac81501a2816a" ON "project_users" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3415ff9fdb952a28095c18cde" ON "project_users" ("user_uid") `,
    );
    await queryRunner.query(`ALTER TABLE "forms" ADD "phase_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "forms" ALTER COLUMN "settings" SET DEFAULT '{"theme":{"color":"#1a73e8","font":"Default"},"collectEmail":false,"limitOneResponsePerUser":false,"showProgressBar":true,"shuffleQuestions":false,"confirmationMessage":"Phản hồi của bạn đã được gửi.","isPublished":false,"allowAnonymous":false,"acceptingResponses":true}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_3924af4bb3ab4a2adc8ae2b3dc3" FOREIGN KEY ("creatorUid") REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_b7d7d44e0e33834351af221757d" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "phases" ADD CONSTRAINT "FK_5cc8558954b6360a5b7fb5f45fa" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forms" ADD CONSTRAINT "FK_c9d6c7409b918041fe6dc671a10" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_users" ADD CONSTRAINT "FK_3a53b25fef9b1ac81501a2816a5" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_users" ADD CONSTRAINT "FK_a3415ff9fdb952a28095c18cdef" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_users" DROP CONSTRAINT "FK_a3415ff9fdb952a28095c18cdef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_users" DROP CONSTRAINT "FK_3a53b25fef9b1ac81501a2816a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forms" DROP CONSTRAINT "FK_c9d6c7409b918041fe6dc671a10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phases" DROP CONSTRAINT "FK_5cc8558954b6360a5b7fb5f45fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_b7d7d44e0e33834351af221757d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_3924af4bb3ab4a2adc8ae2b3dc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forms" ALTER COLUMN "settings" SET DEFAULT '{"theme": {"font": "Default", "color": "#1a73e8"}, "isPublished": false, "collectEmail": false, "allowAnonymous": false, "showProgressBar": true, "shuffleQuestions": false, "acceptingResponses": true, "confirmationMessage": "Your response has been recorded.", "limitOneResponsePerUser": false}'`,
    );
    await queryRunner.query(`ALTER TABLE "forms" DROP COLUMN "phase_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3415ff9fdb952a28095c18cde"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3a53b25fef9b1ac81501a2816a"`,
    );
    await queryRunner.query(`DROP TABLE "project_users"`);
    await queryRunner.query(`DROP TABLE "phases"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
