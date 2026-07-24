import React, { useState, useEffect } from "react";
import {
  Swords, Zap, Cloud, Shield, Search, Info
} from "lucide-react";
import axios from "axios";
import { RANK_ORDER } from "../services/achievementEvaluator";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function RoleIcon({ role, className }) {
  if (role === "Duelist") return <Swords className={className} size={20} />;
  if (role === "Initiator") return <Zap className={className} size={20} />;
  if (role === "Controller") return <Cloud className={className} size={20} />;
  if (role === "Sentinel") return <Shield className={className} size={20} />;
  return <Swords className={className} size={20} />;
}

export default function CompareView({ playerData, onSearch, loadProfile }) {
  const { t } = useTranslation();
  const [rivalTab, setRivalTab] = useState("friend"); // "friend" | "pro"
  const [rivalData, setRivalData] = useState(null);
  const [rivalLoading, setRivalLoading] = useState(false);
  const [rivalError, setRivalError] = useState("");
  const [compareTab, setCompareTab] = useState("stats"); // "stats" | "radar"

  // Pro Players States
  const [pros, setPros] = useState([]);
  const [prosLoading, setProsLoading] = useState(false);
  const [selectedProId, setSelectedProId] = useState(null);

  // Friend Search State
  const [friendInput, setFriendInput] = useState("");

  // Fetch Pros from Backend Proxy
  useEffect(() => {
    async function fetchPros() {
      if (rivalTab === "pro") {
        setProsLoading(true);
        try {
          const { data } = await axios.get(`${API_BASE}/api/db/pros`);
          if (data) {
            setPros(data);
          }
        } catch (err) {
          console.error("Error fetching pro players:", err.message);
        } finally {
          setProsLoading(false);
        }
      }
    }
    fetchPros();
  }, [rivalTab]);

  const handleFriendSearchSubmit = async (e) => {
    e.preventDefault();
    const raw = friendInput.trim();
    if (!raw.includes("#")) {
      setRivalError(t("header.error_format"));
      return;
    }
    const [name, tag] = raw.split("#");
    if (!name || !tag) {
      setRivalError(t("header.error_format"));
      return;
    }
    setRivalError("");
    setRivalLoading(true);
    try {
      const data = await loadProfile(name, tag);
      if (data) {
        setRivalData(data);
      } else {
        setRivalError(t("compare.no_player_found"));
      }
    } catch (err) {
      setRivalError(err.message || t("compare.err_friend_profile"));
    } finally {
      setRivalLoading(false);
    }
  };

  const handleSelectPro = async (pro) => {
    setSelectedProId(pro.id);
    setRivalError("");
    setRivalLoading(true);
    try {
      const data = await loadProfile(pro.riot_name, pro.riot_tag);
      if (data) {
        setRivalData(data);
      } else {
        setRivalError(t("compare.err_pro_not_found", { name: pro.display_name }));
      }
    } catch (err) {
      setRivalError(t("compare.err_pro_not_found", { name: pro.display_name }));
    } finally {
      setRivalLoading(false);
    }
  };

  // Helper: best map calculation
  const getBestMap = (agentsByMap) => {
    if (!agentsByMap) return { map: "—", winrate: 0 };
    let best = { map: "—", winrate: 0 };
    for (const [mapName, agents] of Object.entries(agentsByMap)) {
      const totalGames = agents.reduce((s, a) => s + a.games, 0);
      const totalWins = agents.reduce((s, a) => s + a.wins, 0);
      if (totalGames < 3) continue;
      const wr = totalWins / totalGames;
      if (wr > best.winrate) best = { map: mapName, winrate: wr };
    }
    return best;
  };

  // Metrics configurations
  const getMetrics = () => {
    if (!playerData || !rivalData) return [];

    const meBestMap = getBestMap(playerData.stats.agentsByMap);
    const rivalBestMap = getBestMap(rivalData.stats.agentsByMap);

    return [
      {
        id: "kd",
        label: t("compare.metric_kd"),
        meVal: playerData.stats.kdRatio || 0,
        rivalVal: rivalData.stats.kdRatio || 0,
        higherIsBetter: true,
        useBar: true,
        format: (v) => v.toFixed(2)
      },
      {
        id: "winrate",
        label: t("compare.metric_winrate"),
        meVal: playerData.stats.winrate || 0,
        rivalVal: rivalData.stats.winrate || 0,
        higherIsBetter: true,
        useBar: true,
        format: (v) => v.toFixed(1) + "%"
      },
      {
        id: "hs",
        label: t("compare.metric_hs"),
        meVal: playerData.stats.headshotPct || 0,
        rivalVal: rivalData.stats.headshotPct || 0,
        higherIsBetter: true,
        useBar: true,
        format: (v) => v.toFixed(1) + "%"
      },
      {
        id: "adr",
        label: t("compare.metric_adr") + "*",
        meVal: playerData.stats.matchesPlayed > 0 ? Math.round(playerData.stats.totalDamage / playerData.stats.matchesPlayed) : 0,
        rivalVal: rivalData.stats.matchesPlayed > 0 ? Math.round(rivalData.stats.totalDamage / rivalData.stats.matchesPlayed) : 0,
        higherIsBetter: true,
        useBar: true,
        format: (v) => v.toString(),
        tooltip: t("compare.adr_tooltip", { defaultValue: "* Calculated as total damage / matches played" })
      },
      {
        id: "played",
        label: t("compare.metric_matches"),
        meVal: playerData.stats.matchesPlayed || 0,
        rivalVal: rivalData.stats.matchesPlayed || 0,
        higherIsBetter: true,
        useBar: true,
        noHighlight: true, // No Highlight colors
        format: (v) => v.toString()
      },
      {
        id: "kills",
        label: t("compare.metric_kills"),
        meVal: playerData.stats.totalKills || 0,
        rivalVal: rivalData.stats.totalKills || 0,
        higherIsBetter: true,
        useBar: true,
        format: (v) => v.toLocaleString()
      },
      {
        id: "deaths",
        label: t("compare.metric_deaths"),
        meVal: playerData.stats.totalDeaths || 0,
        rivalVal: rivalData.stats.totalDeaths || 0,
        higherIsBetter: false,
        useBar: true,
        format: (v) => v.toLocaleString()
      },
      {
        id: "assists",
        label: t("compare.metric_assists"),
        meVal: playerData.stats.totalAssists || 0,
        rivalVal: rivalData.stats.totalAssists || 0,
        higherIsBetter: true,
        useBar: true,
        format: (v) => v.toLocaleString()
      },
      {
        id: "rank",
        label: t("compare.metric_rank"),
        meVal: playerData.stats.rankTier || t("profile.unranked"),
        rivalVal: rivalData.stats.rankTier || t("profile.unranked"),
        useBar: false,
        compareRank: true,
        format: (v) => v
      },
      {
        id: "agent",
        label: t("compare.metric_agent"),
        meVal: playerData.stats.mostPlayedAgent || "—",
        rivalVal: rivalData.stats.mostPlayedAgent || "—",
        useBar: false,
        noHighlight: true,
        format: (v) => v
      },
      {
        id: "bestmap",
        label: t("compare.metric_best_map"),
        meVal: meBestMap,
        rivalVal: rivalBestMap,
        useBar: false,
        noHighlight: true,
        format: (v) => v.map === "—" ? "—" : `${v.map} (${Math.round(v.winrate * 100)}%)`
      }
    ];
  };

  // Helper to compare ranks
  const getRankWinner = (meRank, rivalRank) => {
    const meIdx = RANK_ORDER.indexOf(meRank);
    const rivalIdx = RANK_ORDER.indexOf(rivalRank);
    if (meIdx === rivalIdx) return null;
    return meIdx > rivalIdx ? "me" : "rival";
  };

  // Generate Radar Chart Math
  const renderRadarChart = () => {
    if (!playerData || !rivalData) return null;

    const meKPG = playerData.stats.matchesPlayed > 0 ? playerData.stats.totalKills / playerData.stats.matchesPlayed : 0;
    const rivalKPG = rivalData.stats.matchesPlayed > 0 ? rivalData.stats.totalKills / rivalData.stats.matchesPlayed : 0;

    const meADR = playerData.stats.matchesPlayed > 0 ? playerData.stats.totalDamage / playerData.stats.matchesPlayed : 0;
    const rivalADR = rivalData.stats.matchesPlayed > 0 ? rivalData.stats.totalDamage / rivalData.stats.matchesPlayed : 0;

    const axes = [
      { name: "K/D", me: playerData.stats.kdRatio || 0, rival: rivalData.stats.kdRatio || 0 },
      { name: t("compare.metric_winrate"), me: playerData.stats.winrate || 0, rival: rivalData.stats.winrate || 0 },
      { name: t("compare.metric_hs"), me: playerData.stats.headshotPct || 0, rival: rivalData.stats.headshotPct || 0 },
      { name: "ADR", me: meADR, rival: rivalADR },
      { name: t("compare.kills_per_match"), me: meKPG, rival: rivalKPG }
    ];

    const radarData = axes.map((axis) => {
      const maxVal = Math.max(axis.me, axis.rival, 0.01);
      return {
        name: axis.name,
        me: Math.min(100, (axis.me / maxVal) * 100),
        rival: Math.min(100, (axis.rival / maxVal) * 100)
      };
    });

    const width = 300;
    const height = 300;
    const cx = width / 2;
    const cy = height / 2;
    const r = 110;

    // Calculate coordinates for a pentagon vertex
    const getCoords = (index, valuePct) => {
      const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
      const dist = r * (valuePct / 100);
      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);
      return { x, y };
    };

    // Build pentagon web lines
    const backgroundLevels = [25, 50, 75, 100];

    const mePoints = radarData.map((d, i) => getCoords(i, d.me));
    const rivalPoints = radarData.map((d, i) => getCoords(i, d.rival));

    const mePath = mePoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const rivalPath = rivalPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

    return (
      <div className="compare-radar-wrap">
        <svg viewBox="0 0 300 300" width="300" height="300" style={{ background: "transparent" }}>
          {/* Background Pentagons */}
          {backgroundLevels.map((lvl) => {
            const pts = Array.from({ length: 5 }).map((_, i) => {
              const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
              const dist = r * (lvl / 100);
              return `${(cx + dist * Math.cos(angle)).toFixed(1)},${(cy + dist * Math.sin(angle)).toFixed(1)}`;
            }).join(" ");

            return (
              <polygon
                key={lvl}
                points={pts}
                fill="none"
                stroke="var(--line)"
                strokeWidth="1"
                strokeDasharray={lvl < 100 ? "3 3" : "none"}
              />
            );
          })}

          {/* Web Axes Lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const targetX = cx + r * Math.cos(angle);
            const targetY = cy + r * Math.sin(angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={targetX.toFixed(1)}
                y2={targetY.toFixed(1)}
                stroke="var(--line)"
                strokeWidth="1"
              />
            );
          })}

          {/* Pentagon labels */}
          {radarData.map((axis, i) => {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            // Place text slightly outside the web radius
            const labelDist = r + 20;
            const tx = cx + labelDist * Math.cos(angle);
            const ty = cy + labelDist * Math.sin(angle);

            return (
              <text
                key={axis.name}
                x={tx.toFixed(1)}
                y={ty.toFixed(1)}
                fill="var(--text-dim)"
                fontSize="10"
                fontWeight="bold"
                fontFamily="Rajdhani"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {axis.name}
              </text>
            );
          })}

          {/* Player Polygons */}
          <polygon
            points={mePath}
            fill="rgba(0, 229, 209, 0.25)"
            stroke="var(--cyan)"
            strokeWidth="2"
          />
          <polygon
            points={rivalPath}
            fill="rgba(255, 70, 85, 0.20)"
            stroke="var(--red)"
            strokeWidth="2"
          />
        </svg>

        <div className="compare-radar-legend">
          <div className="radar-legend-item">
            <span className="radar-legend-dot" style={{ background: "var(--cyan)" }} />
            <span className="font-oswald">{playerData.account.name.toUpperCase()}#{playerData.account.tag}</span>
          </div>
          <div className="radar-legend-item">
            <span className="radar-legend-dot" style={{ background: "var(--red)" }} />
            <span className="font-oswald">{rivalData.account.name.toUpperCase()}#{rivalData.account.tag}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="compare-view">
      {/* SECCIÓN A: Encabezado */}
      <div style={{ marginBottom: "24px" }}>
        <h2 className="font-oswald" style={{ fontSize: "28px", letterSpacing: "1px", margin: 0 }}>
          {t("compare.title").toUpperCase()}
        </h2>
        <p style={{ color: "var(--text-dim)", fontSize: "14px", margin: "4px 0 0 0" }}>
          {t("compare.subtitle")}
        </p>
      </div>

      {/* SECCIÓN B: Selección del rival */}
      <div className="mdo-perf-panel-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <div className="compare-rival-tabs">
          <button
            className={`compare-rival-tab ${rivalTab === "friend" ? "active" : ""}`}
            onClick={() => setRivalTab("friend")}
          >
            {t("compare.tab_friend")}
          </button>
          <button
            className={`compare-rival-tab ${rivalTab === "pro" ? "active" : ""}`}
            onClick={() => setRivalTab("pro")}
          >
            {t("compare.tab_pro")}
          </button>
        </div>

        {rivalTab === "friend" ? (
          <div>
            <form onSubmit={handleFriendSearchSubmit} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder={t("compare.search_placeholder")}
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                style={{
                  flex: 1,
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  borderRadius: "4px",
                  padding: "10px 14px",
                  color: "var(--text)",
                  fontFamily: "inherit",
                  outline: "none"
                }}
              />
              <button
                type="submit"
                disabled={rivalLoading || !friendInput.trim()}
                style={{
                  background: "var(--red)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0 24px",
                  fontFamily: "Oswald",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <Search size={16} />
                {t("compare.search_btn").toUpperCase()}
              </button>
            </form>
          </div>
        ) : (
          <div>
            {prosLoading ? (
              <div className="pros-list">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="pro-list-item skeleton-animation"
                    style={{ height: "45px", background: "var(--line)", opacity: 0.5 }}
                  />
                ))}
              </div>
            ) : (
              <div className="pros-list">
                {pros.map((pro) => (
                  <div
                    key={pro.id}
                    className={`pro-list-item ${selectedProId === pro.id ? "selected" : ""}`}
                    onClick={() => handleSelectPro(pro)}
                  >
                    <div className="pro-role-icon">
                      <RoleIcon role={pro.role} />
                    </div>
                    <div className="pro-name">{pro.display_name}</div>
                    <div className="pro-team">{pro.team}</div>
                    <div className="pro-meta">
                      {pro.country ? `${pro.country} · ` : ""}{pro.region.toUpperCase()} · {pro.role}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cargas y errores de rival */}
        {rivalLoading && (
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-dim)", fontSize: "14px" }}>
            <div className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }} />
            {t("compare.syncing_rival")}
          </div>
        )}

        {rivalError && (
          <div style={{ marginTop: "16px", padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--red)", borderRadius: "4px", color: "var(--red)", fontSize: "13px" }}>
            {rivalError}
          </div>
        )}
      </div>

      {/* SECCIÓN C: Comparación */}
      {!playerData ? (
        <div className="mdo-perf-panel-card compare-empty-state">
          <Search size={48} className="empty-icon" />
          <p className="font-oswald" style={{ fontSize: "18px", color: "var(--text)", margin: "0 0 8px 0" }}>
            {t("compare.no_profile_title")}
          </p>
          <p style={{ margin: 0 }}>
            {t("compare.no_profile")}
          </p>
        </div>
      ) : !rivalData ? (
        <div className="mdo-perf-panel-card compare-empty-state">
          <Swords size={48} className="empty-icon" />
          <p className="font-oswald" style={{ fontSize: "18px", color: "var(--text)", margin: "0 0 8px 0" }}>
            {t("compare.no_rival_title")}
          </p>
          <p style={{ margin: 0 }}>
            {t("compare.select_rival")}
          </p>
        </div>
      ) : (
        <div className="mdo-perf-panel-card" style={{ padding: "20px" }}>
          {/* Advertencia de 0 partidas */}
          {rivalData.stats.matchesPlayed === 0 && (
            <div style={{ padding: "10px 14px", background: "rgba(240, 195, 67, 0.1)", border: "1px solid var(--gold)", borderRadius: "4px", color: "var(--gold)", fontSize: "13px", marginBottom: "16px" }}>
              {t("compare.no_competitive_warning")}
            </div>
          )}

          {/* Encabezado VS */}
          <div className="compare-vs-header">
            <div className="compare-vs-player">
              <div className="cvp-name">
                {playerData.account.name.toUpperCase()}
                <span className="cvp-tag">#{playerData.account.tag}</span>
              </div>
              <div className="cvp-rank">{playerData.stats.rankTier || t("profile.unranked")}</div>
              <span className="cvp-badge me">{t("compare.you_badge")}</span>
            </div>

            <div className="compare-vs-divider">{t("compare.vs_divider")}</div>

            <div className="compare-vs-player">
              <div className="cvp-name">
                {rivalData.account.name.toUpperCase()}
                <span className="cvp-tag">#{rivalData.account.tag}</span>
              </div>
              <div className="cvp-rank">{rivalData.stats.rankTier || t("profile.unranked")}</div>
              <span className="cvp-badge rival">{t("compare.rival_badge")}</span>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="compare-subtabs">
            <button
              className={`compare-subtab ${compareTab === "stats" ? "active" : ""}`}
              onClick={() => setCompareTab("stats")}
            >
              {t("compare.tab_stats")}
            </button>
            <button
              className={`compare-subtab ${compareTab === "radar" ? "active" : ""}`}
              onClick={() => setCompareTab("radar")}
            >
              {t("compare.tab_radar")}
            </button>
          </div>

          {/* Contenido Comparativo */}
          {compareTab === "stats" ? (
            <div style={{ overflowX: "auto" }}>
              <table className="compare-stats-table">
                <tbody>
                  {getMetrics().map((m) => {
                    let meIsWinner = false;
                    let rivalIsWinner = false;

                    if (!m.noHighlight) {
                      if (m.compareRank) {
                        const win = getRankWinner(m.meVal, m.rivalVal);
                        if (win === "me") meIsWinner = true;
                        else if (win === "rival") rivalIsWinner = true;
                      } else {
                        const meNum = Number(m.meVal) || 0;
                        const rivalNum = Number(m.rivalVal) || 0;
                        if (meNum !== rivalNum) {
                          if (m.higherIsBetter) {
                            if (meNum > rivalNum) meIsWinner = true;
                            else rivalIsWinner = true;
                          } else {
                            if (meNum < rivalNum) meIsWinner = true;
                            else rivalIsWinner = true;
                          }
                        }
                      }
                    }

                    // Bar Math
                    const meNum = typeof m.meVal === "object" ? m.meVal.winrate : (Number(m.meVal) || 0);
                    const rivalNum = typeof m.rivalVal === "object" ? m.rivalVal.winrate : (Number(m.rivalVal) || 0);
                    const maxVal = Math.max(meNum, rivalNum, 0.01);
                    const meBarWidth = `${(meNum / maxVal) * 90}%`;
                    const rivalBarWidth = `${(rivalNum / maxVal) * 90}%`;

                    return (
                      <tr key={m.id}>
                        {/* Me Value */}
                        <td className={`cst-val-me ${m.noHighlight ? "" : meIsWinner ? "winner" : "loser"}`}>
                          {m.format(m.meVal)}
                        </td>

                        {/* Bars Area */}
                        {m.useBar ? (
                          <td className="cst-bars">
                            <div className="cst-bar-wrap">
                              <div
                                className={`cst-bar-me ${m.noHighlight ? "" : meIsWinner ? "winner" : ""}`}
                                style={{ width: meBarWidth }}
                              />
                              <div className="cst-bar-center" />
                              <div
                                className={`cst-bar-rival ${m.noHighlight ? "" : rivalIsWinner ? "winner" : ""}`}
                                style={{ width: rivalBarWidth }}
                              />
                            </div>
                          </td>
                        ) : (
                          <td className="cst-bars" />
                        )}

                        {/* Rival Value */}
                        <td className={`cst-val-rival ${m.noHighlight ? "" : rivalIsWinner ? "winner" : "loser"}`}>
                          {m.format(m.rivalVal)}
                        </td>

                        {/* Metric Label */}
                        <td className="cst-metric" title={m.tooltip}>
                          {m.label}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            renderRadarChart()
          )}
        </div>
      )}
    </div>
  );
}
