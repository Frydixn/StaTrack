import React from "react";
import { Search } from "lucide-react";

export default function Filters({ activeFilter, onFilterChange, searchTerm, onSearchTermChange }) {
  const filterOptions = [
    { key: "all", label: "Todos" },
    { key: "unlocked", label: "Desbloqueados" },
    { key: "locked", label: "Bloqueados" },
  ];

  return (
    <div className="filters-container">
      <div className="filters-buttons">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            className={`filter-btn ${activeFilter === opt.key ? "active" : ""}`}
            onClick={() => onFilterChange(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="achievements-search-bar">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar logro..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
    </div>
  );
}
