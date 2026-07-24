import React from "react";
import { Map, AlertTriangle, Shield, Sword } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Pestaña de Mapas que muestra el balance de winrate en ataque y defensa.
 * @param {Object} props
 * @param {Array} props.mapStats - Estadísticas de mapas calculadas.
 */
export default function MapasTab({ mapStats }) {
  const { t } = useTranslation();
  if (!mapStats || mapStats.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "40px",
        background: "rgba(255,255,255,0.01)",
        border: "1px dashed var(--line)",
        borderRadius: "6px",
        color: "var(--text-dim)",
        fontSize: "13px"
      }}>
        {t("roster.maps_no_data")}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--line)", paddingBottom: "12px" }}>
        <Map size={18} color="var(--red)" />
        <h3 className="font-oswald" style={{ color: "white", fontSize: "16px", margin: 0, letterSpacing: "0.5px" }}>
          {t("roster.maps_title")}
        </h3>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px"
      }}>
        {mapStats.map((item) => {
          const attackColor = item.attackWR >= 50 ? "#10b981" : "#ff4655";
          const defenseColor = item.defenseWR >= 50 ? "#10b981" : "#ff4655";

          return (
            <div
              key={item.map}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: item.isImbalanced ? "1px solid rgba(234,179,8,0.4)" : "1px solid var(--line)",
                borderRadius: "6px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                position: "relative"
              }}
            >
              {/* Map header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 className="font-oswald" style={{ color: "white", fontSize: "15px", margin: 0, letterSpacing: "0.5px" }}>
                    {item.map}
                  </h4>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    {item.games} {item.games === 1 ? t("roster.games_one") : t("roster.games_multiple")}
                  </span>
                </div>

                {item.isImbalanced && (
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "9px",
                    background: "rgba(234,179,8,0.15)",
                    color: "#eab308",
                    border: "1px solid rgba(234,179,8,0.3)",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    textTransform: "uppercase"
                  }}>
                    <AlertTriangle size={10} />
                    {t("roster.imbalance")} ({item.diff}%)
                  </span>
                )}
              </div>

              {/* Progress bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                {/* Attacker Side */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Sword size={10} /> {t("roster.attacker")}
                    </span>
                    <span style={{ fontWeight: "bold", color: "white" }}>
                      {item.attackWR}% <span style={{ fontSize: "9px", color: "var(--text-dim)", fontWeight: "normal" }}>({item.attackWins}/{item.attackPlayed})</span>
                    </span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{
                      width: `${item.attackWR}%`,
                      height: "100%",
                      background: attackColor,
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>

                {/* Defender Side */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Shield size={10} /> {t("roster.defender")}
                    </span>
                    <span style={{ fontWeight: "bold", color: "white" }}>
                      {item.defenseWR}% <span style={{ fontSize: "9px", color: "var(--text-dim)", fontWeight: "normal" }}>({item.defenseWins}/{item.defensePlayed})</span>
                    </span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{
                      width: `${item.defenseWR}%`,
                      height: "100%",
                      background: defenseColor,
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
