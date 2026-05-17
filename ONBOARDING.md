# Onboarding launch-video-skill

> **For agents (Claude Code, Codex, etc.):** read this file end-to-end before running any command. It's written for you, not the human. Execute steps in order, and when the user asks for a video, follow the WORKFLOW section — do not skip the arc-design step.

## What you are installing

`launch-video-skill` is a skill for generating **product launch / demo videos** as code (Remotion → MP4). It is a **reusable scene library + an arc-design-first workflow**, not a one-shape template. After install the user can ask: *"make a launch video for &lt;product&gt;"* and you assemble a video from composable scenes (Terminal, BrowserWindow, MobileFrame, CodeEditor, Outro) with synced typing/click SFX.

Install takes ~1 minute (clone + `npm install`). Rendering needs `ffmpeg` for SFX (optional but recommended).

## Step 1 — Install the skill

Check whether it's already installed:

```bash
ls ~/.claude/skills/launch-video-skill/SKILL.md 2>/dev/null && echo "already installed"
```

If that prints "already installed" → skip to Step 2.

Otherwise clone it into the skills directory:

```bash
git clone https://github.com/serenakeyitan/launch-video-skill ~/.claude/skills/launch-video-skill
```

If the user already has the directory from a prior install, update instead:

```bash
cd ~/.claude/skills/launch-video-skill && git pull --ff-only origin main
```

## Step 2 — Verify install + dependencies

```bash
ls ~/.claude/skills/launch-video-skill/SKILL.md
ls ~/.claude/skills/launch-video-skill/src/scenes
node --version          # need v18+
ffmpeg -version | head -1   # needed for typing/click SFX (optional)
```

`SKILL.md` and `src/scenes/` must exist. If `ffmpeg` is missing and the user
wants sound, install it (`brew install ffmpeg` on macOS) — otherwise you can
still render a silent video.

## Step 3 — Install npm deps (once)

```bash
cd ~/.claude/skills/launch-video-skill && npm install
```

This pulls Remotion + React. Safe to re-run.

## Step 4 — Read the workflow, then design the arc

Open and follow `~/.claude/skills/launch-video-skill/SKILL.md`. The
**non-negotiable rule**: before writing any code, understand the product
and **design the story arc** (5–9 beats, each with a frame duration), then
confirm it with the user. A launch video is a story, not a feature tour.

Do **not** clone the tdoc example's story. It is a *reference for the
library*, not a template. A CLI tool's story lives in a `Terminal`; a SaaS
app's in a `BrowserWindow`; a mobile app's in a `MobileFrame`; a library's
in a `CodeEditor`. Pick only the scenes the product's story needs.

## Step 5 — Build, add sound, render, verify

1. Scaffold a project dir (a sibling, or under `examples/`) with its own
   `src/index.ts` + `Root.tsx` + composition.
2. Put real screenshots in `<project>/public/`. Recreate UI as components
   only when a screenshot would be low-res or must animate.
3. Synthesize SFX: `bash scripts/make-sfx.sh <project>/public`
4. Render with the public-dir flag so assets resolve:
   ```bash
   npx remotion render <project>/src/index.ts <CompId> \
     out/<name>.mp4 --public-dir=<project>/public
   ```
5. **Verify before hand-off**: `bash scripts/verify.sh <entry> <CompId>
   <frame> ...` grabs stills + prints audio windows. Read each still,
   confirm content/alignment/transitions/SFX, fix, re-render, re-verify.
   Trust pixel measurements over the image-proxy's text descriptions.

## Step 6 — Wrap up

Tell the user:

- Hand off the MP4 path only after the verification loop passes
- `examples/tdoc/` is the canonical worked example to read for patterns
- `git pull` in `~/.claude/skills/launch-video-skill` to get updates
- Source / issues: https://github.com/serenakeyitan/launch-video-skill

## Idempotency

Every step is safe to re-run. `npm install` and `make-sfx.sh` are
idempotent. Cloning checks for an existing dir first.

## Failure modes you might hit

| Symptom | Fix |
|---|---|
| `staticFile()` asset 404 on render | You forgot `--public-dir=<project>/public`. The entry is in a subdir; assets resolve against repo-root `public/` by default. |
| `ffmpeg: command not found` in make-sfx | Install ffmpeg, or skip SFX and render silent. |
| Render hangs / OOM on long videos | Lower beat durations; @24fps keep total ≤ ~45s (1080 frames). |
| Image-proxy describes the frame wrong | Expected — it's OCR-noisy. Use Python/PIL pixel measurements for alignment/color, not the text description. |
| `tsc` errors after editing | Run `npx tsc --noEmit` from repo root; fix before rendering. |

## Credit

Built from the patterns of the `tdoc` launch video. The `examples/tdoc`
project is included as the canonical worked example.
