import React from "react";
import { useTranslation } from "react-i18next";

export default function RankComparisonChart({ benchmarks, rankGroup }) {
  const { t } = useTranslation();
  if (!benchmarks) return null;

  const { player, average } = benchmarks;

  const cx = 150;
  const cy = 130;
  const R = 90;
  const angles = [-Math.PI / 2, -Math.PI / 2 + 1.2566, -Math.PI / 2 + 2.5132, -Math.PI / 2 + 3.7699, -Math.PI / 2 + 5.0265];
  
  const labelNames = ["K/D", "HS%", "Winrate", t("general.dpg_short"), t("general.apg_short")];

  const ranges = [
    { min: 0.5, max: 1.5 },   // K/D
    { min: 5, max: 40 },      // HS%
    { min: 30, max: 70 },     // Winrate
    { min: 70, max: 180 },    // DPG (Damage per Game)
    { min: 2, max: 7 },       // Assists
  ];

  const getPoints = (data) => {
    const rawVals = [data.kd, data.hs, data.winrate, data.dpg, data.assists];
    return rawVals.map((val, i) => {
      const { min, max } = ranges[i];
      const norm = Math.min(1, Math.max(0.15, (val - min) / (max - min)));
      const x = cx + R * norm * Math.cos(angles[i]);
      const y = cy + R * norm * Math.sin(angles[i]);
      return { x, y, val, label: labelNames[i] };
    });
  };

  const playerPoints = getPoints(player);
  const avgPoints = getPoints(average);

  const getPolyPointsString = (pts) => pts.map((p) => `${p.x},${p.y}`).join(" ");

  const webPolys = [0.25, 0.5, 0.75, 1].map((scale) => {
    return angles.map((a) => {
      const x = cx + R * scale * Math.cos(a);
      const y = cy + R * scale * Math.sin(a);
      return `${x},${y}`;
    }).join(" ");
  });

  return (
    <div className="radar-chart-card">
      <div className="chart-header">
        <span className="chart-title">{t("tracker.comparison_vs_average", { rank: rankGroup.toUpperCase() })}</span>
      </div>

      <div className="radar-container">
        <svg viewBox="0 0 300 260" className="radar-svg" width="100%" height="100%">
          <defs>
            <filter id="glow-player" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--cyan)" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Radar Background Polygons (Grid Web) */}
          {webPolys.map((polyStr, idx) => (
            <polygon
              key={idx}
              points={polyStr}
              fill="none"
              stroke="var(--border-dim)"
              strokeWidth="1.2"
              strokeDasharray="2 3"
            />
          ))}

          {/* Web Spoke Axes */}
          {angles.map((a, idx) => {
            const x = cx + R * Math.cos(a);
            const y = cy + R * Math.sin(a);
            return (
              <line
                key={idx}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Average Benchmark Polygon */}
          <polygon
            points={getPolyPointsString(avgPoints)}
            fill="rgba(255, 255, 255, 0.05)"
            stroke="var(--text-dim)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Player Performance Polygon */}
          <polygon
            points={getPolyPointsString(playerPoints)}
            fill="rgba(0, 240, 255, 0.15)"
            stroke="var(--cyan)"
            strokeWidth="2.5"
            filter="url(#glow-player)"
          />

          {/* Player Nodes */}
          {playerPoints.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="var(--bg)"
              stroke="var(--cyan)"
              strokeWidth="2"
            />
          ))}

          {/* Labels */}
          {angles.map((a, idx) => {
            const offsetDist = 18;
            const x = cx + (R + offsetDist) * Math.cos(a);
            const y = cy + (R + offsetDist) * Math.sin(a);
            let textAnchor = "middle";
            if (Math.cos(a) > 0.1) textAnchor = "start";
            else if (Math.cos(a) < -0.1) textAnchor = "end";

            const playerVal = playerPoints[idx].val;
            const avgVal = avgPoints[idx].val;
            const diff = playerVal - avgVal;
            const formattedDiff = diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
            const diffColor = diff >= 0 ? "var(--cyan)" : "var(--red)";

            return (
              <g key={idx}>
                {/* Metric Label */}
                <text
                  x={x}
                  y={y - 2}
                  textAnchor={textAnchor}
                  fill="var(--text)"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {labelNames[idx]}
                </text>
                {/* Difference Sublabel */}
                <text
                  x={x}
                  y={y + 8}
                  textAnchor={textAnchor}
                  fill={diffColor}
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  {formattedDiff}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="radar-legend">
        <div className="legend-item">
          <div className="legend-box player" />
          <span>{t("tracker.your_stats")}</span>
        </div>
        <div className="legend-item">
          <div className="legend-box average" />
          <span>{t("tracker.rank_average")}</span>
        </div>
      </div>
    </div>
  );
}
