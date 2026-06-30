import React, { useState } from "react";

export default function Header({ onSearch, loading }) {
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = inputValue.trim();
    if (!raw.includes("#")) {
      setErrorMsg("Formato inválido. Usá Nombre#TAG, ej: Sentinel#000");
      return;
    }
    const [name, tag] = raw.split("#");
    if (!name || !tag) {
      setErrorMsg("Formato inválido. Ambos nombre y tag son obligatorios.");
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
          placeholder="Nombre#TAG (ej: Sentinel#000)"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !inputValue.trim()}>
          {loading ? "..." : "Buscar"}
        </button>
      </form>
      
      {errorMsg && <div className="error-hint">{errorMsg}</div>}
    </header>
  );
}
