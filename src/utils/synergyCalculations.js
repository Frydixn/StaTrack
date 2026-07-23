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
