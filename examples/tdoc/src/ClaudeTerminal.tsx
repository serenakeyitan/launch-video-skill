import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

// ── 1:1 Claude Code terminal recreation ───────────────────────────────────
// Faithful to the real UI spec: macOS title bar, `> ` prompt, `●` amber
// bullets, Skill()/Bash()/Write() tool calls with lime args, dim indented
// results, [tdoc] publish lines, plain URLs, a live spinner status line,
// and a fixed red-orange footer. Crisp vector text — no embedded footage.

const C = {
  bg: "#1b1b1b",
  chrome: "#2c2c2c",
  text: "#e6e6e6",
  amber: "#d18a4e", // ● bullets, tool accent
  lime: "#9ccc65", // tool args / success
  dim: "#828282", // results, collapsed counts
  redorange: "#d65959", // [tdoc] lines, footer
  mono: "ui-monospace, 'SF Mono', 'Menlo', 'Consolas', monospace",
};

// A line in the session script.
type Line =
  | { k: "prompt"; text: string; at: number; typed?: boolean }
  | { k: "bullet"; text: string; at: number; tone?: "text" | "done" }
  | { k: "tool"; name: string; args: string; at: number }
  | { k: "result"; text: string; at: number }
  | { k: "tdoc"; text: string; at: number }
  | { k: "url"; label: string; url: string; at: number }
  | { k: "blank"; at: number }
  | { k: "head"; text: string; at: number };

const FS = 19; // font size
const LH = 1.62;

const Caret: React.FC<{ on: boolean }> = ({ on }) => {
  const f = useCurrentFrame();
  return (
    <span style={{ color: C.amber, opacity: on && Math.floor(f / 13) % 2 === 0 ? 1 : on ? 0.25 : 0 }}>
      ▋
    </span>
  );
};

// Typed prompt: characters reveal over ~the line's window. A leading
// slash-command (e.g. "/tdoc") is rendered in the accent color and bold
// so the skill invocation is highlighted as it's typed.
const Typed: React.FC<{ text: string; at: number; cps?: number }> = ({ text, at, cps = 36 }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor(((f - at) / 24) * cps));
  const done = n >= text.length;
  const shown = text.slice(0, n);
  const m = /^(\/[A-Za-z][\w-]*)(.*)$/s.exec(shown);
  return (
    <span style={{ color: C.text }}>
      {m ? (
        <>
          <span style={{ color: C.lime, fontWeight: 700 }}>{m[1]}</span>
          {m[2]}
        </>
      ) : (
        shown
      )}
      <Caret on={!done} />
    </span>
  );
};

// A row does NOT reserve space until its frame arrives — real Claude Code
// streams output top-down and nothing below the last printed line exists
// yet. Before `at`, the row is fully collapsed (height 0). This keeps the
// spinner/footer flowing directly under the last visible line instead of
// floating far down past invisible placeholders.
const Row: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const o = interpolate(f, [at, at + 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ opacity: o }}>{children}</div>;
};

const SpinnerStatus: React.FC<{ from: number; to: number; verb: string; meta: string }> = ({
  from,
  to,
  verb,
  meta,
}) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const dots = ".".repeat(1 + (Math.floor(f / 8) % 3));
  // Sits one blank line under the last printed output (real Claude Code
  // streams the status line directly beneath the work, not pinned low).
  return (
    <div style={{ color: C.amber, opacity: 0.85, marginTop: FS * LH * 0.5 }}>
      ↷ {verb}
      {dots} <span style={{ color: C.dim }}>({meta})</span>
    </div>
  );
};

export const ClaudeTerminal: React.FC<{
  title: string;
  lines: Line[];
  spinner?: { from: number; to: number; verb: string; meta: string };
  w: number;
  h: number;
}> = ({ title, lines, spinner, w, h }) => {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: C.bg,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(40,70,55,0.30)",
      }}
    >
      {/* macOS title bar */}
      <div
        style={{
          height: 38,
          background: C.chrome,
          display: "flex",
          alignItems: "center",
          paddingLeft: 15,
          gap: 8,
          position: "relative",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#9a9a9a",
            fontSize: 13,
            fontFamily: C.mono,
          }}
        >
          {title}
        </div>
      </div>

      {/* session body */}
      <div
        style={{
          padding: "20px 26px 0",
          fontFamily: C.mono,
          fontSize: FS,
          lineHeight: LH,
          height: h - 38 - 42,
          overflow: "hidden",
        }}
      >
        {lines.map((ln, i) => {
          if (ln.k === "blank") return <Row key={i} at={ln.at}><div>&nbsp;</div></Row>;
          if (ln.k === "prompt")
            return (
              <Row key={i} at={ln.at}>
                <span style={{ color: C.text }}>&gt; </span>
                {ln.typed ? <Typed text={ln.text} at={ln.at} /> : <span style={{ color: C.text }}>{ln.text}</span>}
              </Row>
            );
          if (ln.k === "bullet")
            return (
              <Row key={i} at={ln.at}>
                <span style={{ color: C.amber }}>● </span>
                <span style={{ color: C.text }}>{ln.text}</span>
              </Row>
            );
          if (ln.k === "tool")
            return (
              <Row key={i} at={ln.at}>
                <span style={{ color: C.amber }}>● </span>
                <span style={{ color: C.text, fontWeight: 700 }}>{ln.name}</span>
                <span style={{ color: C.lime }}>({ln.args})</span>
              </Row>
            );
          if (ln.k === "result")
            return (
              <Row key={i} at={ln.at}>
                <span style={{ color: C.dim, paddingLeft: 22, display: "inline-block" }}>
                  {ln.text}
                </span>
              </Row>
            );
          if (ln.k === "tdoc")
            return (
              <Row key={i} at={ln.at}>
                <span style={{ color: C.redorange }}>{ln.text}</span>
              </Row>
            );
          if (ln.k === "url")
            return (
              <Row key={i} at={ln.at}>
                <span style={{ color: C.text }}>{ln.label} </span>
                <span style={{ color: C.text }}>{ln.url}</span>
              </Row>
            );
          if (ln.k === "head")
            return (
              <Row key={i} at={ln.at}>
                <span style={{ color: C.text, fontWeight: 700 }}>{ln.text}</span>
              </Row>
            );
          return null;
        })}
        {spinner ? <SpinnerStatus {...spinner} /> : null}
      </div>

      {/* fixed footer */}
      <div
        style={{
          height: 42,
          display: "flex",
          alignItems: "center",
          paddingLeft: 26,
          fontFamily: C.mono,
          fontSize: 14,
          color: C.redorange,
          opacity: 0.85,
        }}
      >
        ▶ bypass permissions on (shift+tab to cycle) · esc to interrupt
      </div>
    </div>
  );
};

export type { Line };
