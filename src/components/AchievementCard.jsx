import React from "react";
import { useTranslation } from "react-i18next";

export default function AchievementCard({ achievement, friendAchievement }) {
  const { t } = useTranslation();
  const { name, desc, tier, icon, progress, unlocked, currentValue, target } = achievement;
  const friendUnlocked = friendAchievement?.unlocked ?? null;

  const displayName = t(`achievement_list.${achievement.id}_name`, { defaultValue: name });
  const displayDesc = t(`achievement_list.${achievement.id}_desc`, { defaultValue: desc });

  return (
    <div className={`ach-card ${unlocked ? "unlocked" : "locked"}`}>
      <div className="ach-top">
        <div className="ach-icon">{icon}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {friendAchievement != null && (
            <span
              className={`friend-badge ${friendUnlocked ? "friend-unlocked" : "friend-locked"}`}
              title={friendUnlocked ? t("achievements.rival_unlocked") : t("achievements.rival_locked")}
            >
              {friendUnlocked ? "👤✓" : "👤✗"}
            </span>
          )}
          <div className={`tier-tag tier-${tier}`}>{tier}</div>
        </div>
      </div>

      <div className="ach-name">{displayName}</div>
      <div className="ach-desc">{displayDesc}</div>

      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="progress-label">
        <span>{progress}%</span>
        {unlocked ? (
          <span className="unlocked-badge">{t("achievements.unlocked_badge")}</span>
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