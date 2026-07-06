import ACHIEVEMENTS from "./achievements.js";
import { RANK_BENCHMARKS, getRankGroup } from "./trackerEngine.js";

export const RANK_ORDER = [
  "Iron 1", "Iron 2", "Iron 3",
  "Bronze 1", "Bronze 2", "Bronze 3",
  "Silver 1", "Silver 2", "Silver 3",
  "Gold 1", "Gold 2", "Gold 3",
  "Platinum 1", "Platinum 2", "Platinum 3",
  "Diamond 1", "Diamond 2", "Diamond 3",
  "Ascendant 1", "Ascendant 2", "Ascendant 3",
  "Immortal 1", "Immortal 2", "Immortal 3",
  "Radiant",
];

function rankIndex(rankName) {
  if (!rankName) return -1;
  const exact = RANK_ORDER.indexOf(rankName);
  if (exact !== -1) return exact;
  const prefixMatch = RANK_ORDER.findIndex((r) => r.startsWith(rankName));
  return prefixMatch;
}

export function evaluateAchievements(stats) {
  return ACHIEVEMENTS.map((ach) => {
    const currentValue = stats[ach.stat];
    let progress = 0;
    let unlocked = false;

    if (ach.id === "outstanding") {
      const rankName = stats.rankTier || "Unranked";
      const rankGroup = getRankGroup(rankName);
      const benchmark = RANK_BENCHMARKS[rankGroup] || { kd: 1.0, hs: 18, winrate: 50, dpg: 140, assists: 4.2 };

      const pKd = stats.kdRatio || 0;
      const pHs = stats.headshotPct || 0;
      const pWinrate = stats.winrate || 0;
      const pDpg = stats.matchesPlayed > 0 ? Math.round(stats.totalDamage / stats.matchesPlayed) : 0;
      const pAssists = stats.matchesPlayed > 0 ? Number((stats.totalAssists / stats.matchesPlayed).toFixed(1)) : 0;

      let statsAboveCount = 0;
      if (pKd > benchmark.kd) statsAboveCount++;
      if (pHs > benchmark.hs) statsAboveCount++;
      if (pWinrate > benchmark.winrate) statsAboveCount++;
      if (pDpg > benchmark.dpg) statsAboveCount++;
      if (pAssists > benchmark.assists) statsAboveCount++;

      // Se desbloquea si supera en las 5 métricas
      unlocked = statsAboveCount === 5;
      progress = Math.min(100, Math.round((statsAboveCount / 5) * 100));
    } else if (ach.stat === "rankTier") {
      const currentIdx = rankIndex(currentValue);
      const targetIdx = rankIndex(ach.target);
      unlocked = currentIdx >= targetIdx && currentIdx !== -1;
      progress = targetIdx > 0 ? Math.min(100, Math.round((currentIdx / targetIdx) * 100)) : unlocked ? 100 : 0;
    } else {
      const numeric = Number(currentValue) || 0;
      const target = Number(ach.target);
      unlocked = numeric >= target;
      progress = Math.min(100, Math.round((numeric / target) * 100));
    }

    return {
      ...ach,
      currentValue: ach.id === "outstanding" ? "" : (currentValue !== undefined ? currentValue : 0),
      unlocked,
      progress,
    };
  });
}
