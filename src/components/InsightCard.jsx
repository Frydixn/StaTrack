import React from "react";
import { TrendingUp, TrendingDown, Award, AlertTriangle, Zap, Target } from "lucide-react";

export default function InsightCard({ insight }) {
  const { type, title, desc, metric, value } = insight;

  const isStrength = type === "strength";
  const cardClass = isStrength ? "insight-card strength" : "insight-card weakness";

  const getIcon = () => {
    if (isStrength) {
      if (metric === "HS%") return <Target size={18} className="insight-icon strength" />;
      if (metric === "Agentes") return <Zap size={18} className="insight-icon strength" />;
      return <TrendingUp size={18} className="insight-icon strength" />;
    } else {
      if (metric === "HS%") return <Target size={18} className="insight-icon weakness" />;
      if (metric === "Agentes") return <AlertTriangle size={18} className="insight-icon weakness" />;
      return <TrendingDown size={18} className="insight-icon weakness" />;
    }
  };

  return (
    <div className={cardClass}>
      <div className="insight-header">
        <div className="insight-title-wrap">
          {getIcon()}
          <span className="insight-title">{title}</span>
        </div>
        <div className="insight-tag">{value}</div>
      </div>
      <div className="insight-desc">{desc}</div>
      <div className="insight-footer">
        <span className="insight-type">{isStrength ? "FORTALEZA" : "PUNTO DE MEJORA"}</span>
        <span className="insight-metric-label">{metric}</span>
      </div>
    </div>
  );
}
