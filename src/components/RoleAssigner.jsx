import React from "react";

const ROLES = [
  { id: "duelist", name: "Duelista", color: "#ff4655" },
  { id: "initiator", name: "Iniciador", color: "#3b82f6" },
  { id: "controller", name: "Controlador", color: "#a855f7" },
  { id: "sentinel", name: "Centinela", color: "#10b981" },
  { id: "igl", name: "IGL (Líder)", color: "#eab308" }
];

export default function RoleAssigner({ currentRole, onChange }) {
  return (
    <div style={{ display: "inline-block" }}>
      <select
        value={currentRole || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="font-oswald"
        style={{
          background: "rgba(20,23,29,0.9)",
          border: "1px solid var(--line)",
          borderRadius: "4px",
          color: "white",
          padding: "4px 8px",
          fontSize: "11px",
          outline: "none",
          cursor: "pointer",
          letterSpacing: "0.5px",
          textTransform: "uppercase"
        }}
      >
        <option value="" style={{ color: "var(--text-dim)" }}>Sin Rol</option>
        {ROLES.map((r) => (
          <option key={r.id} value={r.id} style={{ color: r.color }}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export { ROLES };
