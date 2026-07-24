import React from "react";
import { useTranslation } from "react-i18next";
import AchievementCard from "./AchievementCard";

export default function AchievementsGrid({ achievements, friendAchievements }) {
  const { t } = useTranslation();

  if (achievements.length === 0) {
    return (
      <div className="empty-achievements">
        {t("achievements.empty")}
      </div>
    );
  }

  return (
    <div className="achievements-grid">
      {achievements.map((ach) => {
        const friendAch = friendAchievements
          ? friendAchievements.find((f) => f.id === ach.id)
          : null;
        return (
          <AchievementCard key={ach.id} achievement={ach} friendAchievement={friendAch} />
        );
      })}
    </div>
  );
}