import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1742531240692 implements MigrationInterface {
  name = 'Init1742531240692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "forms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "questions" jsonb DEFAULT '[]', "settings" jsonb DEFAULT '{"theme":{"color":"#1a73e8","font":"Default"},"collectEmail":false,"limitOneResponsePerUser":false,"showProgressBar":true,"shuffleQuestions":false,"confirmationMessage":"Your response has been recorded.","isPublished":false,"allowAnonymous":false,"acceptingResponses":true}', "owner_id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "modifiedAt" TIMESTAMP NOT NULL DEFAULT now(), "isPublic" boolean NOT NULL DEFAULT false, "shareId" character varying, "sharedWith" jsonb DEFAULT '[]', "isActive" boolean NOT NULL DEFAULT true, "responseCount" integer NOT NULL DEFAULT '0', "analytics" jsonb, CONSTRAINT "PK_ba062fd30b06814a60756f233da" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "form_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "formId" uuid NOT NULL, "respondentId" character varying, "answers" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "submittedAt" TIMESTAMP, "respondentUid" character varying, CONSTRAINT "PK_36a512e5574d0a366b40b26874e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("uid" character varying NOT NULL, "email" character varying NOT NULL, "displayName" character varying, "photoURL" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6e20ce1edf0678a09f1963f9587" PRIMARY KEY ("uid"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."drive_items_type_enum" AS ENUM('FILE', 'FOLDER', 'FORM')`,
    );
    await queryRunner.query(
      `CREATE TABLE "drive_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."drive_items_type_enum" NOT NULL, "mimeType" character varying, "size" integer, "storagePath" character varying, "downloadUrl" character varying, "ownerId" character varying NOT NULL, "parentId" uuid, "descendantIds" text array NOT NULL DEFAULT '{}', "descendants" jsonb NOT NULL DEFAULT '{}', "sharedWith" jsonb NOT NULL DEFAULT '[]', "formId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "modifiedAt" TIMESTAMP NOT NULL DEFAULT now(), "isPublic" boolean NOT NULL DEFAULT false, "shareId" character varying, "ownerUid" character varying, CONSTRAINT "UQ_950bbea303da3d049c22a2c886d" UNIQUE ("shareId"), CONSTRAINT "PK_0b728ec159f3e141c4904830943" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "forms" ADD CONSTRAINT "FK_b7fa0713ef35842141009064ff1" FOREIGN KEY ("owner_id") REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_responses" ADD CONSTRAINT "FK_8e9a32f15bd2485ea908787b634" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_responses" ADD CONSTRAINT "FK_ed1aee71d72c9f478a8d0ee2e90" FOREIGN KEY ("respondentUid") REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_items" ADD CONSTRAINT "FK_b848142b9b7ba05a0e47ad4dc3c" FOREIGN KEY ("ownerUid") REFERENCES "users"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_items" ADD CONSTRAINT "FK_ad8a1633a9d1a6f513f57f5718e" FOREIGN KEY ("parentId") REFERENCES "drive_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_items" ADD CONSTRAINT "FK_30d1bd977148908064da26f4491" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drive_items" DROP CONSTRAINT "FK_30d1bd977148908064da26f4491"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_items" DROP CONSTRAINT "FK_ad8a1633a9d1a6f513f57f5718e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_items" DROP CONSTRAINT "FK_b848142b9b7ba05a0e47ad4dc3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_responses" DROP CONSTRAINT "FK_ed1aee71d72c9f478a8d0ee2e90"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_responses" DROP CONSTRAINT "FK_8e9a32f15bd2485ea908787b634"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forms" DROP CONSTRAINT "FK_b7fa0713ef35842141009064ff1"`,
    );
    await queryRunner.query(`DROP TABLE "drive_items"`);
    await queryRunner.query(`DROP TYPE "public"."drive_items_type_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "form_responses"`);
    await queryRunner.query(`DROP TABLE "forms"`);
  }
}
