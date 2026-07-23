import React, { useState } from "react";
import Header from "./components/Header";
import PlayerProfileBar from "./components/PlayerProfileBar";
import ActStatsBar from "./components/ActStatsBar";
import StatsGrid from "./components/StatsGrid";
import MapAgentsPanel from "./components/MapAgentsPanel";
import Filters from "./components/Filters";
import AchievementsGrid from "./components/AchievementsGrid";
import ComparePanel from "./components/ComparePanel";
import Sidebar from "./components/Sidebar";
import TrackerView from "./components/TrackerView";
import MapsView from "./components/MapsView";
import CompareView from "./components/CompareView";
import RosterView from "./components/RosterView";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
import {
  getAccount, getMMR, getMMRHistory,
  getFullMatchHistory, aggregateStats, buildActStats,
  syncPlayerMatches,
} from "./services/statsEngine";
import { evaluateAchievements } from "./services/achievementEvaluator";

async function loadOrSyncPlayerProfile(name, tag) {
  const account = await getAccount(name, tag);
  const region = account.region;
  const puuid = account.puuid;

  let existingMatchIdsSet = new Set();
  try {
    const { data: storedMatchesRaw } = await axios.get(`${API_BASE}/api/db/matches/${encodeURIComponent(puuid)}`);
    if (storedMatchesRaw && storedMatchesRaw.length > 0) {
      existingMatchIdsSet = new Set(storedMatchesRaw.map((row) => row.match_id));
    }

  } catch (err) {
    console.warn("No se pudieron leer partidas para match_ids del proxy backend:", err.message);
  }

  try {
    await syncPlayerMatches(region, name, tag, puuid, existingMatchIdsSet);
  } catch (err) {
    console.warn("Fallo en sincronización de partidas al proxy backend:", err.message);
  }

  let matches = [];
  try {
    const { data: allStoredMatchesRaw } = await axios.get(`${API_BASE}/api/db/matches/${encodeURIComponent(puuid)}`);
    if (allStoredMatchesRaw) {
      matches = allStoredMatchesRaw.map((row) => row.match_data) || [];
      matches.sort((a, b) => (b.metadata?.game_start || 0) - (a.metadata?.game_start || 0));
    }
  } catch (err) {
    console.warn("No se pudieron leer partidas del proxy backend:", err.message);
  }

  if (matches.length === 0) {
    console.warn("Historial de base de datos vacío o inaccesible. Usando fallback directo de API.");
    try {
      matches = await getFullMatchHistory(region, name, tag);
    } catch (err) {
      console.error("Fallo al obtener historial de fallback de API:", err.message);
    }
  }

  let mmr = null;
  try {
    mmr = await getMMR(region, name, tag);
  } catch (e) {
    console.warn("MMR no disponible:", e.message);
  }

  const stats = aggregateStats(account, mmr, matches);
  const actStats = buildActStats(mmr);
  const achievements = evaluateAchievements(stats);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const result = {
    account: {
      puuid: account.puuid, name: account.name,
      tag: account.tag, region, account_level: account.account_level,
      card: account.card || null,
    },
    stats, actStats, mmrHistory: [], achievements, matches,
    summary: {
      total: achievements.length, unlocked: unlockedCount,
      percent: Math.round((unlockedCount / achievements.length) * 100),
    },
  };

  try {
    await savePlayerSnapshot(result);
  } catch (dbErr) {
    console.warn("No se pudo guardar el snapshot en el proxy backend:", dbErr.message);
  }

  try {
    const savedRecent = JSON.parse(localStorage.getItem("recentPlayers") || "[]");
    const newRecentItem = {
      puuid: account.puuid,
      name: account.name,
      tag: account.tag,
      region,
      account_level: account.account_level,
      elo: stats.elo || stats.mmr?.current_data?.elo || 0
    };
    const updated = [newRecentItem, ...savedRecent.filter((r) => r.puuid !== newRecentItem.puuid)].slice(0, 10);
    localStorage.setItem("recentPlayers", JSON.stringify(updated));
  } catch (err) {
    console.warn("Error saving recent players to localStorage:", err);
  }

  return result;
}

async function savePlayerSnapshot(playerData) {
  const { account, stats, achievements } = playerData;
  try {
    await axios.post(`${API_BASE}/api/db/player`, {
      puuid: account.puuid, name: account.name, tag: account.tag,
      region: account.region, account_level: account.account_level,
      last_updated: new Date().toISOString(),
    });
    await axios.post(`${API_BASE}/api/db/stats`, { puuid: account.puuid, stats });

    const unlockedRows = achievements
      .filter((a) => a.unlocked)
      .map((a) => ({ puuid: account.puuid, achievement_id: a.id }));
    if (unlockedRows.length > 0) {
      await axios.post(`${API_BASE}/api/db/achievements`, unlockedRows);
    }
  } catch (dbErr) {
    console.warn("Error guardando perfil en el proxy backend:", dbErr.message);
  }
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [compareMode, setCompareMode] = useState(false);
  const [friendData, setFriendData] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendError, setFriendError] = useState("");
  const [activeTab, setActiveTab] = useState("tracker");

  const handleSearch = async (name, tag) => {
    setLoading(true);
    setError("");
    setPlayerData(null);
    setFriendData(null);
    setCompareMode(false);
    setActiveFilter("all");
    setSearchTerm("");
    setActiveTab("tracker");

    let player = null;
    try {
      const { data } = await axios.get(`${API_BASE}/api/db/player/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
      player = data;
    } catch (e) {
      console.warn("No se pudo leer el jugador de la base de datos proxy:", e.message);
    }

    try {
      let shouldLoadFromSnapshot = false;
      if (player && player.puuid) {
        const lastUpdated = player.last_updated ? new Date(player.last_updated).getTime() : 0;
        const cacheDuration = 5 * 60 * 1000;
        if (Date.now() - lastUpdated < cacheDuration) {
          shouldLoadFromSnapshot = true;
        }
      }

      if (shouldLoadFromSnapshot) {
        const { data: snapshot } = await axios.get(`${API_BASE}/api/db/stats/${encodeURIComponent(player.puuid)}`);

        if (snapshot?.stats) {
          let matches = [];
          try {
            const { data: storedMatchesRaw } = await axios.get(`${API_BASE}/api/db/matches/${encodeURIComponent(player.puuid)}`);
            if (storedMatchesRaw && storedMatchesRaw.length > 0) {
              matches = storedMatchesRaw.map((row) => row.match_data) || [];
              matches.sort((a, b) => (b.metadata?.game_start || 0) - (a.metadata?.game_start || 0));
            }
          } catch (e) {
            console.warn("No se pudieron leer partidas para el snapshot:", e.message);
          }

          if (matches.length === 0) {
            console.warn("Snapshot sin partidas en DB. Intentando cargar de API...");
            try {
              matches = await getFullMatchHistory(player.region, player.name, player.tag);
              if (matches && matches.length > 0) {
                const rowsToInsert = matches.map((m) => ({
                  puuid: player.puuid,
                  match_id: m.metadata?.matchid || m.metadata?.match_id,
                  match_data: m,
                }));
                await axios.post(`${API_BASE}/api/db/matches`, rowsToInsert);
              }
            } catch (err) {
              console.warn("No se pudieron obtener partidas de API para el snapshot:", err.message);
            }
          }

          const mmrObj = snapshot.stats.mmr || null;
          const freshStats = aggregateStats(player, mmrObj, matches);
          const achievements = evaluateAchievements(freshStats);
          const unlockedCount = achievements.filter((a) => a.unlocked).length;

          setPlayerData({
            account: {
              puuid: player.puuid, name: player.name, tag: player.tag, region: player.region, account_level: player.account_level,
              card: freshStats.accountCard || null
            },
            stats: freshStats, actStats: freshStats.actStats || null, mmrHistory: [],
            achievements,
            matches,
            summary: { total: achievements.length, unlocked: unlockedCount, percent: Math.round((unlockedCount / achievements.length) * 100) },
          });
          setLoading(false);
          return;
        }
      }

      try {
        const result = await loadOrSyncPlayerProfile(name, tag);
        setPlayerData(result);
      } catch (apiErr) {
        console.warn("Fallo al obtener datos frescos de la API en búsqueda:", apiErr.message);
        if (player && player.puuid) {
          const { data: snapshot } = await axios.get(`${API_BASE}/api/db/stats/${encodeURIComponent(player.puuid)}`);

          if (snapshot?.stats) {
            let matches = [];
            try {
              const { data: storedMatchesRaw } = await axios.get(`${API_BASE}/api/db/matches/${encodeURIComponent(player.puuid)}`);
              if (storedMatchesRaw && storedMatchesRaw.length > 0) {
                matches = storedMatchesRaw.map((row) => row.match_data) || [];
                matches.sort((a, b) => (b.metadata?.game_start || 0) - (a.metadata?.game_start || 0));
              }
            } catch (e) {
              console.warn("Error leyendo partidas de la base de datos para fallback de error:", e.message);
            }

            const mmrObj = snapshot.stats.mmr || null;
            const freshStats = aggregateStats(player, mmrObj, matches);
            const achievements = evaluateAchievements(freshStats);
            const unlockedCount = achievements.filter((a) => a.unlocked).length;

            setPlayerData({
              account: {
                puuid: player.puuid, name: player.name, tag: player.tag, region: player.region, account_level: player.account_level,
                card: freshStats.accountCard || null
              },
              stats: freshStats, actStats: freshStats.actStats || null, mmrHistory: [],
              achievements,
              matches,
              summary: { total: achievements.length, unlocked: unlockedCount, percent: Math.round((unlockedCount / achievements.length) * 100) },
            });
            setLoading(false);
            return;
          }
        }
        throw apiErr;
      }
    } catch (err) {
      setError(err.message || "Error al buscar el jugador. Verificá los datos e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!playerData?.account) return;
    const { name, tag } = playerData.account;
    setRefreshing(true);
    setError("");
    try {
      const result = await loadOrSyncPlayerProfile(name, tag);
      setPlayerData(result);
    } catch (err) {
      setError(err.message || "Error al actualizar los datos.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleFriendSearch = async (name, tag) => {
    setFriendLoading(true);
    setFriendError("");
    try {
      const result = await loadOrSyncPlayerProfile(name, tag);
      setFriendData(result);
      setCompareMode(true);
    } catch (err) {
      setFriendError(err.message || "No se pudo cargar el perfil del amigo.");
    } finally {
      setFriendLoading(false);
    }
  };

  const handleCloseCompare = () => {
    setCompareMode(false);
    setFriendData(null);
    setFriendError("");
  };

  const getLatestActLabel = (matches) => {
    if (!matches || matches.length === 0) return "";
    const meta = matches[0]?.metadata;
    if (!meta) return "";
    if (meta.season && typeof meta.season === "object") {
      return (meta.season.short || meta.season.id || "").toUpperCase();
    }
    if (meta.season && typeof meta.season === "string") {
      return meta.season.toUpperCase();
    }
    if (meta.season_id && typeof meta.season_id === "string") {
      return meta.season_id.toUpperCase();
    }
    return "";
  };

  const filteredAchievements = playerData
    ? playerData.achievements.filter((ach) => {
      if (activeFilter === "unlocked" && !ach.unlocked) return false;
      if (activeFilter === "locked" && ach.unlocked) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return ach.name.toLowerCase().includes(term) || ach.desc.toLowerCase().includes(term);
      }
      return true;
    })
    : [];

  return (
    <div className={`app-shell ${activeTab === "maps" ? "maps-active" : ""}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} playerData={playerData} onSearch={handleSearch} loading={loading} />

      <div className="app-main">
        <div className="noise-bar"></div>

        {activeTab === "maps" ? (
          !loading && !error && <MapsView />
        ) : (
          <>
            <main>
              {loading && (
                <div className="state-msg loading-msg">
                  <div className="loading-spinner"></div>
                  Sincronizando expediente competitivo de combate...
                  <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
                    Esto puede tardar unos segundos — guardando partidas nuevas en la base de datos
                  </span>
                </div>
              )}

              {error && <div className="state-msg error">{error}</div>}

              {!loading && !error && activeTab === "compare" && (
                <CompareView
                  playerData={playerData}
                  onSearch={handleSearch}
                  loadProfile={loadOrSyncPlayerProfile}
                />
              )}

              {!loading && !error && activeTab !== "compare" && !playerData && (
                <div className="state-msg">Esperando un Riot ID para empezar a escanear...</div>
              )}

              {!loading && !error && activeTab !== "compare" && playerData && (
                <div className="results-container">
                   {activeTab === "tracker" && (
                    <>
                      <PlayerProfileBar
                        account={playerData.account}
                        stats={playerData.stats}
                        latestAct={getLatestActLabel(playerData.matches)}
                        matches={playerData.matches}
                        summary={playerData.summary}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                        onGoToTracker={() => setActiveTab("tracker")}
                      />
                      {playerData.stats.agentsByMap && Object.keys(playerData.stats.agentsByMap).length > 0 && (
                        <MapAgentsPanel agentsByMap={playerData.stats.agentsByMap} />
                      )}
                      <TrackerView playerData={playerData} />
                    </>
                  )}

                  {activeTab === "roster" && (
                    <RosterView playerData={playerData} />
                  )}

                  {activeTab === "achievements" && (
                    <>
                      <ComparePanel
                        playerData={playerData}
                        friendData={friendData}
                        friendLoading={friendLoading}
                        friendError={friendError}
                        compareMode={compareMode}
                        onFriendSearch={handleFriendSearch}
                        onClose={handleCloseCompare}
                      />
                      <Filters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                      />
                      <AchievementsGrid
                        achievements={filteredAchievements}
                        friendAchievements={compareMode && friendData ? friendData.achievements : null}
                      />
                    </>
                  )}
                </div>
              )}
            </main>

            <footer>
              Proyecto independiente, no afiliado a Riot Games. Valorant es marca registrada de Riot Games, Inc.
            </footer>
          </>
        )}
      </div>
    </div>
  );
}