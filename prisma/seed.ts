import { MatchStatus, MatchdayStatus, PhaseType, PrismaClient, SeasonKind, SeasonStatus, TeamMembershipRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.aiSheetExtraction.deleteMany();
    await tx.officialSheetVersion.deleteMany();
    await tx.officialSheet.deleteMany();
    await tx.fileObject.deleteMany();
    await tx.card.deleteMany();
    await tx.goal.deleteMany();
    await tx.matchSubstitution.deleteMany();
    await tx.matchReplacement.deleteMany();
    await tx.matchParticipation.deleteMany();
    await tx.matchRefereeAssignment.deleteMany();
    await tx.referee.deleteMany();
    await tx.match.deleteMany();
    await tx.matchday.deleteMany();
    await tx.phaseTeam.deleteMany();
    await tx.zone.deleteMany();
    await tx.competitionPhase.deleteMany();
    await tx.teamMembership.deleteMany();
    await tx.team.deleteMany();
    await tx.playerSeason.deleteMany();
    await tx.person.deleteMany();
    await tx.skillLevel.deleteMany();
    await tx.season.deleteMany();
    await tx.competitionFormat.deleteMany();
    await tx.championship.deleteMany();
    await tx.auditLog.deleteMany();

    const levels = await Promise.all([1, 2, 3, 4, 5, 6].map((value) => tx.skillLevel.create({ data: { value, label: `Nivel ${value}` } })));
    const levelId = new Map(levels.map((level) => [level.value, level.id]));
    const championship = await tx.championship.create({ data: { number: 46, calendarYear: 2026, name: "Campeonato 46", status: "ACTIVE" } });
    const season = await tx.season.create({ data: { championshipId: championship.id, kind: SeasonKind.APERTURA, name: "Apertura 2026", calendarYear: 2026, status: SeasonStatus.ACTIVE } });
    const teams = await Promise.all(["Ferrari", "Mercedes Benz", "McLaren"].map((name) => tx.team.create({ data: { name, seasonId: season.id } })));

    const playerData = Array.from({ length: 15 }, (_, index) => ({
      firstName: `Jugador${String(index + 1).padStart(2, "0")}`,
      lastName: "Ficticio",
      dni: `FICT-2026-${String(index + 1).padStart(3, "0")}`,
      email: `jugador${String(index + 1).padStart(2, "0")}@example.test`,
      level: (index % 6) + 1,
    }));
    const playerSeasons = [];
    for (let index = 0; index < playerData.length; index++) {
      const player = playerData[index];
      const person = await tx.person.create({ data: { firstName: player.firstName, lastName: player.lastName, dni: player.dni, email: player.email } });
      playerSeasons.push(await tx.playerSeason.create({ data: { personId: person.id, seasonId: season.id, skillLevelId: levelId.get(player.level)!, status: index < 13 ? "ASSIGNED_TEAM" : "SUBSTITUTE" } }));
    }
    for (let index = 0; index < 13; index++) {
      const teamIndex = index < 5 ? 0 : index < 9 ? 1 : 2;
      await tx.teamMembership.create({ data: { teamId: teams[teamIndex].id, playerSeasonId: playerSeasons[index].id, role: [0, 5, 9].includes(index) ? TeamMembershipRole.CAPTAIN : TeamMembershipRole.MEMBER } });
    }
    const phase = await tx.competitionPhase.create({ data: { seasonId: season.id, name: "Liga General", order: 1, type: PhaseType.REGULAR } });
    const zone = await tx.zone.create({ data: { phaseId: phase.id, name: "Zona Única", order: 1 } });
    await tx.phaseTeam.createMany({ data: teams.map((team) => ({ phaseId: phase.id, zoneId: zone.id, teamId: team.id })) });
    const matchdays = await Promise.all([1, 2, 3].map((order) => tx.matchday.create({ data: { seasonId: season.id, phaseId: phase.id, order, label: `Fecha ${order}`, scheduledOn: new Date(`2026-03-${String(7 + (order - 1) * 7).padStart(2, "0")}T12:00:00Z`), status: order === 1 ? MatchdayStatus.COMPLETED : MatchdayStatus.PLANNED } })));
    const referees = await Promise.all(["Uno", "Dos"].map(async (suffix) => {
      const person = await tx.person.create({ data: { firstName: "Árbitro", lastName: `Ficticio ${suffix}`, dni: `ARB-FICT-2026-${suffix}`, email: `arbitro-${suffix.toLowerCase()}@example.test` } });
      return tx.referee.create({ data: { personId: person.id } });
    }));
    const matches = await Promise.all([
      tx.match.create({ data: { matchdayId: matchdays[0].id, phaseId: phase.id, zoneId: zone.id, homeTeamId: teams[0].id, awayTeamId: teams[1].id, scheduledAt: new Date("2026-03-07T14:00:00Z"), status: MatchStatus.PLAYED } }),
      tx.match.create({ data: { matchdayId: matchdays[1].id, phaseId: phase.id, zoneId: zone.id, homeTeamId: teams[1].id, awayTeamId: teams[2].id, scheduledAt: new Date("2026-03-14T15:00:00Z"), status: MatchStatus.SCHEDULED } }),
      tx.match.create({ data: { matchdayId: matchdays[2].id, phaseId: phase.id, zoneId: zone.id, homeTeamId: teams[2].id, awayTeamId: teams[0].id, scheduledAt: new Date("2026-03-21T16:00:00Z"), status: MatchStatus.POSTPONED, observations: "Partido ficticio postergado" } }),
    ]);
    await tx.matchRefereeAssignment.createMany({ data: [
      { matchId: matches[0].id, refereeId: referees[0].id, isPrimary: true },
      { matchId: matches[1].id, refereeId: referees[1].id, isPrimary: true },
    ] });
    await tx.auditLog.createMany({ data: [
      { entityType: "Championship", entityId: championship.id, action: "SEEDED", actorLabel: "admin" },
      { entityType: "Season", entityId: season.id, action: "SEEDED", actorLabel: "admin" },
      { entityType: "CompetitionPhase", entityId: phase.id, action: "SEEDED", actorLabel: "admin" },
    ] });
  });
}

main().then(() => prisma.$disconnect()).catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
