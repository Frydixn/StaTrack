export function calculateSynergyPairs(matches, activePuuid) {
  if (!matches || matches.length === 0 || !activePuuid) {
    return [];
  }

  const teammateMap = {};

  for (const match of matches) {
    const players = match.players?.all_players || [];
    const me = players.find(p => p.puuid === activePuuid);
    if (!me) continue;

    const myTeam = me.team?.toLowerCase();
    if (!myTeam || (myTeam !== "red" && myTeam !== "blue")) continue;

    const won = match.teams?.[myTeam]?.has_won ?? false;

    // Find all other teammates in the same team
    const teammates = players.filter(p => p.puuid !== activePuuid && p.team?.toLowerCase() === myTeam);

    for (const teammate of teammates) {
      const tPuuid = teammate.puuid;
      if (!tPuuid) continue;

      if (!teammateMap[tPuuid]) {
        teammateMap[tPuuid] = {
          puuid: tPuuid,
          riotId: `${teammate.name}#${teammate.tag}`,
          name: teammate.name,
          tag: teammate.tag,
          games: 0,
          wins: 0
        };
      }

      teammateMap[tPuuid].games += 1;
      if (won) {
        teammateMap[tPuuid].wins += 1;
      }
    }
  }

  // Convert to array, compute winrate
  return Object.values(teammateMap)
    .map(t => ({
      ...t,
      winrate: t.games > 0 ? Math.round((t.wins / t.games) * 100) : 0
    }))
    .sort((a, b) => b.games - a.games || b.winrate - a.winrate);
}

export function calculateAgentStatsByPlayer(matches, puuid) {
  if (!matches || matches.length === 0 || !puuid) {
    return [];
  }

  const agentMap = {};

  for (const match of matches) {
    const players = match.players?.all_players || [];
    const player = players.find(p => p.puuid === puuid);
    if (!player) continue;

    const team = player.team?.toLowerCase();
    if (!team) continue;

    const won = match.teams?.[team]?.has_won ?? false;
    const agentName = player.character || "Unknown";

    if (!agentMap[agentName]) {
      agentMap[agentName] = {
        agent: agentName,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0
      };
    }

    const stats = player.stats || {};
    agentMap[agentName].games += 1;
    if (won) agentMap[agentName].wins += 1;
    agentMap[agentName].kills += stats.kills || 0;
    agentMap[agentName].deaths += stats.deaths || 0;
    agentMap[agentName].assists += stats.assists || 0;
  }

  return Object.values(agentMap)
    .map(a => {
      const kd = a.deaths > 0 ? Number((a.kills / a.deaths).toFixed(2)) : Number(a.kills.toFixed(2));
      return {
        ...a,
        winrate: a.games > 0 ? Math.round((a.wins / a.games) * 100) : 0,
        kd
      };
    })
    .sort((a, b) => b.games - a.games);
}

/**
 * Calcula la sinergia de todas las parejas (dúos) posibles dentro del roster activo.
 * @param {Array} matches - Historial de partidas.
 * @param {Object} roster - Roster activo.
 * @returns {Array} - Dúos con su winrate y partidas jugadas juntos.
 */
export function calculateAllRosterPairs(matches, roster) {
  if (!matches || !roster || !roster.players || roster.players.length < 2) {
    return [];
  }

  const rosterPuuids = new Set(roster.players.map((p) => p.puuid));
  const pairMap = {};

  for (const match of matches) {
    const players = match.players?.all_players || [];
    
    // Filtrar los miembros del roster que están en esta partida
    const membersInMatch = players.filter((p) => rosterPuuids.has(p.puuid));
    if (membersInMatch.length < 2) continue;

    // Agrupar por bando
    const redMembers = membersInMatch.filter((p) => p.team?.toLowerCase() === "red");
    const blueMembers = membersInMatch.filter((p) => p.team?.toLowerCase() === "blue");

    const processTeam = (teamMembers, teamColor) => {
      if (teamMembers.length < 2) return;
      const won = match.teams?.[teamColor]?.has_won ?? false;

      for (let i = 0; i < teamMembers.length; i++) {
        for (let j = i + 1; j < teamMembers.length; j++) {
          const p1 = teamMembers[i];
          const p2 = teamMembers[j];
          
          const key = p1.puuid < p2.puuid ? `${p1.puuid}_${p2.puuid}` : `${p2.puuid}_${p1.puuid}`;
          
          if (!pairMap[key]) {
            pairMap[key] = {
              key,
              p1Puuid: p1.puuid,
              p1RiotId: `${p1.name}#${p1.tag}`,
              p2Puuid: p2.puuid,
              p2RiotId: `${p2.name}#${p2.tag}`,
              games: 0,
              wins: 0
            };
          }
          
          pairMap[key].games += 1;
          if (won) {
            pairMap[key].wins += 1;
          }
        }
      }
    };

    processTeam(redMembers, "red");
    processTeam(blueMembers, "blue");
  }

  return Object.values(pairMap)
    .map((pair) => ({
      ...pair,
      winrate: pair.games > 0 ? Math.round((pair.wins / pair.games) * 100) : 0
    }))
    .sort((a, b) => b.games - a.games || b.winrate - a.winrate);
}

