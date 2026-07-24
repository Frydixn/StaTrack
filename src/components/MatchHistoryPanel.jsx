import React, { useState, useEffect } from "react";
import { 
  ChevronDown, ChevronUp, Clock, Compass, Activity, 
  TrendingUp, Percent, Sparkles, AlertCircle 
} from "lucide-react";
import MatchDetailOverlay from "./MatchDetailOverlay";
import { useTranslation } from "react-i18next";

export default function MatchHistoryPanel({ matches, puuid }) {
  const { t, i18n } = useTranslation();
  const [agentIcons, setAgentIcons] = useState({});
  const [expandedDays, setExpandedDays] = useState({});
  const [visibleDaysCount, setVisibleDaysCount] = useState(3);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Dynamic fetch of playable agent icons from Valorant-API to keep assets up-to-date
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

  if (!matches || matches.length === 0) {
    return (
      <div className="match-history-empty">
        <AlertCircle size={24} className="empty-icon" />
        <p>{t("match_history.empty_agent")}</p>
      </div>
    );
  }

  // 1. Sort matches descending by game start timestamp
  const sortedMatches = [...matches].sort((a, b) => {
    const timeA = a.metadata?.game_start || 0;
    const timeB = b.metadata?.game_start || 0;
    return timeB - timeA;
  });

  // 2. Group matches by calendar day
  const getCalendarDayKey = (timestamp) => {
    const d = new Date(timestamp * 1000);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  const grouped = {};
  sortedMatches.forEach((match) => {
    const dayKey = getCalendarDayKey(match.metadata?.game_start || 0);
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(match);
  });

  // Get sorted list of day keys
  const sortedDayKeys = Object.keys(grouped).sort((a, b) => {
    const dateA = new Date(a.replace(/-/g, "/"));
    const dateB = new Date(b.replace(/-/g, "/"));
    return dateB - dateA;
  });

  // Formatter for day header date
  const getHeaderDateString = (dayKey) => {
    const [year, month, day] = dayKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return t("match_history.today");
    }
    
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return t("match_history.yesterday");
    }
    
    const monthName = date.toLocaleDateString(i18n.language, { month: 'short' }).toUpperCase();
    return `${day} ${monthName}`;
  };

  // Helper for relative game timestamp
  const getRelativeTime = (epochSeconds) => {
    if (!epochSeconds) return "";
    const diffMs = Date.now() - epochSeconds * 1000;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return t("general.time_m_ago", { count: diffMins });
    if (diffHours < 24) return t("general.time_h_ago", { count: diffHours });
    return t("general.time_d_ago", { count: diffDays });
  };

  const toggleDayCollapse = (dayKey) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  // Render daily groups up to current visibility limit
  const visibleDayKeys = sortedDayKeys.slice(0, visibleDaysCount);

  return (
    <div className="match-history-container">
      <div className="section-header-title">
        <Sparkles size={18} className="section-icon" />
        <span>{t("match_history.recent_matches")}</span>
      </div>

      <div className="match-history-days-list">
        {visibleDayKeys.map((dayKey) => {
          const dayMatches = grouped[dayKey];
          const isCollapsed = expandedDays[dayKey] === true; // Starts expanded by default

          // Calculate daily aggregates
          let totalKills = 0;
          let totalDeaths = 0;
          let totalAssists = 0;
          let totalDamageMade = 0;
          let totalDamageReceived = 0;
          let totalHeadshots = 0;
          let totalShots = 0;
          let totalScore = 0;
          let totalRounds = 0;
          let wins = 0;
          let losses = 0;

          dayMatches.forEach((match) => {
            const players = match.players?.all_players || [];
            const me = players.find((p) => p.puuid === puuid);
            if (!me) return;

            totalKills += me.stats?.kills || 0;
            totalDeaths += me.stats?.deaths || 0;
            totalAssists += me.stats?.assists || 0;

            const damageMade = me.damage_made || me.stats?.damage || 0;
            const damageReceived = me.damage_received || me.stats?.damage_received || 0;
            totalDamageMade += damageMade;
            totalDamageReceived += damageReceived;

            totalHeadshots += me.stats?.headshots || 0;
            totalShots += (me.stats?.headshots || 0) + (me.stats?.bodyshots || 0) + (me.stats?.legshots || 0);

            totalScore += me.stats?.score || 0;
            totalRounds += match.metadata?.rounds_played || 1;

            const myTeam = me.team?.toLowerCase();
            const won = match.teams?.[myTeam]?.has_won ?? false;
            const roundsWon = match.teams?.[myTeam]?.rounds_won ?? 0;
            const roundsLost = match.teams?.[myTeam === "red" ? "blue" : "red"]?.rounds_won ?? 0;
            
            if (roundsWon === roundsLost) {
              // Draw, count as nothing or neutral
            } else if (won) {
              wins++;
            } else {
              losses++;
            }
          });

          const dailyKD = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);
          const dailyHS = totalShots > 0 ? Math.round((totalHeadshots / totalShots) * 100) : 0;
          const dailyACS = totalRounds > 0 ? Math.round(totalScore / totalRounds) : 0;
          const dailyDD = totalDamageMade - totalDamageReceived;
          const avgDailyDD = Math.round(dailyDD / dayMatches.length);

          return (
            <div key={dayKey} className="match-history-day-group">
              <div 
                className="match-history-day-header"
                onClick={() => toggleDayCollapse(dayKey)}
                style={{ cursor: "pointer" }}
              >
                <div className="day-header-left">
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  <span className="day-date">{getHeaderDateString(dayKey)}</span>
                  <span className="day-count">{dayMatches.length} {dayMatches.length === 1 ? t("roster.games_one").toUpperCase() : t("roster.games_multiple").toUpperCase()}</span>
                  <span className="day-record">
                    <span className="text-win">{wins} W</span> // <span className="text-loss">{losses} L</span>
                  </span>
                </div>

                <div className="day-header-right">
                  <div className="day-stat-avg" title="Promedio K/D/A">
                    <span className="lbl">KDA</span>
                    <span className="val font-oswald">{totalKills}/{totalDeaths}/{totalAssists} ({dailyKD})</span>
                  </div>
                  <div className="day-stat-avg" title="Promedio Daño Delta">
                    <span className="lbl">DD</span>
                    <span className={`val font-oswald ${avgDailyDD >= 0 ? "text-win" : "text-loss"}`}>
                      {avgDailyDD >= 0 ? `+${avgDailyDD}` : avgDailyDD}
                    </span>
                  </div>
                  <div className="day-stat-avg" title="Promedio Headshot %">
                    <span className="lbl">HS%</span>
                    <span className="val font-oswald">{dailyHS}%</span>
                  </div>
                  <div className="day-stat-avg" title="Promedio Combat Score">
                    <span className="lbl">ACS</span>
                    <span className="val font-oswald">{dailyACS}</span>
                  </div>
                </div>
              </div>

              {!isCollapsed && (
                <div className="match-history-day-cards">
                  {dayMatches.map((match) => {
                    const players = match.players?.all_players || [];
                    const me = players.find((p) => p.puuid === puuid);
                    if (!me) return null;

                    const matchId = match.metadata?.matchid || match.metadata?.match_id;
                    const character = me.character || "Agent";
                    const mapName = match.metadata?.map || "Map";
                    
                    const myTeam = me.team?.toLowerCase();
                    const opponentTeam = myTeam === "red" ? "blue" : "red";
                    const scoreWon = match.teams?.[myTeam]?.rounds_won ?? 0;
                    const scoreLost = match.teams?.[opponentTeam]?.rounds_won ?? 0;
                    const isWin = (match.teams?.[myTeam]?.has_won ?? false) && scoreWon > scoreLost;
                    const isLoss = scoreLost > scoreWon;
                    const isDraw = scoreWon === scoreLost;

                    let outcomeClass = "match-draw";
                    let outcomeText = t("match_history.draw");
                    if (isWin) {
                      outcomeClass = "match-win";
                      outcomeText = t("match_history.victory");
                    } else if (isLoss) {
                      outcomeClass = "match-loss";
                      outcomeText = t("match_history.defeat");
                    }

                    // Stats per match
                    const kills = me.stats?.kills || 0;
                    const deaths = me.stats?.deaths || 0;
                    const assists = me.stats?.assists || 0;
                    const kdRatio = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
                    
                    const damageMade = me.damage_made || me.stats?.damage || 0;
                    const damageReceived = me.damage_received || me.stats?.damage_received || 0;
                    const matchDD = damageMade - damageReceived;
                    const matchDDDisplay = matchDD >= 0 ? `+${matchDD}` : `${matchDD}`;

                    const headshots = me.stats?.headshots || 0;
                    const bodyshots = me.stats?.bodyshots || 0;
                    const legshots = me.stats?.legshots || 0;
                    const shots = headshots + bodyshots + legshots;
                    const hsPct = shots > 0 ? Math.round((headshots / shots) * 100) : 0;

                    const rounds = match.metadata?.rounds_played || 1;
                    const acs = Math.round((me.stats?.score || 0) / rounds);

                    // Dynamic badge checks (tactical benchmarks)
                    const badges = [];
                    // 1. MVP
                    const maxScore = Math.max(...players.map((p) => p.stats?.score || 0));
                    if (me.stats?.score === maxScore) {
                      badges.push({ text: "Match MVP", type: "gold" });
                    } else {
                      // 2. Team MVP
                      const myTeamPlayers = players.filter((p) => p.team?.toLowerCase() === myTeam);
                      const maxTeamScore = Math.max(...myTeamPlayers.map((p) => p.stats?.score || 0));
                      if (me.stats?.score === maxTeamScore) {
                        badges.push({ text: "Team MVP", type: "cyan" });
                      }
                    }
                    // 3. High K/D
                    if (kdRatio >= 2.0) {
                      badges.push({ text: "High K/D", type: "win" });
                    }
                    // 4. High Headshot %
                    if (hsPct >= 30) {
                      badges.push({ text: "Sharpshooter", type: "cyan" });
                    }
                    // 5. Great Combat Score
                    if (acs >= 280) {
                      badges.push({ text: "High Impact", type: "gold" });
                    }

                    const agentNameLower = character.toLowerCase();
                    const hasIcon = agentIcons[agentNameLower];

                    return (
                      <div 
                        key={matchId} 
                        className={`match-history-card ${outcomeClass}`}
                        onClick={() => setSelectedMatch(match)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="card-left-section">
                          {/* Agent display icon */}
                          <div className="agent-avatar-wrap">
                            {hasIcon ? (
                              <img 
                                src={agentIcons[agentNameLower]} 
                                alt={character} 
                                className="agent-avatar-img"
                              />
                            ) : (
                              <div className="agent-avatar-fallback font-oswald">
                                {character.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="match-info-details">
                            <div className="match-mode-time">
                              <span className="mode">{t("match_history.competitive")}</span>
                              <span className="bullet">•</span>
                              <Clock size={11} className="time-icon" />
                              <span className="time">{getRelativeTime(match.metadata?.game_start)}</span>
                            </div>
                            <div className="match-map font-oswald">
                              <Compass size={13} className="map-icon" />
                              <span>{mapName}</span>
                            </div>
                            <div className="match-score font-oswald">
                              <span className="score-won">{scoreWon}</span>
                              <span className="score-divider">:</span>
                              <span className="score-lost">{scoreLost}</span>
                              <span className={`outcome-badge ${outcomeClass}`}>{outcomeText}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges Column */}
                        <div className="card-badges-section">
                          {badges.map((badge, idx) => (
                            <span key={idx} className={`match-badge badge-${badge.type}`}>
                              {badge.text}
                            </span>
                          ))}
                        </div>

                        {/* Stats Summary Column */}
                        <div className="card-stats-section">
                          <div className="stat-col rank-info">
                            <span className="val">{me.currenttier_patched || t("profile.unranked")}</span>
                            <span className="lbl">{t("match_history.comp_rank")}</span>
                          </div>

                          <div className="stat-col">
                            <span className="val font-oswald">{kills}/{deaths}/{assists}</span>
                            <span className="lbl">K/D/A</span>
                          </div>

                          <div className="stat-col">
                            <span className="val font-oswald">{kdRatio}</span>
                            <span className="lbl">K/D</span>
                          </div>

                          <div className="stat-col">
                            <span className={`val font-oswald ${matchDD >= 0 ? "text-win" : "text-loss"}`}>
                              {matchDDDisplay}
                            </span>
                            <span className="lbl">Δ Damage</span>
                          </div>

                          <div className="stat-col">
                            <span className="val font-oswald">{hsPct}%</span>
                            <span className="lbl">HS%</span>
                          </div>

                          <div className="stat-col">
                            <span className="val font-oswald">{acs}</span>
                            <span className="lbl">ACS</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedDayKeys.length > visibleDaysCount && (
        <div className="load-more-wrap">
          <button 
            className="btn btn-secondary load-more-btn"
            onClick={() => setVisibleDaysCount((prev) => prev + 3)}
          >
            {t("match_history.full_history")}
          </button>
        </div>
      )}

      {selectedMatch && (
        <MatchDetailOverlay 
          match={selectedMatch} 
          puuid={puuid} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}
