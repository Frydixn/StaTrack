import React, { useState } from "react";
import { BarChart2, Award, Users, Crosshair, Map, Swords } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, playerData, onSearch, loading }) {
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = inputValue.trim();
    if (!raw.includes("#")) {
      setErrorMsg("Formato: Nombre#TAG");
      return;
    }
    const [name, tag] = raw.split("#");
    if (!name || !tag) {
      setErrorMsg("Nombre y tag son obligatorios.");
      return;
    }
    setErrorMsg("");
    onSearch(name, tag);
  };

  const navItems = [
    { id: "tracker", label: "Tracker", icon: BarChart2, desc: "Análisis y mejora", disabled: !playerData, tooltip: !playerData ? "Buscá un Riot ID primero" : undefined },
    { id: "achievements", label: "Logros", icon: Award, desc: "Trayectoria completa", disabled: !playerData, tooltip: !playerData ? "Buscá un Riot ID primero" : undefined },
    { id: "compare", label: "Comparar", icon: Swords, desc: "vs amigos y pros", disabled: false, tooltip: undefined },
    { id: "maps", label: "Mapas", icon: Map, desc: "Rotación y detalles", disabled: false, tooltip: undefined },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Crosshair className="sidebar-brand-icon" size={20} />
        <span className="sidebar-brand-text">
          Track<span className="brand-red">Trics  </span>
        </span>
      </div>

      <div className="sidebar-search-container" style={{ padding: "0 16px 16px 16px", borderBottom: "1px solid var(--line)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            placeholder="Nombre#TAG"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            disabled={loading}
            style={{
              flex: 1,
              background: "var(--bg)",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              padding: "6px 10px",
              color: "var(--text)",
              fontSize: "12px",
              fontFamily: "inherit",
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            style={{
              background: "var(--red)",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {loading ? "..." : "IR"}
          </button>
        </form>
        {errorMsg && <div style={{ color: "var(--red)", fontSize: "10px", marginTop: "4px", fontFamily: "monospace" }}>{errorMsg}</div>}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
              title={item.tooltip}
            >
              <Icon className="sidebar-nav-icon" size={20} />
              <div className="sidebar-nav-text">
                <span className="sidebar-nav-label">{item.label}</span>
                <span className="sidebar-nav-desc">{item.desc}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {playerData && (
        <div className="sidebar-mini-profile">
          <div className="mini-profile-info">
            <div className="mini-profile-name">
              {playerData.account?.name}
              <span className="mini-profile-tag">#{playerData.account?.tag}</span>
            </div>
            <div className="mini-profile-rank">
              {playerData.stats?.rankTier || "Unranked"}
            </div>
          </div>
          <div className="mini-profile-progress">
            <div className="mini-profile-progress-label">
              <span>Logros</span>
              <span>{playerData.summary?.percent || 0}%</span>
            </div>
            <div className="sidebar-mini-bar-bg">
              <div
                className="sidebar-mini-bar-fill"
                style={{ width: `${playerData.summary?.percent || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        VALOQUEST v1.0.0
      </div>
    </aside>
  );
}
