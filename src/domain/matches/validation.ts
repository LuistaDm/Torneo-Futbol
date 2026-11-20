import { z } from "zod";

export const skillLevelSchema = z.number().int().min(1).max(6);

export function assertReplacementLevel(params: { absentLevel: number; replacementLevel: number; phaseType: "REGULAR" | "SEMIFINAL" | "FINAL" | string; }) {
  const { absentLevel, replacementLevel, phaseType } = params;
  skillLevelSchema.parse(absentLevel);
  skillLevelSchema.parse(replacementLevel);
  const requiresLowerAbility = phaseType === "SEMIFINAL" || phaseType === "FINAL";
  const valid = requiresLowerAbility ? replacementLevel > absentLevel : replacementLevel >= absentLevel;
  if (!valid) throw new Error("El nivel del reemplazante no cumple la regla de la fase.");
}

export function assertReplacementSource(params: { replacementMembershipTeamId?: string | null; beneficiaryTeamId: string; isSubstitute: boolean; }) {
  if (!params.isSubstitute && (!params.replacementMembershipTeamId || params.replacementMembershipTeamId === params.beneficiaryTeamId)) {
    throw new Error("El reemplazante debe pertenecer a otro equipo o ser suplente habilitado.");
  }
}

export function assertGoalBelongsToParticipation(params: { participationMatchId: string; goalMatchId: string; participationTeamId: string; scoringTeamId: string; }) {
  if (params.participationMatchId !== params.goalMatchId || params.participationTeamId !== params.scoringTeamId) {
    throw new Error("El gol debe corresponder a la participación real y al equipo para el que jugó.");
  }
}

export function assertCardHasBlueDuration(type: "YELLOW" | "BLUE" | "RED", blueDurationMinutes?: number | null) {
  if (type === "BLUE" && (!blueDurationMinutes || blueDurationMinutes <= 0)) {
    throw new Error("La tarjeta azul requiere una duración de exclusión positiva.");
  }
}
