-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SeasonKind" AS ENUM ('APERTURA', 'CLAUSURA');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlayerSeasonStatus" AS ENUM ('ASSIGNED_TEAM', 'SUBSTITUTE');

-- CreateEnum
CREATE TYPE "TeamMembershipRole" AS ENUM ('MEMBER', 'CAPTAIN');

-- CreateEnum
CREATE TYPE "PhaseType" AS ENUM ('REGULAR', 'CHAMPIONSHIP', 'CONSOLATION', 'SEMIFINAL', 'FINAL', 'OTHER');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'PLAYED', 'POSTPONED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipationOrigin" AS ENUM ('ROSTER', 'SUBSTITUTE', 'REPLACEMENT_FROM_OTHER_TEAM');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('YELLOW', 'BLUE', 'RED');

-- CreateTable
CREATE TABLE "Championship" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "calendarYear" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Championship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "kind" "SeasonKind" NOT NULL,
    "name" TEXT NOT NULL,
    "startsOn" TIMESTAMP(3),
    "endsOn" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'DRAFT',
    "competitionFormatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionFormat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionPhase" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PhaseType" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "CompetitionPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillLevel" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "SkillLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSeason" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "skillLevelId" TEXT NOT NULL,
    "status" "PlayerSeasonStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "crestFileId" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerSeasonId" TEXT NOT NULL,
    "role" "TeamMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhaseTeam" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "zoneId" TEXT,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "PhaseTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matchday" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "scheduledOn" TIMESTAMP(3),

    CONSTRAINT "Matchday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "matchdayId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "zoneId" TEXT,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referee" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "Referee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchRefereeAssignment" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MatchRefereeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipation" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerSeasonId" TEXT NOT NULL,
    "playingForTeamId" TEXT NOT NULL,
    "origin" "ParticipationOrigin" NOT NULL,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchReplacement" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "absentPlayerSeasonId" TEXT NOT NULL,
    "replacementPlayerSeasonId" TEXT NOT NULL,
    "beneficiaryTeamId" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "levelRuleValidated" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchReplacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchSubstitution" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "outgoingParticipationId" TEXT NOT NULL,
    "incomingParticipationId" TEXT NOT NULL,
    "occurredAtMinute" INTEGER,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "scoringTeamId" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "occurredAtMinute" INTEGER,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "type" "CardType" NOT NULL,
    "occurredAtMinute" INTEGER,
    "blueDurationMinutes" INTEGER,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileObject" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialSheet" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialSheetVersion" (
    "id" TEXT NOT NULL,
    "officialSheetId" TEXT NOT NULL,
    "fileObjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficialSheetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSheetExtraction" (
    "id" TEXT NOT NULL,
    "officialSheetVersionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "extractedData" JSONB NOT NULL,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "AiSheetExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "actorLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Championship_number_key" ON "Championship"("number");

-- CreateIndex
CREATE INDEX "Season_championshipId_idx" ON "Season"("championshipId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_championshipId_kind_key" ON "Season"("championshipId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionPhase_seasonId_order_key" ON "CompetitionPhase"("seasonId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_phaseId_name_key" ON "Zone"("phaseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SkillLevel_value_key" ON "SkillLevel"("value");

-- CreateIndex
CREATE INDEX "PlayerSeason_seasonId_status_idx" ON "PlayerSeason"("seasonId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSeason_personId_seasonId_key" ON "PlayerSeason"("personId", "seasonId");

-- CreateIndex
CREATE INDEX "Team_seasonId_idx" ON "Team"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_seasonId_name_key" ON "Team"("seasonId", "name");

-- CreateIndex
CREATE INDEX "TeamMembership_playerSeasonId_leftAt_idx" ON "TeamMembership"("playerSeasonId", "leftAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_teamId_playerSeasonId_key" ON "TeamMembership"("teamId", "playerSeasonId");

-- CreateIndex
CREATE INDEX "PhaseTeam_zoneId_idx" ON "PhaseTeam"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseTeam_phaseId_teamId_key" ON "PhaseTeam"("phaseId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Matchday_seasonId_order_key" ON "Matchday"("seasonId", "order");

-- CreateIndex
CREATE INDEX "Match_matchdayId_idx" ON "Match"("matchdayId");

-- CreateIndex
CREATE INDEX "Match_phaseId_zoneId_idx" ON "Match"("phaseId", "zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Referee_personId_key" ON "Referee"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchRefereeAssignment_matchId_refereeId_key" ON "MatchRefereeAssignment"("matchId", "refereeId");

-- CreateIndex
CREATE INDEX "MatchParticipation_matchId_playingForTeamId_idx" ON "MatchParticipation"("matchId", "playingForTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipation_matchId_playerSeasonId_playingForTeamId_key" ON "MatchParticipation"("matchId", "playerSeasonId", "playingForTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchReplacement_participationId_key" ON "MatchReplacement"("participationId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchReplacement_matchId_absentPlayerSeasonId_key" ON "MatchReplacement"("matchId", "absentPlayerSeasonId");

-- CreateIndex
CREATE INDEX "Goal_matchId_scoringTeamId_idx" ON "Goal"("matchId", "scoringTeamId");

-- CreateIndex
CREATE INDEX "Card_matchId_type_idx" ON "Card"("matchId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "FileObject_storageKey_key" ON "FileObject"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialSheet_matchId_key" ON "OfficialSheet"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialSheetVersion_officialSheetId_version_key" ON "OfficialSheetVersion"("officialSheetId", "version");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_competitionFormatId_fkey" FOREIGN KEY ("competitionFormatId") REFERENCES "CompetitionFormat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionPhase" ADD CONSTRAINT "CompetitionPhase_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "CompetitionPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeason" ADD CONSTRAINT "PlayerSeason_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeason" ADD CONSTRAINT "PlayerSeason_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeason" ADD CONSTRAINT "PlayerSeason_skillLevelId_fkey" FOREIGN KEY ("skillLevelId") REFERENCES "SkillLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_crestFileId_fkey" FOREIGN KEY ("crestFileId") REFERENCES "FileObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_playerSeasonId_fkey" FOREIGN KEY ("playerSeasonId") REFERENCES "PlayerSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseTeam" ADD CONSTRAINT "PhaseTeam_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "CompetitionPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseTeam" ADD CONSTRAINT "PhaseTeam_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseTeam" ADD CONSTRAINT "PhaseTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchday" ADD CONSTRAINT "Matchday_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matchdayId_fkey" FOREIGN KEY ("matchdayId") REFERENCES "Matchday"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "CompetitionPhase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referee" ADD CONSTRAINT "Referee_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRefereeAssignment" ADD CONSTRAINT "MatchRefereeAssignment_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRefereeAssignment" ADD CONSTRAINT "MatchRefereeAssignment_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "Referee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipation" ADD CONSTRAINT "MatchParticipation_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipation" ADD CONSTRAINT "MatchParticipation_playerSeasonId_fkey" FOREIGN KEY ("playerSeasonId") REFERENCES "PlayerSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipation" ADD CONSTRAINT "MatchParticipation_playingForTeamId_fkey" FOREIGN KEY ("playingForTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReplacement" ADD CONSTRAINT "MatchReplacement_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReplacement" ADD CONSTRAINT "MatchReplacement_absentPlayerSeasonId_fkey" FOREIGN KEY ("absentPlayerSeasonId") REFERENCES "PlayerSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReplacement" ADD CONSTRAINT "MatchReplacement_replacementPlayerSeasonId_fkey" FOREIGN KEY ("replacementPlayerSeasonId") REFERENCES "PlayerSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReplacement" ADD CONSTRAINT "MatchReplacement_beneficiaryTeamId_fkey" FOREIGN KEY ("beneficiaryTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReplacement" ADD CONSTRAINT "MatchReplacement_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "MatchParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSubstitution" ADD CONSTRAINT "MatchSubstitution_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSubstitution" ADD CONSTRAINT "MatchSubstitution_outgoingParticipationId_fkey" FOREIGN KEY ("outgoingParticipationId") REFERENCES "MatchParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSubstitution" ADD CONSTRAINT "MatchSubstitution_incomingParticipationId_fkey" FOREIGN KEY ("incomingParticipationId") REFERENCES "MatchParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_scoringTeamId_fkey" FOREIGN KEY ("scoringTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "MatchParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "MatchParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialSheet" ADD CONSTRAINT "OfficialSheet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialSheetVersion" ADD CONSTRAINT "OfficialSheetVersion_officialSheetId_fkey" FOREIGN KEY ("officialSheetId") REFERENCES "OfficialSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialSheetVersion" ADD CONSTRAINT "OfficialSheetVersion_fileObjectId_fkey" FOREIGN KEY ("fileObjectId") REFERENCES "FileObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSheetExtraction" ADD CONSTRAINT "AiSheetExtraction_officialSheetVersionId_fkey" FOREIGN KEY ("officialSheetVersionId") REFERENCES "OfficialSheetVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

