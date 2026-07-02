import React, { useState, useEffect } from "react";
import { Compass, Info } from "lucide-react";

export default function MapsView() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("rotation"); // "rotation" or "all"
  const [selectedMap, setSelectedMap] = useState(null);
  const [showCallouts, setShowCallouts] = useState(true);
  const [showSites, setShowSites] = useState(true);

  const ACTIVE_MAPS = ["abyss", "ascent", "bind", "haven", "lotus", "split", "sunset"];

  useEffect(() => {
    fetch("https://valorant-api.com/v1/maps")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.data) {
          const validMaps = resJson.data.filter(
            (map) => map.displayName && map.listViewIcon
          );
          setMaps(validMaps);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching maps from Valorant-API:", err);
        setLoading(false);
      });
  }, []);

  const filteredMaps = maps.filter((map) => {
    if (filter === "rotation") {
      return ACTIVE_MAPS.includes(map.displayName.toLowerCase());
    }
    return true;
  });

  // Render selected map detail view
  if (selectedMap) {
    const activeMap = selectedMap;
    const hasMinimap = !!activeMap.displayIcon;
    const calloutsList = activeMap.callouts || [];
    
    // Group callouts by superRegionName (A, B, C, Mid, etc.) for the info column
    const groupedCallouts = {};
    calloutsList.forEach(c => {
      const groupKey = c.superRegionName || "General";
      if (!groupedCallouts[groupKey]) {
        groupedCallouts[groupKey] = [];
      }
      groupedCallouts[groupKey].push(c.regionName);
    });

    const convertCoords = (x, y) => {
      const { xMultiplier, yMultiplier, xScalarToAdd, yScalarToAdd } = activeMap;
      return {
        x: ((y * xMultiplier) + xScalarToAdd) * 100,
        y: ((x * yMultiplier) + yScalarToAdd) * 100
      };
    };

    return (
      <div className="maps-view-container">
        <div className="maps-header">
          <div className="maps-title-section">
            <button 
              className="maps-back-btn font-oswald"
              onClick={() => setSelectedMap(null)}
            >
              ← VOLVER AL LISTADO
            </button>
            <h1 className="font-oswald" style={{ margin: 0 }}>{activeMap.displayName.toUpperCase()}</h1>
          </div>
          <span className="active-pool-badge font-oswald" style={{ margin: 0, padding: "4px 10px" }}>
            {activeMap.coordinates || "TACTICAL LAYOUT"}
          </span>
        </div>

        <div className="map-detail-layout">
          {/* Left: Interactive Canvas */}
          <div className="map-detail-visual-column">
            {hasMinimap ? (
              <div className="map-detail-canvas-wrapper">
                <img 
                  src={activeMap.displayIcon} 
                  alt={`${activeMap.displayName} Tactical Layout`} 
                  className="map-detail-canvas-img"
                />

                {/* Callout Labels Overlay */}
                {showCallouts && calloutsList.map((callout, cIdx) => {
                  if (callout.regionName === "Site") return null;
                  const pct = convertCoords(callout.location.x, callout.location.y);
                  const labelStr = callout.superRegionName 
                    ? `${callout.superRegionName} ${callout.regionName}` 
                    : callout.regionName;
                  return (
                    <div 
                      key={`c-${cIdx}`}
                      className="map-detail-callout-label font-oswald"
                      style={{ left: `${pct.x}%`, top: `${pct.y}%` }}
                    >
                      {labelStr.toUpperCase()}
                    </div>
                  );
                })}

                {/* Bombsite Labels Overlay */}
                {showSites && calloutsList.map((callout, cIdx) => {
                  if (callout.regionName !== "Site") return null;
                  const pct = convertCoords(callout.location.x, callout.location.y);
                  const siteLetter = callout.superRegionName || "A";
                  return (
                    <div 
                      key={`s-${cIdx}`}
                      className="map-detail-site-label font-oswald"
                      style={{ left: `${pct.x}%`, top: `${pct.y}%` }}
                    >
                      {siteLetter.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="map-detail-no-minimap font-oswald text-dim">
                Este mapa no posee minimapa táctico en la base de datos de Valorant-API.
              </div>
            )}
          </div>

          {/* Right: Info and Toggles */}
          <div className="map-detail-info-column">
            {/* Options Selector panel */}
            <div className="mdo-perf-panel-card">
              <div className="panel-header font-oswald">
                <span>OPCIONES DE CAPAS</span>
              </div>
              <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label className="map-option-checkbox font-oswald">
                  <input 
                    type="checkbox" 
                    checked={showCallouts} 
                    onChange={(e) => setShowCallouts(e.target.checked)} 
                    disabled={!hasMinimap || calloutsList.length === 0}
                  />
                  MOSTRAR CALLOUTS DE POSICIÓN
                </label>
                <label className="map-option-checkbox font-oswald">
                  <input 
                    type="checkbox" 
                    checked={showSites} 
                    onChange={(e) => setShowSites(e.target.checked)} 
                    disabled={!hasMinimap || calloutsList.length === 0}
                  />
                  MOSTRAR SITIOS DE SPIKE (BOMBSITES)
                </label>
              </div>
            </div>

            {/* Sectors & Callouts lists */}
            <div className="mdo-perf-panel-card">
              <div className="panel-header font-oswald">
                <span>SECTORES Y CALLOUTS</span>
              </div>
              <div className="panel-body" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {Object.keys(groupedCallouts).length > 0 ? (
                  <div className="grouped-callouts-list">
                    {Object.entries(groupedCallouts).map(([sector, regions]) => (
                      <div key={sector} className="sector-group" style={{ marginBottom: "12px" }}>
                        <h4 className="font-oswald text-uppercase sector-title" style={{ margin: "0 0 6px 0", color: "var(--red)", fontSize: "11.5px" }}>
                          SECTOR {sector}
                        </h4>
                        <div className="regions-pills" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {Array.from(new Set(regions)).map((reg, rI) => (
                            <span 
                              key={rI} 
                              className="region-pill font-oswald"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid var(--line)",
                                padding: "2px 8px",
                                borderRadius: "3px",
                                fontSize: "10px",
                                color: "var(--text-dim)"
                              }}
                            >
                              {reg.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-dim font-oswald">No hay callouts detallados registrados.</div>
                )}
              </div>
            </div>

            {/* Splash image background */}
            {activeMap.splash && (
              <div className="map-splash-preview" style={{ backgroundImage: `url(${activeMap.splash})` }}>
                <div className="splash-overlay">
                  <span className="font-oswald splash-uuid">UUID: {activeMap.uuid}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="maps-view-container">
      <div className="maps-header">
        <div className="maps-title-section">
          <Compass className="maps-title-icon" size={24} />
          <h1 className="font-oswald">EXPLORACIÓN DE MAPAS</h1>
        </div>
        <div className="maps-filter-buttons">
          <button 
            className={`maps-filter-btn font-oswald ${filter === "rotation" ? "active" : ""}`}
            onClick={() => setFilter("rotation")}
          >
            POOL COMPETITIVO
          </button>
          <button 
            className={`maps-filter-btn font-oswald ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            TODOS LOS MAPAS
          </button>
        </div>
      </div>

      {loading ? (
        <div className="maps-loading-state">
          <div className="loading-spinner"></div>
          <span className="font-oswald text-dim">Cargando mapas desde Valorant-API...</span>
        </div>
      ) : (
        <div className="maps-grid">
          {filteredMaps.map((map) => (
            <div 
              key={map.uuid} 
              className="map-card" 
              onClick={() => setSelectedMap(map)}
              style={{ cursor: "pointer" }}
            >
              <div 
                className="map-card-banner"
                style={{ backgroundImage: `url(${map.listViewIcon})` }}
              >
                <div className="map-card-overlay">
                  <div className="map-card-text">
                    <h2 className="map-name font-oswald">{map.displayName.toUpperCase()}</h2>
                    <span className="map-coordinate font-oswald text-dim">
                      {map.coordinates || "Coordenadas no disponibles"}
                    </span>
                  </div>

                  {map.displayIcon && (
                    <div className="map-card-minimap-wrap">
                      <img 
                        src={map.displayIcon} 
                        alt={`${map.displayName} minimap`} 
                        className="map-card-minimap-img" 
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="map-card-footer">
                <Info size={13} className="text-dim" />
                <span className="text-dim font-oswald">
                  UUID: {map.uuid.substring(0, 8).toUpperCase()}...
                </span>
                {ACTIVE_MAPS.includes(map.displayName.toLowerCase()) && (
                  <span className="active-pool-badge font-oswald">COMPETITIVO ACTIVO</span>
                )}
              </div>
            </div>
          ))}

          {filteredMaps.length === 0 && (
            <div className="maps-empty-state text-dim font-oswald">
              No se encontraron mapas en esta sección.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
