import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Img,
  Audio,
  staticFile,
} from "remotion";
import { SageBackground, FirstTreeLogo, SERIF } from "./components";
import { tw } from "./theme";
import { ClaudeTerminal, Line } from "./ClaudeTerminal";

// ─────────────────────────────────────────────────────────────────────────
// THE SCRIPT (engineer story arc — the user's exact narrative):
//   1 ask      — engineer asks Claude for a tech spec
//   2 build    — Claude Code builds it with the tdoc skill
//   3 link+CLICK — Claude returns the Cloudflare link; cursor clicks it and
//                  the doc UI pops up out of the link (signature transition)
//   4 open     — the real published doc opens
//   5 comment  — engineer reads & comments (conway-style comment card)
//   6 share    — a colleague's comment appears
//   7 fix      — engineer asks Claude to fix from feedback; Claude replies ✓
//   8 v2       — engineer opens the updated link, everything fixed
//   9 outro + logo
//
// Real terminal footage is kept SMALL (low-res source). Real hydrate doc;
// comment styling references conway-life/v/2 (the tdoc light card).
// Reference video only informs visual style/pacing (sage, calm, serif).
// @24fps.
// ─────────────────────────────────────────────────────────────────────────

const D = {
  // One continuous beat: type session → cursor clicks link → doc opens →
  // holds. No internal cuts (kills the flash + the tab-bar swap).
  askflow: 224, // ~9.3s  (session types → cursor clicks → doc opens, short hold)
  comment: 150, // ~6.3s  (select → type → click Comment button → card lands)
  share: 106,   // ~4.4s  ("you" comment, then 2 teammates chime in)
  fix: 162,     // ~6.8s  (pull 3 comments → write v2 → ship)
  v2: 150,      // ~6.3s  (green ring + all 3 comments resolved)
  outro: 90,    // ~3.75s  (final card — 1s longer per request)
};
// 2.5s @ 24fps — the Outro card is reused as the opening frame (1s longer).
export const INTRO = 60;
export const TOTAL =
  Object.values(D).reduce((s, n) => s + n, 0) + INTRO;

const ease = (f: number, a: number, b: number, x: number, y: number) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ── window chrome ─────────────────────────────────────────────────────────
const Win: React.FC<{
  title: string;
  w: number;
  h: number;
  children: React.ReactNode;
}> = ({ title, w, h, children }) => (
  <div
    style={{
      width: w,
      height: h,
      background: tw.bg,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 28px 70px rgba(40,70,55,0.26)",
    }}
  >
    <div
      style={{
        height: 34,
        background: tw.chrome,
        display: "flex",
        alignItems: "center",
        paddingLeft: 13,
        gap: 7,
        position: "relative",
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          textAlign: "center",
          color: tw.faint,
          fontSize: 12,
          fontFamily: tw.mono,
        }}
      >
        {title}
      </div>
    </div>
    <div style={{ width: w, height: h - 34, background: tw.bg }}>{children}</div>
  </div>
);

const Caption: React.FC<{ at: number; text: string }> = ({ at, text }) => (
  <div
    style={{
      position: "absolute",
      top: "calc(100% + 26px)",
      left: "50%",
      transform: "translateX(-50%)",
      whiteSpace: "nowrap",
      opacity: 0,
      animation: "none",
    }}
  >
    <FadeIn at={at}>
      <span style={{ fontFamily: tw.mono, fontSize: 18, color: "#2b3a30", opacity: 0.72 }}>
        {text}
      </span>
    </FadeIn>
  </div>
);

const FadeIn: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  children,
  style,
}) => {
  const f = useCurrentFrame();
  const t = ease(f, at, at + 10, 0, 1);
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * 12}px)`, ...style }}>
      {children}
    </div>
  );
};

// Centered wrapper for the scripted terminal (mascot above, caption below).
const TermStage: React.FC<{
  mascot?: boolean;
  caption?: React.ReactNode;
  children: React.ReactNode;
}> = ({ mascot, caption, children }) => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 4, 0, 1);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", display: "flex", opacity: o }}>
        {mascot ? (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 24px)",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <FirstTreeLogo size={8} color="#2f7d4f" />
          </div>
        ) : null}
        {children}
        {caption}
      </div>
    </AbsoluteFill>
  );
};

const CenteredWindow: React.FC<{
  title: string;
  w: number;
  h: number;
  mascot?: boolean;
  caption?: React.ReactNode;
  children: React.ReactNode;
  scale?: number;
}> = ({ title, w, h, mascot, caption, children, scale = 1 }) => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 9, 0, 1);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", display: "flex", opacity: o, transform: `scale(${scale})` }}>
        {mascot ? (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 24px)",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <FirstTreeLogo size={8} color="#2f7d4f" />
          </div>
        ) : null}
        <Win title={title} w={w} h={h}>
          {children}
        </Win>
        {caption}
      </div>
    </AbsoluteFill>
  );
};

const TITLE = "Hydrate — Product Spec";
const TW = 1180;
const TH = 560; // fits the streamed content tightly — no dead space below

// ── The publish session — ONE canonical line list ─────────────────────────
// Ask reveals these with the given `at` times; ClickLink renders the SAME
// list with every at:0 (already settled). Identical content + order + blank
// lines → identical layout, so the Ask→ClickLink cut is invisible.
const SESSION_AT = [
  { k: "prompt", at: 6, typed: true, text: "/tdoc design a water drinking app and write a spec, deploy to cloudflare" },
  { k: "blank", at: 60 },
  { k: "bullet", at: 64, text: "I'll use the tdoc skill to create and deploy the spec." },
  { k: "tool", at: 76, name: "Skill", args: "tdoc" },
  { k: "result", at: 84, text: "Successfully loaded skill · 5 tools allowed" },
  { k: "tool", at: 94, name: "Write", args: "tdocs/hydrate-app-spec/v1/index.html" },
  { k: "result", at: 108, text: "Wrote 221 lines · interactive ring, problem, features" },
  { k: "tool", at: 118, name: "Bash", args: "tdoc-publish hydrate-app-spec" },
  { k: "tdoc", at: 128, text: "[tdoc] v1 uploaded (10166 bytes)" },
  { k: "blank", at: 134 },
  { k: "url", at: 138, label: "Published:", url: "https://tdoc.serenatan.workers.dev/d/hydrate-app-spec/v/1" },
] as Line[];
// Same list, all instantly visible (for the seamless ClickLink continuation).
const SESSION_DONE = SESSION_AT.map((l) => ({ ...l, at: 0, typed: false })) as Line[];

// ── 1+3. ASK → CLICK → OPEN (ONE continuous beat, zero cuts) ──────────────
// Single component / single Sequence so there is NO flash between "Published"
// and the cursor click, and NO second frame swap when the doc opens. The
// terminal session types in, settles, the cursor glides to the link and
// presses, then the doc scales out of that point and stays.

// Shared real-doc window — STATIC. The doc screenshot ALREADY has the tdoc
// app's own header bar (breadcrumb · Copy/Fork/Share). We do NOT add another
// macOS chrome on top — that produced the doubled tab bar. Just frame the
// image with rounded corners + shadow. Used IDENTICALLY by every doc beat
// (ClickLink pop-out, Open, Comment, Share, V2) so there's never a refresh
// jump between them. The image is cropped to DOC_H; comment popups render
// OUTSIDE this clip so they're never cut off.
const DOC_W = 1180;
const DOC_H = 740;
const DocWindow: React.FC<{ version?: string; children?: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      width: DOC_W,
      height: DOC_H,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 28px 70px rgba(40,70,55,0.26)",
      background: "#fff",
      position: "relative",
    }}
  >
    <Img src={staticFile("hydrate.png")} style={{ width: DOC_W, display: "block" }} />
    {/* Override the baked "Hydrate" page heading → "Hydrate — Product Spec".
        White cover over the original glyph (x≈282 y≈100, ~115px wide) then
        the full title re-drawn in the same bold/size/colour. */}
    <div
      style={{
        position: "absolute",
        left: 282,
        top: 98,
        height: 46,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        paddingRight: 24,
      }}
    >
      <span
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          fontSize: 38,
          fontWeight: 800,
          color: "#121212",
          letterSpacing: "-0.5px",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        Hydrate — Product Spec
      </span>
    </div>
    {children}
  </div>
);

// Phase map (local frames):
//   0–150   session types in (prompt → skill → write → publish link)
//   150–168 hold on the finished session
//   168–198 cursor glides from lower-right to the "Published:" link
//   198–206 cursor press (small scale)
//   202–244 doc scales up out of the click point, terminal fades under it
//   244+    doc fully open, holds (the "Open" beat — same DocWindow)
const AskFlow: React.FC = () => {
  const f = useCurrentFrame();
  // "Published:" row Y inside the TH=560 terminal content (after chrome 38 +
  // pad 20 + 10 streamed lines @ ~31px ≈ 300).
  const linkRowY = 300;
  const winLeft = 960 - TW / 2;
  const winTop = 540 - TH / 2;
  const cursorStart = 142;
  const clickAt = 168;
  const cx = ease(f, cursorStart, clickAt, TW - 200, 210);
  const cy = ease(f, cursorStart, clickAt, TH - 60, linkRowY + 12);
  const showCursor = f < 180;
  // Sharp swap: doc snaps open right on the click (12f, not 34f).
  const docScale = ease(f, 170, 182, 0.35, 1);
  const docO = ease(f, 170, 178, 0, 1);
  const termDim = ease(f, 170, 178, 1, 0);
  const originX = winLeft + 240;
  const originY = winTop + 38 + linkRowY + 12;
  const docOpen = f >= 170;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* mascot above the terminal, fades out as the doc opens */}
      <div
        style={{
          position: "absolute",
          opacity: termDim,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 20px)",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <FirstTreeLogo size={8} color="#2f7d4f" />
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 30,
                color: "#2b3a30",
                letterSpacing: "-0.5px",
              }}
            >
              use <span style={{ fontWeight: 700 }}>/tdoc</span> skill
            </span>
          </div>
          <ClaudeTerminal
            title={TITLE}
            w={TW}
            h={TH}
            lines={SESSION_AT}
            spinner={{ from: 64, to: 126, verb: "Building", meta: "8s · ↑ 2.4k tokens" }}
          />
          {/* cursor glides to the link and presses (no ring/ripple) */}
          {showCursor && f >= cursorStart ? (
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              style={{
                position: "absolute",
                left: cx,
                top: 38 + cy,
                filter: "drop-shadow(0 3px 5px rgba(0,0,0,.55))",
                transform: f >= clickAt && f < 180 ? "scale(0.82)" : "scale(1)",
              }}
            >
              <path d="M3 2 L3 20 L8 15 L11 22 L14 21 L11 14 L18 14 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
            </svg>
          ) : null}
        </div>
      </div>
      {/* doc scales out of the click point, then holds open */}
      {docOpen ? (
        <div
          style={{
            position: "absolute",
            opacity: docO,
            transform: `translate(${(originX - 960) * (1 - docScale)}px, ${
              (originY - 540) * (1 - docScale)
            }px) scale(${docScale})`,
          }}
        >
          <DocWindow />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// 1:1 with the real overlay.js .tdoc-margin-comment card:
//   #fff bg · 1px #e5e5e5 border · 10px radius · 12px pad ·
//   box-shadow 0 2px 8px rgba(0,0,0,.05) · 280px wide.
//   author = 24px round avatar + 13/600 #111 login.
//   .text #111 1.45 lh. .meta 11px #888 with Reply (#1652f0) + time.
//   active state: border #1652f0 + box-shadow 0 4px 16px rgba(22,82,240,.18)
const Card: React.FC<{
  who: string;
  avatar: string;
  body: string;
  time?: string;
  active?: boolean;
  reply?: string;
  replyAt?: number;
}> = ({ who, avatar, body, time = "just now", active, reply, replyAt = 0 }) => (
  <div
    style={{
      width: "100%",
      boxSizing: "border-box",
      background: "#fff",
      border: `1px solid ${active ? "#1652f0" : "#e5e5e5"}`,
      borderRadius: 10,
      padding: 12,
      font: "13px system-ui, sans-serif",
      boxShadow: active
        ? "0 4px 16px rgba(22,82,240,0.18)"
        : "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: avatar,
          flexShrink: 0,
        }}
      />
      <span style={{ fontWeight: 600, color: "#111", fontSize: 13 }}>{who}</span>
    </div>
    <div style={{ color: "#111", lineHeight: 1.45, wordWrap: "break-word" }}>{body}</div>
    {reply ? (
      <FadeIn at={replyAt}>
        <div
          style={{
            marginTop: 9,
            paddingLeft: 9,
            borderLeft: "3px solid #111",
            background: "#fafafb",
            borderRadius: 4,
            padding: "8px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 17,
                height: 17,
                borderRadius: "50%",
                background: "#111",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
              }}
            >
              ⚡
            </div>
            <div style={{ fontWeight: 600, fontSize: 11, color: "#1a1a1a" }}>tdoc-agent</div>
            <span
              style={{
                marginLeft: 4,
                background: "#e8f5ed",
                color: "#1a7340",
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 8px",
                borderRadius: 999,
              }}
            >
              ✓ applied
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#111", marginTop: 6, lineHeight: 1.45 }}>{reply}</div>
        </div>
      </FadeIn>
    ) : null}
    <div
      style={{
        fontSize: 11,
        color: "#888",
        marginTop: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span>{time}</span>
      <span style={{ color: "#1652f0", cursor: "pointer" }}>Reply</span>
    </div>
  </div>
);

// 1:1 with the real overlay.js .tdoc-popup (dark new-comment popup):
//   #0a0a0a bg · #fff text · 10px radius · 14px pad · 320px ·
//   box-shadow 0 12px 40px rgba(0,0,0,.4).
//   head: ".h" #aaa selected-text preview + "×" #888.
//   textarea: transparent, 1px #1652f0 border, 6px radius, white text.
//   foot: ".hint" #888 11px  + ".submit" #1652f0 button.
const CommentPopup: React.FC<{
  preview: string;
  typed: string;
  typeAt: number;
}> = ({ preview, typed, typeAt }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor(((f - typeAt) / 24) * 26));
  const shown = typed.slice(0, n);
  const caretOn = n < typed.length && Math.floor(f / 12) % 2 === 0;
  return (
    <div
      style={{
        width: 320,
        background: "#0a0a0a",
        color: "#fff",
        borderRadius: 10,
        padding: 14,
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        font: "13px system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
          gap: 10,
        }}
      >
        <span style={{ color: "#aaa", fontSize: 12, lineHeight: 1.4 }}>
          “{preview}”
        </span>
        <span style={{ color: "#888", cursor: "pointer", flexShrink: 0 }}>×</span>
      </div>
      <div
        style={{
          minHeight: 64,
          border: "1px solid #1652f0",
          borderRadius: 6,
          padding: 8,
          color: shown ? "#fff" : "#666",
          lineHeight: 1.4,
        }}
      >
        {shown || "What should change?"}
        {caretOn ? <span style={{ color: "#1652f0" }}>▋</span> : null}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <span style={{ color: "#888", fontSize: 11 }}>⌘+Enter to submit</span>
        <span
          style={{
            background: "#1652f0",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: 6,
            fontWeight: 500,
          }}
        >
          Comment
        </span>
      </div>
    </div>
  );
};

// ── 4. OPEN — just the doc, centered. No extra macOS tab bar. ─────────────
const Open: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", opacity: ease(f, 0, 4, 0, 1) }}>
        <DocWindow />
        <Caption at={56} text="one link · opens instantly, no install" />
      </div>
    </AbsoluteFill>
  );
};

// ── 5. COMMENT — the real interaction, 1:1 ────────────────────────────────
// Beat timeline (local frames):
//   0–22   text selection sweeps in (the anchored line turns #fff7d0)
//   22–34  dark .tdoc-popup appears just below the selection
//   34–96  the comment is typed into the popup
//   96–112 popup closes; the comment Card slides in on the right and the
//          anchored text locks to the active highlight (#ffd84d + inset)
//
// The doc image's "The problem" paragraph sits ~y 470 in the 1180-wide
// shot; we overlay a precise selection rect + anchor highlight there.
// Selection rect over the ACTUAL body sentence "Most people are mildly,
// chronically dehydrated…" — pixel-located in hydrate.png (2560w) then
// scaled to the 1180-wide display. Lands exactly on the text, not the
// widget/buttons above it.
// ── Canonical story: ONE simple comment, with a REAL visible change ───────
// The user selects the water-ring artifact and asks for it to be green;
// Claude applies it; v2 shows the ring actually green. Same wording in
// every beat — no drift.
const COMMENT_BODY = "can you make the progress ring green?";
const COMMENT_REPLY = "Recolored the ring to green. Shipped in v2.";
const COMMENT_AUTHOR = "you";
const COMMENT_AVATAR = "#6fa8e0";

// The water-ring artifact PANEL in hydrate.png — re-measured precisely by
// its distinct bg colour (245,249,252) vs page white: native x610-1949
// y464-1140 → display x281 y214 w617 h312 (scale 0.46094).
const ART = { x: 281, y: 214, w: 617, h: 312 };
const SEL = ART; // legacy alias
// Cards live in the DOC's own right gutter (real tdoc puts margin comments
// inside the page, not floating outside the window). The doc window is
// DOC_W=1180 wide; the card fills GUTTER_W (width:100%) so its right border
// stays fully inside the window with a ~36px right margin (898+246=1144).
const GUTTER_X = 838;
const GUTTER_W = 250;
// Phases: cursor glides onto the artifact (0–34) → clicks to select it,
// the FULL panel outline appears (34) → dark popup opens below it (40) →
// comment is typed (52–100) → popup closes, card lands in the gutter (108).
const Comment: React.FC = () => {
  const f = useCurrentFrame();
  // cursor travels from lower-right to the artifact centre, clicks at 34
  const artCx = ART.x + ART.w / 2;
  const artCy = ART.y + ART.h / 2;
  const selected = f >= 34; // full-artifact outline shows after the click
  // Comment button centre inside the popup: popup at (ART.x, ART.y+ART.h+14),
  // 320 wide, the blue "Comment" pill sits bottom-right.
  const btnX = ART.x + 320 - 14 - 38;
  const btnY = ART.y + ART.h + 14 + 150;
  // Cursor path: glide to artifact (2→34) → click → hold while the comment
  // types (done ~88) → travel to the Comment button (90→104) → click (104).
  const cuX =
    f < 90 ? ease(f, 2, 34, DOC_W - 120, artCx) : ease(f, 90, 104, artCx, btnX);
  const cuY =
    f < 90 ? ease(f, 2, 34, DOC_H - 80, artCy) : ease(f, 90, 104, artCy, btnY);
  const artPress = f >= 34 && f < 42;
  const btnPress = f >= 104 && f < 112;
  const showCursor = f < 116;
  const popupIn = ease(f, 42, 52, 0, 1);
  const popupOut = ease(f, 108, 118, 1, 0); // closes only AFTER the button click
  const cardIn = ease(f, 114, 128, 0, 1);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", opacity: ease(f, 0, 4, 0, 1) }}>
        <DocWindow>
          {/* full-artifact selection outline (covers the WHOLE panel) */}
          {selected ? (
            <div
              style={{
                position: "absolute",
                left: ART.x - 3,
                top: ART.y - 3,
                width: ART.w + 6,
                height: ART.h + 6,
                border: "2px solid #1652f0",
                borderRadius: 10,
                boxShadow: "0 0 0 4px rgba(22,82,240,0.12)",
                opacity: ease(f, 34, 42, 0, 1),
              }}
            />
          ) : null}
          {/* cursor: presses the artifact to select, then presses Comment */}
          {showCursor ? (
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              style={{
                position: "absolute",
                left: cuX,
                top: cuY,
                filter: "drop-shadow(0 3px 5px rgba(0,0,0,.45))",
                transform: artPress || btnPress ? "scale(0.82)" : "scale(1)",
                zIndex: 20,
              }}
            >
              <path d="M3 2 L3 20 L8 15 L11 22 L14 21 L11 14 L18 14 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
            </svg>
          ) : null}
          {/* saved comment card — doc right gutter, aligned to the artifact */}
          <div
            style={{
              position: "absolute",
              left: GUTTER_X,
              top: ART.y - 6,
              width: GUTTER_W,
              opacity: cardIn,
              transform: `translateX(${(1 - cardIn) * 16}px)`,
            }}
          >
            <Card who="you" avatar="#6fa8e0" active body={COMMENT_BODY} />
          </div>
        </DocWindow>
        {/* dark new-comment popup — sibling so it's never clipped */}
        {f >= 42 && f < 120 ? (
          <div
            style={{
              position: "absolute",
              left: ART.x,
              top: ART.y + ART.h + 14,
              opacity: popupIn * popupOut,
              transform: `translateY(${(1 - popupIn) * -8}px)`,
              zIndex: 10,
            }}
          >
            <CommentPopup
              preview="📊 the water progress ring"
              typed={COMMENT_BODY}
              typeAt={54}
            />
          </div>
        ) : null}
        <Caption at={124} text="select the artifact · comment, exactly like a Google Doc" />
      </div>
    </AbsoluteFill>
  );
};

// ── 6. SHARE — the comment is now anchored on the artifact ────────────────
// Same single comment, settled: artifact has the idle anchor highlight, the
// card sits in the doc's right gutter (not over any text).
const Share: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", opacity: ease(f, 0, 4, 0, 1) }}>
        <DocWindow>
          {/* the comment's anchor — a quiet blue outline on the artifact
              (NOT a yellow fill; matches the real tdoc anchor affordance) */}
          <div
            style={{
              position: "absolute",
              left: ART.x - 3,
              top: ART.y - 3,
              width: ART.w + 6,
              height: ART.h + 6,
              border: "2px solid rgba(22,82,240,0.45)",
              borderRadius: 10,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: GUTTER_X,
              top: ART.y - 6,
              width: GUTTER_W,
            }}
          >
            <Card who={COMMENT_AUTHOR} avatar={COMMENT_AVATAR} active body={COMMENT_BODY} />
            <FadeIn at={22}>
              <div style={{ marginTop: 8 }}>
                <Card
                  who="Product Manager"
                  avatar="#e0915c"
                  time="2m"
                  body="Love it. Can we show today's streak under the ring?"
                />
              </div>
            </FadeIn>
            <FadeIn at={34}>
              <div style={{ marginTop: 8 }}>
                <Card
                  who="Tech Lead"
                  avatar="#7d8fb3"
                  time="1m"
                  body="Make the ring an SVG so the fill animates cleanly."
                />
              </div>
            </FadeIn>
          </div>
        </DocWindow>
        <Caption at={70} text="teammates comment on the shared link" />
      </div>
    </AbsoluteFill>
  );
};

// ── 7. FIX — engineer asks Claude to address the comments ─────────────────
const Fix: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 4, 0, 1);
  // The v2 link is the last streamed line (appears at local f 138). After it
  // lands, the cursor glides to it and clicks (148→164) — same affordance as
  // the AskFlow link click; this is what carries us into the V2 beat.
  const linkRowY = 412; // v2: URL row Y inside the TH=560 terminal body
  const cursorStart = 148;
  const clickAt = 164;
  const cx = ease(f, cursorStart, clickAt, TW - 240, 150);
  const cy = ease(f, cursorStart, clickAt, TH - 70, linkRowY + 12);
  const showCursor = f >= cursorStart;
  const linkPress = f >= clickAt && f < clickAt + 8;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", display: "flex", opacity: o }}>
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 20px)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <FirstTreeLogo size={8} color="#2f7d4f" />
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 30,
              color: "#2b3a30",
              letterSpacing: "-0.5px",
            }}
          >
            use <span style={{ fontWeight: 700 }}>/tdoc</span> skill
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <ClaudeTerminal
            title={TITLE}
            w={TW}
            h={TH}
            lines={
              [
                { k: "prompt", at: 6, typed: true, text: "/tdoc address the comments on the hydrate spec" },
                { k: "blank", at: 44 },
                { k: "tool", at: 48, name: "Bash", args: "tdoc-pull hydrate-app-spec" },
                { k: "result", at: 58, text: "pulled 3 open comments" },
                { k: "bullet", at: 66, text: 'you — "can you make the progress ring green?"' },
                { k: "bullet", at: 74, text: 'Product Manager — "show today’s streak under the ring"' },
                { k: "bullet", at: 82, text: 'Tech Lead — "make the ring an SVG so the fill animates"' },
                { k: "tool", at: 96, name: "Write", args: "tdocs/hydrate-app-spec/v2/index.html" },
                { k: "result", at: 110, text: "green SVG ring + streak counter" },
                { k: "blank", at: 118 },
                { k: "bullet", at: 122, text: "Done. Replied on all 3 comments and shipped v2." },
                { k: "url", at: 138, label: "v2:", url: "https://tdoc.serenatan.workers.dev/d/hydrate-app-spec/v/2" },
              ] as Line[]
            }
            spinner={{ from: 96, to: 110, verb: "Revising", meta: "6s · ↑ 1.4k tokens" }}
          />
          {showCursor ? (
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              style={{
                position: "absolute",
                left: cx,
                top: 38 + cy,
                filter: "drop-shadow(0 3px 5px rgba(0,0,0,.55))",
                transform: linkPress ? "scale(0.82)" : "scale(1)",
                zIndex: 5,
              }}
            >
              <path d="M3 2 L3 20 L8 15 L11 22 L14 21 L11 14 L18 14 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
            </svg>
          ) : null}
        </div>
        <Caption at={60} text="the agent reads the comments — not you, copy-pasting" />
      </div>
    </AbsoluteFill>
  );
};

// Recolors ONLY the ring, perfectly aligned to the original. Pixel-measured
// from hydrate.png: ring center ≈ display (589, 430), track outer ≈ r70,
// dot rides r≈90 at top, panel bg = #f5f9fc. We mask the old blue ring with
// an exact-bg disc, then redraw the SAME geometry in green, and re-place the
// "0 ml" / "of 2000 ml goal" labels exactly where they were so nothing
// shifts or overlaps.
// Ring geometry in DOC-LOCAL coords, pixel-measured from hydrate.png:
//   track widest at disp y≈347, x 505→674  → centre (590, 347), radius ≈ 84
//   blue dot rides the top at disp y≈266.
// We do NOT redraw text or mask a big rectangle (that looked pasted-on).
// Instead: draw an ANNULAR mask exactly the width of the ring stroke in the
// panel-bg colour to erase the gray/blue ring, a tiny disc over the blue
// dot, then stroke a green ring at the identical radius. The "0 ml" text
// underneath is untouched and shows through the ring's hole.
const RING_CX = 590;
const RING_CY = 347;
const RING_R = 84;
const PANEL_BG = "#f5f9fc";
const GreenRing: React.FC = () => {
  const VB = (RING_R + 30) * 2; // viewBox with margin for the dot + stroke
  const c = VB / 2;
  const sw = 22; // stroke wide enough to fully cover the original track
  const C = 2 * Math.PI * RING_R;
  return (
    <svg
      width={VB}
      height={VB}
      viewBox={`0 0 ${VB} ${VB}`}
      style={{ position: "absolute", left: RING_CX - c, top: RING_CY - c }}
    >
      {/* erase the original gray/blue ring with a wide panel-bg annulus */}
      <circle cx={c} cy={c} r={RING_R} fill="none" stroke={PANEL_BG} strokeWidth={sw + 10} />
      {/* erase the blue dot + arc start at the top (generous disc) */}
      <circle cx={c} cy={c - RING_R} r={20} fill={PANEL_BG} />
      {/* the new green track */}
      <circle cx={c} cy={c} r={RING_R} fill="none" stroke="#d8ead7" strokeWidth={10} />
      {/* small green progress arc (0% state, like the original) */}
      <circle
        cx={c}
        cy={c}
        r={RING_R}
        fill="none"
        stroke="#1a7340"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * 0.94}
        transform={`rotate(-90 ${c} ${c})`}
      />
      {/* green dot riding the top, exactly where the blue one was */}
      <circle cx={c} cy={c - RING_R} r={8} fill="#1a7340" />
    </svg>
  );
};

// The PM-requested change, rendered as a real visible artifact: a streak
// counter pill INSIDE the ring, just below the "of 2000 ml goal" caption.
// The ring's external bottom sits flush against the button row (no usable
// gap there), so the streak lives in the clear space inside the ring.
// Appears at the same moment the ring goes green (both gated by V2's ringIn).
const StreakCounter: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: RING_CX - 58,
      top: RING_CY + 44,
      width: 116,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      padding: "3px 10px",
      background: "#eaf5ea",
      border: "1px solid #cfe6cf",
      borderRadius: 999,
      font: "600 11px system-ui, sans-serif",
      color: "#1a7340",
      boxSizing: "border-box",
    }}
  >
    <span style={{ fontSize: 12 }}>🔥</span>
    <span>3-day streak</span>
  </div>
);

// ── 8. V2 — the change is REAL: the ring is now green ─────────────────────
const V2: React.FC = () => {
  const f = useCurrentFrame();
  const ringIn = ease(f, 14, 30, 0, 1); // green ring fades in over the blue
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", opacity: ease(f, 0, 4, 0, 1) }}>
        <DocWindow>
          {/* the real applied changes: ring recolored to green AND a streak
              counter added beneath it — both appear together */}
          <div style={{ opacity: ringIn }}>
            <GreenRing />
            <StreakCounter />
          </div>
          {/* all 3 comments resolved, each with the agent's applied reply */}
          <div
            style={{
              position: "absolute",
              left: GUTTER_X,
              top: 40,
              width: GUTTER_W,
            }}
          >
            <FadeIn at={30}>
              <Card
                who={COMMENT_AUTHOR}
                avatar={COMMENT_AVATAR}
                body={COMMENT_BODY}
                reply={COMMENT_REPLY}
                replyAt={42}
              />
            </FadeIn>
            <FadeIn at={48}>
              <div style={{ marginTop: 8 }}>
                <Card
                  who="Product Manager"
                  avatar="#e0915c"
                  time="2m"
                  body="Love it. Can we show today's streak under the ring?"
                  reply="Added a streak counter beneath the ring. Shipped in v2."
                  replyAt={58}
                />
              </div>
            </FadeIn>
            <FadeIn at={66}>
              <div style={{ marginTop: 8 }}>
                <Card
                  who="Tech Lead"
                  avatar="#7d8fb3"
                  time="1m"
                  body="Make the ring an SVG so the fill animates cleanly."
                  reply="Rebuilt the ring as an animated SVG arc. Shipped in v2."
                  replyAt={76}
                />
              </div>
            </FadeIn>
          </div>
        </DocWindow>
        <Caption at={92} text="same link · now v2 · all 3 comments resolved" />
      </div>
    </AbsoluteFill>
  );
};

// ── 9. OUTRO + LOGO ───────────────────────────────────────────────────────
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 12, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#0e0e0e", justifyContent: "center", alignItems: "center", opacity: o }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 22,
            marginBottom: 42,
          }}
        >
          <FirstTreeLogo size={11} color="#ffffff" />
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 64,
              color: "#fff",
              letterSpacing: "-1px",
            }}
          >
            /tdoc
          </span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 52, color: "#fff", lineHeight: 1.3 }}>
          Google Doc, but designed for agents.
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: "#9a9a9a", marginTop: 16 }}>
          Comments straight into your agent.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spin = spring({ frame: f, fps, config: { damping: 18, stiffness: 90 } });
  const rot = (1 - spin) * 300;
  const word = ease(f, 30, 46, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ transform: `rotate(${rot}deg)`, lineHeight: 0 }}>
          <svg width="78" height="78" viewBox="0 0 512 512">
            <path
              fill="#e17055"
              d="M256 48c-8 0-15 4-20 10L140 186c-6 8-8 18-4 27s13 15 23 15h30l-69 100c-6 8-7 18-3 27s13 14 23 14h36l-80 107c-5 7-6 16-2 24s12 12 21 12h282c9 0 17-5 21-12s3-17-2-24l-80-107h36c10 0 18-5 23-14s3-19-3-27l-69-100h30c10 0 19-6 23-15s2-19-4-27L276 58c-5-6-12-10-20-10z"
            />
          </svg>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 58, color: "#fff", opacity: word, letterSpacing: "-1px" }}>
          tdoc
        </div>
      </div>
      <div
        style={{
          fontFamily: tw.mono,
          fontSize: 18,
          color: "#5a5a5a",
          marginTop: 28,
          opacity: ease(f, 52, 66, 0, 1),
        }}
      >
        github.com/serenakeyitan/tdoc
      </div>
    </AbsoluteFill>
  );
};

// ── choreography ──────────────────────────────────────────────────────────
export const Demo: React.FC = () => {
  let t = 0;
  const at = (n: number) => {
    const from = t;
    t += n;
    return from;
  };
  const f_introCard = at(INTRO); // 2.5s Outro card as the opening frame
  const sageStart = t; // sage bg begins after the intro card
  const sageEnd =
    D.askflow + D.comment + D.share + D.fix + D.v2;
  const f_askflow = at(D.askflow);
  const f_comment = at(D.comment);
  const f_share = at(D.share);
  const f_fix = at(D.fix);
  const f_v2 = at(D.v2);
  const f_outro = at(D.outro);
  const OUT = 5;
  return (
    <AbsoluteFill>
      <Sequence from={f_introCard} durationInFrames={INTRO}>
        <Outro />
      </Sequence>
      <Sequence from={sageStart} durationInFrames={sageEnd}>
        <SageBackground />
      </Sequence>
      <Sequence from={f_askflow} durationInFrames={D.askflow + OUT}>
        <AskFlow />
      </Sequence>
      <Sequence from={f_comment} durationInFrames={D.comment + OUT}>
        <Comment />
      </Sequence>
      <Sequence from={f_share} durationInFrames={D.share + OUT}>
        <Share />
      </Sequence>
      <Sequence from={f_fix} durationInFrames={D.fix + OUT}>
        <Fix />
      </Sequence>
      <Sequence from={f_v2} durationInFrames={D.v2 + OUT}>
        <V2 />
      </Sequence>
      <Sequence from={f_outro} durationInFrames={D.outro}>
        <Outro />
      </Sequence>

      {/* ── SFX ──────────────────────────────────────────────────────────
          Keyboard typing under the terminal sessions + a click on each
          cursor press. Volumes kept low so they sit under the visuals. */}
      {/* AskFlow: ONLY while the engineer types the prompt (local f 6→58).
          Claude's streamed bullets/tools/results after that are not typed. */}
      <Sequence from={f_askflow + 6} durationInFrames={52}>
        <Audio src={staticFile("sfx-typing.mp3")} volume={0.32} />
      </Sequence>
      {/* AskFlow: cursor clicks the published link (local f ~168) */}
      <Sequence from={f_askflow + 168} durationInFrames={8}>
        <Audio src={staticFile("sfx-click.mp3")} volume={0.55} />
      </Sequence>
      {/* Comment: cursor clicks the artifact to select it — the click lands
          exactly on the press frame (local f 34, press-scale f34→42). */}
      <Sequence from={f_comment + 34} durationInFrames={10}>
        <Audio src={staticFile("sfx-click.mp3")} volume={0.6} />
      </Sequence>
      {/* Comment: the comment body is typed into the popup (local f 54→88) */}
      <Sequence from={f_comment + 54} durationInFrames={36}>
        <Audio src={staticFile("sfx-typing.mp3")} volume={0.28} />
      </Sequence>
      {/* Comment: cursor clicks the blue "Comment" button to submit (f 104) */}
      <Sequence from={f_comment + 104} durationInFrames={10}>
        <Audio src={staticFile("sfx-click.mp3")} volume={0.6} />
      </Sequence>
      {/* Fix: ONLY while the engineer types the prompt (local f 6→34).
          The pulled comments + agent output after that are not typed. */}
      <Sequence from={f_fix + 6} durationInFrames={28}>
        <Audio src={staticFile("sfx-typing.mp3")} volume={0.32} />
      </Sequence>
      {/* Fix: cursor clicks the v2 link to open the updated doc (local f 164) */}
      <Sequence from={f_fix + 164} durationInFrames={10}>
        <Audio src={staticFile("sfx-click.mp3")} volume={0.58} />
      </Sequence>
    </AbsoluteFill>
  );
};
