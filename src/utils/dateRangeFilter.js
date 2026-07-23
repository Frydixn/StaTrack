/**
 * Filtra un historial de partidas de Valorant según el rango de tiempo seleccionado.
 * @param {Array} matches - Array de partidas.
 * @param {string} range - Rango de tiempo: "7days", "30days", o "all".
 * @returns {Array} - Array de partidas filtrado.
 */
export function filtrarPorRango(matches, range) {
  if (!matches || !Array.isArray(matches)) return [];
  if (range === "all") return matches;

  const nowSeconds = Date.now() / 1000;
  let maxAgeSeconds = 0;

  if (range === "7days") {
    maxAgeSeconds = 7 * 24 * 60 * 60; // 7 días en segundos
  } else if (range === "30days") {
    maxAgeSeconds = 30 * 24 * 60 * 60; // 30 días en segundos
  } else {
    return matches;
  }

  const cutoff = nowSeconds - maxAgeSeconds;

  return matches.filter((m) => {
    const gameStart = m.metadata?.game_start || 0;
    return gameStart >= cutoff;
  });
}
