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
    <header className="header-container">
      <div className="eyebrow">EXPEDIENTE DE AGENTE</div>
      <h1>
        VALORANT<span>//</span>LOGROS
      </h1>
      <p className="subtitle">
        Ingresá tu Riot ID y desbloqueá tu historial de combate directamente desde Supabase
      </p>

      <form onSubmit={handleSubmit} className="search-wrap">
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
        <button type="submit" className="btn" disabled={loading || !inputValue.trim()}>
          {loading ? "Escaneando..." : "Buscar"}
        </button>
      </form>
      
      {errorMsg && <div className="error-hint">{errorMsg}</div>}
      <div className="hint">
        Los datos se buscan en Supabase. Si no existen, se consultan en HenrikDev API y se guardan.
      </div>
    </header>
  );
}
