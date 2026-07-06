const ACHIEVEMENTS = [
  { id: "kills_100", name: "Primera Sangre", desc: "Consigue 100 kills totales", stat: "totalKills", target: 100, tier: "bronze", icon: "🔫" },
  { id: "kills_1000", name: "Eliminador", desc: "Consigue 1,000 kills totales", stat: "totalKills", target: 1000, tier: "silver", icon: "🔫" },
  { id: "kills_5000", name: "Máquina de Guerra", desc: "Consigue 5,000 kills totales", stat: "totalKills", target: 5000, tier: "gold", icon: "🔫" },
  { id: "kills_10000", name: "Leyenda de Combate", desc: "Consigue 10,000 kills totales", stat: "totalKills", target: 10000, tier: "diamond", icon: "💀" },

  { id: "hs_pct_20", name: "Buena Puntería", desc: "Alcanza 20% de headshot rate", stat: "headshotPct", target: 20, tier: "bronze", icon: "🎯" },
  { id: "hs_pct_30", name: "Precisión Letal", desc: "Alcanza 30% de headshot rate", stat: "headshotPct", target: 30, tier: "silver", icon: "🎯" },
  { id: "hs_pct_40", name: "Francotirador Nato", desc: "Alcanza 40% de headshot rate", stat: "headshotPct", target: 40, tier: "gold", icon: "🎯" },
  { id: "hs_pct_50", name: "Cazador de Cráneos", desc: "Alcanza 50% de headshot rate", stat: "headshotPct", target: 50, tier: "diamond", icon: "💯" },

  { id: "matches_10", name: "Novato", desc: "Juega 10 partidas", stat: "matchesPlayed", target: 10, tier: "bronze", icon: "🎮" },
  { id: "matches_100", name: "Veterano", desc: "Juega 100 partidas", stat: "matchesPlayed", target: 100, tier: "silver", icon: "🎮" },
  { id: "matches_500", name: "Adicto a Valorant", desc: "Juega 500 partidas", stat: "matchesPlayed", target: 500, tier: "gold", icon: "🎮" },
  { id: "matches_1000", name: "Veterano de Guerra", desc: "Juega 1,000 partidas", stat: "matchesPlayed", target: 1000, tier: "diamond", icon: "🏅" },

  { id: "winrate_50", name: "Equilibrado", desc: "Mantén un winrate de 50%+", stat: "winrate", target: 50, tier: "bronze", icon: "⚖️" },
  { id: "winrate_60", name: "Ganador Constante", desc: "Mantén un winrate de 60%+", stat: "winrate", target: 60, tier: "silver", icon: "📈" },
  { id: "winrate_70", name: "Imparable", desc: "Mantén un winrate de 70%+", stat: "winrate", target: 70, tier: "gold", icon: "🚀" },
  { id: "winrate_80", name: "Dominante", desc: "Mantén un winrate de 80%+", stat: "winrate", target: 80, tier: "diamond", icon: "👑" },

  { id: "wins_10", name: "Primera Victoria", desc: "Gana 10 partidas", stat: "totalWins", target: 10, tier: "bronze", icon: "🏆" },
  { id: "wins_100", name: "Coleccionista de Victorias", desc: "Gana 100 partidas", stat: "totalWins", target: 100, tier: "silver", icon: "🏆" },
  { id: "wins_500", name: "Campeón Recurrente", desc: "Gana 500 partidas", stat: "totalWins", target: 500, tier: "gold", icon: "🏆" },

  { id: "aces_1", name: "Primer Ace", desc: "Consigue tu primer Ace (5 kills en una ronda)", stat: "aces", target: 1, tier: "silver", icon: "🃏" },
  { id: "aces_5", name: "Coleccionista de Aces", desc: "Consigue 5 Aces", stat: "aces", target: 5, tier: "gold", icon: "🃏" },
  { id: "aces_15", name: "Rey del Ace", desc: "Consigue 15 Aces", stat: "aces", target: 15, tier: "diamond", icon: "🂡" },

  { id: "mvp_1", name: "Jugador Destacado", desc: "Sé MVP de una partida", stat: "mvps", target: 1, tier: "bronze", icon: "⭐" },
  { id: "mvp_25", name: "Estrella del Equipo", desc: "Sé MVP en 25 partidas", stat: "mvps", target: 25, tier: "silver", icon: "🌟" },
  { id: "mvp_100", name: "Carry Profesional", desc: "Sé MVP en 100 partidas", stat: "mvps", target: 100, tier: "gold", icon: "💫" },

  { id: "rank_gold", name: "Llegando Alto", desc: "Alcanza rango Gold", stat: "rankTier", target: "Gold", tier: "bronze", icon: "🥇" },
  { id: "rank_plat", name: "Élite Emergente", desc: "Alcanza rango Platinum", stat: "rankTier", target: "Platinum", tier: "silver", icon: "💎" },
  { id: "rank_diamond", name: "Brillante", desc: "Alcanza rango Diamond", stat: "rankTier", target: "Diamond", tier: "gold", icon: "💠" },
  { id: "rank_ascendant", name: "Ascendido", desc: "Alcanza rango Ascendant", stat: "rankTier", target: "Ascendant", tier: "gold", icon: "🔺" },
  { id: "rank_immortal", name: "Inmortal", desc: "Alcanza rango Immortal", stat: "rankTier", target: "Immortal", tier: "diamond", icon: "🔥" },
  { id: "rank_radiant", name: "Radiante", desc: "Alcanza el rango más alto: Radiant", stat: "rankTier", target: "Radiant", tier: "diamond", icon: "☀️" },

  { id: "agents_5", name: "Explorador de Agentes", desc: "Juega con 5 agentes distintos", stat: "uniqueAgents", target: 5, tier: "bronze", icon: "🧑‍🤝‍🧑" },
  { id: "agents_10", name: "Versátil", desc: "Juega con 10 agentes distintos", stat: "uniqueAgents", target: 10, tier: "silver", icon: "🧑‍🤝‍🧑" },
  { id: "agents_all", name: "Maestro del Roster", desc: "Juega con todos los agentes disponibles", stat: "uniqueAgents", target: 20, tier: "gold", icon: "🧙" },
  { id: "main_agent_50", name: "Especialista", desc: "Juega 50 partidas con tu agente favorito", stat: "mostPlayedAgentCount", target: 50, tier: "silver", icon: "🎭" },
  { id: "main_agent_200", name: "Devoción Absoluta", desc: "Juega 200 partidas con tu agente favorito", stat: "mostPlayedAgentCount", target: 200, tier: "gold", icon: "🎭" },

  { id: "maps_5", name: "Turista", desc: "Juega en 5 mapas distintos", stat: "uniqueMaps", target: 5, tier: "bronze", icon: "🗺️" },
  { id: "maps_all", name: "Conoce el Terreno", desc: "Juega en todos los mapas del pool actual", stat: "uniqueMaps", target: 7, tier: "silver", icon: "🗺️" },

  { id: "dmg_100k", name: "Castigador", desc: "Inflige 100,000 de daño total", stat: "totalDamage", target: 100000, tier: "bronze", icon: "💥" },
  { id: "dmg_500k", name: "Fuerza Destructiva", desc: "Inflige 500,000 de daño total", stat: "totalDamage", target: 500000, tier: "silver", icon: "💥" },
  { id: "dmg_1m", name: "Arma de Destrucción", desc: "Inflige 1,000,000 de daño total", stat: "totalDamage", target: 1000000, tier: "gold", icon: "☄️" },

  { id: "assists_500", name: "Compañero Confiable", desc: "Consigue 500 asistencias", stat: "totalAssists", target: 500, tier: "bronze", icon: "🤝" },
  { id: "assists_2000", name: "Jugador de Equipo", desc: "Consigue 2,000 asistencias", stat: "totalAssists", target: 2000, tier: "silver", icon: "🤝" },

  { id: "kd_1", name: "Equilibrio Justo", desc: "Mantén un K/D ratio de 1.0+", stat: "kdRatio", target: 1.0, tier: "bronze", icon: "⚔️" },
  { id: "kd_1_5", name: "Dominador", desc: "Mantén un K/D ratio de 1.5+", stat: "kdRatio", target: 1.5, tier: "silver", icon: "⚔️" },
  { id: "kd_2", name: "Depredador", desc: "Mantén un K/D ratio de 2.0+", stat: "kdRatio", target: 2.0, tier: "gold", icon: "🦁" },

  { id: "clutch_1", name: "Nervios de Acero", desc: "Gana tu primer clutch 1vX", stat: "clutches", target: 1, tier: "silver", icon: "🧊" },
  { id: "clutch_10", name: "Cerrador", desc: "Gana 10 clutches", stat: "clutches", target: 10, tier: "gold", icon: "🧊" },

  { id: "account_level_20", name: "Recluta", desc: "Alcanza nivel de cuenta 20", stat: "accountLevel", target: 20, tier: "bronze", icon: "🪖" },
  { id: "account_level_100", name: "Veterano de Cuenta", desc: "Alcanza nivel de cuenta 100", stat: "accountLevel", target: 100, tier: "silver", icon: "🪖" },
  { id: "account_level_200", name: "Curtido en Batalla", desc: "Alcanza nivel de cuenta 200", stat: "accountLevel", target: 200, tier: "gold", icon: "🪖" },

  { id: "comeback_win", name: "Resurrección", desc: "Gana una partida tras ir perdiendo 0-4 en rondas", stat: "comebackWins", target: 1, tier: "gold", icon: "🔄" },
  { id: "flawless_round", name: "Ronda Perfecta", desc: "Gana una ronda sin perder a ningún compañero", stat: "flawlessRounds", target: 1, tier: "silver", icon: "✨" },

  { id: "outstanding", name: "Sobresaliente", desc: "Obten estadisticas superiores a las de tu rango actual", stat: "rankTier", target: "Ranked High", tier: "gold", icon: "🏆" },
];

export default ACHIEVEMENTS;
