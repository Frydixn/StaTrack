import React from "react";
import { Clock, Users, Calendar, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Componente que muestra la lista de partidas jugadas por el equipo.
 * @param {Object} props
 * @param {Array} props.history - Partidas calculadas.
 */
export default function RosterMatchHistory({ history }) {
  const { t } = useTranslation();
  if (!history || history.length === 0) {
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
        <ShieldAlert size={24} style={{ marginBottom: "8px", color: "var(--red)" }} />
        <div>{t("roster.no_history")}</div>
      </div>
    );
  }

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    const ms = timestamp * 1000;
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return t("general.time_d_ago", { count: days });
    if (hours > 0) return t("general.time_h_ago", { count: hours });
    if (mins > 0) return t("general.time_m_ago", { count: mins });
    return t("general.now");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--line)", paddingBottom: "12px" }}>
        <Calendar size={18} color="var(--red)" />
        <h3 className="font-oswald" style={{ color: "white", fontSize: "16px", margin: 0, letterSpacing: "0.5px" }}>
          {t("roster.title_history")}
        </h3>
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        {history.map((m) => {
          const isWin = m.outcome === "Victoria" || m.outcome === "VICTORY" || m.outcome === "Win";
          const isLoss = m.outcome === "Derrota" || m.outcome === "DEFEAT" || m.outcome === "Loss";
          const outcomeColor = isWin ? "#10b981" : isLoss ? "#ff4655" : "var(--text-dim)";
          const outcomeText = isWin
            ? t("match_history.victory")
            : (isLoss ? t("match_history.defeat") : t("match_history.draw"));
          const dateStr = new Date(m.gameStart * 1000).toLocaleDateString();

          return (
            <div
              key={m.matchId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                padding: "12px 16px",
                gap: "16px"
              }}
            >
              {/* Left detail */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                {/* Win/Loss Badge */}
                <div style={{
                  width: "80px",
                  height: "28px",
                  borderRadius: "4px",
                  background: `${outcomeColor}15`,
                  border: `1px solid ${outcomeColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <span className="font-oswald" style={{
                    color: outcomeColor,
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    {outcomeText}
                  </span>
                </div>

                {/* Map & Score */}
                <div>
                  <div className="font-oswald" style={{ color: "white", fontSize: "14px", letterSpacing: "0.5px" }}>
                    {m.map}
                  </div>
                  <div className="font-oswald" style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    {m.score}
                  </div>
                </div>
              </div>

              {/* Center (Players list badge) */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, justifyContent: "center" }}>
                <Users size={12} color="var(--text-dim)" />
                <span style={{ fontSize: "11px", color: "var(--text-dim)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "250px" }} title={m.members.join(", ")}>
                  {m.members.join(", ")}
                </span>
              </div>

              {/* Right detail */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", color: "var(--text-dim)", textAlign: "right" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} /> {m.duration}
                </span>
                <span>
                  {dateStr} ({getRelativeTime(m.gameStart)})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
