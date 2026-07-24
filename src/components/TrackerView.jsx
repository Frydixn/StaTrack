import React, { useState, useEffect } from "react";
import InsightCard from "./InsightCard";
import ActTrendChart from "./ActTrendChart";
import RankComparisonChart from "./RankComparisonChart";
import RecommendationsSection from "./RecommendationsSection";
import MatchHistoryPanel from "./MatchHistoryPanel";
import { generateTrackerData } from "../services/trackerEngine";
import { aggregateStats } from "../services/statsEngine";
import { BarChart3, AlertCircle, Calendar, Filter, X, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TrackerView({ playerData }) {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [dateError, setDateError] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [agentIcons, setAgentIcons] = useState({});

  const handleCustomDateChange = (start, end) => {
    setCustomStart(start);
    setCustomEnd(end);
    setDateError("");

    const minDateLimit = new Date("2020-06-02").getTime();
    const todayLimit = new Date().setHours(23, 59, 59, 999);

    if (start) {
      const startMs = new Date(start).getTime();
      if (startMs < minDateLimit) {
        setDateError(t("tracker.date_error_launch"));
        return;
      }
    }

    if (end) {
      const endMs = new Date(end).getTime();
      if (endMs > todayLimit) {
        setDateError(t("tracker.date_error_future"));
        return;
      }
    }

    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const diffTime = endDateObj.getTime() - startDateObj.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays < 0) {
        setDateError(t("tracker.date_error_order"));
      } else if (diffDays > 7) {
        setDateError(t("tracker.date_error_limit"));
      }
    }
  };

  const handleCustomStartSelect = (startVal) => {
    setDateError("");
    setCustomStart(startVal);

    const minDateLimit = new Date("2020-06-02").getTime();
    if (startVal) {
      const startDateObj = new Date(startVal);
      if (startDateObj.getTime() < minDateLimit) {
        setDateError(t("tracker.date_error_launch"));
        return;
      }

      const futureDateObj = new Date(startDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
      const today = new Date();
      const targetDateObj = futureDateObj > today ? today : futureDateObj;
      const formattedFuture = targetDateObj.toISOString().split('T')[0];
      setCustomEnd(formattedFuture);
    }
  };

  useEffect(() => {
    fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true")
      .then((res) => res.json())
      .then((resJson) => {
        const mapping = {};
        if (resJson.data) {
          resJson.data.forEach((agent) => {
            mapping[agent.displayName.toLowerCase()] = agent.displayIcon;
          });
        }
        setAgentIcons(mapping);
      })
      .catch((err) => console.warn("Error fetching agent icons in TrackerView:", err));
  }, []);

  if (!playerData) return null;

  const matches = playerData.matches || [];
  const latestMatch = matches[0];
  const latestSeason = latestMatch?.metadata?.season_id;

  const filteredMatches = matches.filter((m) => {
    if (dateError) return false; // si el rango es inválido, no mostramos ninguna partida
    if (dateRange === "all") return true;
    const gameStartMs = (m.metadata?.game_start || 0) * 1000;
    if (dateRange === "month") {
      return gameStartMs >= Date.now() - 30 * 24 * 60 * 60 * 1000;
    }
    if (dateRange === "act") {
      return m.metadata?.season_id === latestSeason;
    }
    if (dateRange === "custom") {
      if (!customStart || !customEnd) return true;
      const startMs = new Date(customStart).getTime();
      const endMs = new Date(customEnd).getTime() + 24 * 60 * 60 * 1000 - 1;
      return gameStartMs >= startMs && gameStartMs <= endMs;
    }
    return true;
  });

  const hasMatches = filteredMatches.length > 0;

  const computedStats = hasMatches
    ? aggregateStats(playerData.account, playerData.stats.mmr, filteredMatches)
    : {
      ...playerData.stats,
      kdRatio: 0,
      headshotPct: 0,
      winrate: 0,
      totalDamage: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      matchesPlayed: 0,
      trend: []
    };

  const computedPlayerData = {
    ...playerData,
    stats: computedStats,
    matches: filteredMatches
  };

  const trackerData = generateTrackerData(computedPlayerData);
  const { benchmarks, insights, recommendations, rankGroup } = trackerData;

  const strengths = insights.filter((ins) => ins.type === "strength");
  const weaknesses = insights.filter((ins) => ins.type === "weakness");

  // Get Top 3 played agents for the filtered matches
  const topAgents = (() => {
    if (!filteredMatches.length) return [];
    const agentData = {};
    filteredMatches.forEach((m) => {
      const me = m.players?.all_players?.find((p) => p.puuid === playerData.account.puuid);
      if (!me) return;
      const agent = me.character || "Unknown";
      const myTeam = me.team?.toLowerCase();
      const won = m.teams?.[myTeam]?.has_won ?? false;
      if (!agentData[agent]) {
        agentData[agent] = { games: 0, wins: 0 };
      }
      agentData[agent].games += 1;
      if (won) agentData[agent].wins += 1;
    });

    return Object.entries(agentData)
      .map(([name, s]) => ({
        name,
        games: s.games,
        winrate: Math.round((s.wins / s.games) * 100)
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 3);
  })();

  const getRangeLabel = () => {
    if (dateRange === "all") return t("tracker.opt_all");
    if (dateRange === "month") return t("tracker.opt_month");
    if (dateRange === "act") return t("tracker.opt_act");
    if (dateRange === "custom") {
      if (customStart && customEnd) {
        return `${customStart} - ${customEnd}`;
      }
      return t("tracker.opt_custom");
    }
    return t("tracker.opt_all");
  };

  const winsCount = filteredMatches.filter((m) => {
    const me = m.players?.all_players?.find((p) => p.puuid === playerData.account.puuid);
    if (!me) return false;
    const myTeam = me.team?.toLowerCase();
    return m.teams?.[myTeam]?.has_won ?? false;
  }).length;
  const lossesCount = computedStats.matchesPlayed - winsCount;

  const avgAcs = (() => {
    if (!filteredMatches.length) return 0;
    let totalScore = 0;
    filteredMatches.forEach((m) => {
      const me = m.players?.all_players?.find((p) => p.puuid === playerData.account.puuid);
      totalScore += me?.stats?.score || 0;
    });
    return Math.round(totalScore / filteredMatches.length);
  })();

  const adr = (() => {
    if (!filteredMatches.length) return 0;
    let totalRoundsPlayed = 0;
    filteredMatches.forEach((m) => {
      totalRoundsPlayed += m.metadata?.rounds_played || 0;
    });
    return totalRoundsPlayed > 0
      ? Math.round(computedStats.totalDamage / totalRoundsPlayed)
      : (computedStats.matchesPlayed > 0 ? Math.round(computedStats.totalDamage / (computedStats.matchesPlayed * 20)) : 0);
  })();

  const kadRatio = (() => {
    const deaths = computedStats.totalDeaths || 0;
    const killsAndAssists = (computedStats.totalKills || 0) + (computedStats.totalAssists || 0);
    return deaths > 0 ? (killsAndAssists / deaths).toFixed(2) : killsAndAssists.toFixed(2);
  })();

  const firstBloods = (() => {
    if (!filteredMatches.length) return 0;
    let fbCount = 0;
    filteredMatches.forEach((m) => {
      const matchKills = m.kills || [];
      const killsByRound = {};
      matchKills.forEach((k) => {
        const r = k.round;
        if (!killsByRound[r]) {
          killsByRound[r] = [];
        }
        killsByRound[r].push(k);
      });

      Object.values(killsByRound).forEach((roundKills) => {
        if (!roundKills.length) return;
        roundKills.sort((a, b) => (a.kill_time_in_round || a.kill_time || 0) - (b.kill_time_in_round || b.kill_time || 0));
        const firstKill = roundKills[0];
        if (firstKill.killer_puuid === playerData.account.puuid) {
          fbCount += 1;
        }
      });
    });
    return fbCount;
  })();

  const AGENT_ROLES = {
    "jett": "Duelist", "raze": "Duelist", "neon": "Duelist", "yoru": "Duelist", "phoenix": "Duelist", "reyna": "Duelist", "iso": "Duelist",
    "fade": "Initiator", "sova": "Initiator", "breach": "Initiator", "skye": "Initiator", "kay/o": "Initiator", "kayo": "Initiator", "gekko": "Initiator",
    "omen": "Controller", "brimstone": "Controller", "viper": "Controller", "astra": "Controller", "harbor": "Controller", "clove": "Controller", "miks": "Controller",
    "sage": "Sentinel", "cypher": "Sentinel", "killjoy": "Sentinel", "chamber": "Sentinel", "deadlock": "Sentinel", "vyse": "Sentinel"
  };

  const periodRoles = (() => {
    if (!filteredMatches.length) return [];
    const roleData = {};
    filteredMatches.forEach((m) => {
      const me = m.players?.all_players?.find((p) => p.puuid === playerData.account.puuid);
      if (!me) return;
      const agentName = (me.character || "Unknown").toLowerCase();
      const role = AGENT_ROLES[agentName] || me.role?.displayName || "Other";
      const myTeam = me.team?.toLowerCase();
      const won = m.teams?.[myTeam]?.has_won ?? false;
      if (!roleData[role]) {
        roleData[role] = { games: 0, wins: 0 };
      }
      roleData[role].games += 1;
      if (won) roleData[role].wins += 1;
    });

    return Object.entries(roleData).map(([name, s]) => ({
      name,
      games: s.games,
      winrate: Math.round((s.wins / s.games) * 100)
    })).sort((a, b) => b.games - a.games);
  })();

  const topPeriodMaps = (() => {
    if (!filteredMatches.length) return [];
    const mapData = {};
    filteredMatches.forEach((m) => {
      const mapName = m.metadata?.map || "Unknown";
      const me = m.players?.all_players?.find((p) => p.puuid === playerData.account.puuid);
      if (!me) return;
      const myTeam = me.team?.toLowerCase();
      const won = m.teams?.[myTeam]?.has_won ?? false;

      if (!mapData[mapName]) {
        mapData[mapName] = { games: 0, wins: 0 };
      }
      mapData[mapName].games += 1;
      if (won) mapData[mapName].wins += 1;
    });

    return Object.entries(mapData)
      .map(([name, s]) => ({
        name,
        games: s.games,
        winrate: Math.round((s.wins / s.games) * 100)
      }))
      .sort((a, b) => {
        if (b.winrate !== a.winrate) {
          return b.winrate - a.winrate;
        }
        return b.games - a.games;
      })
      .slice(0, 3);
  })();


  return (
    <div className="tracker-view-container" style={{ position: "relative" }}>
      <div className="tracker-header-desc" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BarChart3 size={18} className="tracker-header-icon" />
          <div>
            <h2>{t("tracker.tactical_report")}</h2>
            <p style={{ margin: 0 }}>
              {t("tracker.tactical_desc")}
            </p>
          </div>
        </div>
        <div className="tracker-filter-wrap">
          <button
            className="filter-toggle-btn font-oswald"
            onClick={() => setIsFilterOpen(true)}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--line)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              letterSpacing: "1px",
              transition: "background 0.2s"
            }}
          >
            <Calendar size={14} style={{ color: "var(--red)" }} />
            {t("tracker.analysis_prefix")} {getRangeLabel()}
          </button>

          {isFilterOpen && (
            <div
              className="tracker-coach-modal-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(10, 12, 16, 0.9)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                backdropFilter: "blur(4px)"
              }}
            >
              <div
                className="tracker-coach-modal-content"
                style={{
                  width: "740px",
                  maxWidth: "95vw",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  padding: "24px",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
                  position: "relative"
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--line)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <BarChart3 size={18} style={{ color: "var(--red)" }} />
                    <span className="font-oswald" style={{ fontSize: "16px", letterSpacing: "1px", color: "white" }}>
                      {t("tracker.analysis_panel")} ({getRangeLabel()})
                    </span>
                  </div>
                  <X
                    size={20}
                    style={{ cursor: "pointer", color: "var(--text-dim)", hover: { color: "white" } }}
                    onClick={() => setIsFilterOpen(false)}
                  />
                </div>

                {/* Grid Structure */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Columna Izquierda: Rango + Coach Insight */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Time Selector */}
                    <div style={{ background: "var(--bg-card)", padding: "14px", borderRadius: "4px", border: "1px solid var(--line)" }}>
                      <div className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px", letterSpacing: "0.5px" }}>{t("tracker.period_label")}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {[
                          { id: "all", label: t("tracker.opt_all") },
                          { id: "custom", label: t("tracker.opt_custom") },
                          { id: "month", label: t("tracker.opt_month") },
                          { id: "act", label: t("tracker.opt_act") }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setDateRange(opt.id)}
                            className="font-oswald"
                            style={{
                              padding: "8px",
                              background: dateRange === opt.id ? "rgba(255, 70, 85, 0.15)" : "var(--bg)",
                              border: "1px solid " + (dateRange === opt.id ? "var(--red)" : "var(--line)"),
                              borderRadius: "3px",
                              color: dateRange === opt.id ? "var(--red)" : "var(--text)",
                              cursor: "pointer",
                              fontSize: "11px",
                              letterSpacing: "0.5px"
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {dateRange === "custom" && (
                        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <div style={{ flex: 1 }}>
                              <label className="font-oswald" style={{ fontSize: "9px", color: "var(--text-dim)", display: "block", marginBottom: "4px", letterSpacing: "0.5px" }}>{t("tracker.start_day")}</label>
                              <input
                                type="date"
                                min="2020-06-02"
                                max={new Date().toISOString().split('T')[0]}
                                value={customStart}
                                onChange={(e) => handleCustomStartSelect(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  background: "rgba(10, 12, 16, 0.6)",
                                  border: "1px solid rgba(255, 70, 85, 0.4)",
                                  borderRadius: "4px",
                                  color: "white",
                                  fontSize: "11px",
                                  fontFamily: "Oswald, sans-serif",
                                  outline: "none",
                                  boxShadow: "0 0 5px rgba(255, 70, 85, 0.1)"
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label className="font-oswald" style={{ fontSize: "9px", color: "var(--text-dim)", display: "block", marginBottom: "4px", letterSpacing: "0.5px" }}>{t("tracker.end_day")}</label>
                              <input
                                type="date"
                                min="2020-06-02"
                                max={new Date().toISOString().split('T')[0]}
                                value={customEnd}
                                onChange={(e) => handleCustomDateChange(customStart, e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  background: "rgba(10, 12, 16, 0.6)",
                                  border: "1px solid rgba(255, 70, 85, 0.4)",
                                  borderRadius: "4px",
                                  color: "white",
                                  fontSize: "11px",
                                  fontFamily: "Oswald, sans-serif",
                                  outline: "none",
                                  boxShadow: "0 0 5px rgba(255, 70, 85, 0.1)"
                                }}
                              />
                            </div>
                          </div>
                          {dateError && (
                            <div className="font-oswald" style={{ color: "var(--red)", fontSize: "10px", marginTop: "2px", letterSpacing: "0.5px" }}>
                              ⚠️ {dateError.toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>


                    {/* Winrate Record */}
                    <div style={{ background: "var(--bg-card)", padding: "14px", borderRadius: "4px", border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)", letterSpacing: "0.5px" }}>{t("match_history.title")}</div>
                        <div className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)", letterSpacing: "0.5px" }}>{t("general.matches", { count: computedStats.matchesPlayed }).toUpperCase()}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="font-oswald" style={{ fontSize: "20px", color: computedStats.winrate >= 50 ? "var(--cyan)" : "white" }}>
                          {computedStats.winrate.toFixed(1)}% WR
                        </span>
                        <span className="font-oswald" style={{ fontSize: "14px", color: "var(--text-dim)" }}>
                          <span style={{ color: "var(--cyan)" }}>{winsCount}W</span> - <span style={{ color: "var(--red)" }}>{lossesCount}L</span>
                        </span>
                      </div>
                    </div>
                    {/* Roles Statistics */}
                    <div style={{ background: "var(--bg-card)", padding: "14px", borderRadius: "4px", border: "1px solid var(--line)" }}>
                      <div className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px", letterSpacing: "0.5px" }}>{t("tracker.role_stats")}</div>
                      {periodRoles.length === 0 ? (
                        <div style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "center", padding: "6px 0" }}>{t("tracker.no_roles_data")}</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {periodRoles.map((role) => (
                            <div key={role.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: "rgba(255,255,255,0.02)", borderRadius: "2px" }}>
                              <span className="font-oswald" style={{ fontSize: "12px", color: "white" }}>{role.name.toUpperCase()}</span>
                              <span className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                <span style={{ color: "white" }}>{role.games}G</span> · {role.winrate}% WR
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Derecha: Combat Stats + Distribution */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Performance Overview */}
                    <div style={{ background: "var(--bg-card)", padding: "14px", borderRadius: "4px", border: "1px solid var(--line)" }}>
                      <div className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "10px", letterSpacing: "0.5px" }}>{t("general.combat_performance")}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--text-dim)", display: "block" }}>K/D RATIO</span>
                          <span className="font-oswald" style={{ fontSize: "16px", color: computedStats.kdRatio >= 1.0 ? "var(--cyan)" : "white" }}>
                            {computedStats.kdRatio.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--text-dim)", display: "block" }}>HEADSHOT%</span>
                          <span className="font-oswald" style={{ fontSize: "16px" }}>{computedStats.headshotPct.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--text-dim)", display: "block" }}>KAD RATIO</span>
                          <span className="font-oswald" style={{ fontSize: "16px" }}>{kadRatio}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--text-dim)", display: "block" }}>{t("general.adr")}</span>
                          <span className="font-oswald" style={{ fontSize: "16px" }}>{adr}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--text-dim)", display: "block" }}>{t("general.aces")}</span>
                          <span className="font-oswald" style={{ fontSize: "16px" }}>{computedStats.aces}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "9px", color: "var(--text-dim)", display: "block" }}>{t("general.first_bloods")}</span>
                          <span className="font-oswald" style={{ fontSize: "16px" }}>{firstBloods}</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Agents */}
                    <div style={{ background: "var(--bg-card)", padding: "14px", borderRadius: "4px", border: "1px solid var(--line)" }}>
                      <div className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px", letterSpacing: "0.5px" }}>{t("tracker.top_agents")}</div>
                      {topAgents.length === 0 ? (
                        <div style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "center", padding: "6px 0" }}>{t("tracker.no_agents_data")}</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {topAgents.map((agent) => {
                            const iconUrl = agentIcons[agent.name.toLowerCase()];
                            return (
                              <div key={agent.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: "rgba(255,255,255,0.02)", borderRadius: "2px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--line)", overflow: "hidden" }}>
                                    {iconUrl && <img src={iconUrl} alt={agent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                                  </div>
                                  <span className="font-oswald" style={{ fontSize: "12px", color: "white" }}>{agent.name.toUpperCase()}</span>
                                </div>
                                <span className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                  <span style={{ color: "white" }}>{agent.games}G</span> · {agent.winrate}% WR
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Top Maps */}
                    <div style={{ background: "var(--bg-card)", padding: "14px", borderRadius: "4px", border: "1px solid var(--line)" }}>
                      <div className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px", letterSpacing: "0.5px" }}>{t("tracker.top_maps")}</div>
                      {topPeriodMaps.length === 0 ? (
                        <div style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "center", padding: "6px 0" }}>{t("tracker.no_maps_data")}</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {topPeriodMaps.map((m) => (
                            <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: "rgba(255,255,255,0.02)", borderRadius: "2px" }}>
                              <span className="font-oswald" style={{ fontSize: "12px", color: "white" }}>{m.name.toUpperCase()}</span>
                              <span className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                <span style={{ color: "white" }}>{m.games}G</span> · <span style={{ color: m.winrate >= 50 ? "var(--cyan)" : "var(--text-dim)" }}>{m.winrate}% WR</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close Button Bottom */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="font-oswald"
                    style={{
                      background: "var(--red)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 24px",
                      letterSpacing: "1px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {t("general.understood").toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasMatches ? (
        <div className="match-history-empty" style={{ margin: "40px 0", padding: "40px", textAlign: "center" }}>
          <AlertCircle size={32} className="empty-icon" style={{ marginBottom: "12px", color: "var(--red)" }} />
          <p className="font-oswald" style={{ fontSize: "18px", margin: "0 0 6px 0" }}>{t("match_history.empty").toUpperCase()}</p>
          <p style={{ color: "var(--text-dim)", margin: 0 }}>{t("tracker.no_matches_range")}</p>
        </div>
      ) : (
        <>
          <div className="tracker-grid">
            <div className="tracker-column">
              <div className="column-title">{t("tracker.strengths").toUpperCase()}</div>
              <div className="insights-list">
                {strengths.length === 0 ? (
                  <div className="state-msg-small">{t("tracker.no_strengths")}</div>
                ) : (
                  strengths.map((ins, i) => <InsightCard key={i} insight={ins} />)
                )}
              </div>
            </div>

            <div className="tracker-column">
              <div className="column-title">{t("tracker.focus_areas").toUpperCase()}</div>
              <div className="insights-list">
                {weaknesses.length === 0 ? (
                  <div className="state-msg-small">{t("tracker.no_weaknesses")}</div>
                ) : (
                  weaknesses.map((ins, i) => <InsightCard key={i} insight={ins} />)
                )}
              </div>
            </div>
          </div>

          <div className="tracker-charts-row">
            <RankComparisonChart benchmarks={benchmarks} rankGroup={rankGroup} />
            <ActTrendChart trendData={computedStats.trend} />
          </div>

          <RecommendationsSection recommendations={recommendations} />

          <MatchHistoryPanel matches={filteredMatches} puuid={playerData.account?.puuid} />
        </>
      )}
    </div>
  );
}
