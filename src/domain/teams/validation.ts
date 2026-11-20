export function assertPlayerSeasonCanJoinTeam(params: {
  playerSeasonStatus: "ASSIGNED_TEAM" | "SUBSTITUTE";
  activeMembershipTeamIds: string[];
  targetTeamId: string;
  teamSeasonId: string;
  playerSeasonSeasonId: string;
  allowSubstitutePromotion?: boolean;
}) {
  if (params.teamSeasonId !== params.playerSeasonSeasonId) {
    throw new Error("El jugador y el equipo deben pertenecer a la misma edición.");
  }
  if (params.playerSeasonStatus === "SUBSTITUTE" && !params.allowSubstitutePromotion) {
    throw new Error("Un suplente debe cambiar de estado antes de integrarse a un plantel.");
  }
  if (params.activeMembershipTeamIds.some((teamId) => teamId !== params.targetTeamId)) {
    throw new Error("Un jugador no puede tener dos pertenencias activas incompatibles en la misma edición.");
  }
}
