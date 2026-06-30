import React, { useState } from "react";
import { Map } from "lucide-react";

function AgentRow({ agent, games, winrate, rank }) {
    const barColor = winrate >= 60 ? "var(--cyan)" : winrate >= 50 ? "var(--gold)" : "var(--red)";
    return (
        <div className="map-agent-row">
            <span className="map-agent-rank">#{rank}</span>
            <span className="map-agent-name">{agent}</span>
            <div className="map-agent-bar-wrap">
                <div className="map-agent-bar-fill" style={{ width: `${winrate}%`, background: barColor }} />
            </div>
            <span className="map-agent-wr" style={{ color: barColor }}>{winrate}%</span>
            <span className="map-agent-games">{games}p</span>
        </div>
    );
}

export default function MapAgentsPanel({ agentsByMap }) {
    const maps = Object.keys(agentsByMap).sort();
    const [activeMap, setActiveMap] = useState(maps[0] || null);
    if (!activeMap) return null;

    const agents = agentsByMap[activeMap] || [];

    return (
        <div className="map-agents-panel">
            <div className="section-header">
                <Map size={16} className="section-icon" />
                <span>Top 3 Agentes por Mapa</span>
                <span className="section-sub">Basado en el último acto jugado</span>
            </div>
            <div className="map-tabs">
                {maps.map((map) => (
                    <button key={map} className={`map-tab ${activeMap === map ? "active" : ""}`} onClick={() => setActiveMap(map)}>
                        {map}
                    </button>
                ))}
            </div>
            <div className="map-agents-list">
                {agents.length === 0
                    ? <div className="map-empty">Sin datos suficientes para este mapa.</div>
                    : agents.map((a, i) => (
                        <AgentRow key={a.agent} rank={i + 1} agent={a.agent} games={a.games} winrate={a.winrate} />
                    ))
                }
            </div>
        </div>
    );
}