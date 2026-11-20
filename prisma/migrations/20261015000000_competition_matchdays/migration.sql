-- Matchdays are scoped to a competition phase. Existing matchdays inherit the
-- phase of one of their matches; fresh installations receive the final schema.
ALTER TABLE "Matchday" ADD COLUMN "phaseId" TEXT;
UPDATE "Matchday" AS md
SET "phaseId" = m."phaseId"
FROM "Match" AS m
WHERE m."matchdayId" = md."id" AND md."phaseId" IS NULL;
ALTER TABLE "Matchday" ALTER COLUMN "phaseId" SET NOT NULL;

CREATE TYPE "MatchdayStatus" AS ENUM ('PLANNED', 'COMPLETED', 'POSTPONED');
ALTER TABLE "Matchday" ADD COLUMN "status" "MatchdayStatus" NOT NULL DEFAULT 'PLANNED';
ALTER TABLE "Matchday" ALTER COLUMN "label" DROP NOT NULL;
DROP INDEX "Matchday_seasonId_order_key";
CREATE UNIQUE INDEX "Matchday_phaseId_order_key" ON "Matchday"("phaseId", "order");
CREATE INDEX "Matchday_seasonId_idx" ON "Matchday"("seasonId");
ALTER TABLE "Matchday" ADD CONSTRAINT "Matchday_phaseId_fkey"
  FOREIGN KEY ("phaseId") REFERENCES "CompetitionPhase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- The initial model exposed SUSPENDED before the competition rules were
-- finalized. The administrative flow supports only the requested four states.
CREATE TYPE "MatchStatus_new" AS ENUM ('SCHEDULED', 'PLAYED', 'POSTPONED', 'CANCELLED');
ALTER TABLE "Match" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Match" ALTER COLUMN "status" TYPE "MatchStatus_new"
  USING (CASE "status"::text WHEN 'SUSPENDED' THEN 'POSTPONED' ELSE "status"::text END)::"MatchStatus_new";
DROP TYPE "MatchStatus";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
