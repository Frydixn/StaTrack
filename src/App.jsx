// src/App.jsx — REEMPLAZA EL ARCHIVO COMPLETO

import React, { useState } from "react";
import Header from "./components/Header";
import ProfileBar from "./components/ProfileBar";
import ActStatsBar from "./components/ActStatsBar";
import StatsGrid from "./components/StatsGrid";
import MapAgentsPanel from "./components/MapAgentsPanel";
import Filters from "./components/Filters";
import AchievementsGrid from "./components/AchievementsGrid";
import ComparePanel from "./components/ComparePanel";
import { supabase } from "./services/supabaseClient";
import {
  getAccount, getMMR, getMMRHistory,
  getFullMatchHistory, aggregateStats, buildActStats,
} from "./services/statsEngine";
import { evaluateAchievements } from "./services/achievementEvaluator";

// ─── Helper: carga completa desde API ────────────────────────────────────────

async function fetchPlayerFull(name, tag) {
  const account = await getAccount(name, tag);
  const region = account.region;

  let mmr = null, mmrHistory = [];
  try {
    [mmr, mmrHistory] = await Promise.all([
      getMMR(region, name, tag),
      getMMRHistory(region, name, tag),
    ]);
  } catch (e) {
    console.warn("MMR no disponible:", e.message);
  }

  const matches = await getFullMatchHistory(region, name, tag);
  const stats = aggregateStats(account, mmr, matches);
  const actStats = buildActStats(mmr);
  const achievements = evaluateAchievements(stats);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return {
    account: {
      puuid: account.puuid, name: account.name,
      tag: account.tag, region, account_level: account.account_level,
    },
    stats, actStats, mmrHistory, achievements,
    summary: {
      total: achievements.length, unlocked: unlockedCount,
      percent: Math.round((unlockedCount / achievements.length) * 100),
    },
  };
}

// ─── Helper: guardar en Supabase ──────────────────────────────────────────────

async function saveToSupabase(playerData) {
  const { account, stats, achievements } = playerData;
  try {
    await supabase.from("players").upsert({
      puuid: account.puuid, name: account.name, tag: account.tag,
      region: account.region, account_level: account.account_level,
      last_updated: new Date().toISOString(),
    });
    await supabase.from("player_stats_snapshots").insert({ puuid: account.puuid, stats });

    const unlockedRows = achievements
      .filter((a) => a.unlocked)
      .map((a) => ({ puuid: account.puuid, achievement_id: a.id }));
    if (unlockedRows.length > 0) {
      await supabase.from("player_achievements")
        .upsert(unlockedRows, { onConflict: "puuid,achievement_id", ignoreDuplicates: true });
    }
  } catch (dbErr) {
    console.warn("Error guardando en Supabase:", dbErr.message);
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function App() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Comparación
  const [compareMode, setCompareMode] = useState(false);
  const [friendData, setFriendData] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendError, setFriendError] = useState("");

  const handleSearch = async (name, tag) => {
    setLoading(true);
    setError("");
    setPlayerData(null);
    setFriendData(null);
    setCompareMode(false);
    setActiveFilter("all");
    setSearchTerm("");

    try {
      // Intentar Supabase primero
      const { data: player } = await supabase
        .from("players").select("*")
        .ilike("name", name).ilike("tag", tag).maybeSingle();

      if (player) {
        const { data: snapshot } = await supabase
          .from("player_stats_snapshots").select("stats")
          .eq("puuid", player.puuid)
          .order("created_at", { ascending: false })
          .limit(1).maybeSingle();

        if (snapshot?.stats) {
          const achievements = evaluateAchievements(snapshot.stats);
          const unlockedCount = achievements.filter((a) => a.unlocked).length;
          setPlayerData({
            account: { puuid: player.puuid, name: player.name, tag: player.tag, region: player.region, account_level: player.account_level },
            stats: snapshot.stats, actStats: snapshot.stats.actStats || null, mmrHistory: [],
            achievements,
            summary: { total: achievements.length, unlocked: unlockedCount, percent: Math.round((unlockedCount / achievements.length) * 100) },
          });
          setLoading(false);
          return;
        }
      }

      const result = await fetchPlayerFull(name, tag);
      await saveToSupabase(result);
      setPlayerData(result);
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
      const result = await fetchPlayerFull(name, tag);
      await saveToSupabase(result);
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
      const result = await fetchPlayerFull(name, tag);
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
    <div className="app-container">
      <div className="noise-bar"></div>
      <Header onSearch={handleSearch} loading={loading} />

      <main>
        {loading && (
          <div className="state-msg loading-msg">
            <div className="loading-spinner"></div>
            Escaneando trayectoria competitiva de combate...
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
              Esto puede tardar unos segundos — cargamos hasta 100 partidas competitivas
            </span>
          </div>
        )}

        {error && <div className="state-msg error">{error}</div>}

        {!loading && !error && !playerData && (
          <div className="state-msg">Esperando un Riot ID para empezar a escanear...</div>
        )}

        {!loading && playerData && (
          <div className="results-container">
            <ProfileBar
              account={playerData.account}
              summary={playerData.summary}
              rank={playerData.stats.rankTier}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />

            {playerData.actStats && <ActStatsBar actStats={playerData.actStats} />}

            <StatsGrid stats={playerData.stats} />

            {playerData.stats.agentsByMap && Object.keys(playerData.stats.agentsByMap).length > 0 && (
              <MapAgentsPanel agentsByMap={playerData.stats.agentsByMap} />
            )}

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
          </div>
        )}
      </main>

      <footer>
        Proyecto independiente, no afiliado a Riot Games. Valorant es marca registrada de Riot Games, Inc.
      </footer>
    </div>
  );
}