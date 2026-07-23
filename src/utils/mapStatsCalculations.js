/**
 * Determina el bando (ataque/defensa) de un jugador en una ronda específica.
 * @param {number} roundIndex - Índice de la ronda (0-indexed).
 * @param {string} playerTeam - Color del equipo del jugador ("red" o "blue").
 * @returns {string} - "attack" o "defense".
 */
export function getPlayerSide(roundIndex, playerTeam) {
  const teamLower = playerTeam.toLowerCase();
  if (roundIndex < 12) {
    return teamLower === "red" ? "attack" : "defense";
  } else if (roundIndex < 24) {
    return teamLower === "red" ? "defense" : "attack";
  } else {
    const isOdd = roundIndex % 2 === 1;
    return teamLower === "red" ? (isOdd ? "attack" : "defense") : (isOdd ? "defense" : "attack");
  }
}

/**
 * Calcula las estadísticas de ataque y defensa a nivel de rondas por mapa para un roster.
 * @param {Array} matches - Historial de partidas.
 * @param {Object} roster - Roster activo conteniendo la lista de jugadores.
 * @returns {Array} - Estadísticas agrupadas por mapa.
 */
export function calculateRosterMapStats(matches, roster) {
  if (!matches || !roster || !roster.players || roster.players.length === 0) {
    return [];
  }

  const rosterPuuids = new Set(roster.players.map((p) => p.puuid));
  const mapData = {};

  for (const match of matches) {
    const players = match.players?.all_players || [];
    
    // Buscar cualquier miembro de la plantilla en esta partida para identificar su equipo
    const rosterMember = players.find((p) => rosterPuuids.has(p.puuid));
    if (!rosterMember) continue;

    const team = rosterMember.team?.toLowerCase();
    if (team !== "red" && team !== "blue") continue;

    const mapName = match.metadata?.map || "Unknown Map";
    if (!mapData[mapName]) {
      mapData[mapName] = {
        map: mapName,
        games: 0,
        attackWins: 0,
        attackPlayed: 0,
        defenseWins: 0,
        defensePlayed: 0
      };
    }

    mapData[mapName].games += 1;

    const rounds = match.rounds || [];
    rounds.forEach((round, rIdx) => {
      const side = getPlayerSide(rIdx, team);
      const winningTeam = round.winning_team?.toLowerCase();
      const won = winningTeam === team;

      if (side === "attack") {
        mapData[mapName].attackPlayed += 1;
        if (won) mapData[mapName].attackWins += 1;
      } else if (side === "defense") {
        mapData[mapName].defensePlayed += 1;
        if (won) mapData[mapName].defenseWins += 1;
      }
    });
  }

  // Mapear y calcular porcentajes
  return Object.values(mapData)
    .map((data) => {
      const attackWR = data.attackPlayed > 0 ? Math.round((data.attackWins / data.attackPlayed) * 100) : 0;
      const defenseWR = data.defensePlayed > 0 ? Math.round((data.defenseWins / data.defensePlayed) * 100) : 0;
      const diff = Math.abs(attackWR - defenseWR);
      const isImbalanced = diff > 20;

      return {
        map: data.map,
        games: data.games,
        attackWR,
        attackWins: data.attackWins,
        attackPlayed: data.attackPlayed,
        defenseWR,
        defenseWins: data.defenseWins,
        defensePlayed: data.defensePlayed,
        diff,
        isImbalanced
      };
    })
    .sort((a, b) => b.games - a.games);
}
