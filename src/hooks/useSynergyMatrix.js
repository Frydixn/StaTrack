import { useMemo } from "react";
import { calculateSynergyPairs, calculateAgentStatsByPlayer } from "../utils/synergyCalculations";

export default function useSynergyMatrix(matches, activePuuid, activeRoster) {
  const synergyPairs = useMemo(() => {
    return calculateSynergyPairs(matches, activePuuid);
  }, [matches, activePuuid]);

  const rosterSynergy = useMemo(() => {
    if (!activeRoster || !activeRoster.players || activeRoster.players.length === 0) {
      return [];
    }
    const rosterPuuids = new Set(activeRoster.players.map(p => p.puuid));
    // Filter the general synergy pairs to only those in the roster
    return synergyPairs.filter(pair => rosterPuuids.has(pair.puuid));
  }, [synergyPairs, activeRoster]);

  const rosterAgentStats = useMemo(() => {
    if (!activeRoster || !activeRoster.players || activeRoster.players.length === 0) {
      return {};
    }
    const statsMap = {};
    for (const player of activeRoster.players) {
      statsMap[player.puuid] = calculateAgentStatsByPlayer(matches, player.puuid);
    }
    // Also add stats for the active player themselves so they can be viewed
    if (activePuuid && !statsMap[activePuuid]) {
      statsMap[activePuuid] = calculateAgentStatsByPlayer(matches, activePuuid);
    }
    return statsMap;
  }, [matches, activeRoster, activePuuid]);

  return {
    synergyPairs,
    rosterSynergy,
    rosterAgentStats
  };
}
