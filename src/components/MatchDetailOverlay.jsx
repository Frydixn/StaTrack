import React, { useState, useEffect } from "react";
import { X, Play, Clock, Server, Monitor, Award, Heart, Shield } from "lucide-react";

export default function MatchDetailOverlay({ match, puuid, onClose }) {
  const [activeTab, setActiveTab] = useState("scoreboard");
  const [agentIcons, setAgentIcons] = useState({});

  // Dynamic fetch of playable agent icons from Valorant-API
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
      .catch((err) => console.warn("Error fetching agent icons from Valorant-API:", err));
  }, []);

  if (!match) return null;

  const metadata = match.metadata || {};
  const matchId = metadata.matchid || metadata.match_id || "Unknown ID";
  const mapName = metadata.map || "Map";
  const gameStart = metadata.game_start || 0;
  const gameLength = metadata.game_length || 0;
  const cluster = metadata.cluster || "Santiago";

  // Find player data to get agent and outcome details
  const allPlayers = match.players?.all_players || [];
  const me = allPlayers.find((p) => p.puuid === puuid) || {};
  const myTeam = me.team?.toLowerCase() || "blue";

  // Game scores
  const scoreWon = match.teams?.[myTeam]?.rounds_won ?? 0;
  const scoreLost = match.teams?.[myTeam === "red" ? "blue" : "red"]?.rounds_won ?? 0;
  const isWin = (match.teams?.[myTeam]?.has_won ?? false) && scoreWon > scoreLost;
  const isLoss = scoreLost > scoreWon;
  const isDraw = scoreWon === scoreLost;

  let outcomeText = "DRAW";
  let outcomeClass = "text-dim";
  if (isWin) {
    outcomeText = "VICTORY";
    outcomeClass = "text-win";
  } else if (isLoss) {
    outcomeText = "DEFEAT";
    outcomeClass = "text-loss";
  }

  // Formatting dates & durations
  const startDateStr = gameStart ? new Date(gameStart * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const startTimeStr = gameStart ? new Date(gameStart * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—";
  const endDateStr = gameStart && gameLength ? new Date((gameStart + gameLength) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const endTimeStr = gameStart && gameLength ? new Date((gameStart + gameLength) * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—";

  const runtimeMin = Math.floor(gameLength / 60);
  const runtimeSec = gameLength % 60;
  const runtimeStr = gameLength ? `${runtimeMin}m ${runtimeSec}s` : "—";

  // Rank icon helper
  const getRankIconUrl = (tierId) => {
    if (tierId === undefined || tierId === null || tierId === 0) return null;
    return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;
  };

  // Group players by teams and sort by Combat Score descending
  const redPlayers = allPlayers
    .filter((p) => p.team?.toLowerCase() === "red")
    .sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0));

  const bluePlayers = allPlayers
    .filter((p) => p.team?.toLowerCase() === "blue")
    .sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0));

  const redRounds = match.teams?.red?.rounds_won ?? 0;
  const blueRounds = match.teams?.blue?.rounds_won ?? 0;

  const myAgentLower = me.character?.toLowerCase() || "";
  const myAgentIcon = agentIcons[myAgentLower];

  return (
    <div className="mdo-backdrop" onClick={onClose}>
      <div className="mdo-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mdo-header">
          <div className="mdo-title-wrap">
            <span className="mdo-purple-dot font-oswald">⚡ MATCH DETAIL</span>
            <span className="mdo-match-id text-dim">{matchId}</span>
          </div>
          <button className="mdo-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Hero Section */}
        <div className="mdo-hero">
          <div className="mdo-hero-card-row">
            <div className="mdo-hero-agent-pic">
              {myAgentIcon ? (
                <img src={myAgentIcon} alt={me.character} className="mdo-hero-agent-img" />
              ) : (
                <div className="mdo-hero-agent-fallback font-oswald">
                  {me.character?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="mdo-hero-info">
              <div className="mdo-hero-map font-oswald">{mapName}</div>
              <div className="mdo-hero-meta text-dim">
                COMPETITIVE • {matchId.substring(0, 16).toUpperCase()}
              </div>
              <div className="mdo-hero-outcome">
                <span className={`outcome-text font-oswald ${outcomeClass}`}>{outcomeText}</span>
                <span className="outcome-score font-oswald">{scoreWon}:{scoreLost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="mdo-meta-grid">
          <div className="mdo-meta-cell">
            <span className="lbl text-dim">START</span>
            <span className="val font-oswald">{startDateStr} • {startTimeStr}</span>
          </div>
          <div className="mdo-meta-cell">
            <span className="lbl text-dim">END</span>
            <span className="val font-oswald">{endDateStr} • {endTimeStr}</span>
          </div>
          <div className="mdo-meta-cell">
            <span className="lbl text-dim">RUNTIME</span>
            <span className="val font-oswald">{runtimeStr}</span>
          </div>
          <div className="mdo-meta-cell">
            <span className="lbl text-dim">SERVER</span>
            <span className="val font-oswald">{cluster}</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mdo-tab-nav">
          <button
            className={`mdo-tab-link font-oswald ${activeTab === "scoreboard" ? "active" : ""}`}
            onClick={() => setActiveTab("scoreboard")}
          >
            SCOREBOARD
          </button>
          <button
            className={`mdo-tab-link font-oswald ${activeTab === "performance" ? "active" : ""}`}
            onClick={() => setActiveTab("performance")}
          >
            PERFORMANCE
          </button>
        </div>

        {/* Tab Content */}
        <div className="mdo-content">
          {activeTab === "scoreboard" ? (
            <div className="mdo-scoreboard-tab">
              {/* Render Team Red */}
              <div className="mdo-team-section">
                <div className="mdo-team-header red font-oswald">
                  TEAM RED <span className="mdo-score-pill">{redRounds} ROUNDS</span>
                </div>
                <div className="mdo-table-wrap">
                  <table className="mdo-table">
                    <thead>
                      <tr>
                        <th>PLAYER</th>
                        <th style={{ textAlign: "center" }}>RANK</th>
                        <th style={{ textAlign: "right" }}>ACS</th>
                        <th style={{ textAlign: "center" }}>K / D / A</th>
                        <th style={{ textAlign: "right" }}>K/D</th>
                        <th style={{ textAlign: "right" }}>HS%</th>
                        <th style={{ textAlign: "right" }}>ADR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redPlayers.map((p, idx) => {
                        const characterLower = p.character?.toLowerCase() || "";
                        const iconUrl = agentIcons[characterLower];
                        const kills = p.stats?.kills || 0;
                        const deaths = p.stats?.deaths || 0;
                        const assists = p.stats?.assists || 0;
                        const kd = deaths > 0 ? (kills / deaths).toFixed(1) : kills.toFixed(1);
                        const rounds = metadata.rounds_played || 1;
                        const acs = Math.round((p.stats?.score || 0) / rounds);

                        const headshots = p.stats?.headshots || 0;
                        const totalShots = (p.stats?.headshots || 0) + (p.stats?.bodyshots || 0) + (p.stats?.legshots || 0);
                        const hs = totalShots > 0 ? Math.round((headshots / totalShots) * 100) : 0;

                        const dmg = p.damage_made || p.stats?.damage || 0;
                        const adr = Math.round(dmg / rounds);

                        const isMe = p.puuid === puuid;
                        const tierId = p.currenttier ?? p.current_tier ?? p.tier ?? 0;
                        const rankIcon = getRankIconUrl(tierId);

                        return (
                          <tr key={idx} className={isMe ? "mdo-row-highlight" : ""}>
                            <td className="mdo-player-cell">
                              <div className="mdo-agent-icon-circle">
                                {iconUrl ? (
                                  <img src={iconUrl} alt={p.character} className="mdo-agent-icon-img" />
                                ) : (
                                  <div className="mdo-agent-fallback font-oswald">
                                    {p.character?.substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="mdo-player-name-wrap">
                                <span className="mdo-player-name font-oswald">{p.name}</span>
                                <span className="mdo-player-tag">#{p.tag}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {rankIcon ? (
                                <img src={rankIcon} alt="Rank" className="mdo-rank-icon" title={p.currenttier_patched ?? p.current_tier_patched ?? "Unranked"} />
                              ) : (
                                <span className="text-dim font-oswald" style={{ fontSize: 10 }}>UR</span>
                              )}
                            </td>
                            <td className="font-oswald" style={{ textAlign: "right" }}>{acs}</td>
                            <td className="font-oswald" style={{ textAlign: "center" }}>
                              {kills} / {deaths} / {assists}
                            </td>
                            <td className="font-oswald" style={{ textAlign: "right", color: kd >= 1.0 ? "var(--cyan)" : "var(--red)" }}>
                              {kd}
                            </td>
                            <td className="font-oswald" style={{ textAlign: "right" }}>{hs}%</td>
                            <td className="font-oswald" style={{ textAlign: "right" }}>{adr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Render Team Blue */}
              <div className="mdo-team-section">
                <div className="mdo-team-header blue font-oswald">
                  TEAM BLUE <span className="mdo-score-pill">{blueRounds} ROUNDS</span>
                </div>
                <div className="mdo-table-wrap">
                  <table className="mdo-table">
                    <thead>
                      <tr>
                        <th>PLAYER</th>
                        <th style={{ textAlign: "center" }}>RANK</th>
                        <th style={{ textAlign: "right" }}>ACS</th>
                        <th style={{ textAlign: "center" }}>K / D / A</th>
                        <th style={{ textAlign: "right" }}>K/D</th>
                        <th style={{ textAlign: "right" }}>HS%</th>
                        <th style={{ textAlign: "right" }}>ADR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bluePlayers.map((p, idx) => {
                        const characterLower = p.character?.toLowerCase() || "";
                        const iconUrl = agentIcons[characterLower];
                        const kills = p.stats?.kills || 0;
                        const deaths = p.stats?.deaths || 0;
                        const assists = p.stats?.assists || 0;
                        const kd = deaths > 0 ? (kills / deaths).toFixed(1) : kills.toFixed(1);
                        const rounds = metadata.rounds_played || 1;
                        const acs = Math.round((p.stats?.score || 0) / rounds);

                        const headshots = p.stats?.headshots || 0;
                        const totalShots = (p.stats?.headshots || 0) + (p.stats?.bodyshots || 0) + (p.stats?.legshots || 0);
                        const hs = totalShots > 0 ? Math.round((headshots / totalShots) * 100) : 0;

                        const dmg = p.damage_made || p.stats?.damage || 0;
                        const adr = Math.round(dmg / rounds);

                        const isMe = p.puuid === puuid;
                        const tierId = p.currenttier ?? p.current_tier ?? p.tier ?? 0;
                        const rankIcon = getRankIconUrl(tierId);

                        return (
                          <tr key={idx} className={isMe ? "mdo-row-highlight" : ""}>
                            <td className="mdo-player-cell">
                              <div className="mdo-agent-icon-circle">
                                {iconUrl ? (
                                  <img src={iconUrl} alt={p.character} className="mdo-agent-icon-img" />
                                ) : (
                                  <div className="mdo-agent-fallback font-oswald">
                                    {p.character?.substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="mdo-player-name-wrap">
                                <span className="mdo-player-name font-oswald">{p.name}</span>
                                <span className="mdo-player-tag">#{p.tag}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {rankIcon ? (
                                <img src={rankIcon} alt="Rank" className="mdo-rank-icon" title={p.currenttier_patched ?? p.current_tier_patched ?? "Unranked"} />
                              ) : (
                                <span className="text-dim font-oswald" style={{ fontSize: 10 }}>UR</span>
                              )}
                            </td>
                            <td className="font-oswald" style={{ textAlign: "right" }}>{acs}</td>
                            <td className="font-oswald" style={{ textAlign: "center" }}>
                              {kills} / {deaths} / {assists}
                            </td>
                            <td className="font-oswald" style={{ textAlign: "right", color: kd >= 1.0 ? "var(--cyan)" : "var(--red)" }}>
                              {kd}
                            </td>
                            <td className="font-oswald" style={{ textAlign: "right" }}>{hs}%</td>
                            <td className="font-oswald" style={{ textAlign: "right" }}>{adr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="mdo-performance-tab">
              {/* Performance Details */}
              <div className="mdo-perf-summary-card">
                <div className="card-header font-oswald">INDIVIDUAL STATS VS MATCH AVG</div>
                <div className="card-body">
                  <div className="mdo-perf-metric-bar">
                    <span className="lbl">Average Combat Score (ACS)</span>
                    <div className="bar-wrapper">
                      <div className="bar-val font-oswald">{Math.round((me.stats?.score || 0) / (metadata.rounds_played || 1))}</div>
                      <div className="bar-line-bg">
                        <div className="bar-line-fill" style={{ width: `${Math.min(100, (Math.round((me.stats?.score || 0) / (metadata.rounds_played || 1)) / 400) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mdo-perf-metric-bar">
                    <span className="lbl">K/D Ratio</span>
                    <div className="bar-wrapper">
                      <div className="bar-val font-oswald">{(me.stats?.kills / Math.max(1, me.stats?.deaths)).toFixed(2)}</div>
                      <div className="bar-line-bg">
                        <div className="bar-line-fill" style={{ width: `${Math.min(100, ((me.stats?.kills / Math.max(1, me.stats?.deaths)) / 2) * 100)}%`, background: "var(--cyan)" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mdo-perf-metric-bar">
                    <span className="lbl">Average Damage per Round (ADR)</span>
                    <div className="bar-wrapper">
                      <div className="bar-val font-oswald">{Math.round((me.damage_made || me.stats?.damage || 0) / (metadata.rounds_played || 1))}</div>
                      <div className="bar-line-bg">
                        <div className="bar-line-fill" style={{ width: `${Math.min(100, (Math.round((me.damage_made || me.stats?.damage || 0) / (metadata.rounds_played || 1)) / 250) * 100)}%`, background: "var(--gold)" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
