import React from "react";

export default function StatsGrid({ stats }) {
  if (!stats) return null;

  const cells = [
    { label: "Kills", value: stats.totalKills },
    { label: "Muertes", value: stats.totalDeaths },
    { label: "K/D", value: stats.kdRatio },
    { label: "Winrate", value: `${stats.winrate}%` },
    { label: "HS%", value: `${stats.headshotPct}%` },
    { label: "Partidas", value: stats.matchesPlayed },
    { label: "Daño total", value: stats.totalDamage?.toLocaleString() || 0 },
    { label: "Agente top", value: stats.mostPlayedAgent || "—" },
  ];

  return (
    <div className="stats-grid">
      {cells.map((cell, idx) => (
        <div className="stat-cell" key={idx}>
          <div className="val">{cell.value}</div>
          <div className="lbl">{cell.label}</div>
        </div>
      ))}
    </div>
  );
}
