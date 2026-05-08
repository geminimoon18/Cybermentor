// utils/formatMessage.jsx
// Renders markdown-lite: **bold**, `inline code`, ```code blocks```, numbered lists

export function formatMessage(text) {
  // Split on code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lang = part.match(/^```(\w*)/)?.[1] || "";
      const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return (
        <div key={i} className="code-block">
          {lang && (
            <div style={{
              fontSize: 10, color: "var(--purple-dim)",
              marginBottom: 6, textTransform: "uppercase",
              letterSpacing: "0.1em", fontFamily: "var(--font-mono)"
            }}>{lang}</div>
          )}
          {code}
        </div>
      );
    }

    // Process inline elements line by line
    return part.split("\n").map((line, j) => {
      const rendered = renderInline(line);
      return <span key={j}>{rendered}<br /></span>;
    });
  });
}

function renderInline(text) {
  // Split on **bold**, `code`
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith("`") && seg.endsWith("`")) {
      return <code key={i} className="inline-code">{seg.slice(1, -1)}</code>;
    }
    return seg;
  });
}
