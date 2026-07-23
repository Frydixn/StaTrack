import React, { useState } from "react";
import { Users, Star, Award, ShieldAlert } from "lucide-react";

export default function SynergyPanel({ activeRoster, rosterSynergy, allSynergy }) {
  const [showOnlyRoster, setShowOnlyRoster] = useState(true);

  const displayList = showOnlyRoster ? rosterSynergy : allSynergy.slice(0, 15);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--line)",
        paddingBottom: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} color="var(--red)" />
          <h3 className="font-oswald" style={{ color: "white", fontSize: "16px", margin: 0, letterSpacing: "0.5px" }}>
            {showOnlyRoster ? "Sinergia del Roster Activo" : "Sinergia General de Compañeros"}
          </h3>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowOnlyRoster(true)}
            className="font-oswald"
            style={{
              background: showOnlyRoster ? "var(--red)" : "transparent",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              padding: "4px 10px",
              color: "white",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            Solo Roster
          </button>
          <button
            onClick={() => setShowOnlyRoster(false)}
            className="font-oswald"
            style={{
              background: !showOnlyRoster ? "var(--red)" : "transparent",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              padding: "4px 10px",
              color: "white",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            Ver Todos
          </button>
        </div>
      </div>

      {displayList.length === 0 ? (
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
          <div>No se encontraron partidas jugadas en pareja en el historial.</div>
          <div style={{ fontSize: "11px", marginTop: "4px" }}>
            {showOnlyRoster 
              ? "Asegúrate de agregar al Roster a compañeros con los que hayas jugado recientemente."
              : "Intenta sincronizar más partidas en tu historial."}
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "12px"
        }}>
          {displayList.map((partner) => {
            const winrateColor = partner.winrate >= 60 
              ? "#10b981" 
              : partner.winrate >= 45 
                ? "white" 
                : "#ff4655";

            return (
              <div
                key={partner.puuid}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "10px"
                }}
              >
                <div>
                  <div className="font-oswald" style={{ color: "white", fontSize: "13px", letterSpacing: "0.5px" }}>
                    {partner.riotId}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "2px" }}>
                    {partner.games} {partner.games === 1 ? "partida jugada juntos" : "partidas jugadas juntos"}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-dim)" }}>Porcentaje de Victoria</span>
                    <span style={{ fontWeight: "bold", color: winrateColor }}>{partner.winrate}%</span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{
                      width: `${partner.winrate}%`,
                      height: "100%",
                      background: winrateColor,
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
