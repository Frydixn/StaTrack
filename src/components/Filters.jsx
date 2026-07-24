import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Filters({ activeFilter, onFilterChange, searchTerm, onSearchTermChange }) {
  const { t } = useTranslation();
  const filterOptions = [
    { key: "all", label: t("achievements.filter_all") },
    { key: "unlocked", label: t("achievements.filter_unlocked") },
    { key: "locked", label: t("achievements.filter_locked") },
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
          placeholder={t("achievements.search_placeholder")}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
    </div>
  );
}
