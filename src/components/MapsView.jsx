import React, { useState, useEffect } from "react";
import { Compass, Info } from "lucide-react";

export default function MapsView() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("rotation"); // "rotation" or "all"

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
            <div key={map.uuid} className="map-card">
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
