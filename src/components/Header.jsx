import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Header({ onSearch, loading }) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = inputValue.trim();
    if (!raw.includes("#")) {
      setErrorMsg(t("header.error_format"));
      return;
    }
    const [name, tag] = raw.split("#");
    if (!name || !tag) {
      setErrorMsg(t("header.error_format"));
      return;
    }
    setErrorMsg("");
    onSearch(name, tag);
  };

  return (
    <header className="topbar">
      <form onSubmit={handleSubmit} className="topbar-search">
        <input
          type="text"
          placeholder={t("header.placeholder")}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !inputValue.trim()}>
          {loading ? t("header.loading") : t("header.search_btn")}
        </button>
      </form>
      
      {errorMsg && <div className="error-hint">{errorMsg}</div>}
    </header>
  );
}
