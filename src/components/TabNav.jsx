import React from "react";
import { Award, BarChart2 } from "lucide-react";

export default function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="tab-nav-container">
      <button
        className={`tab-btn ${activeTab === "achievements" ? "active" : ""}`}
        onClick={() => setActiveTab("achievements")}
      >
        <Award size={16} />
        <span>EXPEDIENTE DE LOGROS</span>
        <div className="tab-indicator" />
      </button>

      <button
        className={`tab-btn ${activeTab === "tracker" ? "active" : ""}`}
        onClick={() => setActiveTab("tracker")}
      >
        <BarChart2 size={16} />
        <span>ANÁLISIS DE TRACKER</span>
        <div className="tab-indicator" />
      </button>
    </div>
  );
}
