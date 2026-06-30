import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ActStatsBar({ actStats }) {
    if (!actStats) return null;

    const { rankName, rr, mmrChange, peakRankName } = actStats;
    const MmrIcon = mmrChange > 0 ? TrendingUp : mmrChange < 0 ? TrendingDown : Minus;
    const mmrColor = mmrChange > 0 ? "var(--cyan)" : mmrChange < 0 ? "var(--red)" : "var(--text-dim)";

    return (
        <div className="act-stats-bar">
            <div className="act-label">ÚLTIMO ACTO</div>
            <div className="act-cells">
                <div className="act-cell">
                    <div className="act-val">{rankName}</div>
                    <div className="act-key">Rango actual</div>
                </div>
                <div className="act-divider" />
                <div className="act-cell">
                    <div className="act-val">{rr} <span className="act-unit">RR</span></div>
                    <div className="act-key">Ranking Rating</div>
                </div>
                <div className="act-divider" />
                <div className="act-cell">
                    <div className="act-val" style={{ color: mmrColor, display: "flex", alignItems: "center", gap: 6 }}>
                        <MmrIcon size={16} />
                        {mmrChange > 0 ? `+${mmrChange}` : mmrChange}
                    </div>
                    <div className="act-key">Última partida</div>
                </div>
                {peakRankName && (
                    <>
                        <div className="act-divider" />
                        <div className="act-cell">
                            <div className="act-val" style={{ color: "var(--gold)" }}>{peakRankName}</div>
                            <div className="act-key">Rango pico histórico</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}