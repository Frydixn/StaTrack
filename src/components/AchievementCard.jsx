import React from "react";

export default function AchievementCard({ achievement }) {
  const { name, desc, tier, icon, progress, unlocked, currentValue, target } = achievement;

  return (
    <div className={`ach-card ${unlocked ? "unlocked" : "locked"}`}>
      <div className="ach-top">
        <div className="ach-icon">{icon}</div>
        <div className={`tier-tag tier-${tier}`}>{tier}</div>
      </div>
      <div className="ach-name">{name}</div>
      <div className="ach-desc">{desc}</div>
      
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="progress-label">
        <span>{progress}%</span>
        {unlocked ? (
          <span className="unlocked-badge">DESBLOQUEADO</span>
        ) : (
          <span>
            {currentValue} / {target}
          </span>
        )}
      </div>
    </div>
  );
}
