import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { palette, ease } from "../lib/theme";

// ── Outro / logo card ──────────────────────────────────────────────────────
// Two flavors, both optional — a launch video does not require an outro,
// but a calm sign-off + wordmark card is a strong default.
//   <Outro headline subhead />   dark headline card
//   <LogoCard logo word url />   spinning logo → wordmark
// Provide `logo` as any React node (an <svg/>, <Img/>, PixelPet, etc.).

export const Outro: React.FC<{
  headline: string;
  subhead?: string;
  bg?: string;
}> = ({ headline, subhead, bg = "#0e0e0e" }) => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 12, 0, 1);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        opacity: o,
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: palette.serif, fontSize: 52, color: "#fff", lineHeight: 1.3 }}>
        {headline}
      </div>
      {subhead ? (
        <div style={{ fontFamily: palette.serif, fontSize: 28, color: "#9a9a9a", marginTop: 16 }}>
          {subhead}
        </div>
      ) : null}
    </div>
  );
};

export const LogoCard: React.FC<{
  logo: React.ReactNode;
  word: string;
  url?: string;
  bg?: string;
}> = ({ logo, word, url, bg = "#000" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spin = spring({ frame: f, fps, config: { damping: 18, stiffness: 90 } });
  const rot = (1 - spin) * 300;
  const wordIn = ease(f, 30, 46, 0, 1);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ transform: `rotate(${rot}deg)`, lineHeight: 0 }}>{logo}</div>
        <div
          style={{
            fontFamily: palette.serif,
            fontSize: 58,
            color: "#fff",
            opacity: wordIn,
            letterSpacing: "-1px",
          }}
        >
          {word}
        </div>
      </div>
      {url ? (
        <div
          style={{
            fontFamily: palette.mono,
            fontSize: 18,
            color: "#5a5a5a",
            marginTop: 28,
            opacity: ease(f, 52, 66, 0, 1),
          }}
        >
          {url}
        </div>
      ) : null}
    </div>
  );
};
