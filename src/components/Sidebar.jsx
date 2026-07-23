import React, { useState, useEffect } from "react";
import { BarChart2, Award, Users, Crosshair, Map, Swords, Search, Clock, Star } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, playerData, onSearch, loading }) {
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTab, setDropdownTab] = useState("results"); // "results" | "recent" | "favorites"
  const [suggestions, setSuggestions] = useState([]);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const savedRecent = JSON.parse(localStorage.getItem("recentPlayers") || "[]");
    const savedFavs = JSON.parse(localStorage.getItem("favoritePlayers") || "[]");
    setRecentPlayers(savedRecent);
    setFavorites(savedFavs);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetch(`${API_BASE}/api/db/players/suggest?q=${encodeURIComponent(inputValue.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data || []);
        })
        .catch((err) => console.warn("Error fetching suggestions:", err));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  const selectPlayer = (player) => {
    setInputValue(`${player.name}#${player.tag}`);
    setIsDropdownOpen(false);
    onSearch(player.name, player.tag);

    let updatedRecent = [player, ...recentPlayers.filter((r) => r.puuid !== player.puuid)].slice(0, 10);
    setRecentPlayers(updatedRecent);
    localStorage.setItem("recentPlayers", JSON.stringify(updatedRecent));
  };

  const toggleFavorite = (e, player) => {
    e.stopPropagation();
    let updatedFavs = [...favorites];
    const idx = updatedFavs.findIndex((f) => f.puuid === player.puuid);
    if (idx !== -1) {
      updatedFavs.splice(idx, 1);
    } else {
      updatedFavs.push(player);
    }
    setFavorites(updatedFavs);
    localStorage.setItem("favoritePlayers", JSON.stringify(updatedFavs));
  };

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
    setIsDropdownOpen(false);
    onSearch(name, tag);
  };

  const renderPlayerRow = (p) => {
    const isFav = favorites.some((f) => f.puuid === p.puuid);
    return (
      <div
        key={p.puuid}
        onClick={() => selectPlayer(p)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 8px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "3px",
          cursor: "pointer",
          transition: "background 0.2s"
        }}
        className="player-suggest-row"
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", color: "var(--red)" }}>🔴</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="font-oswald" style={{ fontSize: "11px", color: "white", letterSpacing: "0.5px" }}>
              {p.name}
              <span style={{ color: "var(--text-dim)", fontSize: "9px", marginLeft: "2px" }}>#{p.tag}</span>
            </span>
            <span style={{ fontSize: "8px", color: "var(--text-dim)" }}>{p.region?.toUpperCase()} · ELO {p.elo || "—"}</span>
          </div>
        </div>
        <button
          onClick={(e) => toggleFavorite(e, p)}
          style={{
            background: "transparent",
            border: "none",
            color: isFav ? "var(--red)" : "var(--text-dim)",
            cursor: "pointer",
            fontSize: "12px",
            display: "flex",
            alignItems: "center"
          }}
        >
          {isFav ? "★" : "☆"}
        </button>
      </div>
    );
  };

  const navItems = [
    { id: "tracker", label: "Tracker", icon: BarChart2, desc: "Análisis y mejora", disabled: !playerData, tooltip: !playerData ? "Buscá un Riot ID primero" : undefined },
    { id: "achievements", label: "Logros", icon: Award, desc: "Trayectoria completa", disabled: !playerData, tooltip: !playerData ? "Buscá un Riot ID primero" : undefined },
    { id: "roster", label: "Roster", icon: Users, desc: "Sinergia de equipos", disabled: !playerData, tooltip: !playerData ? "Buscá un Riot ID primero" : undefined },
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

      <div className="sidebar-search-container" style={{ padding: "0 16px 16px 16px", borderBottom: "1px solid var(--line)", position: "relative" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            placeholder="Nombre#TAG"
            value={inputValue}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
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

        {isDropdownOpen && (
          <div
            className="search-dropdown"
            style={{
              position: "absolute",
              top: "100%",
              left: "16px",
              right: "16px",
              background: "#14171d",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              zIndex: 9999,
              boxShadow: "0 8px 24px rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
              height: "300px",
              width: "300px",
              marginTop: "4px"
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "rgba(0,0,0,0.3)", padding: "4px", gap: "2px" }}>
              {[
                { id: "results", label: "RESULTADOS", icon: Search },
                { id: "recent", label: "RECIENTES", icon: Clock },
                { id: "favorites", label: "FAVORITOS", icon: Star }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDropdownTab(t.id)}
                  className="font-oswald"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    padding: "6px 2px",
                    background: dropdownTab === t.id ? "rgba(255, 70, 85, 0.15)" : "transparent",
                    border: "none",
                    borderRadius: "2px",
                    color: dropdownTab === t.id ? "var(--red)" : "var(--text-dim)",
                    cursor: "pointer",
                    fontSize: "9px",
                    letterSpacing: "0.5px"
                  }}
                >
                  <t.icon size={10} />
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, padding: "8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
              {dropdownTab === "results" && (
                <>
                  <div className="font-oswald" style={{ fontSize: "8px", color: "var(--text-dim)", marginBottom: "4px", letterSpacing: "0.5px" }}>JUGADORES COINCIDENTES</div>
                  {suggestions.length === 0 ? (
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", padding: "15px 0", textAlign: "center" }}>Escribe para sugerir jugadores...</div>
                  ) : (
                    suggestions.map((p) => renderPlayerRow(p))
                  )}
                </>
              )}
              {dropdownTab === "recent" && (
                <>
                  <div className="font-oswald" style={{ fontSize: "8px", color: "var(--text-dim)", marginBottom: "4px", letterSpacing: "0.5px" }}>BÚSQUEDAS RECIENTES</div>
                  {recentPlayers.length === 0 ? (
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", padding: "15px 0", textAlign: "center" }}>Sin búsquedas recientes.</div>
                  ) : (
                    recentPlayers.map((p) => renderPlayerRow(p))
                  )}
                </>
              )}
              {dropdownTab === "favorites" && (
                <>
                  <div className="font-oswald" style={{ fontSize: "8px", color: "var(--text-dim)", marginBottom: "4px", letterSpacing: "0.5px" }}>MIS FAVORITOS</div>
                  {favorites.length === 0 ? (
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", padding: "15px 0", textAlign: "center" }}>No has agregado favoritos.</div>
                  ) : (
                    favorites.map((p) => renderPlayerRow(p))
                  )}
                </>
              )}
            </div>
          </div>
        )}
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
