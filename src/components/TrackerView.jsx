import React from "react";
import InsightCard from "./InsightCard";
import ActTrendChart from "./ActTrendChart";
import RankComparisonChart from "./RankComparisonChart";
import RecommendationsSection from "./RecommendationsSection";
import MatchHistoryPanel from "./MatchHistoryPanel";
import { generateTrackerData } from "../services/trackerEngine";
import { BarChart3 } from "lucide-react";

export default function TrackerView({ playerData }) {
  if (!playerData) return null;

  const trackerData = generateTrackerData(playerData);
  const { benchmarks, insights, recommendations, rankGroup } = trackerData;

  const strengths = insights.filter((ins) => ins.type === "strength");
  const weaknesses = insights.filter((ins) => ins.type === "weakness");

  return (
    <div className="tracker-view-container">
      <div className="tracker-header-desc">
        <BarChart3 size={18} className="tracker-header-icon" />
        <div>
          <h2>Informe Táctico de Rendimiento</h2>
          <p>
            Análisis algorítmico de tus estadísticas competitivas acumuladas en base de datos comparado con promedios oficiales de tu rango.
          </p>
        </div>
      </div>

      <div className="tracker-grid">
        <div className="tracker-column">
          <div className="column-title">FORTALEZAS</div>
          <div className="insights-list">
            {strengths.length === 0 ? (
              <div className="state-msg-small">No se detectaron fortalezas sobresalientes en este rango. ¡Sigue mejorando!</div>
            ) : (
              strengths.map((ins, i) => <InsightCard key={i} insight={ins} />)
            )}
          </div>
        </div>

        <div className="tracker-column">
          <div className="column-title">PUNTOS DE MEJORA</div>
          <div className="insights-list">
            {weaknesses.length === 0 ? (
              <div className="state-msg-small">¡Espectacular! No tienes debilidades críticas en comparación con tu rango actual.</div>
            ) : (
              weaknesses.map((ins, i) => <InsightCard key={i} insight={ins} />)
            )}
          </div>
        </div>
      </div>

      <div className="tracker-charts-row">
        <RankComparisonChart benchmarks={benchmarks} rankGroup={rankGroup} />
        <ActTrendChart trendData={playerData.stats.trend} />
      </div>

      <RecommendationsSection recommendations={recommendations} />

      <MatchHistoryPanel matches={playerData.matches} puuid={playerData.account?.puuid} />
    </div>
  );
}
