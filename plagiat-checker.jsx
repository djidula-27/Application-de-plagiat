import { useState, useRef, useCallback } from "react";

const COLORS = {
  bg: "#0d0f14",
  surface: "#151820",
  border: "#1e2330",
  accent: "#00e5a0",
  accentDim: "#00e5a020",
  accentBorder: "#00e5a040",
  warn: "#ffb84d",
  danger: "#ff4d6d",
  text: "#e8eaf0",
  muted: "#6b7280",
  card: "#1a1d28",
};

const styles = {
  app: {
    minHeight: "100vh",
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'DM Mono', 'Courier New', monospace",
    padding: "0",
  },
  header: {
    borderBottom: `1px solid ${COLORS.border}`,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: COLORS.surface,
  },
  logo: {
    width: 36,
    height: 36,
    background: `linear-gradient(135deg, ${COLORS.accent}, #0099ff)`,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: "11px",
    color: COLORS.muted,
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  main: {
    maxWidth: "780px",
    margin: "0 auto",
    padding: "32px 20px",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    background: COLORS.surface,
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "28px",
    border: `1px solid ${COLORS.border}`,
  },
  tab: (active) => ({
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
    fontWeight: "600",
    letterSpacing: "0.5px",
    transition: "all 0.2s",
    background: active ? COLORS.accent : "transparent",
    color: active ? "#000" : COLORS.muted,
  }),
  card: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
  },
  label: {
    fontSize: "11px",
    color: COLORS.muted,
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "10px",
    display: "block",
  },
  textarea: {
    width: "100%",
    minHeight: "180px",
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    color: COLORS.text,
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: "1.7",
    padding: "14px",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  dropzone: (dragging) => ({
    border: `2px dashed ${dragging ? COLORS.accent : COLORS.border}`,
    borderRadius: "12px",
    padding: "40px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: dragging ? COLORS.accentDim : COLORS.surface,
    transition: "all 0.2s",
  }),
  btn: {
    width: "100%",
    padding: "14px",
    background: `linear-gradient(135deg, ${COLORS.accent}, #00c8ff)`,
    border: "none",
    borderRadius: "10px",
    color: "#000",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
    textTransform: "uppercase",
  },
  resultBar: (score) => ({
    height: "8px",
    borderRadius: "99px",
    background: COLORS.border,
    overflow: "hidden",
    marginBottom: "6px",
  }),
  resultFill: (score) => ({
    height: "100%",
    width: `${score}%`,
    background:
      score < 20
        ? COLORS.accent
        : score < 50
        ? COLORS.warn
        : COLORS.danger,
    borderRadius: "99px",
    transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
  }),
  badge: (score) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    background:
      score < 20
        ? "#00e5a015"
        : score < 50
        ? "#ffb84d15"
        : "#ff4d6d15",
    color:
      score < 20 ? COLORS.accent : score < 50 ? COLORS.warn : COLORS.danger,
    border: `1px solid ${
      score < 20
        ? COLORS.accentBorder
        : score < 50
        ? "#ffb84d40"
        : "#ff4d6d40"
    }`,
  }),
  historyItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    background: COLORS.surface,
    borderRadius: "10px",
    marginBottom: "8px",
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  scoreDot: (score) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    background:
      score < 20
        ? "#00e5a015"
        : score < 50
        ? "#ffb84d15"
        : "#ff4d6d15",
    border: `2px solid ${
      score < 20 ? COLORS.accent : score < 50 ? COLORS.warn : COLORS.danger
    }`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color:
      score < 20 ? COLORS.accent : score < 50 ? COLORS.warn : COLORS.danger,
    flexShrink: 0,
  }),
};

async function analyzeWithClaude(text) {
  const prompt = `Tu es un expert en détection de plagiat. Analyse ce texte et donne un score de plagiat potentiel.

Texte à analyser :
"""
${text.slice(0, 3000)}
"""

Réponds UNIQUEMENT en JSON valide, sans aucun texte autour, dans ce format exact :
{
  "score": <nombre entre 0 et 100>,
  "verdict": "<Original | Suspect | Plagiat probable>",
  "summary": "<explication courte en 1-2 phrases>",
  "indicators": [
    {"label": "<indicateur>", "value": "<valeur>", "risk": "<low|medium|high>"}
  ],
  "suggestions": ["<conseil 1>", "<conseil 2>"]
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const raw = data.content?.map((b) => b.text || "").join("") || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function ScoreDisplay({ result }) {
  const { score, verdict, summary, indicators, suggestions } = result;
  return (
    <div style={{ ...styles.card, border: `1px solid ${COLORS.accentBorder}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "48px", fontWeight: "700", lineHeight: 1, color: score < 20 ? COLORS.accent : score < 50 ? COLORS.warn : COLORS.danger }}>
            {score}%
          </div>
          <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "4px" }}>Score de plagiat</div>
        </div>
        <span style={styles.badge(score)}>{verdict}</span>
      </div>

      <div style={styles.resultBar(score)}>
        <div style={styles.resultFill(score)} />
      </div>

      <p style={{ fontSize: "14px", color: COLORS.muted, lineHeight: "1.6", margin: "16px 0 20px" }}>
        {summary}
      </p>

      {indicators?.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <span style={styles.label}>Indicateurs</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {indicators.map((ind, i) => (
              <div key={i} style={{
                padding: "10px 12px",
                background: COLORS.surface,
                borderRadius: "8px",
                border: `1px solid ${ind.risk === "high" ? "#ff4d6d30" : ind.risk === "medium" ? "#ffb84d30" : COLORS.border}`,
              }}>
                <div style={{ fontSize: "11px", color: COLORS.muted, marginBottom: "2px" }}>{ind.label}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: ind.risk === "high" ? COLORS.danger : ind.risk === "medium" ? COLORS.warn : COLORS.accent }}>
                  {ind.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions?.length > 0 && (
        <div>
          <span style={styles.label}>Suggestions</span>
          {suggestions.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px", color: COLORS.muted, lineHeight: "1.5" }}>
              <span style={{ color: COLORS.accent, flexShrink: 0 }}>→</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState(null);
  const [fileText, setFileText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("plagiat_history") || "[]"); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState("checker");
  const fileRef = useRef();

  const saveToHistory = (entry) => {
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    try { localStorage.setItem("plagiat_history", JSON.stringify(updated)); } catch {}
  };

  const handleAnalyze = async () => {
    const content = tab === "text" ? text : fileText;
    if (!content.trim()) { setError("Veuillez entrer du texte à analyser."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await analyzeWithClaude(content);
      setResult(res);
      saveToHistory({
        id: Date.now(),
        date: new Date().toLocaleString("fr-FR"),
        preview: content.slice(0, 80) + "...",
        score: res.score,
        verdict: res.verdict,
        source: tab === "file" ? fileName : "Texte",
      });
    } catch (e) {
      setError("Erreur lors de l'analyse. Vérifiez votre connexion.");
    }
    setLoading(false);
  };

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setFileText(e.target.result);
    reader.readAsText(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div style={styles.app}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
      textarea:focus { border-color: #00e5a060 !important; }
      button:hover { opacity: 0.88; }
      button:active { transform: scale(0.98); }
      ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d0f14; }
      ::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 99px; }`}</style>

      <header style={styles.header}>
        <div style={styles.logo}>🔍</div>
        <div>
          <div style={styles.title}>PlagiatCheck</div>
          <div style={styles.subtitle}>Détecteur de plagiat IA</div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Nav */}
        <div style={styles.tabs}>
          {[["checker", "⚡ Vérifier"], ["history", `🕘 Historique (${history.length})`]].map(([id, label]) => (
            <button key={id} style={styles.tab(activeTab === id)} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>

        {activeTab === "checker" && (
          <>
            {/* Input type tabs */}
            <div style={{ ...styles.tabs, marginBottom: "16px" }}>
              {[["text", "📝 Texte"], ["file", "📄 Fichier"]].map(([id, label]) => (
                <button key={id} style={styles.tab(tab === id)} onClick={() => { setTab(id); setResult(null); setError(null); }}>{label}</button>
              ))}
            </div>

            <div style={styles.card}>
              <span style={styles.label}>{tab === "text" ? "Collez votre texte" : "Importez un fichier"}</span>

              {tab === "text" ? (
                <textarea
                  style={styles.textarea}
                  placeholder="Collez ici le texte à analyser pour détecter d'éventuels plagiats..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              ) : (
                <div
                  style={styles.dropzone(dragging)}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept=".txt,.md,.csv" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>📁</div>
                  {fileName ? (
                    <div>
                      <div style={{ color: COLORS.accent, fontWeight: "600" }}>{fileName}</div>
                      <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "4px" }}>Fichier chargé — cliquez pour changer</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: COLORS.text, fontWeight: "600" }}>Glissez-déposez votre fichier</div>
                      <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "4px" }}>ou cliquez pour parcourir (.txt, .md, .csv)</div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div style={{ marginTop: "12px", padding: "10px 14px", background: "#ff4d6d10", border: "1px solid #ff4d6d30", borderRadius: "8px", fontSize: "13px", color: COLORS.danger }}>
                  ⚠️ {error}
                </div>
              )}

              <button style={{ ...styles.btn, marginTop: "16px", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }} onClick={handleAnalyze} disabled={loading}>
                {loading ? "⏳ Analyse en cours..." : "🔍 Lancer l'analyse"}
              </button>
            </div>

            {result && <ScoreDisplay result={result} />}
          </>
        )}

        {activeTab === "history" && (
          <div>
            {history.length === 0 ? (
              <div style={{ ...styles.card, textAlign: "center", padding: "48px 24px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🕘</div>
                <div style={{ color: COLORS.muted, fontSize: "14px" }}>Aucune analyse effectuée pour l'instant.</div>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} style={styles.historyItem}>
                  <div style={styles.scoreDot(item.score)}>{item.score}%</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", color: COLORS.text, marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.preview}
                    </div>
                    <div style={{ fontSize: "11px", color: COLORS.muted }}>
                      {item.source} · {item.date}
                    </div>
                  </div>
                  <span style={styles.badge(item.score)}>{item.verdict}</span>
                </div>
              ))
            )}
            {history.length > 0 && (
              <button style={{ ...styles.btn, background: "transparent", color: COLORS.danger, border: `1px solid #ff4d6d30`, marginTop: "8px" }}
                onClick={() => { setHistory([]); localStorage.removeItem("plagiat_history"); }}>
                🗑 Effacer l'historique
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
