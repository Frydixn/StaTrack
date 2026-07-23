const STORAGE_KEY = "valoquest_rosters";

export function getRosters() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading rosters from localStorage:", error);
    return [];
  }
}

export function saveRosters(rosters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rosters));
    return true;
  } catch (error) {
    console.error("Error saving rosters to localStorage:", error);
    return false;
  }
}

export function createRoster(name) {
  const rosters = getRosters();
  const newRoster = {
    id: `roster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name || "Nuevo Roster",
    players: [],
    createdAt: new Date().toISOString()
  };
  rosters.unshift(newRoster);
  saveRosters(rosters);
  return newRoster;
}

export function deleteRoster(id) {
  const rosters = getRosters();
  const filtered = rosters.filter(r => r.id !== id);
  saveRosters(filtered);
  return filtered;
}

export function updateRosterName(id, newName) {
  const rosters = getRosters();
  const updated = rosters.map(r => r.id === id ? { ...r, name: newName } : r);
  saveRosters(updated);
  return updated;
}

export function addPlayerToRoster(rosterId, player) {
  // player should be: { puuid, riotId, role: null }
  const rosters = getRosters();
  const updated = rosters.map(r => {
    if (r.id !== rosterId) return r;
    // Prevent duplicate player additions
    const exists = r.players.some(p => p.puuid === player.puuid);
    if (exists) return r;
    return {
      ...r,
      players: [...r.players, { puuid: player.puuid, riotId: player.riotId, role: player.role || null }]
    };
  });
  saveRosters(updated);
  return updated;
}

export function removePlayerFromRoster(rosterId, puuid) {
  const rosters = getRosters();
  const updated = rosters.map(r => {
    if (r.id !== rosterId) return r;
    return {
      ...r,
      players: r.players.filter(p => p.puuid !== puuid)
    };
  });
  saveRosters(updated);
  return updated;
}

export function updatePlayerRoleInRoster(rosterId, puuid, role) {
  const rosters = getRosters();
  const updated = rosters.map(r => {
    if (r.id !== rosterId) return r;
    return {
      ...r,
      players: r.players.map(p => p.puuid === puuid ? { ...p, role } : p)
    };
  });
  saveRosters(updated);
  return updated;
}
