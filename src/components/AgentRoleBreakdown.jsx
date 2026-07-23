import React from "react";
import { TrendingUp, User } from "lucide-react";
import { ROLES } from "./RoleAssigner";

const AGENT_ROLE_MAP = {
  // Duelists
  jett: "duelist", reyna: "duelist", raze: "duelist", phoenix: "duelist", neon: "duelist", yoru: "duelist", iso: "duelist",
  // Initiators
  sova: "initiator", breach: "initiator", skye: "initiator", fade: "initiator", gekko: "initiator", "kay/o": "initiator", kayo: "initiator",
  // Controllers
  omen: "controller", brimstone: "controller", viper: "controller", astra: "controller", harbor: "controller", clove: "controller",
  // Sentinels
  sage: "sentinel", cypher: "sentinel", killjoy: "sentinel", chamber: "sentinel", deadlock: "sentinel", vyse: "sentinel"
};

export default function AgentRoleBreakdown({ player, agentStats }) {
  const assignedRoleObj = ROLES.find(r => r.id === player.role);
  const mostPlayedAgent = agentStats && agentStats.length > 0 ? agentStats[0] : null;

  let alignmentStatus = { label: "Sin Rol", color: "var(--text-dim)", aligned: false };
  if (player.role && mostPlayedAgent) {
    const agentRole = AGENT_ROLE_MAP[mostPlayedAgent.agent.toLowerCase()];
    if (player.role === "igl") {
      alignmentStatus = { label: "Líder Táctico", color: "#eab308", aligned: true };
    } else if (agentRole === player.role) {
      alignmentStatus = { label: "Rol Alineado", color: "#10b981", aligned: true };
    } else {
      alignmentStatus = { label: "Desalineado", color: "#ff4655", aligned: false };
    }
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid var(--line)",
      borderRadius: "6px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      minWidth: "280px"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(255,70,85,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,70,85,0.2)"
          }}>
            <User size={16} color="var(--red)" />
          </div>
          <div>
            <div className="font-oswald" style={{ color: "white", fontSize: "14px", letterSpacing: "0.5px" }}>
              {player.riotId}
            </div>
            <div style={{ fontSize: "11px", color: assignedRoleObj?.color || "var(--text-dim)", textTransform: "uppercase", fontWeight: "bold" }}>
              {assignedRoleObj?.name || "Sin Rol"}
            </div>
          </div>
        </div>

        {player.role && mostPlayedAgent && (
          <span style={{
            fontSize: "9px",
            padding: "3px 8px",
            borderRadius: "12px",
            background: `${alignmentStatus.color}15`,
            color: alignmentStatus.color,
            border: `1px solid ${alignmentStatus.color}30`,
            fontWeight: "bold",
            textTransform: "uppercase"
          }}>
            {alignmentStatus.label}
          </span>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
        <div className="font-oswald" style={{ fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.5px", marginBottom: "8px" }}>
          RENDIMIENTO POR AGENTE
        </div>
        {(!agentStats || agentStats.length === 0) ? (
          <div style={{ fontSize: "11px", color: "var(--text-dim)", padding: "10px 0" }}>
            Sin datos de partidas para este jugador en el historial.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {agentStats.slice(0, 3).map((astat) => {
              const agentImgName = astat.agent.toLowerCase().replace("/", "");
              const isAligned = player.role && AGENT_ROLE_MAP[astat.agent.toLowerCase()] === player.role;
              return (
                <div key={astat.agent} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(0,0,0,0.15)",
                  padding: "8px",
                  borderRadius: "4px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className="font-oswald" style={{ fontSize: "12px", color: "white" }}>
                        {astat.agent}
                        {isAligned && (
                          <span style={{ fontSize: "9px", color: "#10b981", marginLeft: "6px" }} title="Agente de tu rol">✓</span>
                        )}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                        {astat.games} {astat.games === 1 ? "partida" : "partidas"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "16px", textAlign: "right" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>W/R</div>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: astat.winrate >= 50 ? "#10b981" : "#ff4655"
                      }}>
                        {astat.winrate}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>K/D</div>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: astat.kd >= 1 ? "white" : "var(--text-dim)"
                      }}>
                        {astat.kd}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export { AGENT_ROLE_MAP };
