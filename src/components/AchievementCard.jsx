import React from "react";

export default function AchievementCard({ achievement, friendAchievement }) {
  const { name, desc, tier, icon, progress, unlocked, currentValue, target } = achievement;
  const friendUnlocked = friendAchievement?.unlocked ?? null;

  return (
    <div className={`ach-card ${unlocked ? "unlocked" : "locked"}`}>
      <div className="ach-top">
        <div className="ach-icon">{icon}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {friendAchievement != null && (
            <span
              className={`friend-badge ${friendUnlocked ? "friend-unlocked" : "friend-locked"}`}
              title={friendUnlocked ? "Tu amigo lo desbloqueó" : "Tu amigo no lo tiene aún"}
            >
              {friendUnlocked ? "👤✓" : "👤✗"}
            </span>
          )}
          <div className={`tier-tag tier-${tier}`}>{tier}</div>
        </div>
      </div>

      <div className="ach-name">{name}</div>
      <div className="ach-desc">{desc}</div>

      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="progress-label">
        <span>{progress}%</span>
        {unlocked ? (
          <span className="unlocked-badge">DESBLOQUEADO</span>
        ) : (
          <span>
            {typeof currentValue === "number" ? currentValue.toLocaleString() : currentValue}
            {" / "}
            {typeof target === "number" ? target.toLocaleString() : target}
          </span>
        )}
      </div>
    </div>
  );
}