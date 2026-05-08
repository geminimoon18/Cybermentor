// hooks/useChat.js
import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "cybermentor_history";
const MAX_STORED = 50;

const WELCOME = {
  role: "assistant",
  content: "**CyberMentor online.**\n\nI'm your AI cybersecurity mentor — ask me about attacks, defenses, OWASP, CVEs, labs, or interview prep.\n\nUpload your lab manual or OWASP notes in the sidebar to enable RAG context.",
};

export function useChat() {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [WELCOME];
    } catch {
      return [WELCOME];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTopic, setActiveTopic] = useState("");
  const [ragActive, setRagActive] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    try {
      const toStore = messages.slice(-MAX_STORED);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {}
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          topic: activeTopic,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server error");
      }

      setRagActive(data.rag_used || false);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ **Error:** ${err.message}\n\nMake sure the backend is running on port 5000.`,
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, activeTopic]);

  const clearHistory = useCallback(() => {
    setMessages([WELCOME]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    loading,
    error,
    ragActive,
    activeTopic,
    setActiveTopic,
    sendMessage,
    clearHistory,
  };
}
