import React, { useState, useEffect, useRef } from "react";
import { X, Copy, Check, Clock, Shield, Award, AwardIcon } from "lucide-react";

export default function MatchDetailOverlay({ match, puuid, latestMatchId, latestMmrChange, onClose }) {
  const [copied, setCopied] = useState(false);
  const [mapSplash, setMapSplash] = useState(null);
  const [activeTab, setActiveTab] = useState("scoreboard");
  const overlayRef = useRef(null);

  // Load map splash image from Valorant-API
  useEffect(() => {
    if (!match?.metadata?.map) return;
    fetch("https://valorant-api.com/v1/maps")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.data) {
          const mapObj = resJson.data.find(
            (m) => m.displayName.toLowerCase() === match.metadata.map.toLowerCase()
          );
          if (mapObj) {
            setMapSplash(mapObj.splash || mapObj.listViewIcon);
          }
        }
      })
      .catch((err) => console.warn("Error loading map assets:", err));
  }, [match]);

  if (!match) return null;

  const matchId = match.metadata?.matchid || match.metadata?.match_id || "";
  const rounds = match.metadata?.rounds_played || 1;
  const players = match.players?.all_players || [];
  const me = players.find((p) => p.puuid === puuid);
  const myTeam = me?.team;

  const redRounds = match.teams?.red?.rounds_won ?? 0;
  const blueRounds = match.teams?.blue?.rounds_won ?? 0;
  
  // Outcome calculations
  const myTeamLower = myTeam?.toLowerCase();
  const opponentTeamLower = myTeamLower === "red" ? "blue" : "red";
  const scoreWon = match.teams?.[myTeamLower]?.rounds_won ?? 0;
  const scoreLost = match.teams?.[opponentTeamLower]?.rounds_won ?? 0;
  const isWin = (match.teams?.[myTeamLower]?.has_won ?? false) && scoreWon > scoreLost;
  const isLoss = scoreLost > scoreWon;
  const isDraw = scoreWon === scoreLost;

  let outcomeText = "DRAW";
  let outcomeClass = "match-draw";
  if (isWin) {
    outcomeText = "VICTORY";
    outcomeClass = "match-win";
  } else if (isLoss) {
    outcomeText = "DEFEAT";
    outcomeClass = "match-loss";
  }

  // RR change display
  const isLatest = matchId === latestMatchId;
  const showMmr = isLatest && latestMmrChange !== undefined;
  const mmrChangeText = latestMmrChange > 0 ? `+${latestMmrChange} RR` : `${latestMmrChange} RR`;
  const mmrChangeClass = latestMmrChange > 0 ? "text-win font-oswald" : latestMmrChange < 0 ? "text-loss font-oswald" : "font-oswald";

  // Dynamic calculations of FK, FD, and Multi-kills (MK) from match events
  const calculateMatchEvents = () => {
    const fkMap = {};
    const fdMap = {};
    const mkMap = {};

    const kills = match.kills || [];
    const roundsKills = {};

    kills.forEach((k) => {
      const r = k.round ?? 0;
      if (!roundsKills[r]) roundsKills[r] = [];
      roundsKills[r].push(k);
    });

    Object.entries(roundsKills).forEach(([r, rKills]) => {
      if (rKills.length === 0) return;
      rKills.sort((a, b) => (a.kill_time_in_round || 0) - (b.kill_time_in_round || 0));
      
      const firstKill = rKills[0];
      const killer = firstKill.killer_puuid;
      const victim = firstKill.victim_puuid;

      if (killer) fkMap[killer] = (fkMap[killer] || 0) + 1;
      if (victim) fdMap[victim] = (fdMap[victim] || 0) + 1;
    });

    Object.entries(roundsKills).forEach(([r, rKills]) => {
      const roundKillsCount = {};
      rKills.forEach((k) => {
        const killer = k.killer_puuid;
        if (killer) {
          roundKillsCount[killer] = (roundKillsCount[killer] || 0) + 1;
        }
      });

      Object.entries(roundKillsCount).forEach(([playerPuuid, count]) => {
        if (count >= 3) {
          mkMap[playerPuuid] = (mkMap[playerPuuid] || 0) + 1;
        }
      });
    });

    return { fkMap, fdMap, mkMap };
  };

  const { fkMap, fdMap, mkMap } = calculateMatchEvents();

  // Copy Match ID
  const handleCopyMatchId = () => {
    navigator.clipboard.writeText(matchId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Rank icon URL generator
  const getRankIconUrl = (tierId) => {
    if (tierId === undefined || tierId === null || tierId === 0) return null;
    return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;
  };

  // Player lists sorted by combat score descending
  const redPlayers = players
    .filter((p) => p.team?.toLowerCase() === "red")
    .sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0));

  const bluePlayers = players
    .filter((p) => p.team?.toLowerCase() === "blue")
    .sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0));

  const renderTeamTable = (teamName, teamRounds, teamPlayers, teamClass) => {
    return (
      <div className={`mdo-team-section ${teamClass}`}>
        <div className="mdo-team-header font-oswald">
          <span className="name">TEAM {teamName.toUpperCase()}</span>
          <span className="rounds">{teamRounds} ROUNDS</span>
        </div>
        <div className="mdo-table-wrap">
          <table className="mdo-table">
            <thead>
              <tr>
                <th>PLAYER</th>
                <th style={{ textAlign: "center" }}>RANK</th>
                <th style={{ textAlign: "right" }}>ACS</th>
                <th style={{ textAlign: "right" }}>K/D/A</th>
                <th style={{ textAlign: "right" }}>K/D</th>
                <th style={{ textAlign: "right" }}>HS%</th>
                <th style={{ textAlign: "right" }}>ADR</th>
                <th style={{ textAlign: "center" }}>KAST</th>
                <th style={{ textAlign: "right" }}>FK</th>
                <th style={{ textAlign: "right" }}>FD</th>
                <th style={{ textAlign: "right" }}>MK</th>
              </tr>
            </thead>
            <tbody>
              {teamPlayers.map((player) => {
                const isMe = player.puuid === puuid;
                const kills = player.stats?.kills || 0;
                const deaths = player.stats?.deaths || 0;
                const assists = player.stats?.assists || 0;
                const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
                const kdColor = kd >= 1.0 ? "text-win" : "text-loss";
                
                const hsCount = player.stats?.headshots || 0;
                const totalShots = (player.stats?.headshots || 0) + (player.stats?.bodyshots || 0) + (player.stats?.legshots || 0);
                const hs = totalShots > 0 ? Math.round((hsCount / totalShots) * 100) : 0;
                
                const adr = Math.round((player.damage_made || 0) / rounds);
                const fk = fkMap[player.puuid] || 0;
                const fd = fdMap[player.puuid] || 0;
                const mk = mkMap[player.puuid] || 0;

                const rankIcon = getRankIconUrl(player.currenttier);

                return (
                  <tr key={player.puuid} className={isMe ? "row-highlight" : ""}>
                    <td className="mdo-player-cell">
                      <div className="agent-icon-wrap">
                        {player.assets?.agent?.small ? (
                          <img src={player.assets.agent.small} alt={player.character} className="agent-icon-img" />
                        ) : (
                          <div className="agent-icon-fallback font-oswald">{player.character?.substring(0, 2).toUpperCase()}</div>
                        )}
                      </div>
                      <div className="mdo-player-info">
                        <span className="name truncate">{player.name}</span>
                        <span className="tag">#{player.tag}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="mdo-rank-icon-wrap">
                        {rankIcon ? (
                          <img src={rankIcon} alt={player.currenttier_patched} className="rank-icon-img" title={player.currenttier_patched} />
                        ) : (
                          <span className="text-dim font-oswald" style={{ fontSize: 9 }}>UR</span>
                        )}
                      </div>
                    </td>
                    <td className="font-oswald" style={{ textAlign: "right" }}>
                      {Math.round((player.stats?.score || 0) / rounds)}
                    </td>
                    <td className="font-oswald" style={{ textAlign: "right", fontWeight: "600" }}>
                      {kills}/{deaths}/{assists}
                    </td>
                    <td className={`font-oswald ${kdColor}`} style={{ textAlign: "right" }}>
                      {kd}
                    </td>
                    <td className="font-oswald" style={{ textAlign: "right" }}>
                      {hs}%
                    </td>
                    <td className="font-oswald" style={{ textAlign: "right" }}>
                      {adr}
                    </td>
                    <td className="text-dim" style={{ textAlign: "center", fontSize: 11 }}>
                      —
                    </td>
                    <td className="font-oswald" style={{ textAlign: "right", color: fk > 0 ? "var(--cyan)" : "" }}>
                      {fk}
                    </td>
                    <td className="font-oswald" style={{ textAlign: "right", color: fd > 0 ? "var(--red)" : "" }}>
                      {fd}
                    </td>
                    <td className="font-oswald" style={{ textAlign: "right", color: mk > 0 ? "var(--gold)" : "" }}>
                      {mk}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Date parsing
  const formattedStart = match.metadata?.game_start 
    ? new Date(match.metadata.game_start * 1000).toLocaleString("es-ES", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
      })
    : "";

  const durationMin = Math.floor((match.metadata?.game_length || 0) / 60);
  const durationSec = (match.metadata?.game_length || 0) % 60;
  
  const version = match.metadata?.game_version
    ? match.metadata.game_version.split("-")[1] || "13.00"
    : "13.00";

  return (
    <div className="match-detail-overlay-backdrop" ref={overlayRef} onClick={handleBackdropClick}>
      <div className="match-detail-overlay-drawer">
        {/* HEADER */}
        <div className="mdo-header">
          <div className="mdo-header-left">
            <span className="title font-oswald">MATCH DETAIL</span>
            <div className="mdo-id-wrap" onClick={handleCopyMatchId} title="Copiar ID de partida">
              <span className="id-text">{matchId}</span>
              {copied ? <Check size={12} className="text-win" /> : <Copy size={12} className="copy-icon" />}
            </div>
          </div>
          <button className="mdo-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* SUMMARY MAP BANNER */}
        <div className="mdo-banner">
          {mapSplash && <img src={mapSplash} alt="Map Splash" className="mdo-banner-bg" />}
          <div className="mdo-banner-overlay" />
          <div className="mdo-banner-content">
            <div className="mdo-banner-map-title font-oswald">{match.metadata?.map}</div>
            <div className="mdo-banner-sub">
              <span className="mode">COMPETITIVE</span>
              <span className="bullet">•</span>
              <span className={`outcome-text font-oswald ${outcomeClass}`}>{outcomeText}</span>
              <span className="score font-oswald">{scoreWon}:{scoreLost}</span>
              {showMmr && (
                <>
                  <span className="bullet">•</span>
                  <span className={mmrChangeClass}>{mmrChangeText}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* METADATA GRID */}
        <div className="mdo-meta-grid font-oswald">
          <div className="meta-cell">
            <span className="lbl">START</span>
            <span className="val">{formattedStart}</span>
          </div>
          <div className="meta-cell">
            <span className="lbl">RUNTIME</span>
            <span className="val">{durationMin}m {durationSec}s</span>
          </div>
          <div className="meta-cell">
            <span className="lbl">SERVER</span>
            <span className="val">{match.metadata?.cluster || "NA"}</span>
          </div>
          <div className="meta-cell">
            <span className="lbl">VERSION</span>
            <span className="val">{version}</span>
          </div>
        </div>

        {/* SCOREBOARD TABLE */}
        <div className="mdo-scoreboard-container">
          {renderTeamTable("Red", redRounds, redPlayers, "team-red")}
          {renderTeamTable("Blue", blueRounds, bluePlayers, "team-blue")}
        </div>
      </div>
    </div>
  );
}
