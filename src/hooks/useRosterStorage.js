import { useState, useEffect } from "react";
import * as storage from "../utils/rosterStorage";

export default function useRosterStorage() {
  const [rosters, setRosters] = useState([]);

  useEffect(() => {
    setRosters(storage.getRosters());
  }, []);

  const createRoster = (name) => {
    const newRoster = storage.createRoster(name);
    setRosters(storage.getRosters());
    return newRoster;
  };

  const deleteRoster = (id) => {
    const updated = storage.deleteRoster(id);
    setRosters(updated);
  };

  const renameRoster = (id, newName) => {
    const updated = storage.updateRosterName(id, newName);
    setRosters(updated);
  };

  const addPlayer = (rosterId, player) => {
    const updated = storage.addPlayerToRoster(rosterId, player);
    setRosters(updated);
  };

  const removePlayer = (rosterId, puuid) => {
    const updated = storage.removePlayerFromRoster(rosterId, puuid);
    setRosters(updated);
  };

  const updatePlayerRole = (rosterId, puuid, role) => {
    const updated = storage.updatePlayerRoleInRoster(rosterId, puuid, role);
    setRosters(updated);
  };

  return {
    rosters,
    createRoster,
    deleteRoster,
    renameRoster,
    addPlayer,
    removePlayer,
    updatePlayerRole
  };
}
