import React, { useState, useEffect, useRef, useCallback } from "react";
import { Compass, Info } from "lucide-react";

// ─── Ability Classification (Meters converted to % on a 80m x 80m field, i.e. 1m = 1.25% of the canvas) ─────────────────
const METERS_TO_PCT = 1.25; // 10px por metro en un canvas de 800px (10 / 800 * 100 = 1.25%)
const SCALE_FACTOR = 2.0 / 4.1; // Escalamos basándonos en que el Humo Cortina de Brimstone (4.1m en base de datos) ahora tiene un radio de 2.0m en la pizarra

function classifyAbility(ability, agentName, agentRole) {
  if (!ability || !ability.displayIcon) return null;
  const name = (ability.displayName || "").toLowerCase();
  const agent = (agentName || "").toLowerCase();

  // 1. Definiendo los arquetipos de humo según la base de datos de habilidades
  const smokeKeywords = ["dark cover", "sky smoke", "gravity well", "nebula", "from the shadows", "haze", "cloudburst", "cove", "cascade", "ruse", "waveform"];
  const isSmoke = smokeKeywords.some(k => name.includes(k)) || (agent === "viper" && name.includes("poison"));

  if (isSmoke) {
    // Humos estándar tienen radio de 2.0m
    let radiusMeters = 2.0;
    let fillColor, strokeColor;
    if (agent === "omen") { fillColor = "rgba(120,80,160,0.45)"; strokeColor = "rgba(160,120,200,0.8)"; }
    else if (agent === "brimstone") { fillColor = "rgba(200,100,50,0.45)"; strokeColor = "rgba(230,140,80,0.8)"; }
    else if (agent === "astra") { fillColor = "rgba(150,60,210,0.45)"; strokeColor = "rgba(180,100,240,0.8)"; }
    else if (agent === "clove") { fillColor = "rgba(217,70,239,0.45)"; strokeColor = "rgba(240,110,250,0.8)"; }
    else if (agent === "harbor") { fillColor = "rgba(14,165,233,0.40)"; strokeColor = "rgba(14,200,255,0.8)"; }
    else if (agent === "viper") { fillColor = "rgba(34,197,94,0.40)"; strokeColor = "rgba(60,230,110,0.8)"; }
    else if (agent === "miks") { fillColor = "rgba(244,63,94,0.45)"; strokeColor = "rgba(251,113,133,0.8)"; }
    else { fillColor = "rgba(100,100,140,0.45)"; strokeColor = "rgba(160,160,200,0.8)"; }
    return { archetype: "smoke", radius: radiusMeters * METERS_TO_PCT, fillColor, strokeColor, resizable: false };
  }

  // 2. Clasificación basada en tu base de datos con factor de escala proporcional (x * SCALE_FACTOR)

  // Brimstone Ult (Golpe Orbital)
  if (agent === "brimstone" && (name.includes("orbital") || name.includes("golpe"))) {
    return { archetype: "molotov", radius: (8 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(249, 115, 22, 0.4)", strokeColor: "#c2410c", resizable: false };
  }
  // Brimstone Molly (Incendiario)
  if (agent === "brimstone" && (name.includes("incendiary") || name.includes("incendiario"))) {
    return { archetype: "molotov", radius: (4.5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(239, 68, 68, 0.40)", strokeColor: "#b91c1c", resizable: false };
  }
  // Omen Blind (Paranoia)
  if (agent === "omen" && (name.includes("paranoia") || name.includes("ceguera"))) {
    return { archetype: "wall", length: (35 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (4 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#6d28d9", fillColor: "rgba(76, 29, 149, 0.1)" };
  }
  // Viper Wall (Pantalla Tóxica)
  if (agent === "viper" && (name.includes("screen") || name.includes("pantalla"))) {
    return { archetype: "wall", length: (71 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (0.8 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#15803d", fillColor: "rgba(34, 197, 94, 0.1)" };
  }
  // Viper Molly (Veneno de Serpiente)
  if (agent === "viper" && (name.includes("snake") || name.includes("veneno"))) {
    return { archetype: "slow", radius: (4 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(132, 204, 22, 0.35)", strokeColor: "#4d7c0f", resizable: false };
  }
  // Viper Pit (Pozo de la Víbora)
  if (agent === "viper" && (name.includes("pit") || name.includes("pozo"))) {
    return { archetype: "slow", radius: (15 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(34, 197, 94, 0.25)", strokeColor: "#16a34a", resizable: false };
  }
  // Astra Pull (Pozo de Gravedad)
  if (agent === "astra" && (name.includes("gravity") || name.includes("pozo") || name.includes("pull"))) {
    return { archetype: "slow", radius: (4.75 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(139, 92, 246, 0.35)", strokeColor: "#4c1d95", resizable: false };
  }
  // Harbor Wall (Marea Alta)
  if (agent === "harbor" && (name.includes("tide") || name.includes("marea"))) {
    return { archetype: "wall", length: (50 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (1 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#0284c7", fillColor: "rgba(14, 165, 233, 0.1)" };
  }
  // Harbor Domo (Cove)
  if (agent === "harbor" && (name.includes("cove") || name.includes("domo"))) {
    return { archetype: "smoke", radius: (4 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(14, 165, 233, 0.40)", strokeColor: "#0369a1", resizable: false };
  }
  // Killjoy Swarm (Nanoswarm)
  if (agent === "killjoy" && (name.includes("swarm") || name.includes("nanoenjambre") || name.includes("nanosambre"))) {
    return { archetype: "molotov", radius: (4.5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(250, 204, 21, 0.4)", strokeColor: "#ca8a04", resizable: false };
  }
  // Killjoy Alarm (Bot de Alarma)
  if (agent === "killjoy" && (name.includes("alarm") || name.includes("alarma"))) {
    return { archetype: "slow", radius: (5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(250, 204, 21, 0.1)", strokeColor: "#ca8a04", resizable: false };
  }
  // Killjoy Ult (Dispositivo Inmovilizador)
  if (agent === "killjoy" && (name.includes("lockdown") || name.includes("inmovilizador"))) {
    return { archetype: "slow", radius: (30 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(250, 204, 21, 0.15)", strokeColor: "#eab308", resizable: false };
  }
  // Cypher Cage (Prisión Cibernética)
  if (agent === "cypher" && (name.includes("cage") || name.includes("prisión"))) {
    return { archetype: "smoke", radius: (3.5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(156, 163, 175, 0.45)", strokeColor: "#6b7280", resizable: false };
  }
  // Cypher Trapwire (Cable Trampa)
  if (agent === "cypher" && (name.includes("wire") || name.includes("cable") || name.includes("trap"))) {
    return { archetype: "trapwire", length: (15 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (0.2 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#9ca3af", isResizable: true };
  }
  // Sage Slow (Orbe de Lentitud)
  if (agent === "sage" && (name.includes("slow") || name.includes("lentitud"))) {
    return { archetype: "slow", radius: (7 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(45, 212, 191, 0.35)", strokeColor: "#0f766e", resizable: false };
  }
  // Sage Wall (Orbe Barrera)
  if (agent === "sage" && (name.includes("barrier") || name.includes("barrera") || name.includes("wall") || name.includes("muro"))) {
    return { archetype: "wall", length: (10 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (1.2 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#0891b2", fillColor: "rgba(6, 182, 212, 0.1)" };
  }
  // Deadlock Sensor (Sensor Sónico)
  if (agent === "deadlock" && (name.includes("sensor") || name.includes("sónico"))) {
    return { archetype: "wall", length: (8 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (6 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#94a3b8", fillColor: "rgba(203, 213, 225, 0.1)" };
  }
  // Deadlock Net (Red Gravitacional)
  if (agent === "deadlock" && (name.includes("net") || name.includes("red") || name.includes("gravitacional"))) {
    return { archetype: "slow", radius: (6 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(203, 213, 225, 0.35)", strokeColor: "#64748b", resizable: false };
  }
  // KAY/O Knife (Punto cero)
  if (agent === "kayo" && (name.includes("knife") || name.includes("cero") || name.includes("cuchillo") || name.includes("zero"))) {
    return { archetype: "slow", radius: (15 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(59, 130, 246, 0.15)", strokeColor: "#2563eb", resizable: false };
  }
  // KAY/O Molly (Frags / fragmento)
  if (agent === "kayo" && (name.includes("frag") || name.includes("fragmento") || name.includes("molly"))) {
    return { archetype: "molotov", radius: (4 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(59, 130, 246, 0.40)", strokeColor: "#1d4ed8", resizable: false };
  }
  // KAY/O Ult (NULL/CMD)
  if (agent === "kayo" && (name.includes("null") || name.includes("cmd") || name.includes("ult"))) {
    return { archetype: "slow", radius: (40 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(59, 130, 246, 0.10)", strokeColor: "#1e40af", resizable: false };
  }
  // Sova Recon (Reconocedor)
  if (agent === "sova" && (name.includes("recon") || name.includes("reconocedor"))) {
    return { archetype: "slow", radius: (30 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(56, 189, 248, 0.1)", strokeColor: "#0284c7", resizable: false };
  }
  // Sova Shock (Flecha explosiva)
  if (agent === "sova" && (name.includes("shock") || name.includes("explosiva"))) {
    return { archetype: "molotov", radius: (5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(56, 189, 248, 0.35)", strokeColor: "#0369a1", resizable: false };
  }
  // Fade Seize (Aprehensión)
  if (agent === "fade" && (name.includes("seize") || name.includes("aprehensión"))) {
    return { archetype: "slow", radius: (4.5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(88, 28, 135, 0.40)", strokeColor: "#4c1d95", resizable: false };
  }
  // Fade Ult (Ocaso)
  if (agent === "fade" && (name.includes("nightfall") || name.includes("ocaso") || name.includes("ult"))) {
    return {
      archetype: "cone",
      length: (35 * SCALE_FACTOR) * METERS_TO_PCT,
      startWidth: (10 * SCALE_FACTOR) * METERS_TO_PCT,
      endWidth: (30 * SCALE_FACTOR) * METERS_TO_PCT,
      strokeColor: "#3b0764",
      fillColor: "rgba(88, 28, 135, 0.3)",
      isResizable: false
    };
  }
  // Breach Stun (Falla Sísmica)
  if (agent === "breach" && (name.includes("fault") || name.includes("falla"))) {
    return { archetype: "wall", length: (35 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (4.5 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#b45309", fillColor: "rgba(217, 119, 6, 0.1)", isResizable: true };
  }
  // Breach Ult (Fragor Imparable)
  if (agent === "breach" && (name.includes("rolling") || name.includes("fragor") || name.includes("ult"))) {
    return {
      archetype: "cone",
      length: (38 * SCALE_FACTOR) * METERS_TO_PCT,
      startWidth: (6 * SCALE_FACTOR) * METERS_TO_PCT,
      endWidth: (26 * SCALE_FACTOR) * METERS_TO_PCT,
      strokeColor: "#92400e",
      fillColor: "rgba(217, 119, 6, 0.5)",
      isResizable: true
    };
  }
  // Gekko Mosh (Mosh Pit)
  if (agent === "gekko" && (name.includes("mosh") || name.includes("pit"))) {
    return { archetype: "molotov", radius: (4.5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(163, 230, 53, 0.5)", strokeColor: "#65a30d", resizable: false };
  }
  // Jett Smoke (Nube Explosiva)
  if (agent === "jett" && (name.includes("cloudburst") || name.includes("nube") || name.includes("smoke"))) {
    return { archetype: "smoke", radius: (3 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(226, 232, 240, 0.45)", strokeColor: "#94a3b8", resizable: false };
  }
  // Phoenix Wall (Muro de Fuego)
  if (agent === "phoenix" && (name.includes("blaze") || name.includes("muro"))) {
    return { archetype: "wall", length: (15 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (1 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#c2410c", fillColor: "rgba(249, 115, 22, 0.1)", isResizable: false };
  }
  // Phoenix Molly (Combustión)
  if (agent === "phoenix" && (name.includes("hands") || name.includes("combustión") || name.includes("molly"))) {
    return { archetype: "molotov", radius: (3.5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(249, 115, 22, 0.40)", strokeColor: "#ea580c", resizable: false };
  }
  // Raze Molly (Carcasas de Pintura)
  if (agent === "raze" && (name.includes("shells") || name.includes("carcasas") || name.includes("grenade") || name.includes("granada"))) {
    return { archetype: "molotov", radius: (5 * SCALE_FACTOR) * METERS_TO_PCT, fillColor: "rgba(244, 63, 94, 0.40)", strokeColor: "#e11d48", resizable: false };
  }
  // Neon Wall (Carril Rápido)
  if (agent === "neon" && (name.includes("lane") || name.includes("carril") || name.includes("wall"))) {
    return { archetype: "wall", length: (40 * SCALE_FACTOR) * METERS_TO_PCT, strokeWidth: (3 * SCALE_FACTOR) * METERS_TO_PCT, strokeColor: "#0284c7", fillColor: "rgba(56, 189, 248, 0.1)", isResizable: true };
  }

  // POINT (fallback)
  return { archetype: "point", radius: 1.5 * METERS_TO_PCT, fillColor: "rgba(255,255,255,0.15)", strokeColor: "rgba(255,255,255,0.6)", resizable: false };
}

// ─── Arrow rendering helper ───────────────────────────────────────────────────
function ArrowShape({ x1, y1, x2, y2, color, opacity = 1, onClick }) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return null;
  const angle = Math.atan2(dy, dx);
  const arrowLen = 2.8, arrowAngle = 0.42;
  const shorten = 2.8;
  const sx2 = x2 - shorten * Math.cos(angle);
  const sy2 = y2 - shorten * Math.sin(angle);
  const p1x = x2 - arrowLen * Math.cos(angle - arrowAngle);
  const p1y = y2 - arrowLen * Math.sin(angle - arrowAngle);
  const p2x = x2 - arrowLen * Math.cos(angle + arrowAngle);
  const p2y = y2 - arrowLen * Math.sin(angle + arrowAngle);
  return (
    <g opacity={opacity} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <line x1={x1} y1={y1} x2={sx2} y2={sy2} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} />
    </g>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MapsView() {
  // External data
  const [maps, setMaps] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState(null);

  const [visibleSectors, setVisibleSectors] = useState({});
  const [filter, setFilter] = useState("rotation");

  // Panel
  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);
  const [agentRoleFilter, setAgentRoleFilter] = useState("ALL");

  // Canvas state
  const [agentMarkers, setAgentMarkers] = useState([]);
  const [abilityMarkers, setAbilityMarkers] = useState([]);
  const [drawnArrows, setDrawnArrows] = useState([]);

  // Drag state
  const [draggingAgentId, setDraggingAgentId] = useState(null);
  const [draggingAbility, setDraggingAbility] = useState(null);
  const [drawingArrow, setDrawingArrow] = useState(null);

  // Tools
  const [activeTool, setActiveTool] = useState("select");
  const [activeArrowColor, setActiveArrowColor] = useState("#00e5d1");

  // Ghost & context menu
  const [ghostPreview, setGhostPreview] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Undo/Redo
  const historyStack = useRef([]);
  const redoStack = useRef([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  // Zoom / Pan states
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const zoomScaleRef = useRef(1);
  const panOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    zoomScaleRef.current = zoomScale;
  }, [zoomScale]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  // Refs
  const canvasRef = useRef(null);
  const isNativeDragging = useRef(false);
  const dragPayloadRef = useRef(null);

  const ACTIVE_MAPS = ["ascent", "split", "summit", "breeze", "lotus", "sunset", "haven"];
  const ARROW_COLORS = ["#00e5d1", "#ff4655", "#f0c343", "#ffffff", "#22c55e", "#f97316"];
  const ROLE_FILTERS = ["ALL", "Controller", "Duelist", "Sentinel", "Initiator"];

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    const isCompetitiveMap = (map) => {
      const url = map.mapUrl || "";
      if (url.includes("/HURM/") || url.includes("/Pangea/")) return false;
      return !!map.displayIcon && map.callouts && map.callouts.length > 0;
    };
    fetch("https://valorant-api.com/v1/maps")
      .then(r => r.json()).then(j => {
        if (j.data) setMaps(j.data.filter(m => m.displayName && m.listViewIcon && isCompetitiveMap(m)));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const roleMap = {
      "Controller": "Controlador",
      "Duelist": "Duelista",
      "Sentinel": "Centinela",
      "Initiator": "Iniciador"
    };
    fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true")
      .then(r => r.json()).then(j => {
        if (j.data) {
          const updated = j.data.map(agent => {
            const spanishRole = roleMap[agent.role?.displayName] || "Duelista";
            let agentName = agent.displayName;
            if (agentName === "KAY/O") agentName = "KayO";
            const localIcon = `/Valorant assets/Agents/Icon/${spanishRole}/${agentName}.png`;
            return {
              ...agent,
              displayName: agentName,
              displayIcon: localIcon
            };
          });
          setAgents(updated);
        }
      })
      .catch(() => { });
  }, []);

  // Measure topbar height
  useEffect(() => {
    const measure = () => {
      const topbarEl = document.querySelector(".topbar");
      const mapsHeaderEl = document.querySelector(".maps-header");
      let totalHeight = 0;
      if (topbarEl) totalHeight += topbarEl.getBoundingClientRect().height;
      if (mapsHeaderEl) totalHeight += mapsHeaderEl.getBoundingClientRect().height;
      if (totalHeight > 0) {
        document.documentElement.style.setProperty(
          "--topbar-height", `${totalHeight}px`
        );
      }
    };
    measure();
    // Medir después del paint para que el DOM esté listo
    const timer = setTimeout(measure, 100);
    return () => clearTimeout(timer);
  }, [selectedMap]);

  // ── Reset on map change ────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedMap) {
      const sectors = {};
      (selectedMap.callouts || []).forEach(c => { sectors[c.superRegionName || "General"] = true; });
      setVisibleSectors(sectors);
    } else {
      setVisibleSectors({});
    }
    setAgentMarkers([]);
    setAbilityMarkers([]);
    setDrawnArrows([]);
    setSelectedAgentUuid(null);
    setContextMenu(null);
    setDrawingArrow(null);
    setActiveTool("select");
    setGhostPreview(null);
    historyStack.current = [];
    redoStack.current = [];
    setHistoryCount(0);
    setRedoCount(0);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsPanning(false);
  }, [selectedMap]);

  // ── Close context menu on outside click ────────────────────────────────────
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  // ── Wheel Event Zoom ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomIntensity = 0.12;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Coordenadas relativas antes del zoom
      const mapX = (mouseX - panOffsetRef.current.x) / zoomScaleRef.current;
      const mapY = (mouseY - panOffsetRef.current.y) / zoomScaleRef.current;

      // Nueva escala (de 1x a 8x)
      const delta = e.deltaY < 0 ? 1 : -1;
      const newScale = Math.max(1, Math.min(8, zoomScaleRef.current + delta * zoomIntensity * zoomScaleRef.current));

      // Re-centrar el offset en 0,0 si volvemos a la escala 1x
      let newPanX = mouseX - mapX * newScale;
      let newPanY = mouseY - mapY * newScale;
      if (newScale === 1) {
        newPanX = 0;
        newPanY = 0;
      }

      setZoomScale(newScale);
      setPanOffset({ x: newPanX, y: newPanY });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); handleRedo(); }
      else if (e.key === "Escape") {
        if (contextMenu) setContextMenu(null);
        else if (drawingArrow) setDrawingArrow(null);
        else setActiveTool("select");
      }
      else if (e.key === "1") setActiveTool("select");
      else if (e.key === "2") setActiveTool("arrow");
      else if (e.key === "3") setActiveTool("eraser");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextMenu, drawingArrow, agentMarkers, abilityMarkers, drawnArrows, historyCount, redoCount]);

  // ── Global mouseup to clear drag states ───────────────────────────────────
  useEffect(() => {
    const onUp = () => {
      setIsPanning(false);
      if (isNativeDragging.current) return;
      if (draggingAgentId) {
        snapshotState(agentMarkers, abilityMarkers, drawnArrows);
        setDraggingAgentId(null);
      }
      if (draggingAbility) {
        snapshotState(agentMarkers, abilityMarkers, drawnArrows);
        setDraggingAbility(null);
      }
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingAgentId, draggingAbility, agentMarkers, abilityMarkers, drawnArrows]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const snapshotState = (am, abm, da) => {
    historyStack.current.push({
      agentMarkers: JSON.parse(JSON.stringify(am)),
      abilityMarkers: JSON.parse(JSON.stringify(abm)),
      drawnArrows: JSON.parse(JSON.stringify(da))
    });
    if (historyStack.current.length > 30) historyStack.current.shift();
    redoStack.current = [];
    setHistoryCount(historyStack.current.length);
    setRedoCount(0);
  };

  const applySnapshot = (snap) => {
    setAgentMarkers(JSON.parse(JSON.stringify(snap.agentMarkers)));
    setAbilityMarkers(JSON.parse(JSON.stringify(snap.abilityMarkers)));
    setDrawnArrows(JSON.parse(JSON.stringify(snap.drawnArrows)));
  };

  const handleUndo = useCallback(() => {
    if (historyStack.current.length === 0) return;
    redoStack.current.push({
      agentMarkers: JSON.parse(JSON.stringify(agentMarkers)),
      abilityMarkers: JSON.parse(JSON.stringify(abilityMarkers)),
      drawnArrows: JSON.parse(JSON.stringify(drawnArrows))
    });
    applySnapshot(historyStack.current.pop());
    setHistoryCount(historyStack.current.length);
    setRedoCount(redoStack.current.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentMarkers, abilityMarkers, drawnArrows]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    historyStack.current.push({
      agentMarkers: JSON.parse(JSON.stringify(agentMarkers)),
      abilityMarkers: JSON.parse(JSON.stringify(abilityMarkers)),
      drawnArrows: JSON.parse(JSON.stringify(drawnArrows))
    });
    applySnapshot(redoStack.current.pop());
    setHistoryCount(historyStack.current.length);
    setRedoCount(redoStack.current.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentMarkers, abilityMarkers, drawnArrows]);

  const clearBoard = () => {
    snapshotState(agentMarkers, abilityMarkers, drawnArrows);
    setAgentMarkers([]);
    setAbilityMarkers([]);
    setDrawnArrows([]);
    historyStack.current = [];
    redoStack.current = [];
    setHistoryCount(0);
    setRedoCount(0);
  };

  const getCanvasCoords = (e) => {
    if (!canvasRef.current) return { x: 50, y: 50 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    // 1. Apply inverse of zoom and panOffset
    const relativeX = (e.clientX - rect.left - (panOffsetRef.current?.x || 0)) / (zoomScaleRef.current || 1);
    const relativeY = (e.clientY - rect.top - (panOffsetRef.current?.y || 0)) / (zoomScaleRef.current || 1);

    let px = (relativeX / rect.width) * 100;
    let py = (relativeY / rect.height) * 100;

    // Apply inverse of mapRotation
    if (mapRotationRef.current === 90) { const tmp = px; px = 100 - py; py = tmp; }
    else if (mapRotationRef.current === 180) { px = 100 - px; py = 100 - py; }
    else if (mapRotationRef.current === 270) { const tmp = px; px = py; py = 100 - tmp; }
    return { x: Math.max(0, Math.min(100, px)), y: Math.max(0, Math.min(100, py)) };
  };

  // Store mapRotation in ref so event handlers can access it
  const mapRotationRef = useRef(0);

  // ── Drag-from-panel handlers ───────────────────────────────────────────────
  const onAgentDragStart = (e, agent) => {
    isNativeDragging.current = true;
    dragPayloadRef.current = { type: "agent", agentUuid: agent.uuid, agentName: agent.displayName, icon: agent.displayIcon };
    e.dataTransfer.setData("text/plain", "agent");
    e.dataTransfer.effectAllowed = "copy";
  };

  const onAbilityDragStart = (e, ability, agent) => {
    const classified = classifyAbility(ability, agent.displayName, agent.role?.displayName);
    if (!classified) return;
    isNativeDragging.current = true;
    dragPayloadRef.current = { type: "ability", abilityName: ability.displayName, icon: ability.displayIcon, agentName: agent.displayName, classified };
    e.dataTransfer.setData("text/plain", "ability");
    e.dataTransfer.effectAllowed = "copy";
  };

  const onPanelDragEnd = () => {
    isNativeDragging.current = false;
    dragPayloadRef.current = null;
    setGhostPreview(null);
  };

  // ── Canvas event handlers ──────────────────────────────────────────────────
  const onCanvasDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!dragPayloadRef.current) return;
    const { x, y } = getCanvasCoords(e);
    const p = dragPayloadRef.current;
    if (p.type === "agent") {
      setGhostPreview({ type: "agent", cx: x, cy: y, icon: p.icon });
    } else if (p.type === "ability") {
      const c = p.classified;
      if (["smoke", "molotov", "slow", "point"].includes(c.archetype)) {
        setGhostPreview({ type: "circle", cx: x, cy: y, radius: c.radius || 5, fillColor: c.fillColor, strokeColor: c.strokeColor });
      } else if (c.archetype === "cone") {
        setGhostPreview({ type: "cone", cx: x, cy: y, length: c.length, startWidth: c.startWidth, endWidth: c.endWidth, strokeColor: c.strokeColor, fillColor: c.fillColor });
      } else {
        setGhostPreview({ type: "line", x1: x, y1: y, x2: x + (c.archetype === "wall" ? 14 : 10), y2: y, strokeColor: c.strokeColor, strokeWidth: c.strokeWidth });
      }
    }
  };

  const onCanvasDrop = (e) => {
    e.preventDefault();
    setGhostPreview(null);
    const payload = dragPayloadRef.current;
    if (!payload) return;
    const { x, y } = getCanvasCoords(e);

    if (payload.type === "agent") {
      snapshotState(agentMarkers, abilityMarkers, drawnArrows);
      setAgentMarkers(prev => [...prev, { id: generateId(), agentUuid: payload.agentUuid, agentName: payload.agentName, icon: payload.icon, x, y, team: null }]);
    } else if (payload.type === "ability") {
      const c = payload.classified;
      snapshotState(agentMarkers, abilityMarkers, drawnArrows);
      let newMarker;
      if (["smoke", "molotov", "slow", "point"].includes(c.archetype)) {
        newMarker = { id: generateId(), archetype: c.archetype, agentName: payload.agentName, abilityName: payload.abilityName, icon: payload.icon, cx: x, cy: y, radius: c.radius || 5, fillColor: c.fillColor, strokeColor: c.strokeColor, resizable: false, team: null };
      } else if (["wall", "trapwire", "cone"].includes(c.archetype)) {
        newMarker = {
          id: generateId(),
          archetype: c.archetype,
          agentName: payload.agentName,
          abilityName: payload.abilityName,
          icon: payload.icon,
          x,
          y,
          maxLength: c.length || 10,
          length: c.length || 10,
          startWidth: c.startWidth || 0,
          endWidth: c.endWidth || 0,
          rotation: 0,
          strokeWidth: c.strokeWidth,
          strokeColor: c.strokeColor,
          fillColor: c.fillColor || null,
          strokeDasharray: c.strokeDasharray || null,
          isResizable: c.isResizable || false,
          team: null
        };
      }
      if (newMarker) setAbilityMarkers(prev => [...prev, newMarker]);
    }
    isNativeDragging.current = false;
    dragPayloadRef.current = null;
  };

  const onCanvasMouseDown = (e) => {
    if (e.button === 0) {
      if (activeTool === "arrow") {
        const { x, y } = getCanvasCoords(e);
        setDrawingArrow({ x1: x, y1: y, currentX: x, currentY: y });
      } else if (activeTool === "select") {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
    }
  };

  const onCanvasMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }
    if (draggingAgentId) {
      const { x, y } = getCanvasCoords(e);
      setAgentMarkers(prev => prev.map(m => m.id === draggingAgentId ? { ...m, x, y } : m));
      return;
    }
    if (draggingAbility) {
      const { x, y } = getCanvasCoords(e);
      const { markerId, handleType, offsetAx, offsetAy } = draggingAbility;
      setAbilityMarkers(prev => prev.map(m => {
        if (m.id !== markerId) return m;
        if (handleType === "center") return { ...m, cx: x, cy: y };
        if (handleType === "origin") return { ...m, x, y };
        if (handleType === "rotate") {
          const dx = x - m.x;
          const dy = y - m.y;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          let newLength = m.length;
          if (m.isResizable) {
            const dist = Math.hypot(dx, dy);
            newLength = Math.min(m.maxLength, Math.max(METERS_TO_PCT, dist));
          }
          return { ...m, rotation: angle, length: newLength };
        }
        if (handleType === "move_line") {
          return { ...m, x: Math.max(0, Math.min(100, x - offsetAx)), y: Math.max(0, Math.min(100, y - offsetAy)) };
        }
        return m;
      }));
      return;
    }
    if (drawingArrow) {
      const { x, y } = getCanvasCoords(e);
      setDrawingArrow(prev => ({ ...prev, currentX: x, currentY: y }));
    }
  };

  const onCanvasMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (draggingAgentId) {
      snapshotState(agentMarkers, abilityMarkers, drawnArrows);
      setDraggingAgentId(null);
      return;
    }
    if (draggingAbility) {
      snapshotState(agentMarkers, abilityMarkers, drawnArrows);
      setDraggingAbility(null);
      return;
    }
    if (drawingArrow) {
      const { x1, y1, currentX, currentY } = drawingArrow;
      const dist = Math.hypot(currentX - x1, currentY - y1);
      if (dist > 3) {
        snapshotState(agentMarkers, abilityMarkers, drawnArrows);
        setDrawnArrows(prev => [...prev, { id: generateId(), x1, y1, x2: currentX, y2: currentY, color: activeArrowColor, team: null }]);
      }
      setDrawingArrow(null);
    }
  };

  const assignTeam = (markerId, markerType, team) => {
    if (markerType === "agent") {
      setAgentMarkers(prev => prev.map(m => m.id === markerId ? { ...m, team } : m));
    } else {
      setAbilityMarkers(prev => prev.map(m => m.id === markerId ? { ...m, team } : m));
    }
    setContextMenu(null);
  };

  const deleteElement = (markerId, markerType) => {
    snapshotState(agentMarkers, abilityMarkers, drawnArrows);
    if (markerType === "agent") setAgentMarkers(prev => prev.filter(m => m.id !== markerId));
    else if (markerType === "ability") setAbilityMarkers(prev => prev.filter(m => m.id !== markerId));
    else if (markerType === "arrow") setDrawnArrows(prev => prev.filter(m => m.id !== markerId));
  };

  const filteredMaps = maps.filter(m => filter === "rotation" ? ACTIVE_MAPS.includes(m.displayName.toLowerCase()) : true);
  const filteredAgents = agentRoleFilter === "ALL" ? agents : agents.filter(a => a.role?.displayName === agentRoleFilter);
  const selectedAgent = agents.find(a => a.uuid === selectedAgentUuid);

  // ── Map Detail View ────────────────────────────────────────────────────────
  if (selectedMap) {
    const activeMap = selectedMap;
    const hasMinimap = !!activeMap.displayIcon;
    const calloutsList = activeMap.callouts || [];

    const convertCoords = (x, y) => {
      const { xMultiplier, yMultiplier, xScalarToAdd, yScalarToAdd } = activeMap;
      return { x: ((y * xMultiplier) + xScalarToAdd) * 100, y: ((x * yMultiplier) + yScalarToAdd) * 100 };
    };

    const attackerCallout = calloutsList.find(c =>
      c.regionName?.toLowerCase().includes("attack") || c.superRegionName?.toLowerCase().includes("attack")
    );
    let mapRotation = 0;
    if (attackerCallout) {
      const pct = convertCoords(attackerCallout.location.x, attackerCallout.location.y);
      const dx = pct.x - 50, dy = pct.y - 50;
      let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angleDeg < 0) angleDeg += 360;
      let target = 90 - angleDeg;
      if (target < 0) target += 360;
      mapRotation = Math.round(target / 90) * 90;
      if (mapRotation >= 360) mapRotation -= 360;
    }
    mapRotationRef.current = mapRotation;

    const canvasStyle = {
      cursor: draggingAgentId || draggingAbility ? "grabbing"
        : activeTool === "arrow" ? "crosshair"
          : activeTool === "eraser" ? "cell"
            : "default"
    };

    return (
      <div className="maps-view-container">
        <div className="maps-header">
          <div className="maps-title-section">
            <button className="maps-back-btn font-oswald" onClick={() => setSelectedMap(null)}>
              ← VOLVER AL LISTADO
            </button>
            <h1 className="font-oswald" style={{ margin: 0 }}>{activeMap.displayName.toUpperCase()}</h1>
          </div>
          <span className="active-pool-badge font-oswald" style={{ margin: 0, padding: "4px 10px" }}>
            {activeMap.coordinates || "TACTICAL LAYOUT"}
          </span>
        </div>

        {/* Tactical board: Row arrangement with Map Canvas on the left and tools/agents in a vertical sidebar panel on the right */}
        <div className="map-detail-layout" style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          {/* ── Left: Full size Canvas ── */}
          <div className="map-detail-visual-column">
            {hasMinimap ? (
              <div
                ref={canvasRef}
                className="map-detail-canvas-wrapper"
                style={{
                  transform: `rotate(${mapRotation}deg)`,
                  transition: "transform 0.3s ease",
                  width: "min(calc(100vh - var(--topbar-height, 60px) - 32px), calc(100vw - 240px - 220px - 32px))",
                  height: "min(calc(100vh - var(--topbar-height, 60px) - 32px), calc(100vw - 240px - 220px - 32px))",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  position: "relative",
                  ...canvasStyle
                }}
                onDragOver={onCanvasDragOver}
                onDragLeave={() => setGhostPreview(null)}
                onDrop={onCanvasDrop}
                onMouseDown={onCanvasMouseDown}
                onMouseMove={onCanvasMouseMove}
                onMouseUp={onCanvasMouseUp}
              >
                <div
                  className="map-zoom-pan-container"
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                    transformOrigin: "0 0",
                    pointerEvents: "all"
                  }}
                >
                  <img src={activeMap.displayIcon} alt={`${activeMap.displayName} Tactical Layout`} className="map-detail-canvas-img" />

                {/* Bombsites */}
                {calloutsList.map((callout, i) => {
                  if (callout.regionName !== "Site") return null;
                  const pct = convertCoords(callout.location.x, callout.location.y);
                  return (
                    <div key={`s-${i}`} className="map-detail-site-label font-oswald"
                      style={{ left: `${pct.x}%`, top: `${pct.y}%`, transform: `translate(-50%,-50%) rotate(${-mapRotation}deg)` }}>
                      {(callout.superRegionName || "A").toUpperCase()}
                    </div>
                  );
                })}

                {/* Agent markers (divs) */}
                {agentMarkers.map(m => (
                  <div key={m.id} className="agent-marker"
                    style={{
                      left: `${m.x}%`, top: `${m.y}%`,
                      transform: `translate(-50%,-50%) rotate(${-mapRotation}deg)`,
                      border: m.team === "atk" ? "2px solid var(--cyan)" : m.team === "def" ? "2px solid var(--red)" : "2px solid rgba(255,255,255,0.35)",
                      boxShadow: m.team === "atk" ? "0 0 8px rgba(0,229,209,0.55)" : m.team === "def" ? "0 0 8px rgba(255,70,85,0.55)" : "none",
                      cursor: activeTool === "eraser" ? "cell" : "grab",
                      zIndex: draggingAgentId === m.id ? 20 : 10,
                      userSelect: "none", position: "absolute", width: "32px", height: "32px",
                      borderRadius: "50%", overflow: "hidden", background: "var(--bg-panel)"
                    }}
                    onMouseDown={e => {
                      e.stopPropagation(); e.preventDefault();
                      if (activeTool === "eraser") { deleteElement(m.id, "agent"); return; }
                      if (activeTool !== "select") return;
                      setDraggingAgentId(m.id);
                    }}
                    onContextMenu={e => { e.preventDefault(); setContextMenu({ markerId: m.id, markerType: "agent", x: e.clientX, y: e.clientY }); }}
                  >
                    <img src={m.icon} alt={m.agentName} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", userSelect: "none" }} />
                    {m.team && (
                      <div style={{ position: "absolute", top: 0, right: 0, width: "8px", height: "8px", borderRadius: "50%", background: m.team === "atk" ? "var(--cyan)" : "var(--red)", border: "1px solid var(--bg)" }} />
                    )}
                  </div>
                ))}

                {/* Cone / Trapezoid markers (HTML absolute divs) */}
                {abilityMarkers.filter(m => m.archetype === "cone").map(m => {
                  const sc = m.team === "atk" ? "var(--cyan)" : m.team === "def" ? "var(--red)" : m.strokeColor;
                  const fc = m.team === "atk" ? "rgba(0,229,209,0.25)" : m.team === "def" ? "rgba(255,70,85,0.25)" : m.fillColor;

                  // Calcular el ancho proporcional si se ha encogido la habilidad (Interpolación lineal)
                  const progress = m.maxLength ? (m.length / m.maxLength) : 1;
                  const currentEndWidth = m.startWidth + (m.endWidth - m.startWidth) * progress;

                  const topLeftY = ((currentEndWidth - m.startWidth) / 2 / currentEndWidth) * 100;
                  const bottomLeftY = ((currentEndWidth + m.startWidth) / 2 / currentEndWidth) * 100;

                  return (
                    <div
                      key={m.id}
                      className="cone-ability-container"
                      style={{
                        position: "absolute",
                        left: `${m.x}%`,
                        top: `${m.y - (currentEndWidth * METERS_TO_PCT) / 2}%`,
                        width: `${m.length * METERS_TO_PCT}%`,
                        height: `${currentEndWidth * METERS_TO_PCT}%`,
                        transform: `rotate(${m.rotation}deg)`,
                        transformOrigin: "left center",
                        zIndex: 15,
                        pointerEvents: "all"
                      }}
                      onMouseDown={e => {
                        e.stopPropagation();
                        if (activeTool === "eraser") { deleteElement(m.id, "ability"); return; }
                        if (activeTool !== "select") return;
                        const { x, y } = getCanvasCoords(e);
                        setDraggingAbility({ markerId: m.id, handleType: "move_line", offsetAx: x - m.x, offsetAy: y - m.y });
                      }}
                      onContextMenu={e => { e.preventDefault(); setContextMenu({ markerId: m.id, markerType: "ability", x: e.clientX, y: e.clientY }); }}
                    >
                      {/* Trapecio recortado */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: fc,
                          border: `1.5px solid ${sc}`,
                          clipPath: `polygon(0% ${topLeftY}%, 100% 0%, 100% 100%, 0% ${bottomLeftY}%)`,
                          opacity: 0.85
                        }}
                      />

                      {/* Icono centrado contra-rotado */}
                      <img
                        src={m.icon}
                        alt={m.abilityName}
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: `translate(-50%, -50%) rotate(${-m.rotation}deg)`,
                          width: "16px",
                          height: "16px",
                          pointerEvents: "none",
                          userSelect: "none"
                        }}
                      />

                      {/* Controles flotantes en hover contra-rotados */}
                      <div className="ability-hover-controls"
                        style={{
                          position: "absolute",
                          top: "-32px",
                          left: "50%",
                          transform: `translateX(-50%) rotate(${-m.rotation}deg)`,
                          display: "none",
                          gap: "4px",
                          background: "var(--bg-panel)",
                          border: "1px solid var(--line)",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          zIndex: 40
                        }}
                      >
                        <button
                          style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "10px", fontWeight: "bold" }}
                          onClick={e => { e.stopPropagation(); deleteElement(m.id, "ability"); }}
                        >
                          ✕ BORRAR
                        </button>
                      </div>

                      {/* Handle de rotación 360° (fuera del clip-path) */}
                      <div
                        onMouseDown={e => {
                          e.stopPropagation();
                          if (activeTool !== "select") return;
                          setDraggingAbility({ markerId: m.id, handleType: "rotate" });
                        }}
                        style={{
                          position: "absolute",
                          right: "-5px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "white",
                          border: `2.5px solid ${sc}`,
                          cursor: "crosshair",
                          zIndex: 35
                        }}
                        title="Arrastrar para rotar libremente"
                      />
                    </div>
                  );
                })}

                {/* SVG overlay */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 30 }}
                >
                  {/* Walls & Trapwires */}
                  {abilityMarkers.filter(m => m.archetype === "wall" || m.archetype === "trapwire").map(m => {
                    const sc = m.team === "atk" ? "var(--cyan)" : m.team === "def" ? "var(--red)" : m.strokeColor;
                    const isWall = m.archetype === "wall";

                    // Calcular el extremo final en base al origen, largo y rotación
                    const rad = (m.rotation || 0) * (Math.PI / 180);
                    const x2 = m.x + m.length * Math.cos(rad);
                    const y2 = m.y + m.length * Math.sin(rad);

                    // Diamante en el origen (m.x, m.y)
                    const dSize = 0.9;
                    const diamondPoints = `${m.x},${m.y - dSize} ${m.x + dSize},${m.y} ${m.x},${m.y + dSize} ${m.x - dSize},${m.y}`;

                    return (
                      <g key={m.id}
                        onContextMenu={e => { e.preventDefault(); setContextMenu({ markerId: m.id, markerType: "ability", x: e.clientX, y: e.clientY }); }}
                        style={{ pointerEvents: "all" }}
                      >
                        {/* Línea principal fina */}
                        <line x1={m.x} y1={m.y} x2={x2} y2={y2} stroke={sc} strokeWidth={0.8} strokeLinecap="round"
                          strokeDasharray={m.strokeDasharray || undefined}
                          style={{ pointerEvents: "stroke", cursor: activeTool === "eraser" ? "cell" : "move" }}
                          onMouseDown={e => {
                            e.stopPropagation();
                            if (activeTool === "eraser") { deleteElement(m.id, "ability"); return; }
                            if (activeTool !== "select") return;
                            const { x, y } = getCanvasCoords(e);
                            setDraggingAbility({ markerId: m.id, handleType: "move_line", offsetAx: x - m.x, offsetAy: y - m.y });
                          }}
                        />

                        {/* Emisor (Diamante en el origen) */}
                        <polygon points={diamondPoints} fill={sc} stroke="white" strokeWidth={0.2} style={{ pointerEvents: "none" }} />

                        {/* Control handle: Rótulo interactivo blanco en el extremo para girar 360 grados libres */}
                        <circle cx={x2} cy={y2} r={1.0} fill="white" stroke={sc} strokeWidth={0.4} style={{ cursor: "crosshair", pointerEvents: "all" }}
                          onMouseDown={e => { e.stopPropagation(); if (activeTool !== "select") return; setDraggingAbility({ markerId: m.id, handleType: "rotate" }); }}
                          title="Arrastrar para rotar libremente"
                        />
                      </g>
                    );
                  })}
                  {/* Circles: smoke / molotov / slow / point */}
                  {abilityMarkers.filter(m => ["smoke", "molotov", "slow", "point"].includes(m.archetype)).map(m => {
                    const sc = m.team === "atk" ? "var(--cyan)" : m.team === "def" ? "var(--red)" : m.strokeColor;
                    const fc = m.team === "atk" ? "rgba(0,229,209,0.28)" : m.team === "def" ? "rgba(255,70,85,0.28)" : m.fillColor;
                    const isSmoke = m.archetype === "smoke";

                    return (
                      <g key={m.id}
                        style={{ cursor: activeTool === "eraser" ? "cell" : activeTool === "select" ? "move" : "default", pointerEvents: "all" }}
                        onMouseDown={e => {
                          e.stopPropagation();
                          if (activeTool === "eraser") { deleteElement(m.id, "ability"); return; }
                          if (activeTool !== "select") return;
                          setDraggingAbility({ markerId: m.id, handleType: "center" });
                        }}
                        onContextMenu={e => { e.preventDefault(); setContextMenu({ markerId: m.id, markerType: "ability", x: e.clientX, y: e.clientY }); }}
                      >
                        {isSmoke ? (
                          <circle cx={m.cx} cy={m.cy} r={m.radius} fill={fc} stroke={sc} strokeWidth={0.6} strokeDasharray="2 1" />
                        ) : (
                          // Non-smoke circular-logic abilities shown as rounded rectangles (cuadrado con bordes curvos)
                          <rect
                            x={m.cx - m.radius}
                            y={m.cy - m.radius}
                            width={m.radius * 2}
                            height={m.radius * 2}
                            rx={1.5}
                            ry={1.5}
                            fill={fc}
                            stroke={sc}
                            strokeWidth={0.6}
                          />
                        )}
                        {!isSmoke && (
                          <image href={m.icon} x={m.cx - 2.5} y={m.cy - 2.5} width={5} height={5} style={{ pointerEvents: "none" }} />
                        )}
                      </g>
                    );
                  })}

                  {/* Drawn arrows */}
                  {drawnArrows.map(a => (
                    <ArrowShape key={a.id} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} color={a.color}
                      onClick={activeTool === "eraser" ? (e) => { e.stopPropagation(); deleteElement(a.id, "arrow"); } : undefined}
                    />
                  ))}

                  {/* Arrow preview */}
                  {drawingArrow && (
                    <ArrowShape x1={drawingArrow.x1} y1={drawingArrow.y1} x2={drawingArrow.currentX} y2={drawingArrow.currentY} color={activeArrowColor} opacity={0.6} />
                  )}

                  {/* Ghost preview */}
                  {ghostPreview && (() => {
                    const g = ghostPreview;
                    if (g.type === "agent") {
                      return <circle cx={g.cx} cy={g.cy} r={3.5} fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth={0.4} opacity={0.5} />;
                    }
                    if (g.type === "circle") {
                      // Note: check dragPayloadRef to see if the drag is a smoke
                      const isSmoke = dragPayloadRef.current?.classified?.archetype === "smoke";
                      if (isSmoke) {
                        return <circle cx={g.cx} cy={g.cy} r={g.radius} fill={g.fillColor} stroke={g.strokeColor} strokeWidth={0.5} opacity={0.45} />;
                      } else {
                        return (
                          <rect
                            x={g.cx - g.radius}
                            y={g.cy - g.radius}
                            width={g.radius * 2}
                            height={g.radius * 2}
                            rx={1.5}
                            ry={1.5}
                            fill={g.fillColor}
                            stroke={g.strokeColor}
                            strokeWidth={0.5}
                            opacity={0.45}
                          />
                        );
                      }
                    }
                    if (g.type === "line") {
                      return <line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke={g.strokeColor} strokeWidth={g.strokeWidth} opacity={0.45} strokeLinecap="round" />;
                    }
                    if (g.type === "cone") {
                      const h2 = g.endWidth / 2;
                      const sh2 = g.startWidth / 2;
                      const pts = `${g.cx},${g.cy - sh2} ${g.cx + g.length},${g.cy - h2} ${g.cx + g.length},${g.cy + h2} ${g.cx},${g.cy + sh2}`;
                      return <polygon points={pts} fill={g.fillColor} stroke={g.strokeColor} strokeWidth={0.5} opacity={0.45} />;
                    }
                    return null;
                  })()}
                </svg>
              </div>
            </div>
            ) : (
              <div className="map-detail-no-minimap font-oswald text-dim">
                Este mapa no posee minimapa táctico en la base de datos de Valorant-API.
              </div>
            )}
          </div>

          {/* ── Right Column: Control tools and agent selection (organized in a sidebar panel stack) ── */}
          <div className="map-detail-bottom-row" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "220px" }}>

            {/* PANEL 1: Herramientas */}
            <div className="mdo-perf-panel-card">
              <div className="panel-header font-oswald"><span>HERRAMIENTAS</span></div>
              <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Tool buttons */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[["select", "↖ SELECCIONAR"], ["arrow", "→ FLECHA"], ["eraser", "✕ BORRADOR"]].map(([t, label]) => (
                    <button key={t} className={`tool-btn ${activeTool === t ? "active" : ""}`} onClick={() => setActiveTool(t)}>{label}</button>
                  ))}
                </div>

                {/* Arrow color pills */}
                {activeTool === "arrow" && (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", paddingLeft: "2px" }}>
                    {ARROW_COLORS.map(c => (
                      <button key={c} className={`color-pill ${activeArrowColor === c ? "active" : ""}`}
                        style={{ background: c, width: "20px", height: "20px", borderRadius: "50%", border: activeArrowColor === c ? "2px solid white" : "2px solid transparent", cursor: "pointer", padding: 0 }}
                        onClick={() => setActiveArrowColor(c)} />
                    ))}
                  </div>
                )}

                {/* Undo / Redo */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="undo-redo-btn" onClick={handleUndo} disabled={historyCount === 0}>
                    ↩ DESHACER ({historyCount})
                  </button>
                  <button className="undo-redo-btn" onClick={handleRedo} disabled={redoCount === 0}>
                    ↪ REHACER ({redoCount})
                  </button>
                </div>

                {/* Clear */}
                <button className="maps-back-btn font-oswald"
                  style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "4px", padding: "8px 12px", color: "var(--red)", fontSize: "10px", marginRight: 0, textAlign: "center" }}
                  onClick={clearBoard}
                  disabled={agentMarkers.length === 0 && abilityMarkers.length === 0 && drawnArrows.length === 0}
                >
                  LIMPIAR PIZARRA
                </button>
              </div>
            </div>

            {/* PANEL 2: Agentes */}
            <div className="mdo-perf-panel-card">
              <div className="panel-header font-oswald"><span>AGENTES</span></div>
              <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Role filter */}
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {ROLE_FILTERS.map(r => (
                    <button key={r} className={`role-filter-btn ${agentRoleFilter === r ? "active" : ""}`} onClick={() => setAgentRoleFilter(r)}>
                      {r === "ALL" ? "TODOS" : r === "Controller" ? "CTRL" : r === "Duelist" ? "DUEL" : r === "Sentinel" ? "CENT" : "INIC"}
                    </button>
                  ))}
                </div>
                {/* Agent grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "110px", overflowY: "auto" }}>
                  {filteredAgents.map(agent => (
                    <button key={agent.uuid}
                      className="agent-pick-btn"
                      draggable
                      onDragStart={e => onAgentDragStart(e, agent)}
                      onDragEnd={onPanelDragEnd}
                      onClick={() => setSelectedAgentUuid(prev => prev === agent.uuid ? null : agent.uuid)}
                      style={{ outline: selectedAgentUuid === agent.uuid ? "2px solid var(--red)" : "none", outlineOffset: "1px" }}
                      title={agent.displayName}
                    >
                      <img src={agent.displayIcon} alt={agent.displayName} style={{ width: "100%", height: "100%", borderRadius: "4px", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PANEL 3: Habilidades (conditional) */}
            {selectedAgent && (
              <div className="mdo-perf-panel-card">
                <div className="panel-header font-oswald" style={{ justifyContent: "space-between" }}>
                  <span>{selectedAgent.displayName.toUpperCase()} — HABILIDADES</span>
                  <button onClick={() => setSelectedAgentUuid(null)}
                    style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}>✕</button>
                </div>
                <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Agent info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={selectedAgent.displayIcon} alt={selectedAgent.displayName} style={{ width: "30px", height: "30px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--line)" }} />
                    <div>
                      <div className="font-oswald" style={{ fontSize: "12px", color: "var(--text)" }}>{selectedAgent.displayName}</div>
                    </div>
                  </div>
                  {/* Abilities grid */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(selectedAgent.abilities || []).filter(ab => ab.displayIcon && ab.slot !== "Passive").map((ability, i) => {
                      const cl = classifyAbility(ability, selectedAgent.displayName, selectedAgent.role?.displayName);
                      if (!cl) return null;
                      const archetypeEmoji = cl.archetype === "smoke" ? "💨" : cl.archetype === "molotov" ? "🔥" : cl.archetype === "slow" ? "❄️" : cl.archetype === "wall" ? "█" : cl.archetype === "trapwire" ? "⚡" : "●";
                      return (
                        <button key={i}
                          className="ability-pick-btn"
                          draggable
                          onDragStart={e => onAbilityDragStart(e, ability, selectedAgent)}
                          onDragEnd={onPanelDragEnd}
                          title={`${ability.displayName} (${cl.archetype})`}
                        >
                          <img src={ability.displayIcon} alt={ability.displayName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          <span className="ability-archetype-badge">{archetypeEmoji}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context menu */}
        {contextMenu && (
          <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
            {[["atk", "var(--cyan)", "● ATACANTE"], ["def", "var(--red)", "● DEFENSOR"], [null, "var(--text-dim)", "○ SIN EQUIPO"]].map(([team, color, label]) => (
              <button key={String(team)} className="context-menu-item"
                style={{ color }}
                onClick={() => assignTeam(contextMenu.markerId, contextMenu.markerType, team)}
              >
                {label}
              </button>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "2px", paddingTop: "2px" }}>
              <button className="context-menu-item" style={{ color: "var(--red)" }}
                onClick={() => { deleteElement(contextMenu.markerId, contextMenu.markerType); setContextMenu(null); }}>
                🗑 ELIMINAR
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Map List View ────────────────────────────────────────────────────────
  return (
    <div className="maps-view-container">
      <div className="maps-header">
        <div className="maps-title-section">
          <Compass className="maps-title-icon" size={24} />
          <h1 className="font-oswald">EXPLORACIÓN DE MAPAS</h1>
        </div>
        <div className="maps-filter-buttons">
          <button className={`maps-filter-btn font-oswald ${filter === "rotation" ? "active" : ""}`} onClick={() => setFilter("rotation")}>POOL COMPETITIVO</button>
          <button className={`maps-filter-btn font-oswald ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>TODOS LOS MAPAS</button>
        </div>
      </div>

      {loading ? (
        <div className="maps-loading-state">
          <div className="loading-spinner"></div>
          <span className="font-oswald text-dim">Cargando mapas desde Valorant-API...</span>
        </div>
      ) : (
        <div className="maps-grid">
          {filteredMaps.map(map => (
            <div key={map.uuid} className="map-card" onClick={() => setSelectedMap(map)} style={{ cursor: "pointer" }}>
              <div className="map-card-banner" style={{ backgroundImage: `url(${map.listViewIcon})` }}>
                <div className="map-card-overlay">
                  <div className="map-card-text">
                    <h2 className="map-name font-oswald">{map.displayName.toUpperCase()}</h2>
                    <span className="map-coordinate font-oswald text-dim">{map.coordinates || "Coordenadas no disponibles"}</span>
                  </div>
                  {map.displayIcon && (
                    <div className="map-card-minimap-wrap">
                      <img src={map.displayIcon} alt={`${map.displayName} minimap`} className="map-card-minimap-img" />
                    </div>
                  )}
                </div>
              </div>
              <div className="map-card-footer">
                <Info size={13} className="text-dim" />
                <span className="text-dim font-oswald">UUID: {map.uuid.substring(0, 8).toUpperCase()}...</span>
                {ACTIVE_MAPS.includes(map.displayName.toLowerCase()) && (
                  <span className="active-pool-badge font-oswald">COMPETITIVO ACTIVO</span>
                )}
              </div>
            </div>
          ))}
          {filteredMaps.length === 0 && (
            <div className="maps-empty-state text-dim font-oswald">No se encontraron mapas en esta sección.</div>
          )}
        </div>
      )}
    </div>
  );
}
