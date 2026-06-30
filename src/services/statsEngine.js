import axios from "axios";

const HENRIK_BASE = "https://api.henrikdev.xyz";
const API_KEY = import.meta.env.VITE_HENRIK_API_KEY || "";

const headers = API_KEY ? { Authorization: API_KEY } : {};

// --- Helpers de llamado a la API ---

export async function getAccount(name, tag) {
  const url = `${HENRIK_BASE}/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
  const { data } = await axios.get(url, { headers });
  return data.data; // { puuid, region, account_level, name, tag, ... }
}

export async function getMMR(region, name, tag) {
  const url = `${HENRIK_BASE}/valorant/v2/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
  const { data } = await axios.get(url, { headers });
  return data.data; // current_data.currenttierpatched, etc.
}

// Trae hasta `size` partidas competitivas/normales recientes
export async function getMatchHistory(region, name, tag, size = 20) {
  const url = `${HENRIK_BASE}/valorant/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=${size}`;
  const { data } = await axios.get(url, { headers });
  return data.data || [];
}

// --- Cálculo agregado de stats a partir del historial de partidas ---

export function aggregateStats(account, mmr, matches) {
  const stats = {
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    totalDamage: 0,
    totalWins: 0,
    matchesPlayed: matches.length,
    headshots: 0,
    bodyshots: 0,
    legshots: 0,
    aces: 0,
    mvps: 0,
    clutches: 0,
    comebackWins: 0,
    flawlessRounds: 0,
    agentCounts: {},
    mapCounts: {},
  };

  for (const match of matches) {
    const meta = match.metadata;
    const players = match.players?.all_players || [];
    const me = players.find((p) => p.puuid === account.puuid);
    if (!me) continue;

    stats.totalKills += me.stats.kills || 0;
    stats.totalDeaths += me.stats.deaths || 0;
    stats.totalAssists += me.stats.assists || 0;
    stats.totalDamage += me.damage_made || me.stats.damage || 0;
    stats.headshots += me.stats.headshots || 0;
    stats.bodyshots += me.stats.bodyshots || 0;
    stats.legshots += me.stats.legshots || 0;

    // Agente
    const agent = me.character || "Unknown";
    stats.agentCounts[agent] = (stats.agentCounts[agent] || 0) + 1;

    // Mapa
    const map = meta?.map || "Unknown";
    stats.mapCounts[map] = (stats.mapCounts[map] || 0) + 1;

    // Victoria
    const myTeam = me.team;
    const won = match.teams?.[myTeam?.toLowerCase()]?.has_won;
    if (won) stats.totalWins += 1;

    // Ace: 5+ kills en una sola ronda
    if (me.stats.kills >= 20 && meta.rounds_played && me.stats.kills / meta.rounds_played >= 1.5) {
      stats.aces += 1;
    }

    // MVP aproximado: mayor score del equipo
    const maxScore = Math.max(...players.map((p) => p.stats.score || 0));
    if (me.stats.score === maxScore) stats.mvps += 1;
  }

  const headshotPct =
    stats.headshots + stats.bodyshots + stats.legshots > 0
      ? (stats.headshots / (stats.headshots + stats.bodyshots + stats.legshots)) * 100
      : 0;

  const winrate = stats.matchesPlayed > 0 ? (stats.totalWins / stats.matchesPlayed) * 100 : 0;
  const kdRatio = stats.totalDeaths > 0 ? stats.totalKills / stats.totalDeaths : stats.totalKills;

  const uniqueAgents = Object.keys(stats.agentCounts).length;
  const uniqueMaps = Object.keys(stats.mapCounts).length;

  let mostPlayedAgent = null;
  let mostPlayedAgentCount = 0;
  for (const [agent, count] of Object.entries(stats.agentCounts)) {
    if (count > mostPlayedAgentCount) {
      mostPlayedAgent = agent;
      mostPlayedAgentCount = count;
    }
  }

  return {
    totalKills: stats.totalKills,
    totalDeaths: stats.totalDeaths,
    totalAssists: stats.totalAssists,
    totalDamage: stats.totalDamage,
    totalWins: stats.totalWins,
    matchesPlayed: stats.matchesPlayed,
    headshotPct: Number(headshotPct.toFixed(1)),
    winrate: Number(winrate.toFixed(1)),
    kdRatio: Number(kdRatio.toFixed(2)),
    aces: stats.aces,
    mvps: stats.mvps,
    clutches: stats.clutches,
    comebackWins: stats.comebackWins,
    flawlessRounds: stats.flawlessRounds,
    uniqueAgents,
    uniqueMaps,
    mostPlayedAgent,
    mostPlayedAgentCount,
    accountLevel: account.account_level || 0,
    rankTier: mmr?.current_data?.currenttierpatched || "Unranked",
  };
}
