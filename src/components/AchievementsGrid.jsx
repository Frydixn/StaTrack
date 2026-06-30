import React from "react";
import AchievementCard from "./AchievementCard";

export default function AchievementsGrid({ achievements }) {
  if (achievements.length === 0) {
    return (
      <div className="empty-achievements">
        No se encontraron logros que coincidan con la búsqueda o el filtro seleccionado.
      </div>
    );
  }

  return (
    <div className="achievements-grid">
      {achievements.map((ach) => (
        <AchievementCard key={ach.id} achievement={ach} />
      ))}
    </div>
  );
}
