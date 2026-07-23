import React, { useState, useEffect } from "react";
import RosterSidebar from "./RosterSidebar";
import RoleAssigner from "./RoleAssigner";
import SynergyPanel from "./SynergyPanel";
import AgentRoleBreakdown from "./AgentRoleBreakdown";
import useRosterStorage from "../hooks/useRosterStorage";
import useSynergyMatrix from "../hooks/useSynergyMatrix";
import axios from "axios";
import { UserPlus, ShieldAlert, Award, Sparkles, Trash2 } from "lucide-react";

export default function RosterView({ playerData }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const activePlayer = playerData?.account;

  const {
    rosters,
    createRoster,
    deleteRoster,
    addPlayer,
    removePlayer,
    updatePlayerRole
  } = useRosterStorage();

  const [activeRosterId, setActiveRosterId] = useState("");
  const [newPlayerInput, setNewPlayerInput] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("synergy"); // "synergy" | "agents"

  // Select first roster as default if available
  useEffect(() => {
    if (rosters.length > 0 && !activeRosterId) {
      setActiveRosterId(rosters[0].id);
    }
  }, [rosters, activeRosterId]);

  const activeRoster = rosters.find((r) => r.id === activeRosterId);

  // Hook for synergy matrix calculations
  const { synergyPairs, rosterSynergy, rosterAgentStats } = useSynergyMatrix(
    playerData?.matches || [],
    activePlayer?.puuid,
    activeRoster
  );

  // Auto-add the active player to the roster if it is newly created and empty
  useEffect(() => {
    if (activeRoster && activeRoster.players.length === 0 && activePlayer) {
      addPlayer(activeRosterId, {
        puuid: activePlayer.puuid,
        riotId: `${activePlayer.name}#${activePlayer.tag}`,
        role: "igl" // Default role for active user
      });
    }
  }, [activeRosterId, activeRoster]);

  const handleAddPlayer = async (e) => {
    if (e) e.preventDefault();
    if (!newPlayerInput.includes("#")) {
      setAddError("Formato incorrecto. Usa Nombre#TAG");
      return;
    }
    setAddError("");
    setAdding(true);

    const [name, tag] = newPlayerInput.split("#");
    try {
      // Fetch PUUID from backend
      const url = `${API_BASE}/api/account/${encodeURIComponent(name.trim())}/${encodeURIComponent(tag.trim())}`;
      const { data } = await axios.get(url);
      const accountData = data?.data;

      if (!accountData || !accountData.puuid) {
        throw new Error("No se pudo obtener el PUUID del jugador.");
      }

      addPlayer(activeRosterId, {
        puuid: accountData.puuid,
        riotId: `${accountData.name}#${accountData.tag}`,
        role: null
      });
      setNewPlayerInput("");
    } catch (err) {
      console.error(err);
      setAddError("Jugador no encontrado. Verifica las mayúsculas y el TAG.");
    } finally {
      setAdding(false);
    }
  };

  const handleAddTeammateDirect = (teammate) => {
    if (!activeRoster) return;
    addPlayer(activeRosterId, {
      puuid: teammate.puuid,
      riotId: teammate.riotId,
      role: null
    });
  };

  return (
    <div style={{
      display: "flex",
      background: "rgba(10,12,16,0.5)",
      border: "1px solid var(--line)",
      borderRadius: "8px",
      minHeight: "650px",
      overflow: "hidden"
    }}>
      {/* Roster list sidebar */}
      <RosterSidebar
        rosters={rosters}
        activeRosterId={activeRosterId}
        onSelect={setActiveRosterId}
        onCreate={(name) => {
          const r = createRoster(name);
          setActiveRosterId(r.id);
        }}
        onDelete={(id) => {
          deleteRoster(id);
          if (activeRosterId === id) {
            setActiveRosterId("");
          }
        }}
      />

      {/* Main Roster Panel */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "20px", overflowX: "hidden" }}>
        {!activeRoster ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "var(--text-dim)",
            gap: "12px"
          }}>
            <ShieldAlert size={48} color="var(--red)" />
            <h3 className="font-oswald" style={{ color: "white", fontSize: "20px", margin: 0 }}>
              Crea o selecciona un Roster
            </h3>
            <p style={{ fontSize: "13px", margin: 0 }}>
              Usa el panel de la izquierda para inicializar tu alineación de equipo.
            </p>
          </div>
        ) : (
          <>
            {/* Header / Info bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255,255,255,0.02)",
              padding: "16px",
              borderRadius: "6px",
              border: "1px solid var(--line)"
            }}>
              <div>
                <h2 className="font-oswald" style={{ color: "white", fontSize: "22px", margin: 0, letterSpacing: "1px", textTransform: "uppercase" }}>
                  {activeRoster.name}
                </h2>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                  {activeRoster.players.length} jugadores en el equipo
                </div>
              </div>

              {/* Add player form */}
              <form onSubmit={handleAddPlayer} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    placeholder="Compañero#TAG"
                    value={newPlayerInput}
                    onChange={(e) => setNewPlayerInput(e.target.value)}
                    disabled={adding}
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      color: "white",
                      fontSize: "12px",
                      outline: "none",
                      width: "180px"
                    }}
                  />
                  <button
                    type="submit"
                    disabled={adding || !newPlayerInput.includes("#")}
                    style={{
                      background: "var(--red)",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <UserPlus size={14} />
                    {adding ? "..." : "Añadir"}
                  </button>
                </div>
                {addError && <span style={{ color: "var(--red)", fontSize: "10px", textAlign: "right" }}>{addError}</span>}
              </form>
            </div>

            {/* Players List Grid */}
            <div>
              <h4 className="font-oswald" style={{ color: "white", fontSize: "12px", letterSpacing: "0.5px", marginBottom: "10px" }}>
                JUGADORES EN EL ROSTER
              </h4>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "10px"
              }}>
                {activeRoster.players.map((player) => (
                  <div
                    key={player.puuid}
                    style={{
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid var(--line)",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className="font-oswald" style={{ color: "white", fontSize: "13px", letterSpacing: "0.5px" }}>
                        {player.riotId}
                        {player.puuid === activePlayer?.puuid && (
                          <span style={{ fontSize: "9px", color: "var(--red)", marginLeft: "6px" }}>(Tú)</span>
                        )}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                        {player.puuid === activePlayer?.puuid ? "Líder de búsqueda" : "Invitado"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <RoleAssigner
                        currentRole={player.role}
                        onChange={(role) => updatePlayerRole(activeRosterId, player.puuid, role)}
                      />
                      <button
                        onClick={() => removePlayer(activeRosterId, player.puuid)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-dim)",
                          cursor: "pointer",
                          padding: "4px"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--red)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs for analysis */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--line)", gap: "16px" }}>
              <button
                onClick={() => setActiveSubTab("synergy")}
                className="font-oswald"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: activeSubTab === "synergy" ? "2px solid var(--red)" : "2px solid transparent",
                  padding: "8px 0",
                  color: activeSubTab === "synergy" ? "white" : "var(--text-dim)",
                  fontSize: "14px",
                  cursor: "pointer",
                  letterSpacing: "0.5px"
                }}
              >
                Matriz de Sinergia
              </button>
              <button
                onClick={() => setActiveSubTab("agents")}
                className="font-oswald"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: activeSubTab === "agents" ? "2px solid var(--red)" : "2px solid transparent",
                  padding: "8px 0",
                  color: activeSubTab === "agents" ? "white" : "var(--text-dim)",
                  fontSize: "14px",
                  cursor: "pointer",
                  letterSpacing: "0.5px"
                }}
              >
                Agentes por Rol
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1 }}>
              {activeSubTab === "synergy" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <SynergyPanel
                    activeRoster={activeRoster}
                    rosterSynergy={rosterSynergy}
                    allSynergy={synergyPairs}
                  />

                  {/* Quick-add teammates helper UI */}
                  {synergyPairs.length > 0 && (
                    <div style={{
                      background: "rgba(255,255,255,0.01)",
                      border: "1px dashed var(--line)",
                      padding: "16px",
                      borderRadius: "6px"
                    }}>
                      <div className="font-oswald" style={{ fontSize: "11px", color: "white", marginBottom: "8px", letterSpacing: "0.5px" }}>
                        COMPAÑEROS FRECUENTES RECOMENDADOS
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {synergyPairs
                          .filter(p => !activeRoster.players.some(rp => rp.puuid === p.puuid))
                          .slice(0, 5)
                          .map(teammate => (
                            <button
                              key={teammate.puuid}
                              onClick={() => handleAddTeammateDirect(teammate)}
                              className="font-oswald"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid var(--line)",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                color: "var(--text-dim)",
                                fontSize: "11px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "white";
                                e.currentTarget.style.borderColor = "var(--red)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--text-dim)";
                                e.currentTarget.style.borderColor = "var(--line)";
                              }}
                            >
                              + {teammate.riotId} ({teammate.games}g)
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === "agents" && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px"
                }}>
                  {activeRoster.players.map((player) => (
                    <AgentRoleBreakdown
                      key={player.puuid}
                      player={player}
                      agentStats={rosterAgentStats[player.puuid] || []}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
