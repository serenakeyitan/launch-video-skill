---
name: launch-video
description: Generate a polished product launch / demo video with Remotion. Use when the user wants a marketing or launch video for a product (CLI tool, web app, mobile app, library, agent, etc.). Produces a rendered MP4 from a reusable scene library, with synced typing/click SFX.
---

# launch-video

Generate a product launch video as code (Remotion → MP4). This skill is a
**scene library + a workflow**, not a fixed template. Different products
tell different stories — a CLI tool's story happens in a terminal, a SaaS
app's in a browser, a mobile app's on a phone, a library's in an editor.
**You design the arc for THIS product first**, then assemble it from the
scene palette. Do not force a product into the tdoc example's shape.

## The non-negotiable rule

**Design the story arc before touching code.** Ask: what does this product
*do*, who is the user, what is the single "aha" moment? Write a beat list
(5–9 beats, each with a duration in frames @24fps) and confirm it with the
user. Only then assemble scenes. A launch video is a story, not a feature
tour.

## Workflow

1. **Understand the product.** What is it? Where does the user interact
   with it (terminal / browser / phone / editor / mixed)? What is the
   before→after? What is the one moment that makes someone want it?
2. **Write the beat list.** Each beat: name, what's on screen, duration in
   frames. Total ≈ 30–45s (720–1080 frames). Confirm with the user via
   AskUserQuestion before building.
3. **Pick scenes from the palette** (below) per beat. Most videos use 1–3
   scene types + an optional outro. Not every type is needed.
4. **Gather assets.** Real screenshots > mockups. Put them in
   `<project>/public/`. Recreate UI as crisp components only when a
   screenshot would be low-res or when you need it animated 1:1.
5. **Scaffold a project** under the repo (copy `examples/tdoc` as a
   starting skeleton — its structure, not its content) or a sibling dir.
   Wire a single `<Composition>` whose duration is the sum of beat
   durations, with one `<Sequence>` per beat.
6. **Build beats**, then **add SFX** (`scripts/make-sfx.sh <public>`),
   then **render**, then **verify every changed beat visually**, iterate.
7. **Hand off** the MP4 only after the verification loop passes.

## Scene palette (`src/`)

Import from the library; assemble only what the story needs.

| Scene | Use it for | Key props |
|---|---|---|
| `Terminal` | CLI tools, agents, dev tools — story in a shell | `lines` (typed prompt, tool calls, results, alert, url), `spinner`, `title` |
| `BrowserWindow` | web apps, docs, dashboards, SaaS | screenshot/HTML as children, `chrome="bar"\|"none"` |
| `MobileFrame` | mobile apps | phone shell; screenshot/UI as children |
| `CodeEditor` | libraries, SDKs — "write this → get that" | `code` lines, typed reveal |
| `Outro` / `LogoCard` | sign-off (optional) | headline/subhead, or spinning logo + wordmark |
| `WaveBackground` | calm branded backdrop behind any window | colors |
| `Cursor` | click an artifact/link/button | from/to coords, `clickAt` |
| `PixelPet` | a friendly mascot above a window | `crown`/`base` pixel rows, `color` |
| `Caption` | one-line kicker under a window | `at`, `text` |

These are independent. A library launch might be just `CodeEditor` +
`Terminal` + `LogoCard`. A SaaS launch might be `BrowserWindow` + `Outro`.

## Pacing & transition rules (learned the hard way)

- **@24fps.** Beat durations in frames. Keep total tight: cut static
  holds, not the action. If a beat is mostly a frozen frame, shorten it.
- **Sharp transitions.** Scene-to-scene cross-dissolves ≤ 5 frames; beat
  fade-ins ≈ 4 frames. A window "snapping" open (scale 0.35→1 over ~12
  frames) reads better than a slow 30+ frame scale.
- **One continuous beat where possible.** Merge "type → click → result"
  into a single Sequence so there is no flash/cut mid-action.
- **Cursor must travel and press.** Don't teleport; animate to the target,
  scale-down on click. Every click gets a click SFX on the press frame.
- **No double chrome.** If a screenshot already has a header, use
  `chrome="none"`. Don't stack a window bar on top of a baked one.

## Audio rules

- Run `scripts/make-sfx.sh <project>/public` to synthesize
  `sfx-typing.mp3` + `sfx-click.mp3`. These are git-ignored generated
  artifacts — always (re)generate them; never rely on them being present
  after a fresh clone.
- Typing SFX plays **only while a human is typing** (a prompt, a comment).
  Never over auto-streamed/agent output.
- Click SFX fires **on the press frame** of each cursor click (link,
  button, artifact). Match the `<Sequence from>` to the click frame.
- Layer audio with `<Audio src={staticFile(...)} volume={0.3}>` inside
  short `<Sequence>`s scoped to the exact frame windows.

## Verification loop (mandatory before hand-off)

The image-proxy that reads PNGs is OCR-noisy — **trust pixel measurements
(Python/PIL/numpy), not text descriptions**, for alignment/color.

1. `scripts/verify.sh <entry> <CompId> <public-dir> <frame> ...` grabs
   stills + prints audio windows. Pass the project's `public/` as
   `<public-dir>` (or `-` if it has none) — same `--public-dir` rule as
   render; stills 404 their assets otherwise.
2. Read each still. For every changed beat, confirm: content correct,
   nothing clipped by `overflow:hidden`, transitions land, cursor on
   target, SFX windows align with the visible click/typing frames.
3. Fix → re-render → re-verify. Do not report "done" from intent; verify
   the actual frames.

## Render

```bash
npx remotion render <entry> <CompId> out/<name>.mp4 \
  --public-dir=<project>/public
# still:  npx remotion still <entry> <CompId> out/x.png --frame=N \
#           --public-dir=<project>/public
```

`<entry>` is the project's `src/index.ts` (calls `registerRoot`).
**Always pass `--public-dir`** when the entry is in a subdir — otherwise
`staticFile()` resolves against the repo-root `public/` and assets 404.

## Reference example

`examples/tdoc/` is the canonical worked example: an engineer asks an
agent (Terminal) to build a doc, gets a link, the doc opens
(BrowserWindow), teammates comment, the agent ships v2, LogoCard outro —
with typing/click SFX and a PixelPet. **Read it to see the library in
use; do not clone its story.** Build the new product's own arc.
