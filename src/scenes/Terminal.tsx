import React from "react";
import { useCurrentFrame } from "remotion";
import { term, ease } from "../lib/theme";

// ── Terminal / CLI scene ───────────────────────────────────────────────────
// A faithful agentic-CLI terminal (Claude-Code style, but product-neutral):
// macOS title bar, `> ` prompt with typed reveal, `●` tool/bullet lines,
// dim indented results, an alert line color, a live spinner, fixed footer.
// Use for any CLI / agent / dev-tool launch. NOT required — pick it only if
// the product's story actually happens in a terminal.

export type TermLine =
  | { k: "prompt"; text: string; at: number; typed?: boolean }
  | { k: "bullet"; text: string; at: number }
  | { k: "tool"; name: string; args: string; at: number }
  | { k: "result"; text: string; at: number }
  | { k: "alert"; text: string; at: number }
  | { k: "url"; label: string; url: string; at: number }
  | { k: "blank"; at: number }
  | { k: "head"; text: string; at: number };

const FS = 19;
const LH = 1.62;

const Caret: React.FC<{ on: boolean }> = ({ on }) => {
  const f = useCurrentFrame();
  return (
    <span
      style={{
        color: term.amber,
        opacity: on && Math.floor(f / 13) % 2 === 0 ? 1 : on ? 0.25 : 0,
      }}
    >
      ▋
    </span>
  );
};

const Typed: React.FC<{ text: string; at: number; cps?: number }> = ({
  text,
  at,
  cps = 36,
}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor(((f - at) / 24) * cps));
  return (
    <span style={{ color: term.text }}>
      {text.slice(0, n)}
      <Caret on={n < text.length} />
    </span>
  );
};

// Rows don't reserve space until their frame — output streams top-down so
// the spinner/footer hug the last visible line (no floating gap).
const Row: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return <div style={{ opacity: ease(f, at, at + 7, 0, 1) }}>{children}</div>;
};

const Spinner: React.FC<{
  from: number;
  to: number;
  verb: string;
  meta: string;
}> = ({ from, to, verb, meta }) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const dots = ".".repeat(1 + (Math.floor(f / 8) % 3));
  return (
    <div style={{ color: term.amber, opacity: 0.85, marginTop: FS * LH * 0.5 }}>
      ↷ {verb}
      {dots} <span style={{ color: term.dim }}>({meta})</span>
    </div>
  );
};

export const Terminal: React.FC<{
  title: string;
  lines: TermLine[];
  w: number;
  h: number;
  spinner?: { from: number; to: number; verb: string; meta: string };
  footer?: string;
}> = ({
  title,
  lines,
  w,
  h,
  spinner,
  footer = "▶ bypass permissions on (shift+tab to cycle) · esc to interrupt",
}) => (
  <div
    style={{
      width: w,
      height: h,
      background: term.bg,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 30px 80px rgba(40,70,55,0.30)",
    }}
  >
    <div
      style={{
        height: 38,
        background: term.chrome,
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
          fontFamily: term.mono,
        }}
      >
        {title}
      </div>
    </div>
    <div
      style={{
        padding: "20px 26px 0",
        fontFamily: term.mono,
        fontSize: FS,
        lineHeight: LH,
        height: h - 38 - 42,
        overflow: "hidden",
      }}
    >
      {lines.map((ln, i) => {
        if (ln.k === "blank")
          return (
            <Row key={i} at={ln.at}>
              <div>&nbsp;</div>
            </Row>
          );
        if (ln.k === "prompt")
          return (
            <Row key={i} at={ln.at}>
              <span style={{ color: term.text }}>&gt; </span>
              {ln.typed ? (
                <Typed text={ln.text} at={ln.at} />
              ) : (
                <span style={{ color: term.text }}>{ln.text}</span>
              )}
            </Row>
          );
        if (ln.k === "bullet")
          return (
            <Row key={i} at={ln.at}>
              <span style={{ color: term.amber }}>● </span>
              <span style={{ color: term.text }}>{ln.text}</span>
            </Row>
          );
        if (ln.k === "tool")
          return (
            <Row key={i} at={ln.at}>
              <span style={{ color: term.amber }}>● </span>
              <span style={{ color: term.text, fontWeight: 700 }}>{ln.name}</span>
              <span style={{ color: term.lime }}>({ln.args})</span>
            </Row>
          );
        if (ln.k === "result")
          return (
            <Row key={i} at={ln.at}>
              <span style={{ color: term.dim, paddingLeft: 22, display: "inline-block" }}>
                {ln.text}
              </span>
            </Row>
          );
        if (ln.k === "alert")
          return (
            <Row key={i} at={ln.at}>
              <span style={{ color: term.alert }}>{ln.text}</span>
            </Row>
          );
        if (ln.k === "url")
          return (
            <Row key={i} at={ln.at}>
              <span style={{ color: term.text }}>{ln.label} </span>
              <span style={{ color: term.text }}>{ln.url}</span>
            </Row>
          );
        if (ln.k === "head")
          return (
            <Row key={i} at={ln.at}>
              <span style={{ color: term.text, fontWeight: 700 }}>{ln.text}</span>
            </Row>
          );
        return null;
      })}
      {spinner ? <Spinner {...spinner} /> : null}
    </div>
    <div
      style={{
        height: 42,
        display: "flex",
        alignItems: "center",
        paddingLeft: 26,
        fontFamily: term.mono,
        fontSize: 14,
        color: term.alert,
        opacity: 0.85,
      }}
    >
      {footer}
    </div>
  </div>
);
