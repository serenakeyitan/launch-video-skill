# launch-video-skill

A Claude skill for generating **product launch / demo videos** as code
(Remotion → MP4). It ships a **reusable scene library** and an
**arc-design-first workflow** — not a one-shape template.

Different products tell different stories. A CLI tool's story lives in a
terminal; a SaaS app's in a browser; a mobile app's on a phone; a library's
in an editor. This skill gives you composable scenes and a workflow that
makes you **design the arc for the specific product first**, then assemble
it.

## Install

Paste this into Claude Code or Codex:

```
Install launch-video-skill by following https://github.com/serenakeyitan/launch-video-skill/blob/v0.1.0/ONBOARDING.md
```

That's it — the agent clones the skill, installs deps, and reads the
workflow. Then just ask: *"make a launch video for &lt;your product&gt;"*.

(Pin to the latest release tag — see
[Releases](https://github.com/serenakeyitan/launch-video-skill/releases).
Want to track unreleased changes instead? Swap `v0.1.0` for `main`.)

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
