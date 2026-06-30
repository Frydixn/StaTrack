import React from "react";
import { RefreshCw, MapPin, Award, ShieldAlert } from "lucide-react";

export default function ProfileBar({ account, summary, rank, onRefresh, refreshing }) {
  if (!account) return null;

  return (
    <div className="profile-bar">
      <div className="profile-info-left">
        <div className="profile-id">
          {account.name}
          <span className="tag">#{account.tag}</span>
        </div>
        <div className="profile-meta">
          <span className="meta-item">
            <MapPin size={14} className="meta-icon" />
            Región: {account.region?.toUpperCase() || "—"}
          </span>
          <span className="meta-separator">·</span>
          <span className="meta-item">
            Nivel: {account.account_level || account.accountLevel || "—"}
          </span>
          <span className="meta-separator">·</span>
          <span className="meta-item">
            Rango: {rank || "Unranked"}
          </span>
        </div>
      </div>

      <div className="profile-info-right">
        <div className="progress-text">
          <div className="big">{summary.percent}%</div>
          <div className="small">
            {summary.unlocked} / {summary.total} logros
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="btn-secondary"
          disabled={refreshing}
          title="Actualizar datos desde la API de Valorant"
        >
          <RefreshCw size={16} className={refreshing ? "spin-animation" : ""} />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>
    </div>
  );
}
