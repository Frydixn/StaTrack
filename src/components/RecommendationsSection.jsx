import React from "react";
import { Compass, BookOpen, AlertCircle, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

function translateRecommendation(rec, t) {
  if (!rec) return rec;
  let { title, text } = rec;

  // 1. Aprovecha tu fortaleza en [map]
  if (title && title.startsWith("Aprovecha tu fortaleza en ")) {
    const mapName = title.replace("Aprovecha tu fortaleza en ", "");
    const m = text.match(/prioriza seleccionar a (\w+)\. Tienes una tasa de victorias (?:sobresaliente )?del ([\d.]+)%/);
    if (m) {
      return {
        ...rec,
        title: t("tracker_engine.leverage_strength_title", { map: mapName }),
        text: t("tracker_engine.leverage_strength_desc", { map: mapName, agent: m[1], winrate: m[2] })
      };
    }
  }

  // 2. Practica tácticas en [map]
  if (title && title.startsWith("Practica tácticas en ")) {
    const mapName = title.replace("Practica tácticas en ", "");
    const m = text.match(/winrate de ([\d.]+)%/);
    if (m) {
      return {
        ...rec,
        title: t("tracker_engine.practice_tactics_title", { map: mapName }),
        text: t("tracker_engine.practice_tactics_desc", { winrate: m[1], map: mapName })
      };
    }
  }

  // 3. Ajusta tu mira y sensibilidad
  if (title === "Ajusta tu mira y sensibilidad") {
    return {
      ...rec,
      title: t("tracker_engine.adjust_sensitivity_title"),
      text: t("tracker_engine.adjust_sensitivity_desc")
    };
  }

  // 4. Continúa perfeccionando tu juego
  if (title === "Continúa perfeccionando tu juego") {
    return {
      ...rec,
      title: t("tracker_engine.continue_perfecting_title"),
      text: t("tracker_engine.continue_perfecting_desc")
    };
  }

  return rec;
}

export default function RecommendationsSection({ recommendations }) {
  const { t } = useTranslation();
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="recommendations-card">
      <div className="chart-header">
        <span className="chart-title">{t("tracker.recommendations_title").toUpperCase()}</span>
      </div>
      <div className="recs-list">
        {recommendations.map((rawRec, idx) => {
          const rec = translateRecommendation(rawRec, t);
          const isPractice = rec.type === "practice";
          const cardClass = isPractice ? "rec-item practice" : "rec-item focus";
          const Icon = isPractice ? BookOpen : Compass;

          return (
            <div key={idx} className={cardClass}>
              <div className="rec-icon-wrap">
                <Icon size={18} className="rec-icon" />
              </div>
              <div className="rec-body">
                <div className="rec-title">{rec.title}</div>
                <div className="rec-text">{rec.text}</div>
              </div>
              <div className="rec-type-badge">
                {isPractice ? t("tracker_engine.practice_badge") : t("tracker_engine.focus_badge")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
