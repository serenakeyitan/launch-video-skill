import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { sage, tw } from "./theme";

// ── Reference-spec constants ──────────────────────────────────────────────
// The terminal NEVER exceeds ~55% of frame width; the sage margin is the
// design and the waves live only in it. 1920 * 0.52 ≈ 1000.
export const WIN_W = 1000;
export const SERIF =
  "'Iowan Old Style', 'Palatino', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";

// One continuous, slow wave field. Rendered once at the Root so it spans
// every cut — this is what makes the piece read as a single breath.
export const SageBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.7; // slow, constant
  const Band: React.FC<{ y: number; amp: number; color: string; ph: number; k: number }> = ({
    y,
    amp,
    color,
    ph,
    k,
  }) => {
    const pts: string[] = [];
    for (let x = 0; x <= 1920; x += 48) {
      const yy =
        y +
        Math.sin((x + drift * 5) / 300 + ph) * amp +
        Math.cos((x - drift * 3) / 620) * amp * 0.35;
      pts.push(`${x},${yy.toFixed(1)}`);
    }
    return <polyline points={`0,1080 ${pts.join(" ")} 1920,1080`} fill={color} />;
  };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(165deg, ${sage.bg1}, ${sage.bg2} 52%, ${sage.bg3})`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        <Band y={170} amp={36} color={sage.wave} ph={0.0} k={1} />
        <Band y={120} amp={26} color={sage.waveDark} ph={1.6} k={2} />
        <Band y={965} amp={40} color={sage.wave} ph={0.7} k={3} />
        <Band y={1015} amp={26} color={sage.waveDark} ph={2.4} k={4} />
      </svg>
    </div>
  );
};

// Pixel-art mascot: a coral water-droplet creature with eyes. Reads as a
// clear CHARACTER at any size (the reference's mascot is a recognizable
// sprite, not an abstract glyph). On-theme for tdoc/Hydrate; coral palette
// echoes the reference without cloning Claude's robot.
//   .  transparent   X  coral body   o  white eye   #  dark pupil
export const Mascot: React.FC<{ size?: number; float?: boolean }> = ({
  size = 11,
  float = true,
}) => {
  const frame = useCurrentFrame();
  const y = float ? Math.sin(frame / 22) * 5 : 0;
  const grid = [
    "....X....",
    "...XXX...",
    "..XXXXX..",
    ".XXXXXXX.",
    "XXXXXXXXX",
    "XoXXXXXoX",
    "X#XXXXX#X",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..XXXXX..",
  ];
  const fill = (c: string) =>
    c === "X" ? "#e07856" : c === "o" ? "#ffffff" : c === "#" ? "#2a1a14" : "transparent";
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
        row.split("").map((c, i) => (
          <div
            key={`${r}-${i}`}
            style={{ width: size, height: size, background: fill(c) }}
          />
        ))
      )}
    </div>
  );
};

// The first-tree pixel PET — an evergreen-tree creature with a face, in the
// same chunky pixel style as the Claude Code pet. It floats gently, blinks
// on a natural cadence, and gives a brief happy squint every few seconds.
// Replaces the old coral droplet mascot everywhere. `color` lets it sit on
// the sage terminal bg (coral) or the dark outro (white).
//   T = tree body · t = trunk · o = eye white · # = pupil · ^ = blink line
//   v = smile · . = transparent
export const FirstTreeLogo: React.FC<{
  size?: number;
  color?: string;
  float?: boolean;
}> = ({ size = 9, color = "#e07856", float = true }) => {
  const frame = useCurrentFrame();
  const y = float ? Math.sin(frame / 22) * 5 : 0;
  // Blink: a quick 2-frame eye-close roughly every ~70 frames, with a
  // longer happy squint that lands on a slower cadence.
  const cyc = frame % 72;
  const blink = cyc < 3;
  const squint = frame % 168 < 10 && frame % 168 >= 3;
  const eyeRows = blink
    ? ["TT^TTT^TT", "TTTTTTTTT"]
    : squint
    ? ["TT^TTT^TT", "TToTTToTT"]
    : ["TToTTToTT", "TT#TTT#TT"];
  const grid = [
    "....T....",
    "...TTT...",
    "..TTTTT..",
    ".TTTTTTT.",
    "..TTTTT..",
    ".TTTTTTT.",
    "TTTTTTTTT",
    eyeRows[0],
    eyeRows[1],
    "TTTvvvTTT",
    "TTTTTTTTT",
    "....t....",
    "...ttt...",
  ];
  const fill = (c: string) => {
    if (c === "T") return color;
    if (c === "t") return "#7a5240"; // trunk
    if (c === "o") return "#ffffff"; // eye white
    if (c === "#") return "#22140e"; // pupil
    if (c === "^") return "#22140e"; // closed-eye line
    if (c === "v") return "#22140e"; // smile
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
        row.split("").map((c, i) => (
          <div
            key={`${r}-${i}`}
            style={{ width: size, height: size, background: fill(c) }}
          />
        ))
      )}
    </div>
  );
};

// macOS window. Fixed width = WIN_W so the sage margin is consistent.
export const MacWindow: React.FC<{
  title: string;
  children: React.ReactNode;
  minHeight?: number;
  width?: number;
}> = ({ title, children, minHeight, width = WIN_W }) => (
  <div
    style={{
      width,
      minHeight,
      background: tw.bg,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 36px 90px rgba(40,70,50,0.30)",
    }}
  >
    <div
      style={{
        height: 40,
        background: tw.chrome,
        display: "flex",
        alignItems: "center",
        paddingLeft: 16,
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
          color: tw.dim,
          fontSize: 14,
          fontFamily: tw.mono,
        }}
      >
        {title}
      </div>
    </div>
    <div style={{ padding: "26px 30px" }}>{children}</div>
  </div>
);

// Block reveal — a whole line/element fades + rises as ONE unit. Fast and
// calm (no per-character typing, per the reference's motion language).
export const Block: React.FC<{
  at: number;
  children: React.ReactNode;
  y?: number;
  style?: React.CSSProperties;
}> = ({ at, children, y = 14, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)`, ...style }}>
      {children}
    </div>
  );
};

// Spring pop for status chips / badges only.
export const Pop: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 160 } });
  return (
    <div style={{ transform: `scale(${s})`, transformOrigin: "left center", ...style }}>
      {children}
    </div>
  );
};

// Static blinking caret (no typing) — used only on the active prompt line.
export const Caret: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <span style={{ color: tw.orange, opacity: Math.floor(frame / 14) % 2 === 0 ? 1 : 0.2 }}>
      ▋
    </span>
  );
};
