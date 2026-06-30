// src/components/AchievementsGrid.jsx — REEMPLAZA EL ARCHIVO COMPLETO

import React from "react";
import AchievementCard from "./AchievementCard";

export default function AchievementsGrid({ achievements, friendAchievements }) {
  if (achievements.length === 0) {
    return (
      <div className="empty-achievements">
        No se encontraron logros que coincidan con la búsqueda o el filtro seleccionado.
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