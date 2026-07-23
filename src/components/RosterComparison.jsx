import React, { useState, useEffect } from "react";
import { calculateAllRosterPairs, calculateAgentStatsByPlayer } from "../utils/synergyCalculations";
import { calculateRosterMapStats } from "../utils/mapStatsCalculations";
import { filtrarPorRango } from "../utils/dateRangeFilter";
import DateRangeSelector from "./DateRangeSelector";
import { Swords, Users, Map, Award, ShieldAlert } from "lucide-react";
import MapasTab from "./MapasTab";
import AgentRoleBreakdown from "./AgentRoleBreakdown";

export default function RosterComparison({ rosters, matches, activePuuid }) {
  const [rosterAId, setRosterAId] = useState("");
  const [rosterBId, setRosterBId] = useState("");
  const [dateRange, setDateRange] = useState("all");

  // Default selections
  useEffect(() => {
    if (rosters.length > 0) {
      if (!rosterAId) setRosterAId(rosters[0].id);
      if (!rosterBId) setRosterBId(rosters[1]?.id || rosters[0].id);
    }
  }, [rosters]);

  const rosterA = rosters.find(r => r.id === rosterAId);
  const rosterB = rosters.find(r => r.id === rosterBId);

  // Apply date range filter globally to matches
  const filteredMatches = filtrarPorRango(matches, dateRange);

  // Helper function to compute all stats for a single roster
  const getRosterStats = (roster) => {
    if (!roster) return null;

    const pairsSynergy = calculateAllRosterPairs(filteredMatches, roster);
    const mapStats = calculateRosterMapStats(filteredMatches, roster);

    const agentStatsMap = {};
    for (const player of roster.players) {
      agentStatsMap[player.puuid] = calculateAgentStatsByPlayer(filteredMatches, player.puuid);
    }

    return {
      pairsSynergy,
      mapStats,
      agentStatsMap
    };
  };

  const statsA = getRosterStats(rosterA);
  const statsB = getRosterStats(rosterB);

  const renderRosterColumn = (roster, stats) => {
    if (!roster) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--text-dim)" }}>
          Roster no seleccionado.
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Players & Roles summary */}
        <div style={{
          background: "rgba(255,255,255,0.01)",
          border: "1px solid var(--line)",
          borderRadius: "6px",
          padding: "12px 16px"
        }}>
          <h4 className="font-oswald" style={{ color: "white", fontSize: "12px", letterSpacing: "0.5px", marginBottom: "8px" }}>
            JUGADORES ({roster.players?.length || 0})
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {roster.players?.map(p => (
              <span key={p.puuid} style={{
                fontSize: "10px",
                padding: "3px 8px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                color: "white"
              }}>
                {p.riotId} <span style={{ color: "var(--red)", fontSize: "9px" }}>{p.role ? `· ${p.role.toUpperCase()}` : ""}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Synergy matrix summary */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--line)", paddingBottom: "12px", marginBottom: "12px" }}>
            <Users size={18} color="var(--red)" />
            <h3 className="font-oswald" style={{ color: "white", fontSize: "16px", margin: 0, letterSpacing: "0.5px" }}>
              Sinergia de Parejas (Dúos)
            </h3>
          </div>
          
          {!stats?.pairsSynergy || stats.pairsSynergy.length === 0 ? (
            <div style={{ fontSize: "11px", color: "var(--text-dim)", padding: "10px 0", fontStyle: "italic" }}>
              No se encontraron dúos jugando juntos en el historial.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
              {stats.pairsSynergy.map((pair) => {
                const winrateColor = pair.winrate >= 60 
                  ? "#10b981" 
                  : pair.winrate >= 45 
                    ? "white" 
                    : "#ff4655";

                return (
                  <div
                    key={pair.key}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--line)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="font-oswald" style={{ color: "white", fontSize: "12px", letterSpacing: "0.5px" }}>
                        {pair.p1RiotId.split("#")[0]} + {pair.p2RiotId.split("#")[0]}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                        {pair.games} {pair.games === 1 ? "partida" : "partidas"}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                        <span style={{ color: "var(--text-dim)" }}>Winrate</span>
                        <span style={{ fontWeight: "bold", color: winrateColor }}>{pair.winrate}%</span>
                      </div>
                      <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                        <div style={{
                          width: `${pair.winrate}%`,
                          height: "100%",
                          background: winrateColor
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Map winrates summary */}
        <div>
          <MapasTab mapStats={stats?.mapStats || []} />
        </div>

        {/* Agent/Role Breakdown */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--line)", paddingBottom: "12px", marginBottom: "12px" }}>
            <Award size={18} color="var(--red)" />
            <h3 className="font-oswald" style={{ color: "white", fontSize: "16px", margin: 0, letterSpacing: "0.5px" }}>
              Desglose de Agentes por Rol
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {roster.players?.map((player) => (
              <AgentRoleBreakdown
                key={player.puuid}
                player={player}
                agentStats={stats?.agentStatsMap[player.puuid] || []}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Selection Control Panel */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
        padding: "16px",
        borderRadius: "6px",
        border: "1px solid var(--line)",
        gap: "20px",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {/* Select Roster A */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="font-oswald" style={{ color: "var(--text-dim)", fontSize: "11px" }}>ROSTER A:</span>
            <select
              value={rosterAId}
              onChange={(e) => setRosterAId(e.target.value)}
              className="font-oswald"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                color: "white",
                padding: "6px 12px",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
                minWidth: "160px"
              }}
            >
              {rosters.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <span className="font-oswald" style={{ color: "var(--red)", fontSize: "14px" }}>VS</span>

          {/* Select Roster B */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="font-oswald" style={{ color: "var(--text-dim)", fontSize: "11px" }}>ROSTER B:</span>
            <select
              value={rosterBId}
              onChange={(e) => setRosterBId(e.target.value)}
              className="font-oswald"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                color: "white",
                padding: "6px 12px",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
                minWidth: "160px"
              }}
            >
              {rosters.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Date Filter */}
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {rosters.length < 2 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(234,179,8,0.1)",
          border: "1px solid rgba(234,179,8,0.2)",
          padding: "12px",
          borderRadius: "6px",
          color: "#eab308",
          fontSize: "13px"
        }}>
          <ShieldAlert size={16} />
          Crea al menos 2 rosters en el panel de administración para poder compararlos lado a lado.
        </div>
      )}

      {/* Side-by-side comparison columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px"
      }}>
        {/* Column A */}
        <div style={{ borderRight: "1px solid var(--line)", paddingRight: "12px" }}>
          <h3 className="font-oswald" style={{
            color: "var(--red)",
            fontSize: "18px",
            borderBottom: "2px solid var(--red)",
            paddingBottom: "8px",
            marginBottom: "16px",
            textTransform: "uppercase"
          }}>
            {rosterA?.name || "Roster A"}
          </h3>
          {renderRosterColumn(rosterA, statsA)}
        </div>

        {/* Column B */}
        <div>
          <h3 className="font-oswald" style={{
            color: "#3b82f6",
            fontSize: "18px",
            borderBottom: "2px solid #3b82f6",
            paddingBottom: "8px",
            marginBottom: "16px",
            textTransform: "uppercase"
          }}>
            {rosterB?.name || "Roster B"}
          </h3>
          {renderRosterColumn(rosterB, statsB)}
        </div>
      </div>
    </div>
  );
}
