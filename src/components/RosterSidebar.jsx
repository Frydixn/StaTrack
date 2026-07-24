import React, { useState } from "react";
import { Plus, Trash2, Folder, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RosterSidebar({ rosters, activeRosterId, onSelect, onCreate, onDelete }) {
  const { t } = useTranslation();
  const [newRosterName, setNewRosterName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRosterName.trim()) return;
    onCreate(newRosterName.trim());
    setNewRosterName("");
  };

  return (
    <div style={{
      width: "260px",
      borderRight: "1px solid var(--line)",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      background: "rgba(0,0,0,0.15)"
    }}>
      <div>
        <h4 className="font-oswald" style={{ color: "white", fontSize: "14px", margin: "0 0 12px 0", letterSpacing: "0.5px" }}>
          {t("roster.title_mis_rosters")}
        </h4>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            placeholder={t("roster.placeholder_name")}
            value={newRosterName}
            onChange={(e) => setNewRosterName(e.target.value)}
            style={{
              flex: 1,
              background: "var(--bg)",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              padding: "6px 8px",
              color: "white",
              fontSize: "11px",
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={!newRosterName.trim()}
            style={{
              background: "var(--red)",
              border: "none",
              borderRadius: "4px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
              opacity: newRosterName.trim() ? 1 : 0.5
            }}
          >
            <Plus size={16} />
          </button>
        </form>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        {rosters.length === 0 ? (
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "center", padding: "20px 0" }}>
            {t("roster.no_rosters_created")}
          </div>
        ) : (
          rosters.map((roster) => {
            const isActive = activeRosterId === roster.id;
            const dateStr = new Date(roster.createdAt).toLocaleDateString();

            return (
              <div
                key={roster.id}
                onClick={() => onSelect(roster.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  background: isActive ? "rgba(255,70,85,0.15)" : "rgba(255,255,255,0.02)",
                  border: isActive ? "1px solid var(--red)" : "1px solid var(--line)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                  <Folder size={14} color={isActive ? "var(--red)" : "var(--text-dim)"} style={{ flexShrink: 0 }} />
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <div className="font-oswald" style={{
                      color: isActive ? "white" : "var(--text-dim)",
                      fontSize: "12px",
                      letterSpacing: "0.5px"
                    }}>
                      {roster.name}
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--text-dim)" }}>
                      {t("roster.players_count", { count: roster.players?.length || 0 })} · {dateStr}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(roster.id);
                  }}
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
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
