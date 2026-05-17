import React from "react";
import { useCurrentFrame } from "remotion";
import { palette, ease } from "./theme";

// ── Animated wave background ───────────────────────────────────────────────
// A calm, slowly drifting band background. Pass your own colors to rebrand.
export const WaveBackground: React.FC<{
  c1?: string;
  c2?: string;
  c3?: string;
}> = ({ c1 = palette.bg1, c2 = palette.bg2, c3 = palette.bg3 }) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 90) * 24;
  return (
    <div style={{ position: "absolute", inset: 0, background: c2, overflow: "hidden" }}>
      {[c1, c3, c1].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -120,
            right: -120,
            top: `${i * 33 - 12}%`,
            height: "46%",
            background: c,
            opacity: 0.55,
            transform: `translateX(${drift * (i % 2 ? -1 : 1)}px) rotate(-4deg)`,
            filter: "blur(36px)",
          }}
        />
      ))}
    </div>
  );
};

// ── Caption (kicker line under a window) ───────────────────────────────────
export const Caption: React.FC<{ at: number; text: string; color?: string }> = ({
  at,
  text,
  color = palette.ink,
}) => {
  const f = useCurrentFrame();
  const o = ease(f, at, at + 10, 0, 1);
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 26px)",
        left: "50%",
        transform: `translateX(-50%) translateY(${(1 - o) * 10}px)`,
        whiteSpace: "nowrap",
        opacity: o,
      }}
    >
      <span style={{ fontFamily: palette.mono, fontSize: 18, color, opacity: 0.75 }}>
        {text}
      </span>
    </div>
  );
};

// ── Fade/slide-in wrapper ──────────────────────────────────────────────────
export const FadeIn: React.FC<{
  at: number;
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, dur = 10, children, style }) => {
  const f = useCurrentFrame();
  const t = ease(f, at, at + dur, 0, 1);
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * 12}px)`, ...style }}>
      {children}
    </div>
  );
};

// ── Animated cursor that travels to a point and presses ────────────────────
// Place inside a position:relative container. Coordinates are that
// container's local px. `clickAt` is when the press (scale-down) happens.
export const Cursor: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startAt: number;
  clickAt: number;
  hideAfter?: number;
  size?: number;
}> = ({ fromX, fromY, toX, toY, startAt, clickAt, hideAfter, size = 42 }) => {
  const f = useCurrentFrame();
  if (hideAfter != null && f > hideAfter) return null;
  const x = ease(f, startAt, clickAt, fromX, toX);
  const y = ease(f, startAt, clickAt, fromY, toY);
  const pressing = f >= clickAt && f < clickAt + 8;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: x,
        top: y,
        filter: "drop-shadow(0 3px 5px rgba(0,0,0,.5))",
        transform: pressing ? "scale(0.82)" : "scale(1)",
        zIndex: 50,
      }}
    >
      <path
        d="M3 2 L3 20 L8 15 L11 22 L14 21 L11 14 L18 14 Z"
        fill="#fff"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
    </svg>
  );
};

// ── Pixel "pet" mascot with expressions ────────────────────────────────────
// A friendly pixel creature (Claude-Code-pet style): floats, blinks, and
// gives a happy squint on a cadence. `grid` lets a project supply its own
// 9-col pixel art; default is a generic rounded blob with a face. `color`
// is the body fill. Eye/mouth rows are swapped for the blink/squint frames.
const FACE_OPEN = ["XXoXXXoXX", "XX#XXX#XX", "XXXvvvXXX"];
const FACE_BLINK = ["XX^XXX^XX", "XXXXXXXXX", "XXXvvvXXX"];
const FACE_SQUINT = ["XX^XXX^XX", "XXoXXXoXX", "XXXvvvXXX"];

export const PixelPet: React.FC<{
  size?: number;
  color?: string;
  /** rows ABOVE the face (each a 9-char string of X/.) */
  crown?: string[];
  /** rows BELOW the face, e.g. a trunk */
  base?: string[];
  baseColor?: string;
  float?: boolean;
}> = ({
  size = 9,
  color = palette.accent,
  crown = ["....X....", "...XXX...", "..XXXXX..", ".XXXXXXX.", "XXXXXXXXX"],
  base = [],
  baseColor = "#7a5240",
  float = true,
}) => {
  const frame = useCurrentFrame();
  const y = float ? Math.sin(frame / 22) * 5 : 0;
  const blink = frame % 72 < 3;
  const squint = frame % 168 >= 3 && frame % 168 < 11;
  const face = blink ? FACE_BLINK : squint ? FACE_SQUINT : FACE_OPEN;
  const grid = [...crown, ...face, ...base];
  const fill = (c: string) => {
    if (c === "X") return color;
    if (c === "t") return baseColor;
    if (c === "o") return "#ffffff";
    if (c === "#" || c === "^" || c === "v") return "#22140e";
    return "transparent";
  };
  return (
    <div
      style={{
        transform: `translateY(${y}px)`,
        display: "grid",
        gridTemplateColumns: `repeat(9, ${size}px)`,
        gridAutoRows: `${size}px`,
        filter: "drop-shadow(0 5px 12px rgba(40,70,50,0.22))",
      }}
    >
      {grid.flatMap((row, r) =>
        row
          .padEnd(9, ".")
          .slice(0, 9)
          .split("")
          .map((c, i) => (
            <div key={`${r}-${i}`} style={{ width: size, height: size, background: fill(c) }} />
          ))
      )}
    </div>
  );
};
