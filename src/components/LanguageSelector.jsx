import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggle = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("valoquest_lang", lang);
  };

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {["en", "es"].map(lang => (
        <button key={lang} onClick={() => toggle(lang)}
          style={{
            padding: "3px 8px",
            borderRadius: 3,
            border: `1px solid ${i18n.language === lang ? "var(--red)" : "var(--line)"}`,
            background: i18n.language === lang ? "rgba(255,70,85,0.12)" : "transparent",
            color: i18n.language === lang ? "var(--red)" : "var(--text-dim)",
            fontSize: 11,
            fontFamily: "'Oswald', sans-serif",
            letterSpacing: 1,
            cursor: "pointer",
            textTransform: "uppercase",
          }}>
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
