# Example: tdoc launch video

The canonical worked example (≈39s, 24fps). tdoc is a Claude skill for
prompt-native HTML docs with Google-Docs-style commenting. The video's arc:

0. **Intro card** (2.5s) — the brand card (tree `PixelPet` + serif `/tdoc`
   + "Google Doc, but designed for agents.") opens the video.
1. **AskFlow** — engineer types a `/tdoc …` prompt (the leading
   slash-command auto-highlights bold) in a terminal; the agent runs tools,
   returns a Cloudflare link; cursor clicks it and the doc snaps open
   (Terminal → BrowserWindow, one continuous beat).
2. **Comment** — cursor selects the artifact, types a comment, clicks the
   Comment button (BrowserWindow + Cursor + popup).
3. **Share** — teammates' comments stack in the doc gutter.
4. **Fix** — engineer asks the agent to address all comments; it ships v2;
   cursor clicks the v2 link (Terminal + Cursor).
5. **V2** — the doc reflects every change (green ring + streak counter,
   blue progress fully recolored), each comment resolved.
6. **Outro card** (3.75s) — the same brand card closes the video. (The old
   spinning `LogoCard` end-card was removed; the bookend card is reused as
   both the opening and closing frame.)

It demonstrates: the continuous type→click→open beat, sharp scene
transitions, the `PixelPet` (eyes bob, no eye-whites), a typed-prompt
slash-command highlight, an intro/outro brand-card bookend, typing/click
SFX scoped to actual typing/clicks, an in-doc comment UI recreated 1:1,
the composite-artifact overlay behaviour, and the pixel-verification loop.

This example keeps its own local `theme.ts`/`components.tsx` (frozen) so it
never breaks if the shared library evolves. **Read it for patterns; do not
clone its story** — design each product's own arc (see ../../SKILL.md).

## Render

SFX are **not committed** (generated artifacts) — generate them first, then
render. From the repo root:

```bash
# 1. generate SFX into this example's public/ (required — not committed)
bash scripts/make-sfx.sh examples/tdoc/public
# 2. render (npm script already includes the --public-dir flag)
npm run render:tdoc
# …equivalent to:
npx remotion render examples/tdoc/src/index.ts TdocDemo \
  out/tdoc-demo.mp4 --public-dir=examples/tdoc/public
```

`npm run render:tdoc` is also the **install smoke-test** — if it produces an
mp4 with audio, the skill works end-to-end.
