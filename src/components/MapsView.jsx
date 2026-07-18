import React, { useState, useEffect, useRef } from "react";
import { Compass, Info, Trash2 } from "lucide-react";

// ── CONSTANTS ───────────────────────────────────────────────────────────────
const MAP_DIMENSIONS = {
  "Ascent": { widthM: 136, heightM: 124 },
  "Bind": { widthM: 144, heightM: 122 },
  "Haven": { widthM: 164, heightM: 112 },
  "Split": { widthM: 128, heightM: 148 },
  "Fracture": { widthM: 150, heightM: 122 },
  "Pearl": { widthM: 142, heightM: 128 },
  "Lotus": { widthM: 138, heightM: 130 },
  "Sunset": { widthM: 132, heightM: 118 },
  "Abyss": { widthM: 130, heightM: 126 },
  "Icebox": { widthM: 152, heightM: 120 },
};

const AGENT_COLORS = {
  "brimstone": { fill: "rgba(194,96,24,0.45)", stroke: "#c26018" },
  "omen": { fill: "rgba(109,40,217,0.45)", stroke: "#6d28d9" },
  "astra": { fill: "rgba(139,92,246,0.45)", stroke: "#8b5cf6" },
  "clove": { fill: "rgba(217,70,239,0.45)", stroke: "#d946ef" },
  "viper": { fill: "rgba(34,197,94,0.45)", stroke: "#22c55e" },
  "harbor": { fill: "rgba(14,165,233,0.45)", stroke: "#0ea5e9" },
  "killjoy": { fill: "rgba(250,204,21,0.40)", stroke: "#facc15" },
  "cypher": { fill: "rgba(148,163,184,0.45)", stroke: "#94a3b8" },
  "sage": { fill: "rgba(6,182,212,0.45)", stroke: "#06b6d4" },
  "jett": { fill: "rgba(226,232,240,0.45)", stroke: "#e2e8f0" },
  "phoenix": { fill: "rgba(249,115,22,0.45)", stroke: "#f97316" },
  "raze": { fill: "rgba(244,63,94,0.45)", stroke: "#f43f5e" },
  "neon": { fill: "rgba(56,189,248,0.40)", stroke: "#38bdf8" },
  "sova": { fill: "rgba(59,130,246,0.40)", stroke: "#3b82f6" },
  "fade": { fill: "rgba(88,28,135,0.45)", stroke: "#581c87" },
  "breach": { fill: "rgba(217,119,6,0.45)", stroke: "#d97706" },
  "gekko": { fill: "rgba(163,230,53,0.45)", stroke: "#a3e635" },
  "kay/o": { fill: "rgba(59,130,246,0.35)", stroke: "#2563eb" },
  "kayo": { fill: "rgba(59,130,246,0.35)", stroke: "#2563eb" },
  "skye": { fill: "rgba(34,197,94,0.40)", stroke: "#16a34a" },
  "yoru": { fill: "rgba(29,78,216,0.45)", stroke: "#1d4ed8" },
  "reyna": { fill: "rgba(168,85,247,0.45)", stroke: "#a855f7" },
  "chamber": { fill: "rgba(217,119,6,0.40)", stroke: "#d97706" },
  "deadlock": { fill: "rgba(203,213,225,0.40)", stroke: "#cbd5e1" },
  "iso": { fill: "rgba(99,102,241,0.45)", stroke: "#6366f1" },
  "vyse": { fill: "rgba(20,184,166,0.45)", stroke: "#14b8a6" },
  "default": { fill: "rgba(100,116,139,0.40)", stroke: "#64748b" }
};

const TOOL_NAMES = {
  arrow: "FLECHA",
  shape: "FORMA",
  text: "TEXTO",
  eraser: "BORRADOR",
};

// ── CLASSIFY ABILITY ────────────────────────────────────────────────────────
function classifyAbility(ability, agentName) {
  if (!ability) return { type: "point", radiusM: 1.5, fill: "rgba(100,116,139,0.40)", stroke: "#64748b" };
  const name = (ability.displayName || "").toLowerCase();
  const slot = (ability.slot || "");
  const ag = (agentName || "").toLowerCase();
  const colors = AGENT_COLORS[ag] || AGENT_COLORS["default"];

  // Deadlock Custom Abilities
  if (ag === "deadlock") {
    if (name.includes("gravnet")) {
      return { type: "gravnet", radiusM: 7.5, fill: "url(#gravnet-grad)", stroke: "#4f46e5" };
    }
    if (name.includes("barrier mesh") || name.includes("barrier_mesh")) {
      return { type: "barrier_mesh", radiusM: 6.0, fill: "rgba(59,130,246,0.15)", stroke: "#3b82f6" };
    }
    if (name.includes("sonic sensor") || name.includes("sonic_sensor")) {
      return { type: "sonic_sensor", radiusM: 5.5, fill: "rgba(6,182,212,0.15)", stroke: "#06b6d4" };
    }
  }

  // 1. Ult Area
  if (slot === "Ultimate" && (name.includes("lockdown") || name.includes("viper's pit") || name.includes("null/cmd"))) {
    let radiusM = 35;
    if (name.includes("viper's pit")) radiusM = 18;
    if (name.includes("null/cmd")) radiusM = 45;
    const fill = colors.stroke + "26"; // ~15% opacity hex
    return { type: "ult_area", radiusM, fill, stroke: colors.stroke };
  }

  // 2. Smoke
  const smokeKeywords = ["smoke", "dark cover", "nebula", "ruse", "cove", "cascade", "poison cloud", "sky smoke", "cloudburst"];
  if (smokeKeywords.some(k => name.includes(k))) {
    let radiusM = 5.0;
    if (ag === "viper") radiusM = 5.5;
    else if (ag === "harbor") radiusM = 4.0;
    else if (ag === "jett") radiusM = 3.5;
    return { type: "smoke", radiusM, fill: colors.fill, stroke: colors.stroke };
  }

  // 3. Molotov
  const molotovKeywords = ["hot hands", "blaze", "nanoswarm", "paint shells", "incendiary", "snake bite", "trailblazer"];
  if (molotovKeywords.some(k => name.includes(k))) {
    let radiusM = 4.5;
    if (name.includes("nanoswarm")) radiusM = 3.5;
    return { type: "molotov", radiusM, fill: "rgba(239,68,68,0.40)", stroke: "#ef4444" };
  }

  // 4. Slow
  const slowKeywords = ["slow orb", "snake bite", "undercut"];
  if (slowKeywords.some(k => name.includes(k))) {
    let radiusM = 4.0;
    if (name.includes("slow orb")) radiusM = 6.0;
    return { type: "slow", radiusM, fill: "rgba(34,197,94,0.30)", stroke: "#22c55e" };
  }

  // 5. Flash
  const flashKeywords = ["flash", "blindside", "paranoia", "zero/point", "aftershock", "arc rose", "storm's eye"];
  if (flashKeywords.some(k => name.includes(k))) {
    return { type: "flash", radiusM: 6.0, fill: "rgba(255,255,255,0.20)", stroke: "#ffffff" };
  }

  // 6. Wall
  const wallKeywords = ["barrier orb", "toxic screen", "dark veil", "fast lane", "cascade", "blaze"];
  if (wallKeywords.some(k => name.includes(k))) {
    let widthM = 1.2;
    if (name.includes("barrier orb")) widthM = 1.5;
    else if (name.includes("toxic screen")) widthM = 1.2;
    else if (name.includes("fast lane")) widthM = 3.0;
    else if (name.includes("blaze")) widthM = 1.0;
    return { type: "wall", widthM, fill: colors.stroke + "26", stroke: colors.stroke };
  }

  // 7. Wire
  const wireKeywords = ["trapwire", "sonic sensor", "cyber cage"];
  if (wireKeywords.some(k => name.includes(k))) {
    return { type: "wire", widthM: 0.3, stroke: colors.stroke };
  }

  // Fallback Point
  return { type: "point", radiusM: 1.5, fill: colors.stroke + "80", stroke: colors.stroke };
}

export default function MapsView() {
  // Map list states (Preserved)
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState(null);
  const [filter, setFilter] = useState("rotation");
  const ACTIVE_MAPS = ["ascent", "split", "summit", "breeze", "lotus", "sunset", "haven"];

  // Whiteboard States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);

  const [placedAgents, setPlacedAgents] = useState([]);
  const [placedAbilities, setPlacedAbilities] = useState([]);
  const [drawnArrows, setDrawnArrows] = useState([]);
  const [drawnShapes, setDrawnShapes] = useState([]);
  const [drawnTexts, setDrawnTexts] = useState([]);

  const [activeTool, setActiveTool] = useState("move");
  const [activeColor, setActiveColor] = useState("#00e5d1");
  const [activeShapeType, setActiveShapeType] = useState("circle");

  const [selectedAgentUuid, setSelectedAgentUuid] = useState(null);
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentRoleFilter, setAgentRoleFilter] = useState("TODOS");
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);

  const [drawing, setDrawing] = useState(null);
  const [draggingElement, setDraggingElement] = useState(null);
  const [trashHover, setTrashHover] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [inlineText, setInlineText] = useState(null);

  // Undo/Redo Stacks
  const historyStack = useRef([]);
  const redoStack = useRef([]);
  const [histCount, setHistCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  // Refs for zoom/pan (stale closures)
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    zoomRef.current = zoom;
    panRef.current = pan;
  }, [zoom, pan]);

  // Fetch Maps (Preserved logic)
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

  // Fetch Agents
  useEffect(() => {
    fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true")
      .then(r => r.json())
      .then(d => {
        setAgents(d.data.sort((a, b) => a.displayName.localeCompare(b.displayName)));
        setAgentsLoading(false);
      })
      .catch(() => setAgentsLoading(false));
  }, []);

  // Reset whiteboard on map change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPlacedAgents([]);
    setPlacedAbilities([]);
    setDrawnArrows([]);
    setDrawnShapes([]);
    setDrawnTexts([]);
    setActiveTool("move");
    setSelectedAgentUuid(null);
    historyStack.current = [];
    redoStack.current = [];
    setHistCount(0);
    setRedoCount(0);
  }, [selectedMap]);

  // Undo/Redo Helpers
  const getCurrentSnapshot = () => ({
    agents: JSON.parse(JSON.stringify(placedAgents)),
    abilities: JSON.parse(JSON.stringify(placedAbilities)),
    arrows: JSON.parse(JSON.stringify(drawnArrows)),
    shapes: JSON.parse(JSON.stringify(drawnShapes)),
    texts: JSON.parse(JSON.stringify(drawnTexts)),
  });

  const applySnapshot = (snap) => {
    setPlacedAgents(snap.agents || []);
    setPlacedAbilities(snap.abilities || []);
    setDrawnArrows(snap.arrows || []);
    setDrawnShapes(snap.shapes || []);
    setDrawnTexts(snap.texts || []);
  };

  const pushHistory = () => {
    historyStack.current.push(getCurrentSnapshot());
    if (historyStack.current.length > 30) historyStack.current.shift();
    redoStack.current = [];
    setHistCount(historyStack.current.length);
    setRedoCount(0);
  };

  const handleUndo = () => {
    if (!historyStack.current.length) return;
    const current = getCurrentSnapshot();
    redoStack.current.push(current);
    const prev = historyStack.current.pop();
    applySnapshot(prev);
    setHistCount(historyStack.current.length);
    setRedoCount(redoStack.current.length);
  };

  const handleRedo = () => {
    if (!redoStack.current.length) return;
    const current = getCurrentSnapshot();
    historyStack.current.push(current);
    const next = redoStack.current.pop();
    applySnapshot(next);
    setHistCount(historyStack.current.length);
    setRedoCount(redoStack.current.length);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Escape") {
        setActiveTool("move");
        setDrawing(null);
        setInlineText(null);
        setContextMenu(null);
      } else if (e.key === "1") {
        setActiveTool("move");
      } else if (e.key === "2") {
        setActiveTool("arrow");
      } else if (e.key === "3") {
        setActiveTool("shape");
      } else if (e.key === "4") {
        setActiveTool("text");
      } else if (e.key === "5") {
        setActiveTool("eraser");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [placedAgents, placedAbilities, drawnArrows, drawnShapes, drawnTexts, histCount, redoCount]);

  // Context Menu outside click closer
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const generateUid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const dims = selectedMap ? (MAP_DIMENSIONS[selectedMap.displayName] || { widthM: 136, heightM: 124 }) : { widthM: 136, heightM: 124 };

  const getSvgCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    try {
      const svg = svgRef.current;
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      return {
        x: Math.max(0, Math.min(dims.widthM, svgPoint.x)),
        y: Math.max(0, Math.min(dims.heightM, svgPoint.y))
      };
    } catch (err) {
      return { x: 0, y: 0 };
    }
  };

  // Zoom with scroll centered under mouse cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      let newZoom = currentZoom * factor;
      newZoom = Math.max(0.3, Math.min(7, newZoom));

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scale = newZoom / currentZoom;
      const newPanX = mouseX - (mouseX - currentPan.x) * scale;
      const newPanY = mouseY - (mouseY - currentPan.y) * scale;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  // Pan with Middle Click or Alt + Left Click
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && panStart) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (draggingElement) {
      const { x, y } = getSvgCoords(e);
      if (draggingElement.type === "agent") {
        setPlacedAgents(prev => prev.map(a => a.uid === draggingElement.uid ? { ...a, cx: x, cy: y } : a));
      } else if (draggingElement.type === "ability") {
        setPlacedAbilities(prev => prev.map(ab => ab.uid === draggingElement.uid ? { ...ab, cx: x, cy: y } : ab));
      } else if (draggingElement.type === "text") {
        setDrawnTexts(prev => prev.map(t => t.uid === draggingElement.uid ? { ...t, x, y } : t));
      } else if (draggingElement.type === "wall_line") {
        const dx = x - draggingElement.startX;
        const dy = y - draggingElement.startY;
        setPlacedAbilities(prev => prev.map(ab => ab.uid === draggingElement.uid ? {
          ...ab,
          x1: draggingElement.x1 + dx,
          y1: draggingElement.y1 + dy,
          x2: draggingElement.x2 + dx,
          y2: draggingElement.y2 + dy
        } : ab));
      } else if (draggingElement.type === "wall_endpoint_a") {
        setPlacedAbilities(prev => prev.map(ab => ab.uid === draggingElement.uid ? { ...ab, x1: x, y1: y } : ab));
      } else if (draggingElement.type === "wall_endpoint_b") {
        setPlacedAbilities(prev => prev.map(ab => ab.uid === draggingElement.uid ? { ...ab, x2: x, y2: y } : ab));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (draggingElement) {
      pushHistory();
      setDraggingElement(null);
    }
  };

  // Drag and drop elements into whiteboard canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    setActiveDragItem(null);
    setDragPreview(null);
    const type = e.dataTransfer.getData("type");
    const { x, y } = getSvgCoords(e);

    if (type === "agent") {
      pushHistory();
      const newAgent = {
        uid: generateUid(),
        agentUuid: e.dataTransfer.getData("agentUuid"),
        displayName: e.dataTransfer.getData("agentName"),
        displayIcon: e.dataTransfer.getData("agentIcon"),
        cx: x,
        cy: y,
        team: null
      };
      setPlacedAgents(prev => [...prev, newAgent]);
    } else if (type === "ability") {
      pushHistory();
      const archetype = JSON.parse(e.dataTransfer.getData("archetype"));
      const uid = generateUid();
      const agentUuid = e.dataTransfer.getData("agentUuid");
      const abilityName = e.dataTransfer.getData("abilityName");
      const icon = e.dataTransfer.getData("abilityIcon");

      if (["smoke", "molotov", "slow", "ult_area", "flash", "point"].includes(archetype.type)) {
        setPlacedAbilities(prev => [...prev, {
          uid,
          type: archetype.type,
          agentUuid,
          abilityName,
          icon,
          cx: x,
          cy: y,
          radiusM: archetype.radiusM,
          fill: archetype.fill,
          stroke: archetype.stroke
        }]);
      } else if (["wall", "wire"].includes(archetype.type)) {
        setPlacedAbilities(prev => [...prev, {
          uid,
          type: archetype.type,
          agentUuid,
          abilityName,
          icon,
          x1: x,
          y1: y,
          x2: x + 10,
          y2: y,
          widthM: archetype.widthM,
          fill: archetype.fill,
          stroke: archetype.stroke
        }]);
      }
    }
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    if (!activeDragItem) return;
    const { x, y } = getSvgCoords(e);
    setDragPreview({ ...activeDragItem, x, y });
  };

  const handleSvgMouseDown = (e) => {
    if (activeTool === "move") return;
    if (e.button !== 0) return;
    e.stopPropagation();
    const { x, y } = getSvgCoords(e);

    if (activeTool === "arrow") {
      setDrawing({ type: "arrow", x1: x, y1: y, cx: x, cy: y });
    } else if (activeTool === "shape") {
      setDrawing({ type: "shape", shapeType: activeShapeType, x1: x, y1: y, cx: x, cy: y });
    } else if (activeTool === "text") {
      setInlineText({ x: e.clientX, y: e.clientY, svgX: x, svgY: y, value: "" });
    }
  };

  const handleSvgMouseMove = (e) => {
    if (!drawing) return;
    const { x, y } = getSvgCoords(e);
    setDrawing(d => ({ ...d, cx: x, cy: y }));
  };

  const handleSvgMouseUp = (e) => {
    if (!drawing) return;
    const { x, y } = getSvgCoords(e);

    if (drawing.type === "arrow") {
      const dist = Math.hypot(x - drawing.x1, y - drawing.y1);
      if (dist > 2) {
        pushHistory();
        setDrawnArrows(prev => [...prev, { uid: generateUid(), x1: drawing.x1, y1: drawing.y1, x2: x, y2: y, color: activeColor }]);
      }
    } else if (drawing.type === "shape") {
      const dist = Math.hypot(x - drawing.x1, y - drawing.y1);
      if (dist > 1) {
        pushHistory();
        const uid = generateUid();
        if (drawing.shapeType === "circle") {
          setDrawnShapes(prev => [...prev, { uid, type: "circle", cx: drawing.x1, cy: drawing.y1, r: dist, color: activeColor }]);
        } else if (drawing.shapeType === "rect") {
          const rx = Math.min(drawing.x1, x);
          const ry = Math.min(drawing.y1, y);
          const rw = Math.abs(x - drawing.x1);
          const rh = Math.abs(y - drawing.y1);
          setDrawnShapes(prev => [...prev, { uid, type: "rect", x: rx, y: ry, w: rw, h: rh, color: activeColor }]);
        } else if (drawing.shapeType === "line") {
          setDrawnShapes(prev => [...prev, { uid, type: "line", x1: drawing.x1, y1: drawing.y1, x2: x, y2: y, color: activeColor }]);
        }
      }
    }
    setDrawing(null);
  };

  const deleteElement = (uid) => {
    setPlacedAgents(prev => prev.filter(x => x.uid !== uid));
    setPlacedAbilities(prev => prev.filter(x => x.uid !== uid));
  };

  const selectedAgent = agents.find(a => a.uuid === selectedAgentUuid);
  const abilities = selectedAgent?.abilities.filter(ab => ab.displayIcon && ab.slot !== "Passive") || [];
  const filteredMaps = maps.filter(m => filter === "rotation" ? ACTIVE_MAPS.includes(m.displayName.toLowerCase()) : true);

  if (selectedMap !== null) {
    return (
      <div className="stratboard-layout">
        {/* Top Navbar */}
        <div style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--line)", background: "var(--bg-panel)", position: "relative" }}>
          <button className="maps-back-btn font-oswald" style={{ margin: 0 }} onClick={() => setSelectedMap(null)}>
            ← VOLVER AL LISTADO
          </button>
          <div className="font-oswald" style={{ fontSize: "20px", fontWeight: "bold", fontStyle: "italic", position: "absolute", left: "50%", transform: "translateX(-50%)", color: "white" }}>
            {selectedMap.displayName.toUpperCase()}
          </div>
          <div></div>
        </div>

        {/* Stratboard Body */}
        <div className="stratboard-body">
          {/* Canvas Wrapper */}
          <div
            ref={canvasRef}
            className="stratboard-canvas-wrap"
            onDragOver={handleCanvasDragOver}
            onDragLeave={() => setDragPreview(null)}
            onDrop={handleCanvasDrop}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: isPanning ? "grabbing" : (activeTool === "eraser" ? "pointer" : "default") }}
          >
            {/* Transformation container */}
            <div style={{
              position: "absolute",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              width: "100%",
              height: "100%"
            }}>
              {/* Map Minimap Icon */}
              <img
                src={selectedMap.displayIcon}
                alt={selectedMap.displayName}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                  userSelect: "none"
                }}
              />

              {/* SVG Overlay */}
              <svg
                ref={svgRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  overflow: "visible",
                  pointerEvents: activeTool === "move" ? "none" : "all"
                }}
                viewBox={`0 0 ${dims.widthM} ${dims.heightM}`}
                preserveAspectRatio="xMidYMid meet"
                onMouseDown={handleSvgMouseDown}
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
              >
                <defs>
                  {placedAgents.map(ag => (
                    <clipPath id={`clip-${ag.uid}`} key={ag.uid}>
                      <circle cx={ag.cx} cy={ag.cy} r={2.8} />
                    </clipPath>
                  ))}
                  {dragPreview && dragPreview.type === "agent" && (
                    <clipPath id={`clip-drag-preview-${dragPreview.agentUuid}`}>
                      <circle cx={dragPreview.x} cy={dragPreview.y} r={2.8} />
                    </clipPath>
                  )}
                  <radialGradient id="gravnet-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.15} />
                    <stop offset="70%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#312e81" stopOpacity={0.4} />
                  </radialGradient>
                  <pattern id="gravnet-grid" width={0.5} height={0.5} patternUnits="userSpaceOnUse">
                    <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="#6366f1" strokeWidth={0.04} strokeOpacity={0.4} />
                  </pattern>
                  {/* Smoke Gradients from 7/8/2026 */}
                  <radialGradient id="viper-smoke-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="65%" stopColor="#047857" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#064e3b" stopOpacity={0.65} />
                  </radialGradient>
                  <radialGradient id="omen-smoke-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.15} />
                    <stop offset="70%" stopColor="#4c1d95" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#1e1b4b" stopOpacity={0.7} />
                  </radialGradient>
                  <radialGradient id="clove-smoke-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f472b6" stopOpacity={0.2} />
                    <stop offset="60%" stopColor="#c084fc" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                  </radialGradient>
                  <radialGradient id="harbor-smoke-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="75%" stopColor="#0369a1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.6} />
                  </radialGradient>
                  <radialGradient id="astra-smoke-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#d946ef" stopOpacity={0.15} />
                    <stop offset="60%" stopColor="#701a75" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.7} />
                  </radialGradient>
                  <radialGradient id="brimstone-smoke-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="70%" stopColor="#c2410c" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#431407" stopOpacity={0.65} />
                  </radialGradient>
                  <radialGradient id="jett-smoke-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.25} />
                    <stop offset="80%" stopColor="#cbd5e1" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#64748b" stopOpacity={0.65} />
                  </radialGradient>
                  <radialGradient id="cypher-smoke-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.15} />
                    <stop offset="75%" stopColor="#475569" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.6} />
                  </radialGradient>
                </defs>

                {/* Placed Abilities */}
                {placedAbilities.map(ab => {
                  if (["smoke", "molotov", "slow", "ult_area", "flash", "point", "gravnet", "barrier_mesh", "sonic_sensor"].includes(ab.type)) {
                    return (
                      <g
                        key={ab.uid}
                        style={{ cursor: activeTool === "eraser" ? "pointer" : "grab", pointerEvents: "all" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (activeTool === "eraser") {
                            pushHistory();
                            setPlacedAbilities(prev => prev.filter(x => x.uid !== ab.uid));
                            return;
                          }
                          if (activeTool !== "move") return;
                          const { x, y } = getSvgCoords(e);
                          setDraggingElement({ uid: ab.uid, type: "ability", offsetX: x - ab.cx, offsetY: y - ab.cy });
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ uid: ab.uid, type: "ability", x: e.clientX, y: e.clientY });
                        }}
                        draggable={activeTool === "move"}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("elementUid", ab.uid);
                          e.dataTransfer.setData("elementType", "ability");
                        }}
                      >
                        {ab.type === "gravnet" ? (
                          <>
                            <circle cx={ab.cx} cy={ab.cy} r={ab.radiusM} fill="url(#gravnet-grad)" stroke={ab.stroke} strokeWidth={0.3} />
                            <circle cx={ab.cx} cy={ab.cy} r={ab.radiusM} fill="url(#gravnet-grid)" style={{ pointerEvents: "none" }} />
                          </>
                        ) : ab.type === "barrier_mesh" ? (() => {
                          const r = ab.radiusM || 6;
                          return (
                            <>
                              <circle cx={ab.cx} cy={ab.cy} r={r} fill="rgba(59, 130, 246, 0.12)" stroke={ab.stroke} strokeWidth={0.3} />
                              <line x1={ab.cx - r} y1={ab.cy - r} x2={ab.cx + r} y2={ab.cy + r} stroke="#3b82f6" strokeWidth={0.6} strokeOpacity={0.65} />
                              <line x1={ab.cx + r} y1={ab.cy - r} x2={ab.cx - r} y2={ab.cy + r} stroke="#3b82f6" strokeWidth={0.6} strokeOpacity={0.65} />
                              <circle cx={ab.cx} cy={ab.cy} r={0.7} fill="#ffffff" stroke="#3b82f6" strokeWidth={0.3} />
                              <circle cx={ab.cx - r} cy={ab.cy - r} r={0.4} fill="#2563eb" />
                              <circle cx={ab.cx + r} cy={ab.cy - r} r={0.4} fill="#2563eb" />
                              <circle cx={ab.cx - r} cy={ab.cy + r} r={0.4} fill="#2563eb" />
                              <circle cx={ab.cx + r} cy={ab.cy + r} r={0.4} fill="#2563eb" />
                            </>
                          );
                        })() : ab.type === "sonic_sensor" ? (
                          <>
                            <circle cx={ab.cx} cy={ab.cy} r={ab.radiusM} fill={ab.fill} stroke={ab.stroke} strokeWidth={0.4} />
                            <circle cx={ab.cx} cy={ab.cy} r={0.6} fill="#ef4444" stroke="#ffffff" strokeWidth={0.2} />
                          </>
                        ) : ab.type === "smoke" ? (() => {
                          const agObj = agents.find(a => a.uuid === ab.agentUuid);
                          const ag = agObj ? agObj.displayName.toLowerCase() : "";
                          
                          let fillUrl = ab.fill;
                          if (ag === "viper") fillUrl = "url(#viper-smoke-grad)";
                          else if (ag === "omen") fillUrl = "url(#omen-smoke-grad)";
                          else if (ag === "clove") fillUrl = "url(#clove-smoke-grad)";
                          else if (ag === "harbor") fillUrl = "url(#harbor-smoke-grad)";
                          else if (ag === "astra") fillUrl = "url(#astra-smoke-grad)";
                          else if (ag === "brimstone") fillUrl = "url(#brimstone-smoke-grad)";
                          else if (ag === "jett") fillUrl = "url(#jett-smoke-grad)";
                          else if (ag === "cypher") fillUrl = "url(#cypher-smoke-grad)";

                          const customStroke = ag === "cypher" ? "#38bdf8" : ab.stroke;

                          return (
                            <>
                              <circle
                                cx={ab.cx}
                                cy={ab.cy}
                                r={ab.radiusM}
                                fill={fillUrl}
                                stroke={customStroke}
                                strokeWidth={ag === "cypher" ? 0.9 : 0.3}
                                strokeDasharray="2 1"
                                style={{ filter: "blur(0.5px)" }}
                              />
                              {ag === "harbor" && (
                                <circle cx={ab.cx} cy={ab.cy} r={ab.radiusM * 0.88} fill="none" stroke="rgba(250,204,21,0.4)" strokeWidth={0.2} strokeDasharray="4 2" />
                              )}
                              {ag === "astra" && (
                                <circle cx={ab.cx} cy={ab.cy} r={ab.radiusM * 0.8} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.2} />
                              )}
                            </>
                          );
                        })() : (
                          <rect
                            x={ab.cx - ab.radiusM}
                            y={ab.cy - ab.radiusM}
                            width={ab.radiusM * 2}
                            height={ab.radiusM * 2}
                            rx={1.5}
                            ry={1.5}
                            fill={ab.fill}
                            stroke={ab.stroke}
                            strokeWidth={0.3}
                          />
                        )}
                        <image href={ab.icon}
                          x={ab.cx - 1.8} y={ab.cy - 1.8} width={3.6} height={3.6}
                          style={{ pointerEvents: "none" }} />
                      </g>
                    );
                  } else if (["wall", "wire"].includes(ab.type)) {
                    const dx = ab.x2 - ab.x1;
                    const dy = ab.y2 - ab.y1;
                    const len = Math.hypot(dx, dy) || 1;
                    const px = (-dy / len) * (ab.widthM / 2);
                    const py = (dx / len) * (ab.widthM / 2);

                    const p1x = ab.x1 + px;
                    const p1y = ab.y1 + py;
                    const p2x = ab.x2 + px;
                    const p2y = ab.y2 + py;
                    const p3x = ab.x2 - px;
                    const p3y = ab.y2 - py;
                    const p4x = ab.x1 - px;
                    const p4y = ab.y1 - py;

                    const rectPoints = `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}`;
                    const mx = (ab.x1 + ab.x2) / 2;
                    const my = (ab.y1 + ab.y2) / 2;

                    const isWire = ab.type === "wire";

                    return (
                      <g
                        key={ab.uid}
                        draggable={activeTool === "move"}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("elementUid", ab.uid);
                          e.dataTransfer.setData("elementType", "ability");
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ uid: ab.uid, type: "ability", x: e.clientX, y: e.clientY });
                        }}
                      >
                        {!isWire && <polygon points={rectPoints} fill={ab.fill} style={{ pointerEvents: "none" }} />}

                        <line x1={ab.x1} y1={ab.y1} x2={ab.x2} y2={ab.y2} stroke={ab.stroke} strokeWidth={ab.widthM}
                          strokeLinecap="round"
                          strokeDasharray={isWire ? "0.5 0.3" : "none"}
                          style={{ cursor: activeTool === "eraser" ? "pointer" : "move", pointerEvents: "all" }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            if (activeTool === "eraser") {
                              pushHistory();
                              setPlacedAbilities(prev => prev.filter(x => x.uid !== ab.uid));
                              return;
                            }
                            if (activeTool !== "move") return;
                            const { x, y } = getSvgCoords(e);
                            setDraggingElement({ uid: ab.uid, type: "wall_line", x1: ab.x1, y1: ab.y1, x2: ab.x2, y2: ab.y2, startX: x, startY: y });
                          }} />

                        <image href={ab.icon} x={mx - 1.5} y={my - 1.5} width={3} height={3}
                          style={{ pointerEvents: "none" }} />

                        {isWire ? (
                          <>
                            <polygon
                              points={`${ab.x1},${ab.y1 - 0.8} ${ab.x1 + 0.8},${ab.y1} ${ab.x1},${ab.y1 + 0.8} ${ab.x1 - 0.8},${ab.y1}`}
                              fill="white" stroke="#0a0e17" strokeWidth={0.2}
                              style={{ cursor: "crosshair" }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (activeTool !== "move") return;
                                setDraggingElement({ uid: ab.uid, type: "wall_endpoint_a" });
                              }}
                            />
                            <polygon
                              points={`${ab.x2},${ab.y2 - 0.8} ${ab.x2 + 0.8},${ab.y2} ${ab.x2},${ab.y2 + 0.8} ${ab.x2 - 0.8},${ab.y2}`}
                              fill="white" stroke="#0a0e17" strokeWidth={0.2}
                              style={{ cursor: "crosshair" }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (activeTool !== "move") return;
                                setDraggingElement({ uid: ab.uid, type: "wall_endpoint_b" });
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <rect x={ab.x1 - 1} y={ab.y1 - 1} width={2} height={2}
                              fill="white" stroke="#0a0e17" strokeWidth={0.2}
                              style={{ cursor: "crosshair" }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (activeTool !== "move") return;
                                setDraggingElement({ uid: ab.uid, type: "wall_endpoint_a" });
                              }} />
                            <rect x={ab.x2 - 1} y={ab.y2 - 1} width={2} height={2}
                              fill="white" stroke="#0a0e17" strokeWidth={0.2}
                              style={{ cursor: "crosshair" }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (activeTool !== "move") return;
                                setDraggingElement({ uid: ab.uid, type: "wall_endpoint_b" });
                              }} />
                          </>
                        )}
                      </g>
                    );
                  }
                  return null;
                })}

                {/* Placed Agents */}
                {placedAgents.map(ag => (
                  <g key={ag.uid}>
                    <image
                      href={ag.displayIcon}
                      x={ag.cx - 2.8} y={ag.cy - 2.8}
                      width={5.6} height={5.6}
                      clipPath={`url(#clip-${ag.uid})`}
                      style={{ cursor: activeTool === "eraser" ? "pointer" : "grab", pointerEvents: "all" }}
                      draggable={activeTool === "move"}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("elementUid", ag.uid);
                        e.dataTransfer.setData("elementType", "agent");
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (activeTool === "eraser") {
                          pushHistory();
                          setPlacedAgents(prev => prev.filter(x => x.uid !== ag.uid));
                          return;
                        }
                        if (activeTool !== "move") return;
                        const { x, y } = getSvgCoords(e);
                        setDraggingElement({ uid: ag.uid, type: "agent", offsetX: x - ag.cx, offsetY: y - ag.cy });
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ uid: ag.uid, type: "agent", x: e.clientX, y: e.clientY });
                      }}
                    />
                    <circle
                      cx={ag.cx} cy={ag.cy} r={2.8}
                      fill="none"
                      stroke={ag.team === "atk" ? "#00e5d1"
                        : ag.team === "def" ? "#ff4655"
                          : "rgba(255,255,255,0.4)"}
                      strokeWidth={0.4}
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                ))}

                {/* Drawn Arrows */}
                {drawnArrows.map(arrow => {
                  const angle = Math.atan2(arrow.y2 - arrow.y1, arrow.x2 - arrow.x1);
                  const len = 2.0;
                  const spread = 0.42;
                  const p1 = { x: arrow.x2 - len * Math.cos(angle - spread), y: arrow.y2 - len * Math.sin(angle - spread) };
                  const p3 = { x: arrow.x2 - len * Math.cos(angle + spread), y: arrow.y2 - len * Math.sin(angle + spread) };
                  const shortX2 = arrow.x2 - 1.8 * Math.cos(angle);
                  const shortY2 = arrow.y2 - 1.8 * Math.sin(angle);
                  return (
                    <g
                      key={arrow.uid}
                      style={{ cursor: activeTool === "eraser" ? "pointer" : "default", pointerEvents: "all" }}
                      onClick={(e) => {
                        if (activeTool === "eraser") {
                          e.stopPropagation();
                          pushHistory();
                          setDrawnArrows(prev => prev.filter(a => a.uid !== arrow.uid));
                        }
                      }}
                    >
                      <line x1={arrow.x1} y1={arrow.y1} x2={shortX2} y2={shortY2} stroke={arrow.color}
                        strokeWidth={0.6} strokeLinecap="round" />
                      <polygon points={`${p1.x},${p1.y} ${arrow.x2},${arrow.y2} ${p3.x},${p3.y}`}
                        fill={arrow.color} />
                    </g>
                  );
                })}

                {/* Drawn Shapes */}
                {drawnShapes.map(shape => {
                  const c = shape.color;
                  return (
                    <g
                      key={shape.uid}
                      style={{ cursor: activeTool === "eraser" ? "pointer" : "default", pointerEvents: "all" }}
                      onClick={(e) => {
                        if (activeTool === "eraser") {
                          e.stopPropagation();
                          pushHistory();
                          setDrawnShapes(prev => prev.filter(s => s.uid !== shape.uid));
                        }
                      }}
                    >
                      {shape.type === "circle" && (
                        <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={c + "33"} stroke={c} strokeWidth={0.4} />
                      )}
                      {shape.type === "rect" && (
                        <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={c + "33"} stroke={c} strokeWidth={0.4} />
                      )}
                      {shape.type === "line" && (
                        <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={c} strokeWidth={0.6} strokeLinecap="round" />
                      )}
                    </g>
                  );
                })}

                {/* Drawn Texts */}
                {drawnTexts.map(t => (
                  <text
                    key={t.uid}
                    x={t.x}
                    y={t.y}
                    fill={t.color}
                    fontSize="3.5"
                    fontFamily="Rajdhani, sans-serif"
                    dominantBaseline="middle"
                    style={{ cursor: activeTool === "eraser" ? "pointer" : (activeTool === "move" ? "move" : "default"), userSelect: "none", pointerEvents: "all" }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      if (activeTool === "eraser") {
                        pushHistory();
                        setDrawnTexts(prev => prev.filter(x => x.uid !== t.uid));
                        return;
                      }
                      if (activeTool !== "move") return;
                      const { x, y } = getSvgCoords(e);
                      setDraggingElement({ uid: t.uid, type: "text", offsetX: x - t.x, offsetY: y - t.y });
                    }}
                  >
                    {t.text}
                  </text>
                ))}

                {/* Drawing Preview (Arrow) */}
                {drawing && drawing.type === "arrow" && (() => {
                  const angle = Math.atan2(drawing.cy - drawing.y1, drawing.cx - drawing.x1);
                  const len = 2.0;
                  const spread = 0.42;
                  const p1 = { x: drawing.cx - len * Math.cos(angle - spread), y: drawing.cy - len * Math.sin(angle - spread) };
                  const p3 = { x: drawing.cx - len * Math.cos(angle + spread), y: drawing.cy - len * Math.sin(angle + spread) };
                  const shortX2 = drawing.cx - 1.8 * Math.cos(angle);
                  const shortY2 = drawing.cy - 1.8 * Math.sin(angle);
                  return (
                    <g opacity={0.45} style={{ pointerEvents: "none" }}>
                      <line x1={drawing.x1} y1={drawing.y1} x2={shortX2} y2={shortY2} stroke={activeColor}
                        strokeWidth={0.6} strokeLinecap="round" />
                      <polygon points={`${p1.x},${p1.y} ${drawing.cx},${drawing.cy} ${p3.x},${p3.y}`}
                        fill={activeColor} />
                    </g>
                  );
                })()}

                {/* Drawing Preview (Shape) */}
                {drawing && drawing.type === "shape" && (() => {
                  const c = activeColor;
                  const dist = Math.hypot(drawing.cx - drawing.x1, drawing.cy - drawing.y1);
                  return (
                    <g opacity={0.45} style={{ pointerEvents: "none" }}>
                      {drawing.shapeType === "circle" && (
                        <circle cx={drawing.x1} cy={drawing.y1} r={dist} fill={c + "33"} stroke={c} strokeWidth={0.4} />
                      )}
                      {drawing.shapeType === "rect" && (() => {
                        const rx = Math.min(drawing.x1, drawing.cx);
                        const ry = Math.min(drawing.y1, drawing.cy);
                        const rw = Math.abs(drawing.cx - drawing.x1);
                        const rh = Math.abs(drawing.cy - drawing.y1);
                        return <rect x={rx} y={ry} width={rw} height={rh} fill={c + "33"} stroke={c} strokeWidth={0.4} />;
                      })()}
                      {drawing.shapeType === "line" && (
                        <line x1={drawing.x1} y1={drawing.y1} x2={drawing.cx} y2={drawing.cy} stroke={c} strokeWidth={0.6} strokeLinecap="round" />
                      )}
                    </g>
                  );
                })()}

                {/* Drag and Drop Ghost Preview */}
                {dragPreview && (
                  <g opacity={0.6} style={{ pointerEvents: "none" }}>
                    {dragPreview.type === "agent" ? (
                      <>
                        <circle cx={dragPreview.x} cy={dragPreview.y} r={2.8} fill="#0a0e17" stroke="rgba(255,255,255,0.4)" strokeWidth={0.4} />
                        <image
                          href={dragPreview.agentIcon}
                          x={dragPreview.x - 2.8}
                          y={dragPreview.y - 2.8}
                          width={5.6}
                          height={5.6}
                          clipPath={`url(#clip-drag-preview-${dragPreview.agentUuid})`}
                        />
                      </>
                    ) : (() => {
                      const arch = dragPreview.archetype;
                      const rad = arch?.radiusM || 5;
                      const fillVal = arch?.fill || "rgba(100,116,139,0.3)";
                      const strokeVal = arch?.stroke || "#64748b";
                      const isSmoke = arch?.type === "smoke";
                      
                      return (
                        <>
                          {arch?.type === "gravnet" ? (
                            <>
                              <circle cx={dragPreview.x} cy={dragPreview.y} r={rad} fill="url(#gravnet-grad)" stroke={strokeVal} strokeWidth={0.3} />
                              <circle cx={dragPreview.x} cy={dragPreview.y} r={rad} fill="url(#gravnet-grid)" />
                            </>
                          ) : arch?.type === "barrier_mesh" ? (
                            <>
                              <circle cx={dragPreview.x} cy={dragPreview.y} r={rad} fill="rgba(59, 130, 246, 0.12)" stroke={strokeVal} strokeWidth={0.3} />
                              <line x1={dragPreview.x - rad} y1={dragPreview.y - rad} x2={dragPreview.x + rad} y2={dragPreview.y + rad} stroke="#3b82f6" strokeWidth={0.6} strokeOpacity={0.65} />
                              <line x1={dragPreview.x + rad} y1={dragPreview.y - rad} x2={dragPreview.x - rad} y2={dragPreview.y + rad} stroke="#3b82f6" strokeWidth={0.6} strokeOpacity={0.65} />
                              <circle cx={dragPreview.x} cy={dragPreview.y} r={0.7} fill="#ffffff" stroke="#3b82f6" strokeWidth={0.3} />
                              <circle cx={dragPreview.x - rad} cy={dragPreview.y - rad} r={0.4} fill="#2563eb" />
                              <circle cx={dragPreview.x + rad} cy={dragPreview.y - rad} r={0.4} fill="#2563eb" />
                              <circle cx={dragPreview.x - rad} cy={dragPreview.y + rad} r={0.4} fill="#2563eb" />
                              <circle cx={dragPreview.x + rad} cy={dragPreview.y + rad} r={0.4} fill="#2563eb" />
                            </>
                          ) : arch?.type === "sonic_sensor" ? (
                            <>
                              <circle cx={dragPreview.x} cy={dragPreview.y} r={rad} fill={fillVal} stroke={strokeVal} strokeWidth={0.4} />
                              <circle cx={dragPreview.x} cy={dragPreview.y} r={0.6} fill="#ef4444" stroke="#ffffff" strokeWidth={0.2} />
                            </>
                          ) : (
                            <circle
                              cx={dragPreview.x}
                              cy={dragPreview.y}
                              r={rad}
                              fill={fillVal}
                              stroke={strokeVal}
                              strokeWidth={0.3}
                              strokeDasharray={isSmoke ? "2 1" : "none"}
                              style={isSmoke ? { filter: "blur(0.5px)" } : {}}
                            />
                          )}
                          <image
                            href={dragPreview.abilityIcon}
                            x={dragPreview.x - 1.8}
                            y={dragPreview.y - 1.8}
                            width={3.6}
                            height={3.6}
                          />
                        </>
                      );
                    })()}
                  </g>
                )}
              </svg>
            </div>

            {/* Trash Zone */}
            <div
              className="trash-zone"
              style={{
                border: trashHover ? "2px dashed #ff4655" : "2px dashed var(--line)",
                background: trashHover ? "rgba(255, 70, 85, 0.2)" : "rgba(10, 14, 23, 0.85)",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setTrashHover(true);
              }}
              onDragLeave={() => setTrashHover(false)}
              onDrop={(e) => {
                e.preventDefault();
                const elementUid = e.dataTransfer.getData("elementUid");
                const elementType = e.dataTransfer.getData("elementType");
                if (elementUid) {
                  pushHistory();
                  if (elementType === "agent") {
                    setPlacedAgents(prev => prev.filter(x => x.uid !== elementUid));
                  } else if (elementType === "ability") {
                    setPlacedAbilities(prev => prev.filter(x => x.uid !== elementUid));
                  }
                }
                setTrashHover(false);
              }}
            >
              <Trash2 size={24} color={trashHover ? "#ff4655" : "var(--text-dim)"} />
            </div>

            {/* Active Tool Indicator */}
            {activeTool !== "move" && (
              <div className="active-tool-indicator">
                MODO: {TOOL_NAMES[activeTool] || activeTool.toUpperCase()} — ESC para cancelar
              </div>
            )}

            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={() => setZoom(z => Math.min(7, z * 1.15))}>+</button>
              <span style={{ color: "var(--text-dim)", fontSize: "11px", textAlign: "center", fontFamily: "Oswald", background: "rgba(10,14,23,0.85)", padding: "2px", borderRadius: "3px" }}>
                {Math.round(zoom * 100)}%
              </span>
              <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.3, z * 0.87))}>-</button>
              <button className="zoom-btn font-oswald" style={{ fontSize: "10px", height: "auto", padding: "4px 2px" }} onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>↺ Reset</button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="stratboard-panel">
            {/* Whiteboard Tools */}
            <div className="stratboard-panel-section">
              <div className="stratboard-panel-title">HERRAMIENTAS</div>
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                <button className={`stratboard-tool-btn ${activeTool === "move" ? "active" : ""}`} onClick={() => setActiveTool("move")}>↖ MOVER</button>
                <button className={`stratboard-tool-btn ${activeTool === "arrow" ? "active" : ""}`} onClick={() => setActiveTool("arrow")}>→ FLECHA</button>
                <button className={`stratboard-tool-btn ${activeTool === "eraser" ? "active" : ""}`} onClick={() => setActiveTool("eraser")}>✕ BORRADOR</button>
              </div>
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                <button className={`stratboard-tool-btn ${activeTool === "shape" ? "active" : ""}`} onClick={() => setActiveTool("shape")}>▢ FORMA</button>
                <button className={`stratboard-tool-btn ${activeTool === "text" ? "active" : ""}`} onClick={() => setActiveTool("text")}>T TEXTO</button>
              </div>

              {/* Sub-selector shape */}
              {activeTool === "shape" && (
                <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                  <button className={`stratboard-tool-btn ${activeShapeType === "circle" ? "active" : ""}`} style={{ fontSize: "10px", padding: "4px" }} onClick={() => setActiveShapeType("circle")}>○ Círculo</button>
                  <button className={`stratboard-tool-btn ${activeShapeType === "rect" ? "active" : ""}`} style={{ fontSize: "10px", padding: "4px" }} onClick={() => setActiveShapeType("rect")}>□ Rect</button>
                  <button className={`stratboard-tool-btn ${activeShapeType === "line" ? "active" : ""}`} style={{ fontSize: "10px", padding: "4px" }} onClick={() => setActiveShapeType("line")}>/ Línea</button>
                </div>
              )}

              {/* Colors */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px", alignItems: "center" }}>
                {["#00e5d1", "#ff4655", "#f0c343", "#ffffff", "#22c55e", "#f97316"].map(c => (
                  <div
                    key={c}
                    className={`color-pill ${activeColor === c ? "active" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setActiveColor(c)}
                  />
                ))}
              </div>

              {/* Undo/Redo */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button className="undo-redo-btn" onClick={handleUndo} disabled={histCount === 0}>
                  ↩ ({histCount})
                </button>
                <button className="undo-redo-btn" onClick={handleRedo} disabled={redoCount === 0}>
                  ↪ ({redoCount})
                </button>
              </div>
            </div>

            {/* Whiteboard Agents */}
            <div className="stratboard-panel-section" style={{ flex: "0 0 auto", display: "flex", flexDirection: "column" }}>
              <div className="stratboard-panel-title">AGENTES</div>

              {/* Filtro de Roles */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "8px", flexWrap: "wrap" }}>
                {["TODOS", "DUELISTA", "CONTROLADOR", "INICIADOR", "CENTINELA"].map(role => (
                  <button
                    key={role}
                    className={`stratboard-tool-btn font-oswald ${agentRoleFilter === role ? "active" : ""}`}
                    style={{
                      flex: "none",
                      padding: "3px 6px",
                      fontSize: "9px",
                      background: agentRoleFilter === role ? "rgba(255, 70, 85, 0.15)" : "transparent",
                      border: "1px solid " + (agentRoleFilter === role ? "var(--red)" : "var(--line)"),
                      borderRadius: "3px",
                      color: agentRoleFilter === role ? "var(--red)" : "var(--text-dim)",
                      cursor: "pointer",
                      letterSpacing: "0.5px"
                    }}
                    onClick={() => setAgentRoleFilter(role)}
                  >
                    {role === "CONTROLADOR" ? "CTRL" : role === "INICIADOR" ? "INIC" : role === "CENTINELA" ? "CENT" : role === "DUELISTA" ? "DUEL" : "TODOS"}
                  </button>
                ))}
              </div>

              {agentsLoading ? (
                <div className="agent-grid">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="agent-grid-btn" style={{ background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite" }} />
                  ))}
                </div>
              ) : (() => {
                const roleMap = {
                  "Duelist": "DUELISTA",
                  "Initiator": "INICIADOR",
                  "Controller": "CONTROLADOR",
                  "Sentinel": "CENTINELA"
                };
                const filteredAgents = agents.filter(agent => {
                  if (agentRoleFilter === "TODOS") return true;
                  const agentRole = roleMap[agent.role?.displayName] || "";
                  return agentRole === agentRoleFilter;
                });

                return (
                  <div className="agent-grid">
                    {filteredAgents.map(agent => (
                      <button
                        key={agent.uuid}
                        className={`agent-grid-btn ${selectedAgentUuid === agent.uuid ? "selected" : ""}`}
                        draggable={true}
                        onDragStart={(e) => {
                          const dragImg = new Image();
                          dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                          e.dataTransfer.setDragImage(dragImg, 0, 0);

                          setActiveDragItem({
                            type: "agent",
                            agentUuid: agent.uuid,
                            agentName: agent.displayName,
                            agentIcon: agent.displayIcon
                          });

                          e.dataTransfer.setData("type", "agent");
                          e.dataTransfer.setData("agentUuid", agent.uuid);
                          e.dataTransfer.setData("agentName", agent.displayName);
                          e.dataTransfer.setData("agentIcon", agent.displayIcon);
                        }}
                        onDragEnd={() => {
                          setActiveDragItem(null);
                          setDragPreview(null);
                        }}
                        onClick={() => setSelectedAgentUuid(prev => prev === agent.uuid ? null : agent.uuid)}
                      >
                        <img src={agent.displayIcon} alt={agent.displayName} />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Whiteboard Instructions when no agent selected */}
            {selectedAgentUuid === null && (
              <div className="stratboard-panel-section" style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "4px", padding: "16px", color: "var(--text-dim)", textAlign: "center" }}>
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>💡</div>
                <div className="font-oswald" style={{ fontSize: "12px", color: "white", marginBottom: "6px", letterSpacing: "0.5px" }}>GUÍA DE PIZARRA TÁCTICA</div>
                <p style={{ fontSize: "10px", margin: 0, lineHeight: "1.5", color: "var(--text-dim)", maxWidth: "220px" }}>
                  • Selecciona herramientas arriba para dibujar líneas, formas o texto.<br />
                  • Haz clic en un agente para ver sus habilidades.<br />
                  • Arrastra agentes y habilidades al mapa para planificar jugadas.
                </p>
              </div>
            )}

            {/* Whiteboard Abilities */}
            {selectedAgentUuid !== null && selectedAgent && (
              <div className="stratboard-panel-section" style={{ flex: "1 1 auto", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div className="stratboard-panel-title" style={{ margin: 0 }}>HABILIDADES DE {selectedAgent.displayName.toUpperCase()}</div>
                  <button onClick={() => setSelectedAgentUuid(null)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "14px" }}>✕</button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <img src={selectedAgent.displayIcon} alt={selectedAgent.displayName} style={{ width: "32px", height: "32px", borderRadius: "4px" }} />
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: "white" }}>{selectedAgent.displayName}</span>
                </div>

                <div>
                  {abilities.map((ability, i) => {
                    const cl = classifyAbility(ability, selectedAgent.displayName);
                    return (
                      <div
                        key={i}
                        className="ability-card"
                        draggable={true}
                        onDragStart={(e) => {
                          const dragImg = new Image();
                          dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                          e.dataTransfer.setDragImage(dragImg, 0, 0);

                          setActiveDragItem({
                            type: "ability",
                            agentUuid: selectedAgent.uuid,
                            abilityName: ability.displayName,
                            abilityIcon: ability.displayIcon,
                            archetype: cl
                          });

                          e.dataTransfer.setData("type", "ability");
                          e.dataTransfer.setData("agentUuid", selectedAgent.uuid);
                          e.dataTransfer.setData("abilityName", ability.displayName);
                          e.dataTransfer.setData("abilityIcon", ability.displayIcon);
                          e.dataTransfer.setData("archetype", JSON.stringify(cl));
                        }}
                        onDragEnd={() => {
                          setActiveDragItem(null);
                          setDragPreview(null);
                        }}
                      >
                        <img src={ability.displayIcon} alt={ability.displayName} />
                        <div className="ability-card-name">{ability.displayName}</div>
                        <div className="ability-card-badge">{cl.type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Whiteboard Clear */}
            <div className="stratboard-panel-section" style={{ marginTop: "auto" }}>
              <button
                className="clear-board-btn"
                onClick={() => {
                  pushHistory();
                  setPlacedAgents([]);
                  setPlacedAbilities([]);
                  setDrawnArrows([]);
                  setDrawnShapes([]);
                  setDrawnTexts([]);
                }}
              >
                🗑 LIMPIAR TODO
              </button>
            </div>
          </div>
        </div>

        {/* Inline Floating Text Input */}
        {inlineText && (
          <input
            value={inlineText.value}
            onChange={e => setInlineText(t => ({ ...t, value: e.target.value }))}
            onKeyDown={e => {
              if (e.key === "Enter" && inlineText.value.trim()) {
                pushHistory();
                setDrawnTexts(prev => [...prev, {
                  uid: generateUid(),
                  x: inlineText.svgX,
                  y: inlineText.svgY,
                  text: inlineText.value,
                  color: activeColor
                }]);
                setInlineText(null);
              }
              if (e.key === "Escape") setInlineText(null);
            }}
            autoFocus
            style={{
              position: "fixed",
              left: inlineText.x,
              top: inlineText.y,
              background: "rgba(15,21,35,0.95)",
              border: "1px solid var(--cyan)",
              color: "white",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 14,
              zIndex: 1000,
              outline: "none"
            }}
          />
        )}

        {/* Agent ATK/DEF Context Menu */}
        {contextMenu && (
          <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
            <button className="context-menu-item" onClick={() => {
              pushHistory();
              if (contextMenu.type === "agent") {
                setPlacedAgents(prev => prev.map(a => a.uid === contextMenu.uid ? { ...a, team: "atk" } : a));
              }
              setContextMenu(null);
            }}>
              <span style={{ color: "#00e5d1" }}>● ATK</span>
            </button>
            <button className="context-menu-item" onClick={() => {
              pushHistory();
              if (contextMenu.type === "agent") {
                setPlacedAgents(prev => prev.map(a => a.uid === contextMenu.uid ? { ...a, team: "def" } : a));
              }
              setContextMenu(null);
            }}>
              <span style={{ color: "#ff4655" }}>● DEF</span>
            </button>
            <button className="context-menu-item" onClick={() => {
              pushHistory();
              if (contextMenu.type === "agent") {
                setPlacedAgents(prev => prev.map(a => a.uid === contextMenu.uid ? { ...a, team: null } : a));
              }
              setContextMenu(null);
            }}>
              ○ Sin equipo
            </button>
            <div className="context-menu-divider" />
            <button className="context-menu-item" style={{ color: "var(--red)" }} onClick={() => {
              pushHistory();
              if (contextMenu.type === "agent") {
                setPlacedAgents(prev => prev.filter(a => a.uid !== contextMenu.uid));
              } else if (contextMenu.type === "ability") {
                setPlacedAbilities(prev => prev.filter(ab => ab.uid !== contextMenu.uid));
              }
              setContextMenu(null);
            }}>
              🗑 Eliminar
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Map List View (Preserved exactly) ────────────────────────────────────
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
