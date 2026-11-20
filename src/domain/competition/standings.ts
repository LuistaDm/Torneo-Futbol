export type MatchResultForStandings = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homeYellowCards: number;
  awayYellowCards: number;
};

export type StandingRow = {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  yellowCards: number;
};

const emptyRow = (teamId: string): StandingRow => ({
  teamId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0,
  goalsAgainst: 0, goalDifference: 0, points: 0, yellowCards: 0,
});

export function calculateStandings(teamIds: string[], results: MatchResultForStandings[]) {
  const rows = new Map(teamIds.map((teamId) => [teamId, emptyRow(teamId)]));
  for (const result of results) {
    const home = rows.get(result.homeTeamId);
    const away = rows.get(result.awayTeamId);
    if (!home || !away) continue;
    home.played++; away.played++;
    home.goalsFor += result.homeScore; home.goalsAgainst += result.awayScore;
    away.goalsFor += result.awayScore; away.goalsAgainst += result.homeScore;
    home.yellowCards += result.homeYellowCards; away.yellowCards += result.awayYellowCards;
    if (result.homeScore > result.awayScore) { home.won++; away.lost++; home.points += 2; }
    else if (result.homeScore < result.awayScore) { away.won++; home.lost++; away.points += 2; }
    else { home.drawn++; away.drawn++; home.points++; away.points++; }
  }
  return [...rows.values()].map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.yellowCards - b.yellowCards);
}
