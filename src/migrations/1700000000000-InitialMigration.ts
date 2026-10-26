import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_role_enum" AS ENUM('admin', 'servant', 'priest');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_grades_enum" AS ENUM('first', 'second', 'third', 'fourth', 'fifth', 'sixth');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "classes_grade_enum" AS ENUM('first', 'second', 'third', 'fourth', 'fifth', 'sixth');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "servants_role_enum" AS ENUM('خادم', 'خادم رئيسي', 'مشرف');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "children_gender_enum" AS ENUM('male', 'female');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "attendance_status_enum" AS ENUM('present', 'absent', 'late', 'excused');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "visitations_type_enum" AS ENUM('home_visit', 'phone_call', 'church_meeting', 'other');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "visitations_status_enum" AS ENUM('planned', 'completed', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 1. Users Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "emailVerified" boolean NOT NULL DEFAULT true,
        "phone" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'servant',
        "grades" "users_grades_enum"[] NOT NULL DEFAULT '{}',
        "avatar" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone")
      )
    `);

    // 2. Refresh Tokens Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tokenHash" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_c25bc63d248ca90e8dcc1d92d06" UNIQUE ("tokenHash"),
        CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // 3. Classes Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "classes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "grade" "classes_grade_enum" NOT NULL,
        "academicYear" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_e207aa15404e9b2ce35910f9f7f" PRIMARY KEY ("id")
      )
    `);

    // 4. Servants Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "servants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "email" character varying,
        "role" "servants_role_enum" NOT NULL DEFAULT 'خادم',
        "avatar" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_d4aea914d6348351878a94dfb01" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_197f02819c93b28dd0de7fe217e" UNIQUE ("phone"),
        CONSTRAINT "UQ_6e79a80d20c4fc9279b0da7c8d8" UNIQUE ("email")
      )
    `);

    // 5. Servants Classes Join Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "servants_classes" (
        "servantsId" uuid NOT NULL,
        "classesId" uuid NOT NULL,
        CONSTRAINT "PK_1fda1e0c8abab01e0a583da0ca0" PRIMARY KEY ("servantsId", "classesId"),
        CONSTRAINT "FK_53534ce19a18aab74a614a45ebb" FOREIGN KEY ("servantsId") REFERENCES "servants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_be82d4b332f735d353711f5afe1" FOREIGN KEY ("classesId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_53534ce19a18aab74a614a45eb" ON "servants_classes" ("servantsId");
      CREATE INDEX IF NOT EXISTS "IDX_be82d4b332f735d353711f5afe" ON "servants_classes" ("classesId");
    `);

    // 6. Children Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "children" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "birthDate" date NOT NULL,
        "gender" "children_gender_enum" NOT NULL,
        "address" character varying,
        "parentName" character varying,
        "parentPhone" character varying NOT NULL,
        "notes" text,
        "avatar" character varying,
        "classId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_8c5a7cbebf2c702830ef38d22b0" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cc9b24fe026096fd2a09adf26b5" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // 7. Attendance Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attendance" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "childId" uuid NOT NULL,
        "classId" uuid NOT NULL,
        "date" date NOT NULL,
        "status" "attendance_status_enum" NOT NULL DEFAULT 'present',
        "notes" text,
        "takenById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_08af9f97b07dd718f25fc26932a" UNIQUE ("childId", "classId", "date"),
        CONSTRAINT "FK_83620835d2908176fd96accb6f1" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_af129543ec010c822cb6f0254b5" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // 8. Visitations Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "visitations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "childId" uuid NOT NULL,
        "servantId" uuid,
        "date" date NOT NULL,
        "type" "visitations_type_enum" NOT NULL DEFAULT 'home_visit',
        "status" "visitations_status_enum" NOT NULL DEFAULT 'completed',
        "notes" text,
        "followUpDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_2928ec5808e5b8f8e5f7488e34f" PRIMARY KEY ("id"),
        CONSTRAINT "FK_284155a180d89e53ed57f1f07cb" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_8b4c294e5443d51d1f0f290c7db" FOREIGN KEY ("servantId") REFERENCES "servants"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // 9. News Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "news" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying,
        "content" text NOT NULL,
        "image" character varying,
        "isPinned" boolean NOT NULL DEFAULT false,
        "authorName" character varying,
        "authorRole" character varying,
        "authorId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"),
        CONSTRAINT "FK_18ab67e7662dbc5d45dc53a6e00" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "news"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "visitations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "children"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "servants_classes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "servants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "classes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "visitations_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "visitations_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "attendance_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "children_gender_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "servants_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "classes_grade_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_grades_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
  }
}
