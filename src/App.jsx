import { useEffect, useRef, useState } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { formatMessage } from "../formatMessage";
import { useChat } from "../useChat";
import { useDocuments } from "../useDocuments";

const QUICK_PROMPTS = [
  { label: "SQL Injection 101", prompt: "Explain SQL Injection like I'm a beginner, then show me a basic bypass payload" },
  { label: "XSS Lab Steps", prompt: "Give me step-by-step steps to find and exploit a reflected XSS vulnerability in a lab environment" },
  { label: "Fix Broken Auth", prompt: "How do I fix broken authentication? List OWASP recommendations with code examples" },
  { label: "Metasploit vsftpd", prompt: "How do I exploit vsftpd 2.3.4 backdoor using Metasploit on Metasploitable2?" },
  { label: "OWASP Top 10 2025", prompt: "What are the OWASP Top 10 2025 vulnerabilities? Summarize each with one-line impact" },
  { label: "Interview Prep", prompt: "Ask me 5 cybersecurity interview questions and then give model answers" },
  { label: "Nmap vs Masscan", prompt: "Compare Nmap and Masscan for port scanning — when to use which, with example commands" },
  { label: "MITRE ATT&CK", prompt: "Explain the MITRE ATT&CK framework — what is it, why it matters, give a real attack example mapped to it" },
];

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 18px" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "var(--purple)",
        animation: "pulse 1.2s ease-in-out infinite",
        animationDelay: `${i * 0.2}s`,
        opacity: 0.7
      }} />
    ))}
  </div>
);

const MessageBlock = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 12,
      marginBottom: 20,
      alignItems: "flex-start",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700,
        background: isUser ? "var(--purple-faint)" : "var(--blue-faint)",
        border: isUser ? "1px solid var(--purple-border)" : "1px solid var(--blue-border)",
        color: isUser ? "var(--purple)" : "var(--blue)",
        fontFamily: "var(--font-mono)",
      }}>
        {isUser ? "U" : "⚡"}
      </div>
      <div style={{
        maxWidth: "80%",
        background: isUser ? "var(--purple-faint)" : "var(--bg-raised)",
        border: isUser ? "1px solid var(--purple-border)" : "1px solid var(--blue-border)",
        borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        padding: "12px 16px",
        color: "var(--text-primary)",
        fontSize: 14,
        lineHeight: 1.7,
        fontFamily: "var(--font-sans)",
        whiteSpace: "pre-wrap",
        boxShadow: isUser ? "none" : "0 2px 20px rgba(0,0,0,0.1)",
      }}>
        {formatMessage(msg.content)}
      </div>
    </div>
  );
};

export default function App() {
  const { messages, loading, ragActive, activeTopic, setActiveTopic, sendMessage, clearHistory } = useChat();
  const { documents, uploading, uploadFile, removeDocument } = useDocuments();
  
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("cybermentor_theme") || "dark");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cybermentor_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading) {
        sendMessage(input);
        setInput("");
      }
    }
  };

  return (
    <div style={{
      height: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-sans)",
      overflow: "hidden",
      color: "var(--text-primary)"
    }}>
      <Header ragActive={ragActive} onClear={clearHistory} theme={theme} toggleTheme={toggleTheme} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar 
          activeTopic={activeTopic}
          setActiveTopic={setActiveTopic}
          documents={documents}
          uploading={uploading}
          onUpload={uploadFile}
          onRemoveDoc={removeDocument}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Quick prompts */}
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--bg-raised)",
            display: "flex", gap: 8, flexWrap: "wrap",
            background: "var(--bg-surface)",
          }}>
            {QUICK_PROMPTS.map((q, i) => (
              <button
                key={i}
                className="quick-btn"
                onClick={() => {
                  sendMessage(q.prompt);
                }}
                disabled={loading}
                style={{
                  padding: "5px 12px",
                  background: "var(--purple-faint)",
                  border: "1px solid var(--purple-border)",
                  borderRadius: 20,
                  color: "var(--purple-dim)",
                  fontSize: 11.5,
                  fontFamily: "var(--font-mono)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "all 0.18s ease",
                }}
              >{q.label}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "24px 20px",
            display: "flex", flexDirection: "column",
            margin: "0 auto", width: "100%", maxWidth: 860
          }}>
            {messages.map((msg, i) => (
              <div key={i} className="msg-fade">
                <MessageBlock msg={msg} />
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--blue-faint)",
                  border: "1px solid var(--blue-border)",
                  color: "var(--blue)", fontSize: 14,
                }}>⚡</div>
                <div style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--blue-border)",
                  borderRadius: "4px 16px 16px 16px",
                }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--purple-border)",
            background: "var(--bg-overlay)",
            backdropFilter: "blur(10px)",
          }}>
            <div style={{
              maxWidth: 860, margin: "0 auto",
              display: "flex", gap: 10, alignItems: "flex-end",
            }}>
              <div style={{
                flex: 1,
                background: "var(--bg-raised)",
                border: "1px solid var(--purple-border)",
                borderRadius: 14,
                display: "flex", alignItems: "flex-end",
                padding: "10px 14px",
                transition: "border-color 0.2s",
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about attacks, labs, OWASP, CVEs, or interview questions..."
                  rows={1}
                  style={{
                    flex: 1, background: "transparent",
                    border: "none", color: "var(--text-primary)",
                    fontSize: 14, resize: "none",
                    fontFamily: "var(--font-sans)",
                    lineHeight: 1.6, maxHeight: 120,
                    overflowY: "auto", outline: "none"
                  }}
                  onInput={e => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  disabled={loading}
                />
              </div>
              <button
                className="send-btn"
                onClick={() => {
                  if (input.trim() && !loading) {
                    sendMessage(input);
                    setInput("");
                  }
                }}
                disabled={loading || !input.trim()}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: input.trim() && !loading ? "var(--purple-faint)" : "var(--bg-raised)",
                  border: `1px solid ${input.trim() && !loading ? "var(--purple-border)" : "transparent"}`,
                  color: input.trim() && !loading ? "var(--purple)" : "var(--text-muted)",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, transition: "all 0.18s ease",
                  flexShrink: 0,
                }}
              >→</button>
            </div>
            <div style={{
              textAlign: "center", marginTop: 10,
              fontSize: 10.5, color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}>
              For educational & lab use only · Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
