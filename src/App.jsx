import React, { useState } from "react";
import Header from "./components/Header";
import ProfileBar from "./components/ProfileBar";
import StatsGrid from "./components/StatsGrid";
import Filters from "./components/Filters";
import AchievementsGrid from "./components/AchievementsGrid";
import { supabase } from "./services/supabaseClient";
import { getAccount, getMMR, getMatchHistory, aggregateStats } from "./services/statsEngine";
import { evaluateAchievements } from "./services/achievementEvaluator";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [playerData, setPlayerData] = useState(null);
  
  // Filtros de logros
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (name, tag) => {
    setLoading(true);
    setError("");
    setPlayerData(null);
    setActiveFilter("all");
    setSearchTerm("");

    try {
      // 1. Buscar jugador en Supabase (case-insensitive para nombre y tag)
      const { data: player, error: playerError } = await supabase
        .from("players")
        .select("*")
        .ilike("name", name)
        .ilike("tag", tag)
        .maybeSingle();

      if (playerError) {
        console.error("Error buscando jugador en Supabase:", playerError);
      }

      if (player) {
        // 2. Jugador encontrado: traer estadísticas (último snapshot)
        const { data: snapshot, error: snapError } = await supabase
          .from("player_stats_snapshots")
          .select("stats")
          .eq("puuid", player.puuid)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (snapError) {
          console.error("Error buscando snapshot en Supabase:", snapError);
        }

        if (snapshot && snapshot.stats) {
          // Evaluar logros localmente con las estadísticas persistidas
          const achievements = evaluateAchievements(snapshot.stats);
          const unlockedCount = achievements.filter((a) => a.unlocked).length;

          setPlayerData({
            account: {
              puuid: player.puuid,
              name: player.name,
              tag: player.tag,
              region: player.region,
              account_level: player.account_level,
            },
            stats: snapshot.stats,
            achievements,
            summary: {
              total: achievements.length,
              unlocked: unlockedCount,
              percent: Math.round((unlockedCount / achievements.length) * 100),
            },
          });
          setLoading(false);
          return;
        }
      }

      // 3. No encontrado o sin snapshot: consultar API y guardar
      await fetchAndSaveFromApi(name, tag);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Error al buscar el jugador. Verificá los datos e intentá de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!playerData || !playerData.account) return;
    const { name, tag } = playerData.account;
    
    setRefreshing(true);
    setError("");

    try {
      await fetchAndSaveFromApi(name, tag);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Error al actualizar los datos de la API de Valorant."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAndSaveFromApi = async (name, tag) => {
    // A. Consultar la API de HenrikDev
    const account = await getAccount(name, tag);
    const region = account.region;

    let mmr = null;
    try {
      mmr = await getMMR(region, name, tag);
    } catch (e) {
      console.warn("No se pudo obtener el MMR:", e.message);
    }

    const matches = await getMatchHistory(region, name, tag, 20);

    // B. Procesar estadísticas y evaluar logros
    const stats = aggregateStats(account, mmr, matches);
    const achievements = evaluateAchievements(stats);
    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    const formattedData = {
      account: {
        puuid: account.puuid,
        name: account.name,
        tag: account.tag,
        region,
        account_level: account.account_level,
      },
      stats,
      achievements,
      summary: {
        total: achievements.length,
        unlocked: unlockedCount,
        percent: Math.round((unlockedCount / achievements.length) * 100),
      },
    };

    // C. Guardar en Supabase (best-effort, si falla igual mostramos los datos al usuario)
    try {
      await supabase.from("players").upsert({
        puuid: account.puuid,
        name: account.name,
        tag: account.tag,
        region,
        account_level: account.account_level,
        last_updated: new Date().toISOString(),
      });

      await supabase.from("player_stats_snapshots").insert({
        puuid: account.puuid,
        stats,
      });

      const unlockedRows = achievements
        .filter((a) => a.unlocked)
        .map((a) => ({ puuid: account.puuid, achievement_id: a.id }));

      if (unlockedRows.length > 0) {
        await supabase
          .from("player_achievements")
          .upsert(unlockedRows, { onConflict: "puuid,achievement_id", ignoreDuplicates: true });
      }
    } catch (dbErr) {
      console.warn("Error guardando datos en Supabase:", dbErr.message);
    }

    setPlayerData(formattedData);
  };

  // Filtrado de logros para renderizar
  const filteredAchievements = playerData
    ? playerData.achievements.filter((ach) => {
        // Filtro por tipo (unlocked/locked/all)
        if (activeFilter === "unlocked" && !ach.unlocked) return false;
        if (activeFilter === "locked" && ach.unlocked) return false;

        // Filtro de búsqueda por texto (nombre o descripción)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchesName = ach.name.toLowerCase().includes(term);
          const matchesDesc = ach.desc.toLowerCase().includes(term);
          return matchesName || matchesDesc;
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
            Escaneando historial de combate...
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

            <StatsGrid stats={playerData.stats} />

            <Filters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />

            <AchievementsGrid achievements={filteredAchievements} />
          </div>
        )}
      </main>

      <footer>
        Proyecto independiente, no afiliado a Riot Games. Valorant es marca registrada de Riot Games, Inc.
      </footer>
    </div>
  );
}
