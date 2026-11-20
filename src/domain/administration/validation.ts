import { z } from "zod";

export const championshipInputSchema = z.object({
  number: z.coerce.number().int().positive(),
  calendarYear: z.coerce.number().int().min(2000).max(2100),
  name: z.string().trim().min(2).max(100),
});

export const seasonInputSchema = z.object({
  championshipId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  calendarYear: z.coerce.number().int().min(2000).max(2100),
  kind: z.enum(["APERTURA", "CLAUSURA"]),
  status: z.enum(["PLANNING", "ACTIVE", "FINISHED"]),
});

export const personInputSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  dni: z.string().trim().min(3).max(30),
  birthDate: z.string().optional(),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
});

export const playerSeasonInputSchema = z.object({
  seasonId: z.string().min(1),
  skillLevelId: z.string().min(1),
  status: z.enum(["ASSIGNED_TEAM", "SUBSTITUTE"]),
});

export const teamInputSchema = z.object({
  seasonId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
});

export function optionalDate(value: string | undefined) {
  return value ? new Date(`${value}T12:00:00`) : null;
}
