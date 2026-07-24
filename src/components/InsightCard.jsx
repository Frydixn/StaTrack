import React from "react";
import { TrendingUp, TrendingDown, Award, AlertTriangle, Zap, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

function translateInsight(insight, t) {
  if (!insight) return insight;
  let { title, desc } = insight;

  // 1. Puntería de Élite
  if (title === "Puntería de Élite") {
    const m = desc.match(/a la cabeza \(([\d.]+)%\) supera ampliamente el promedio de (\w+) \(([\d.]+)%\)/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.elite_aim_title"),
        desc: t("tracker_engine.elite_aim_desc", { hs: m[1], rank: m[2], avg: m[3] })
      };
    }
  }

  // 2. Precisión de Aim Baja
  if (title === "Precisión de Aim Baja") {
    const m = desc.match(/a la cabeza \(([\d.]+)%\) que el promedio de tu rango \(([\d.]+)%\)/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.low_aim_title"),
        desc: t("tracker_engine.low_aim_desc", { hs: m[1], avg: m[2] })
      };
    }
  }

  // 3. Duelista Letal
  if (title === "Duelista Letal") {
    const m = desc.match(/de eliminación\/muerte de ([\d.]+)/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.lethal_duelist_title"),
        desc: t("tracker_engine.lethal_duelist_desc", { kd: m[1] })
      };
    }
  }

  // 4. Supervivencia Crítica
  if (title === "Supervivencia Crítica") {
    const m = desc.match(/Tu K\/D \(([\d.]+)\) está por debajo del promedio \(([\d.]+)\)/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.critical_survival_title"),
        desc: t("tracker_engine.critical_survival_desc", { kd: m[1], avg: m[2] })
      };
    }
  }

  // 5. Impacto Victorioso
  if (title === "Impacto Victorioso") {
    const m = desc.match(/tasa de victorias del ([\d.]+)%/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.victorious_impact_title"),
        desc: t("tracker_engine.victorious_impact_desc", { winrate: m[1] })
      };
    }
  }

  // 6. Rendimiento Inestable
  if (title === "Rendimiento Inestable") {
    const m = desc.match(/winrate actual \(([\d.]+)%\)/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.unstable_performance_title"),
        desc: t("tracker_engine.unstable_performance_desc", { winrate: m[1] })
      };
    }
  }

  // 7. Pool de Agentes Muy Amplio
  if (title === "Pool de Agentes Muy Amplio") {
    const m = desc.match(/jugado con (\d+) agentes/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.wide_agent_pool_title"),
        desc: t("tracker_engine.wide_agent_pool_desc", { count: m[1] })
      };
    }
  }

  // 8. Versatilidad Óptima
  if (title === "Versatilidad Óptima") {
    const m = desc.match(/pool de (\d+) agentes/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.optimal_versatility_title"),
        desc: t("tracker_engine.optimal_versatility_desc", { count: m[1] })
      };
    }
  }

  // 9. Problemas en [map]
  if (title && title.startsWith("Problemas en ")) {
    const mapName = title.replace("Problemas en ", "");
    const m = desc.match(/winrate bajo \(([\d.]+)%\)/);
    if (m) {
      return {
        ...insight,
        title: t("tracker_engine.problems_in_map_title", { map: mapName }),
        desc: t("tracker_engine.problems_in_map_desc", { winrate: m[1], map: mapName })
      };
    }
  }

  // 10. Jugador Estable
  if (title === "Jugador Estable") {
    return {
      ...insight,
      title: t("tracker_engine.stable_player_title"),
      desc: t("tracker_engine.stable_player_desc")
    };
  }

  return insight;
}

export default function InsightCard({ insight }) {
  const { t } = useTranslation();
  const translated = translateInsight(insight, t);
  const { type, title, desc, metric, value } = translated;

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
        <span className="insight-type">
          {isStrength ? t("insights.strength") : t("insights.improvement")}
        </span>
        <span className="insight-metric-label">{metric}</span>
      </div>
    </div>
  );
}
