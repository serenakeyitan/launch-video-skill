# launch-video-skill

A Claude skill for generating **product launch / demo videos** as code
(Remotion → MP4). It ships a **reusable scene library** and an
**arc-design-first workflow** — not a one-shape template.

Different products tell different stories. A CLI tool's story lives in a
terminal; a SaaS app's in a browser; a mobile app's on a phone; a library's
in an editor. This skill gives you composable scenes and a workflow that
makes you **design the arc for the specific product first**, then assemble
it.

## What's inside

```
SKILL.md              the workflow + rules (read this first)
src/
  scenes/             Terminal · BrowserWindow · MobileFrame · CodeEditor · Outro
  lib/                WaveBackground · Cursor · PixelPet · Caption · theme
  index.ts            barrel export
scripts/
  make-sfx.sh         synthesize typing/click SFX (ffmpeg, no committed binaries)
  verify.sh           grab QA stills + print audio windows
examples/
  tdoc/               canonical worked example (terminal → browser → outro)
```

## Quick start

```bash
npm install
# design the arc with the user FIRST (see SKILL.md), then build a project,
# then:
bash scripts/make-sfx.sh examples/tdoc/public
npm run render:tdoc
```

## Philosophy

- **Story, not feature tour.** 5–9 beats, one "aha" moment.
- **Real screenshots > mockups.** Recreate UI only when it must animate.
- **Sharp pacing.** Cut static holds; snap transitions; SFX on the press
  frame.
- **Verify pixels, not vibes.** Frame-grab and measure before hand-off.

See `SKILL.md` for the full workflow and the hard-won pacing/audio/QA rules.

The `examples/tdoc` video demonstrates the library end-to-end — read it for
patterns, but build each new product's own arc.

MIT.
