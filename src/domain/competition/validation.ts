import { z } from "zod";

export const phaseInputSchema = z.object({
  seasonId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  order: z.coerce.number().int().positive(),
  type: z.enum(["REGULAR", "CHAMPIONSHIP", "CONSOLATION", "SEMIFINAL", "FINAL", "OTHER"]),
});

export const zoneInputSchema = z.object({
  phaseId: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  order: z.coerce.number().int().positive(),
});

export const matchdayInputSchema = z.object({
  seasonId: z.string().min(1),
  phaseId: z.string().min(1),
  order: z.coerce.number().int().positive(),
  label: z.string().trim().max(100).optional(),
  scheduledOn: z.string().optional(),
  status: z.enum(["PLANNED", "COMPLETED", "POSTPONED"]),
});

export const matchInputSchema = z.object({
  matchdayId: z.string().min(1),
  phaseId: z.string().min(1),
  zoneId: z.string().optional(),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  scheduledAt: z.string().min(1),
  status: z.enum(["SCHEDULED", "PLAYED", "POSTPONED", "CANCELLED"]),
  observations: z.string().trim().max(2000).optional(),
  refereeId: z.string().optional(),
});

export const refereeInputSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  dni: z.string().trim().min(3).max(30),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
});

export function asOptional(value: string) { return value.trim() || undefined; }

export function assertPhaseBelongsToSeason(phaseSeasonId: string, seasonId: string) {
  if (phaseSeasonId !== seasonId) throw new Error("La fase debe pertenecer a la misma temporada.");
}

export function assertMatchStructure(params: {
  matchdaySeasonId: string;
  matchdayPhaseId: string;
  phaseId: string;
  phaseSeasonId: string;
  homeTeamSeasonId: string;
  awayTeamSeasonId: string;
  homeInPhase: boolean;
  awayInPhase: boolean;
  homeTeamId: string;
  awayTeamId: string;
  zonePhaseId?: string | null;
}) {
  if (params.homeTeamId === params.awayTeamId) throw new Error("El equipo local y visitante deben ser distintos.");
  if (params.matchdaySeasonId !== params.phaseSeasonId || params.homeTeamSeasonId !== params.phaseSeasonId || params.awayTeamSeasonId !== params.phaseSeasonId) {
    throw new Error("La fecha, la fase y ambos equipos deben pertenecer a la misma temporada.");
  }
  if (params.matchdayPhaseId !== params.phaseId) throw new Error("La fecha y el partido deben pertenecer a la misma fase.");
  if (!params.homeInPhase || !params.awayInPhase) throw new Error("Ambos equipos deben participar en la fase del partido.");
  if (params.zonePhaseId && params.zonePhaseId !== params.phaseId) throw new Error("La zona debe pertenecer a la fase del partido.");
}
