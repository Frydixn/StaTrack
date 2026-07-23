import React from "react";
import { Calendar } from "lucide-react";

/**
 * Selector de rango de fechas para filtrar partidas.
 * @param {Object} props
 * @param {string} props.value - Rango activo ("7days", "30days", "all").
 * @param {Function} props.onChange - Handler de cambio.
 */
export default function DateRangeSelector({ value, onChange }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "rgba(20,23,29,0.9)",
      border: "1px solid var(--line)",
      borderRadius: "4px",
      padding: "4px 8px"
    }}>
      <Calendar size={13} color="var(--text-dim)" />
      <span className="font-oswald" style={{ color: "var(--text-dim)", fontSize: "10px", letterSpacing: "0.5px" }}>
        FILTRAR:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-oswald"
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          fontSize: "11px",
          outline: "none",
          cursor: "pointer",
          letterSpacing: "0.5px",
          textTransform: "uppercase"
        }}
      >
        <option value="7days" style={{ background: "#14171d" }}>Últimos 7 días</option>
        <option value="30days" style={{ background: "#14171d" }}>Últimos 30 días</option>
        <option value="all" style={{ background: "#14171d" }}>Histórico Completo</option>
      </select>
    </div>
  );
}
