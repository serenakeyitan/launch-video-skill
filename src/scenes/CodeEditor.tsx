import React from "react";
import { useCurrentFrame } from "remotion";

// ── Code-editor scene ──────────────────────────────────────────────────────
// A VS-Code-ish editor (activity rail, tab, gutter line numbers) with a
// typed-code reveal. Pick this for libraries / SDKs / dev tools where the
// story is "write this much code → get this result". Token coloring is a
// light heuristic; pass pre-split spans via `lines` for full control.

type Tok = { t: string; c?: string };
const KW =
  /\b(import|from|export|const|let|function|return|async|await|new|class|if|else|for|of|type|interface)\b/;

function color(word: string): string {
  if (KW.test(word)) return "#c586c0";
  if (/^['"`].*['"`]$/.test(word)) return "#ce9178";
  if (/^[A-Z]/.test(word)) return "#4ec9b0";
  if (/^\d+$/.test(word)) return "#b5cea8";
  return "#d4d4d4";
}

export const CodeEditor: React.FC<{
  w: number;
  h: number;
  filename: string;
  /** plain code lines; revealed character-by-character */
  code: string[];
  startAt?: number;
  cps?: number;
}> = ({ w, h, filename, code, startAt = 0, cps = 32 }) => {
  const f = useCurrentFrame();
  const full = code.join("\n");
  const n = Math.max(0, Math.floor(((f - startAt) / 24) * cps));
  const shown = full.slice(0, n).split("\n");
  return (
    <div
      style={{
        width: w,
        height: h,
        background: "#1e1e1e",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(40,70,55,0.30)",
        display: "flex",
        fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
      }}
    >
      <div style={{ width: 48, background: "#333333" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            height: 36,
            background: "#252526",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              color: "#d4d4d4",
              padding: "0 18px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              borderTop: "1px solid #0a84ff",
            }}
          >
            {filename}
          </div>
        </div>
        <div style={{ padding: "16px 0", fontSize: 18, lineHeight: 1.6, flex: 1 }}>
          {shown.map((ln, i) => (
            <div key={i} style={{ display: "flex" }}>
              <span
                style={{
                  width: 52,
                  textAlign: "right",
                  paddingRight: 18,
                  color: "#5a5a5a",
                  userSelect: "none",
                }}
              >
                {i + 1}
              </span>
              <span style={{ whiteSpace: "pre", color: "#d4d4d4" }}>
                {ln.split(/(\s+|[(){}.,;])/).map((wd, j) => (
                  <span key={j} style={{ color: color(wd) }}>
                    {wd}
                  </span>
                ))}
                {i === shown.length - 1 && n < full.length ? (
                  <span style={{ color: "#aeafad" }}>▋</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
