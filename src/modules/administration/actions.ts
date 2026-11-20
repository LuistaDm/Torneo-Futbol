"use server";

import {
  PlayerSeasonStatus,
  Prisma,
  PhaseType,
  MatchdayStatus,
  MatchStatus,
  SeasonKind,
  SeasonStatus,
  TeamMembershipRole,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  championshipInputSchema,
  optionalDate,
  personInputSchema,
  playerSeasonInputSchema,
  seasonInputSchema,
  teamInputSchema,
} from "@/domain/administration/validation";
import { assertPlayerSeasonCanJoinTeam } from "@/domain/teams/validation";
import { asOptional, assertMatchStructure, assertPhaseBelongsToSeason, matchInputSchema, matchdayInputSchema, phaseInputSchema, refereeInputSchema, zoneInputSchema } from "@/domain/competition/validation";
import { prisma } from "@/infrastructure/database/prisma";
import { requireAdmin } from "./authorization";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");
const audit = (tx: Prisma.TransactionClient, entityType: string, entityId: string, action: string, beforeData?: Prisma.InputJsonValue, afterData?: Prisma.InputJsonValue) =>
  tx.auditLog.create({ data: { entityType, entityId, action, beforeData, afterData, actorLabel: "admin" } });

export async function createChampionship(formData: FormData) {
  await requireAdmin();
  const input = championshipInputSchema.parse({ number: text(formData, "number"), calendarYear: text(formData, "calendarYear"), name: text(formData, "name") });
  const championship = await prisma.championship.create({ data: input });
  await audit(prisma, "Championship", championship.id, "CREATED", undefined, { ...input });
  revalidatePath("/admin/campeonatos");
  redirect(`/admin/campeonatos/${championship.id}?notice=Campeonato creado`);
}

export async function updateChampionship(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const input = championshipInputSchema.parse({ number: text(formData, "number"), calendarYear: text(formData, "calendarYear"), name: text(formData, "name") });
  const before = await prisma.championship.findUniqueOrThrow({ where: { id } });
  const championship = await prisma.championship.update({ where: { id }, data: input });
  await audit(prisma, "Championship", id, "UPDATED", { number: before.number, calendarYear: before.calendarYear, name: before.name }, input);
  revalidatePath("/admin/campeonatos");
  redirect(`/admin/campeonatos/${championship.id}?notice=Campeonato actualizado`);
}

export async function createSeason(formData: FormData) {
  await requireAdmin();
  const input = seasonInputSchema.parse({ championshipId: text(formData, "championshipId"), name: text(formData, "name"), calendarYear: text(formData, "calendarYear"), kind: text(formData, "kind"), status: text(formData, "status") });
  await prisma.championship.findUniqueOrThrow({ where: { id: input.championshipId } });
  const season = await prisma.season.create({ data: { ...input, kind: input.kind as SeasonKind, status: input.status as SeasonStatus } });
  await audit(prisma, "Season", season.id, "CREATED", undefined, input);
  revalidatePath("/admin/temporadas");
  revalidatePath(`/admin/campeonatos/${input.championshipId}`);
  redirect(`/admin/temporadas/${season.id}?notice=Temporada creada`);
}

export async function updateSeason(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const input = seasonInputSchema.parse({ championshipId: text(formData, "championshipId"), name: text(formData, "name"), calendarYear: text(formData, "calendarYear"), kind: text(formData, "kind"), status: text(formData, "status") });
  const before = await prisma.season.findUniqueOrThrow({ where: { id } });
  const season = await prisma.season.update({ where: { id }, data: { ...input, kind: input.kind as SeasonKind, status: input.status as SeasonStatus } });
  await audit(prisma, "Season", id, "UPDATED", { name: before.name, kind: before.kind, status: before.status }, input);
  revalidatePath("/admin/temporadas");
  revalidatePath(`/admin/campeonatos/${input.championshipId}`);
  redirect(`/admin/temporadas/${season.id}?notice=Temporada actualizada`);
}

export async function createPersonAndPlayerSeason(formData: FormData) {
  await requireAdmin();
  const personInput = personInputSchema.parse({ firstName: text(formData, "firstName"), lastName: text(formData, "lastName"), dni: text(formData, "dni"), birthDate: text(formData, "birthDate"), email: text(formData, "email") });
  const playerInput = playerSeasonInputSchema.parse({ seasonId: text(formData, "seasonId"), skillLevelId: text(formData, "skillLevelId"), status: text(formData, "status") });
  const playerSeason = await prisma.$transaction(async (tx) => {
    await tx.season.findUniqueOrThrow({ where: { id: playerInput.seasonId } });
    await tx.skillLevel.findUniqueOrThrow({ where: { id: playerInput.skillLevelId } });
    const person = await tx.person.create({ data: { ...personInput, birthDate: optionalDate(personInput.birthDate), email: personInput.email || null } });
    const created = await tx.playerSeason.create({ data: { personId: person.id, seasonId: playerInput.seasonId, skillLevelId: playerInput.skillLevelId, status: playerInput.status as PlayerSeasonStatus } });
    await audit(tx, "Person", person.id, "CREATED", undefined, { firstName: person.firstName, lastName: person.lastName, dni: person.dni });
    await audit(tx, "PlayerSeason", created.id, "CREATED", undefined, { seasonId: created.seasonId, skillLevelId: created.skillLevelId, status: created.status });
    return created;
  });
  revalidatePath("/admin/jugadores");
  revalidatePath("/admin/suplentes");
  redirect(`/admin/jugadores/${playerSeason.id}?notice=Jugador creado`);
}

export async function updatePerson(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const returnTo = text(formData, "returnTo") || "/admin/jugadores";
  const input = personInputSchema.parse({ firstName: text(formData, "firstName"), lastName: text(formData, "lastName"), dni: text(formData, "dni"), birthDate: text(formData, "birthDate"), email: text(formData, "email") });
  const before = await prisma.person.findUniqueOrThrow({ where: { id } });
  const person = await prisma.person.update({ where: { id }, data: { ...input, birthDate: optionalDate(input.birthDate), email: input.email || null } });
  await audit(prisma, "Person", person.id, "UPDATED", { firstName: before.firstName, lastName: before.lastName, dni: before.dni }, { firstName: person.firstName, lastName: person.lastName, dni: person.dni });
  revalidatePath("/admin/jugadores");
  redirect(`${returnTo}?notice=Jugador actualizado`);
}

export async function createTeam(formData: FormData) {
  await requireAdmin();
  const input = teamInputSchema.parse({ seasonId: text(formData, "seasonId"), name: text(formData, "name") });
  await prisma.season.findUniqueOrThrow({ where: { id: input.seasonId } });
  const team = await prisma.team.create({ data: input });
  await audit(prisma, "Team", team.id, "CREATED", undefined, input);
  revalidatePath("/admin/equipos");
  redirect(`/admin/equipos/${team.id}?notice=Equipo creado`);
}

export async function updateTeam(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const name = teamInputSchema.shape.name.parse(text(formData, "name"));
  const before = await prisma.team.findUniqueOrThrow({ where: { id } });
  const team = await prisma.team.update({ where: { id }, data: { name } });
  await audit(prisma, "Team", id, "UPDATED", { name: before.name }, { name });
  revalidatePath("/admin/equipos");
  redirect(`/admin/equipos/${team.id}?notice=Equipo actualizado`);
}

export async function assignPlayerToTeam(formData: FormData) {
  await requireAdmin();
  const teamId = text(formData, "teamId");
  const playerSeasonId = text(formData, "playerSeasonId");
  await prisma.$transaction(async (tx) => {
    const [team, player] = await Promise.all([
      tx.team.findUniqueOrThrow({ where: { id: teamId } }),
      tx.playerSeason.findUniqueOrThrow({ where: { id: playerSeasonId }, include: { memberships: { where: { leftAt: null } } } }),
    ]);
    assertPlayerSeasonCanJoinTeam({ playerSeasonStatus: player.status, playerSeasonSeasonId: player.seasonId, teamSeasonId: team.seasonId, activeMembershipTeamIds: player.memberships.map((membership) => membership.teamId), targetTeamId: teamId, allowSubstitutePromotion: true });
    const membership = await tx.teamMembership.findUnique({ where: { teamId_playerSeasonId: { teamId, playerSeasonId } } });
    if (membership) await tx.teamMembership.update({ where: { id: membership.id }, data: { leftAt: null } });
    else await tx.teamMembership.create({ data: { teamId, playerSeasonId } });
    await tx.playerSeason.update({ where: { id: playerSeasonId }, data: { status: PlayerSeasonStatus.ASSIGNED_TEAM } });
    await audit(tx, "TeamMembership", membership?.id ?? `${teamId}:${playerSeasonId}`, "PLAYER_ASSIGNED", undefined, { teamId, playerSeasonId });
  });
  revalidatePath(`/admin/equipos/${teamId}`);
  revalidatePath("/admin/suplentes");
  redirect(`/admin/equipos/${teamId}?notice=Jugador asignado al equipo`);
}

export async function removePlayerFromTeam(formData: FormData) {
  await requireAdmin();
  const teamId = text(formData, "teamId");
  const playerSeasonId = text(formData, "playerSeasonId");
  await prisma.$transaction(async (tx) => {
    const membership = await tx.teamMembership.findFirstOrThrow({ where: { teamId, playerSeasonId, leftAt: null } });
    await tx.teamMembership.update({ where: { id: membership.id }, data: { leftAt: new Date(), role: TeamMembershipRole.MEMBER } });
    await tx.playerSeason.update({ where: { id: playerSeasonId }, data: { status: PlayerSeasonStatus.SUBSTITUTE } });
    await audit(tx, "TeamMembership", membership.id, "PLAYER_REMOVED", { teamId, playerSeasonId }, undefined);
  });
  revalidatePath(`/admin/equipos/${teamId}`);
  revalidatePath("/admin/suplentes");
  redirect(`/admin/equipos/${teamId}?notice=Jugador removido y marcado como suplente`);
}

export async function setTeamCaptain(formData: FormData) {
  await requireAdmin();
  const teamId = text(formData, "teamId");
  const playerSeasonId = text(formData, "playerSeasonId");
  await prisma.$transaction(async (tx) => {
    await tx.teamMembership.findFirstOrThrow({ where: { teamId, playerSeasonId, leftAt: null } });
    await tx.teamMembership.updateMany({ where: { teamId, leftAt: null, role: TeamMembershipRole.CAPTAIN }, data: { role: TeamMembershipRole.MEMBER } });
    const membership = await tx.teamMembership.update({ where: { teamId_playerSeasonId: { teamId, playerSeasonId } }, data: { role: TeamMembershipRole.CAPTAIN } });
    await audit(tx, "TeamMembership", membership.id, "CAPTAIN_CHANGED", undefined, { teamId, playerSeasonId });
  });
  revalidatePath(`/admin/equipos/${teamId}`);
  redirect(`/admin/equipos/${teamId}?notice=Capitán actualizado`);
}

const parseDate = (value: string, field: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`${field} debe ser una fecha y hora válida.`);
  return date;
};

export async function createCompetitionPhase(formData: FormData) {
  await requireAdmin();
  const input = phaseInputSchema.parse({ seasonId: text(formData, "seasonId"), name: text(formData, "name"), order: text(formData, "order"), type: text(formData, "type") });
  await prisma.season.findUniqueOrThrow({ where: { id: input.seasonId } });
  const phase = await prisma.competitionPhase.create({ data: { ...input, type: input.type as PhaseType } });
  await audit(prisma, "CompetitionPhase", phase.id, "CREATED", undefined, input);
  revalidatePath("/admin/fases");
  redirect(`/admin/fases/${phase.id}?notice=Fase creada`);
}

export async function updateCompetitionPhase(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const input = phaseInputSchema.parse({ seasonId: text(formData, "seasonId"), name: text(formData, "name"), order: text(formData, "order"), type: text(formData, "type") });
  const before = await prisma.competitionPhase.findUniqueOrThrow({ where: { id } });
  assertPhaseBelongsToSeason(before.seasonId, input.seasonId);
  const phase = await prisma.competitionPhase.update({ where: { id }, data: { name: input.name, order: input.order, type: input.type as PhaseType } });
  await audit(prisma, "CompetitionPhase", id, "UPDATED", { name: before.name, order: before.order, type: before.type }, { name: phase.name, order: phase.order, type: phase.type });
  revalidatePath("/admin/fases");
  redirect(`/admin/fases/${id}?notice=Fase actualizada`);
}

export async function createZone(formData: FormData) {
  await requireAdmin();
  const input = zoneInputSchema.parse({ phaseId: text(formData, "phaseId"), name: text(formData, "name"), order: text(formData, "order") });
  await prisma.competitionPhase.findUniqueOrThrow({ where: { id: input.phaseId } });
  const zone = await prisma.zone.create({ data: input });
  await audit(prisma, "Zone", zone.id, "CREATED", undefined, input);
  revalidatePath(`/admin/fases/${input.phaseId}`);
  redirect(`/admin/fases/${input.phaseId}?notice=Zona creada`);
}

export async function updateZone(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const input = zoneInputSchema.parse({ phaseId: text(formData, "phaseId"), name: text(formData, "name"), order: text(formData, "order") });
  const before = await prisma.zone.findUniqueOrThrow({ where: { id } });
  if (before.phaseId !== input.phaseId) throw new Error("Una zona no puede trasladarse entre fases desde esta operación.");
  const zone = await prisma.zone.update({ where: { id }, data: { name: input.name, order: input.order } });
  await audit(prisma, "Zone", id, "UPDATED", { name: before.name, order: before.order }, { name: zone.name, order: zone.order });
  revalidatePath(`/admin/fases/${input.phaseId}`);
  redirect(`/admin/fases/${input.phaseId}?notice=Zona actualizada`);
}

export async function assignTeamToPhase(formData: FormData) {
  await requireAdmin();
  const phaseId = text(formData, "phaseId"); const teamId = text(formData, "teamId"); const zoneId = asOptional(text(formData, "zoneId"));
  await prisma.$transaction(async (tx) => {
    const [phase, team, zone] = await Promise.all([
      tx.competitionPhase.findUniqueOrThrow({ where: { id: phaseId } }),
      tx.team.findUniqueOrThrow({ where: { id: teamId } }),
      zoneId ? tx.zone.findUniqueOrThrow({ where: { id: zoneId } }) : Promise.resolve(null),
    ]);
    assertPhaseBelongsToSeason(phase.seasonId, team.seasonId);
    if (zone && zone.phaseId !== phaseId) throw new Error("La zona seleccionada no pertenece a esta fase.");
    const existing = await tx.phaseTeam.findUnique({ where: { phaseId_teamId: { phaseId, teamId } } });
    const phaseTeam = existing ? await tx.phaseTeam.update({ where: { id: existing.id }, data: { zoneId: zoneId ?? null } }) : await tx.phaseTeam.create({ data: { phaseId, teamId, zoneId: zoneId ?? null } });
    await audit(tx, "PhaseTeam", phaseTeam.id, existing ? "TEAM_PHASE_UPDATED" : "TEAM_ASSIGNED_TO_PHASE", undefined, { phaseId, teamId, zoneId: zoneId ?? null });
  });
  revalidatePath(`/admin/fases/${phaseId}`);
  redirect(`/admin/fases/${phaseId}?notice=Equipo asignado a la fase`);
}

export async function removeTeamFromPhase(formData: FormData) {
  await requireAdmin();
  const phaseId = text(formData, "phaseId"); const teamId = text(formData, "teamId");
  const phaseTeam = await prisma.phaseTeam.findUniqueOrThrow({ where: { phaseId_teamId: { phaseId, teamId } } });
  await prisma.phaseTeam.delete({ where: { id: phaseTeam.id } });
  await audit(prisma, "PhaseTeam", phaseTeam.id, "TEAM_REMOVED_FROM_PHASE", { phaseId, teamId }, undefined);
  revalidatePath(`/admin/fases/${phaseId}`);
  redirect(`/admin/fases/${phaseId}?notice=Equipo removido de la fase`);
}

export async function createMatchday(formData: FormData) {
  await requireAdmin();
  const input = matchdayInputSchema.parse({ seasonId: text(formData, "seasonId"), phaseId: text(formData, "phaseId"), order: text(formData, "order"), label: text(formData, "label"), scheduledOn: text(formData, "scheduledOn"), status: text(formData, "status") });
  const phase = await prisma.competitionPhase.findUniqueOrThrow({ where: { id: input.phaseId } });
  assertPhaseBelongsToSeason(phase.seasonId, input.seasonId);
  const matchday = await prisma.matchday.create({ data: { seasonId: input.seasonId, phaseId: input.phaseId, order: input.order, label: asOptional(input.label ?? "") ?? null, scheduledOn: asOptional(input.scheduledOn ?? "") ? parseDate(input.scheduledOn!, "La fecha") : null, status: input.status as MatchdayStatus } });
  await audit(prisma, "Matchday", matchday.id, "CREATED", undefined, { phaseId: matchday.phaseId, order: matchday.order, status: matchday.status });
  revalidatePath("/admin/fechas");
  redirect(`/admin/fechas/${matchday.id}?notice=Fecha creada`);
}

export async function updateMatchday(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const current = await prisma.matchday.findUniqueOrThrow({ where: { id } });
  const input = matchdayInputSchema.parse({ seasonId: current.seasonId, phaseId: current.phaseId, order: text(formData, "order"), label: text(formData, "label"), scheduledOn: text(formData, "scheduledOn"), status: text(formData, "status") });
  const matchday = await prisma.matchday.update({ where: { id }, data: { order: input.order, label: asOptional(input.label ?? "") ?? null, scheduledOn: asOptional(input.scheduledOn ?? "") ? parseDate(input.scheduledOn!, "La fecha") : null, status: input.status as MatchdayStatus } });
  await audit(prisma, "Matchday", id, "UPDATED", { order: current.order, status: current.status }, { order: matchday.order, status: matchday.status });
  revalidatePath("/admin/fechas");
  redirect(`/admin/fechas/${id}?notice=Fecha actualizada`);
}

export async function createReferee(formData: FormData) {
  await requireAdmin();
  const input = refereeInputSchema.parse({ firstName: text(formData, "firstName"), lastName: text(formData, "lastName"), dni: text(formData, "dni"), email: text(formData, "email") });
  const referee = await prisma.$transaction(async (tx) => {
    const person = await tx.person.create({ data: { firstName: input.firstName, lastName: input.lastName, dni: input.dni, email: input.email || null } });
    const created = await tx.referee.create({ data: { personId: person.id } });
    await audit(tx, "Referee", created.id, "CREATED", undefined, { personId: person.id });
    return created;
  });
  revalidatePath("/admin/arbitros");
  redirect(`/admin/arbitros/${referee.id}?notice=Árbitro creado`);
}

export async function updateReferee(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const input = refereeInputSchema.parse({ firstName: text(formData, "firstName"), lastName: text(formData, "lastName"), dni: text(formData, "dni"), email: text(formData, "email") });
  const referee = await prisma.referee.findUniqueOrThrow({ where: { id }, include: { person: true } });
  await prisma.person.update({ where: { id: referee.personId }, data: { ...input, email: input.email || null } });
  await audit(prisma, "Referee", id, "UPDATED", { firstName: referee.person.firstName, lastName: referee.person.lastName }, input);
  revalidatePath("/admin/arbitros");
  redirect(`/admin/arbitros/${id}?notice=Árbitro actualizado`);
}

async function validateMatchInput(tx: Prisma.TransactionClient, input: ReturnType<typeof matchInputSchema.parse>) {
  const [matchday, phase, homeTeam, awayTeam, zone] = await Promise.all([
    tx.matchday.findUniqueOrThrow({ where: { id: input.matchdayId } }),
    tx.competitionPhase.findUniqueOrThrow({ where: { id: input.phaseId } }),
    tx.team.findUniqueOrThrow({ where: { id: input.homeTeamId } }),
    tx.team.findUniqueOrThrow({ where: { id: input.awayTeamId } }),
    input.zoneId ? tx.zone.findUniqueOrThrow({ where: { id: input.zoneId } }) : Promise.resolve(null),
  ]);
  const phaseTeams = await tx.phaseTeam.findMany({ where: { phaseId: input.phaseId, teamId: { in: [input.homeTeamId, input.awayTeamId] } } });
  assertMatchStructure({ matchdaySeasonId: matchday.seasonId, matchdayPhaseId: matchday.phaseId, phaseId: input.phaseId, phaseSeasonId: phase.seasonId, homeTeamSeasonId: homeTeam.seasonId, awayTeamSeasonId: awayTeam.seasonId, homeInPhase: phaseTeams.some((entry) => entry.teamId === input.homeTeamId), awayInPhase: phaseTeams.some((entry) => entry.teamId === input.awayTeamId), homeTeamId: input.homeTeamId, awayTeamId: input.awayTeamId, zonePhaseId: zone?.phaseId });
  if (input.refereeId) await tx.referee.findUniqueOrThrow({ where: { id: input.refereeId } });
}

async function replaceMatchReferee(tx: Prisma.TransactionClient, matchId: string, refereeId?: string) {
  await tx.matchRefereeAssignment.deleteMany({ where: { matchId } });
  if (refereeId) await tx.matchRefereeAssignment.create({ data: { matchId, refereeId, isPrimary: true } });
}

export async function createMatch(formData: FormData) {
  await requireAdmin();
  const input = matchInputSchema.parse({ matchdayId: text(formData, "matchdayId"), phaseId: text(formData, "phaseId"), zoneId: asOptional(text(formData, "zoneId")), homeTeamId: text(formData, "homeTeamId"), awayTeamId: text(formData, "awayTeamId"), scheduledAt: text(formData, "scheduledAt"), status: text(formData, "status"), observations: text(formData, "observations"), refereeId: asOptional(text(formData, "refereeId")) });
  const match = await prisma.$transaction(async (tx) => {
    await validateMatchInput(tx, input);
    const created = await tx.match.create({ data: { matchdayId: input.matchdayId, phaseId: input.phaseId, zoneId: input.zoneId || null, homeTeamId: input.homeTeamId, awayTeamId: input.awayTeamId, scheduledAt: parseDate(input.scheduledAt, "La fecha y hora"), status: input.status as MatchStatus, observations: asOptional(input.observations ?? "") ?? null } });
    await replaceMatchReferee(tx, created.id, input.refereeId);
    await audit(tx, "Match", created.id, "CREATED", undefined, { matchdayId: input.matchdayId, phaseId: input.phaseId, homeTeamId: input.homeTeamId, awayTeamId: input.awayTeamId, status: input.status });
    if (input.refereeId) await audit(tx, "MatchRefereeAssignment", `${created.id}:${input.refereeId}`, "REFEREE_ASSIGNED", undefined, { matchId: created.id, refereeId: input.refereeId });
    return created;
  });
  revalidatePath("/admin/partidos");
  redirect(`/admin/partidos/${match.id}?notice=Partido creado`);
}

export async function updateMatch(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const input = matchInputSchema.parse({ matchdayId: text(formData, "matchdayId"), phaseId: text(formData, "phaseId"), zoneId: asOptional(text(formData, "zoneId")), homeTeamId: text(formData, "homeTeamId"), awayTeamId: text(formData, "awayTeamId"), scheduledAt: text(formData, "scheduledAt"), status: text(formData, "status"), observations: text(formData, "observations"), refereeId: asOptional(text(formData, "refereeId")) });
  await prisma.$transaction(async (tx) => {
    const before = await tx.match.findUniqueOrThrow({ where: { id } });
    await validateMatchInput(tx, input);
    await tx.match.update({ where: { id }, data: { matchdayId: input.matchdayId, phaseId: input.phaseId, zoneId: input.zoneId || null, homeTeamId: input.homeTeamId, awayTeamId: input.awayTeamId, scheduledAt: parseDate(input.scheduledAt, "La fecha y hora"), status: input.status as MatchStatus, observations: asOptional(input.observations ?? "") ?? null } });
    await replaceMatchReferee(tx, id, input.refereeId);
    await audit(tx, "Match", id, "UPDATED", { matchdayId: before.matchdayId, status: before.status }, { matchdayId: input.matchdayId, status: input.status });
    await audit(tx, "MatchRefereeAssignment", id, "REFEREE_CHANGED", undefined, { matchId: id, refereeId: input.refereeId ?? null });
  });
  revalidatePath("/admin/partidos");
  redirect(`/admin/partidos/${id}?notice=Partido actualizado`);
}
