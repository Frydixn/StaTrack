import React from "react";
import { Compass, BookOpen, AlertCircle, Award } from "lucide-react";

export default function RecommendationsSection({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="recommendations-card">
      <div className="chart-header">
        <span className="chart-title">CONSEJOS TÁCTICOS Y RECOMENDACIONES</span>
      </div>
      <div className="recs-list">
        {recommendations.map((rec, idx) => {
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
                {isPractice ? "PRÁCTICA" : "FORTALECER"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
