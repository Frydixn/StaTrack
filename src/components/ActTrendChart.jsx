import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ActTrendChart({ trendData }) {
  const { t } = useTranslation();
  const [metric, setMetric] = useState("kd"); // "kd" | "hs" | "winrate"

  if (!trendData || trendData.length === 0) {
    return <div className="chart-empty">{t("tracker.insufficient_trend_data")}</div>;
  }

  const values = trendData.map((d) => d[metric]);
  const minVal = Math.min(...values) * 0.9;
  const maxVal = Math.max(...values) * 1.1 || 1;
  const range = maxVal - minVal || 1;

  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = trendData.map((d, i) => {
    const x = paddingX + (i / (trendData.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d[metric] - minVal) / range) * chartHeight;
    return { x, y, val: d[metric], label: d.label };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  const color = metric === "kd" ? "var(--gold)" : metric === "hs" ? "var(--cyan)" : "var(--red)";
  const strokeColor = color;
  const fillColor = `url(#grad-${metric})`;

  return (
    <div className="trend-chart-card">
      <div className="chart-header">
        <span className="chart-title">{t("tracker.recent_trend_title")}</span>
        <div className="chart-selectors">
          <button className={`chart-sel-btn ${metric === "kd" ? "active" : ""}`} onClick={() => setMetric("kd")}>
            K/D
          </button>
          <button className={`chart-sel-btn ${metric === "hs" ? "active" : ""}`} onClick={() => setMetric("hs")}>
            HS%
          </button>
          <button className={`chart-sel-btn ${metric === "winrate" ? "active" : ""}`} onClick={() => setMetric("winrate")}>
            Winrate
          </button>
        </div>
      </div>

      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg" width="100%" height="100%">
          <defs>
            <linearGradient id="grad-kd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-hs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-winrate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--red)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--red)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={strokeColor} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="var(--border-dim)" strokeDasharray="4 4" />
          <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={width - paddingX} y2={paddingY + chartHeight / 2} stroke="var(--border-dim)" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="var(--border)" strokeWidth="1.5" />

          {/* Area under curve */}
          {areaD && <path d={areaD} fill={fillColor} />}

          {/* Main trend line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Nodes */}
          {points.map((p, idx) => (
            <g key={idx} className="chart-node-group">
              <circle cx={p.x} cy={p.y} r="5" fill="var(--bg)" stroke={strokeColor} strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" className="hover-trigger" />
              <g className="chart-tooltip">
                <rect x={p.x - 25} y={p.y - 30} width="50" height="20" rx="3" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
                <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize="10.5" fill="var(--text)" fontWeight="bold">
                  {p.val}
                </text>
              </g>
            </g>
          ))}

          {/* X Axis Labels */}
          {points.filter((_, i) => i % 3 === 0 || i === points.length - 1).map((p, idx) => (
            <text key={idx} x={p.x} y={height - 10} textAnchor="middle" fill="var(--text-dim)" fontSize="10">
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
