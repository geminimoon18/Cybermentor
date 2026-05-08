// components/Header.jsx
export default function Header({ ragActive, onClear, theme, toggleTheme }) {
  return (
    <header style={{
      height: "var(--header-height)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      borderBottom: "1px solid var(--purple-faint)",
      background: "var(--bg-overlay)",
      backdropFilter: "blur(12px)",
      position: "relative",
      zIndex: 20,
      gap: 14,
      flexShrink: 0,
    }}>
      {/* Logo mark */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg, var(--purple-faint), var(--blue-faint))",
        border: "1px solid var(--purple-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
      }}>🛡️</div>

      {/* Title */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 15, fontWeight: 700,
          color: "var(--purple)",
          letterSpacing: "0.04em",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          CyberMentor
          <span style={{
            animation: "blink 1s step-end infinite",
            color: "var(--purple)",
            fontSize: 15,
          }}>_</span>
        </div>
        <div style={{
          fontSize: 11, color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          marginTop: 1,
        }}>
          OWASP · Pentesting · CVEs · Labs
        </div>
      </div>

      {/* RAG badge */}
      {ragActive && (
        <div style={{
          padding: "3px 10px",
          background: "var(--blue-faint)",
          border: "1px solid var(--blue-border)",
          borderRadius: 20,
          fontSize: 10.5,
          color: "var(--blue)",
          fontFamily: "var(--font-mono)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--blue)",
            boxShadow: "0 0 4px var(--blue)",
          }} />
          RAG ACTIVE
        </div>
      )}

      {/* Status dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--purple)",
          boxShadow: "0 0 8px var(--purple)",
          animation: "pulse-dot 2s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 11, color: "var(--purple-dim)", fontFamily: "var(--font-mono)" }}>LIVE</span>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        title="Toggle Theme"
        style={{
          background: "transparent",
          border: "1px solid var(--bg-raised)",
          borderRadius: 8,
          padding: "5px 10px",
          color: "var(--text-muted)",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={e => {
          e.target.style.borderColor = "var(--text-primary)";
          e.target.style.color = "var(--text-primary)";
        }}
        onMouseLeave={e => {
          e.target.style.borderColor = "var(--bg-raised)";
          e.target.style.color = "var(--text-muted)";
        }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {/* Clear button */}
      <button
        onClick={onClear}
        title="Clear conversation"
        style={{
          background: "transparent",
          border: "1px solid var(--bg-raised)",
          borderRadius: 8,
          padding: "5px 10px",
          color: "var(--text-muted)",
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          e.target.style.borderColor = "rgba(255,77,109,0.4)";
          e.target.style.color = "var(--red)";
        }}
        onMouseLeave={e => {
          e.target.style.borderColor = "var(--bg-raised)";
          e.target.style.color = "var(--text-muted)";
        }}
      >
        CLEAR
      </button>
    </header>
  );
}
