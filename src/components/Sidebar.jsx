import React from "react";
import { BarChart2, Award, Users, Crosshair } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, playerData }) {
  const isNavDisabled = !playerData;
  const tooltipText = isNavDisabled ? "Buscá un Riot ID primero" : undefined;

  const navItems = [
    { id: "tracker", label: "Tracker", icon: BarChart2, desc: "Análisis y mejora" },
    { id: "achievements", label: "Logros", icon: Award, desc: "Trayectoria completa" },
    { id: "compare", label: "Comparar", icon: Users, desc: "Vs. un amigo" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Crosshair className="sidebar-brand-icon" size={20} />
        <span className="sidebar-brand-text">
          VALOR<span className="brand-red">QUEST</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
              onClick={() => !isNavDisabled && setActiveTab(item.id)}
              disabled={isNavDisabled}
              title={tooltipText}
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
