-- Person data remains private and is only used by the administration panel.
ALTER TABLE "Person"
  ADD COLUMN "dni" TEXT,
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "email" TEXT;

-- The prior initial schema had no Person records when this migration was created.
-- A temporary value keeps the migration safe if a development database already has rows.
UPDATE "Person" SET "dni" = 'MIGRATED-' || "id" WHERE "dni" IS NULL;

ALTER TABLE "Person" ALTER COLUMN "dni" SET NOT NULL;
CREATE UNIQUE INDEX "Person_dni_key" ON "Person"("dni");

ALTER TABLE "Season" ADD COLUMN "calendarYear" INTEGER;
UPDATE "Season" AS s
  SET "calendarYear" = c."calendarYear"
  FROM "Championship" AS c
  WHERE s."championshipId" = c."id";
ALTER TABLE "Season" ALTER COLUMN "calendarYear" SET NOT NULL;

CREATE TYPE "SeasonStatus" AS ENUM ('PLANNING', 'ACTIVE', 'FINISHED');
ALTER TABLE "Season" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Season"
  ALTER COLUMN "status" TYPE "SeasonStatus"
  USING (
    CASE "status"::text
      WHEN 'DRAFT' THEN 'PLANNING'
      WHEN 'ACTIVE' THEN 'ACTIVE'
      WHEN 'ARCHIVED' THEN 'FINISHED'
    END
  )::"SeasonStatus";
ALTER TABLE "Season" ALTER COLUMN "status" SET DEFAULT 'PLANNING';
