import { useRef } from "react";

const TOPICS = [
  { id: "", label: "General Security" },
  { id: "web", label: "Web Vulnerabilities" },
  { id: "network", label: "Network Security" },
  { id: "exploit", label: "Exploitation" },
  { id: "defense", label: "Defense & Blue Team" },
  { id: "forensics", label: "Digital Forensics" },
];

export default function Sidebar({ activeTopic, setActiveTopic, documents, uploading, onUpload, onRemoveDoc }) {
  const fileInputRef = useRef();

  return (
    <div style={{
      width: 250,
      background: "var(--bg-overlay)",
      borderRight: "1px solid var(--purple-faint)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Topics */}
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <div style={{
          fontSize: 11, color: "var(--text-muted)",
          fontFamily: "var(--font-mono)", marginBottom: 12,
          textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          Knowledge Domains
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTopic(t.id)}
              style={{
                textAlign: "left", padding: "8px 12px",
                background: activeTopic === t.id ? "var(--purple-faint)" : "transparent",
                border: "none", borderRadius: 6,
                color: activeTopic === t.id ? "var(--purple)" : "var(--text-primary)",
                fontSize: 13, fontFamily: "var(--font-sans)",
                cursor: "pointer", transition: "all 0.15s",
                borderLeft: activeTopic === t.id ? "3px solid var(--purple)" : "3px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Upload for RAG */}
      <div style={{ padding: 20, borderTop: "1px solid var(--purple-faint)" }}>
        <div style={{
          fontSize: 11, color: "var(--text-muted)",
          fontFamily: "var(--font-mono)", marginBottom: 12,
          textTransform: "uppercase", letterSpacing: "0.05em",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          Context Documents
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            background: "var(--blue-faint)", color: "var(--blue)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, cursor: "help"
          }} title="Upload PDF lab manuals or notes to give the AI context">?</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 150, overflowY: "auto" }}>
          {documents.map(doc => (
            <div key={doc.id} style={{
              background: "var(--bg-raised)", padding: "8px 10px",
              borderRadius: 6, fontSize: 12, color: "var(--text-primary)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              border: "1px solid var(--bg-raised)"
            }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={doc.filename}>
                📄 {doc.filename}
              </span>
              <button 
                onClick={() => onRemoveDoc(doc.id)}
                style={{
                  background: "none", border: "none", color: "var(--red)",
                  cursor: "pointer", fontSize: 14, padding: "0 4px"
                }}
                title="Remove"
              >×</button>
            </div>
          ))}
        </div>

        <input
          type="file" accept=".pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) {
              onUpload(e.target.files[0]);
              e.target.value = null; // reset
            }
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            width: "100%", padding: "10px",
            background: "var(--blue-faint)",
            border: "1px dashed var(--blue-border)",
            borderRadius: 8, color: "var(--blue)",
            fontSize: 12, fontFamily: "var(--font-mono)",
            cursor: uploading ? "wait" : "pointer",
            transition: "all 0.2s"
          }}
        >
          {uploading ? "UPLOADING..." : "+ UPLOAD PDF"}
        </button>
      </div>
    </div>
  );
}
