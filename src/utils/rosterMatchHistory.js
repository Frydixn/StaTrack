/**
 * Calcula el historial de partidas del roster activo.
 * Filtra las partidas donde jugaron al menos 3 miembros del roster en el mismo equipo.
 * @param {Array} matches - Historial de partidas.
 * @param {Object} roster - Roster activo.
 * @returns {Array} - Historial filtrado y formateado de partidas de equipo.
 */
export function calculateRosterMatches(matches, roster) {
  if (!matches || !roster || !roster.players || roster.players.length === 0) {
    return [];
  }

  const rosterPuuids = new Set(roster.players.map((p) => p.puuid));
  const teamMatches = [];

  for (const match of matches) {
    const players = match.players?.all_players || [];
    
    // Contar cuántos jugadores del roster jugaron en cada equipo (red vs blue)
    let redCount = 0;
    let blueCount = 0;
    const redMembers = [];
    const blueMembers = [];

    players.forEach((p) => {
      if (rosterPuuids.has(p.puuid)) {
        if (p.team?.toLowerCase() === "red") {
          redCount++;
          redMembers.push(p.name);
        } else if (p.team?.toLowerCase() === "blue") {
          blueCount++;
          blueMembers.push(p.name);
        }
      }
    });

    // Validar si al menos 3 miembros jugaron en el mismo bando
    const playedRed = redCount >= 3;
    const playedBlue = blueCount >= 3;

    if (playedRed || playedBlue) {
      const teamSide = playedRed ? "red" : "blue";
      const opponentSide = teamSide === "red" ? "blue" : "red";
      const membersPlayed = playedRed ? redMembers : blueMembers;

      const teamStats = match.teams?.[teamSide] || {};
      const opponentStats = match.teams?.[opponentSide] || {};

      const roundsWon = teamStats.rounds_won ?? 0;
      const roundsLost = opponentStats.rounds_won ?? 0;
      
      let outcome = "Empate";
      if (teamStats.has_won) outcome = "Victoria";
      else if (opponentStats.has_won) outcome = "Derrota";
      else if (roundsWon > roundsLost) outcome = "Victoria";
      else if (roundsWon < roundsLost) outcome = "Derrota";

      const durationMinutes = match.metadata?.game_length 
        ? Math.round(match.metadata.game_length / 60)
        : null;

      teamMatches.push({
        matchId: match.metadata?.matchid || match.metadata?.match_id,
        map: match.metadata?.map || "Unknown",
        outcome,
        score: `${roundsWon} - ${roundsLost}`,
        duration: durationMinutes ? `${durationMinutes}m` : "—",
        gameStart: match.metadata?.game_start || 0,
        members: membersPlayed
      });
    }
  }

  // Ordenar por fecha descendente
  return teamMatches.sort((a, b) => b.gameStart - a.gameStart);
}
