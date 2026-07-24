import React, { useState } from "react";
import { Users, X, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ComparePanel({
    playerData, friendData, friendLoading, friendError,
    compareMode, onFriendSearch, onClose,
}) {
    const { t } = useTranslation();
    const [input, setInput] = useState("");
    const [inputError, setInputError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const raw = input.trim();
        if (!raw.includes("#")) { setInputError(t("header.error_format")); return; }
        const [name, tag] = raw.split("#");
        if (!name || !tag) { setInputError(t("achievements.err_required")); return; }
        setInputError("");
        onFriendSearch(name, tag);
    };

    const meSummary = playerData?.summary;
    const friendSummary = friendData?.summary;

    return (
        <div className="compare-panel">
            <div className="compare-header">
                <div className="section-header" style={{ marginBottom: 0 }}>
                    <Users size={16} className="section-icon" />
                    <span>{t("achievements.compare_title")}</span>
                </div>
                {compareMode && (
                    <button className="btn-secondary compare-close" onClick={onClose}>
                        <X size={14} /> {t("achievements.close_btn")}
                    </button>
                )}
            </div>

            {!compareMode && (
                <form onSubmit={handleSubmit} className="compare-search-wrap">
                    <div className="achievements-search-bar" style={{ flex: 1 }}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder={t("achievements.compare_placeholder")}
                            value={input}
                            onChange={(e) => { setInput(e.target.value); setInputError(""); }}
                            disabled={friendLoading}
                        />
                    </div>
                    <button className="btn" type="submit" disabled={friendLoading || !input.trim()}>
                        {friendLoading ? t("general.loading") : t("achievements.compare_btn")}
                    </button>
                </form>
            )}

            {inputError && <div className="error-hint">{inputError}</div>}
            {friendError && <div className="error-hint">{friendError}</div>}

            {friendLoading && (
                <div className="state-msg" style={{ padding: "20px 0" }}>
                    <div className="loading-spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
                    {t("achievements.loading_friend")}
                </div>
            )}

            {compareMode && friendData && (
                <div className="compare-summary">
                    <div className={`compare-player ${meSummary.unlocked > friendSummary.unlocked ? "winner" : ""}`}>
                        <div className="compare-player-name">
                            {playerData.account.name}<span className="tag">#{playerData.account.tag}</span>
                        </div>
                        <div className="compare-player-score">{meSummary.unlocked}</div>
                        <div className="compare-player-sub">{t("achievements.unlocked_suffix")}</div>
                        <div className="compare-player-pct">{meSummary.percent}%</div>
                    </div>

                    <div className="compare-vs">{t("compare.vs_divider")}</div>

                    <div className={`compare-player ${friendSummary.unlocked > meSummary.unlocked ? "winner" : ""}`}>
                        <div className="compare-player-name">
                            {friendData.account.name}<span className="tag">#{friendData.account.tag}</span>
                        </div>
                        <div className="compare-player-score">{friendSummary.unlocked}</div>
                        <div className="compare-player-sub">{t("achievements.unlocked_suffix")}</div>
                        <div className="compare-player-pct">{friendSummary.percent}%</div>
                    </div>
                </div>
            )}
        </div>
    );
}