# Example: tdoc launch video

The canonical worked example. tdoc is a Claude skill for prompt-native HTML
docs with Google-Docs-style commenting. The video's arc:

1. **AskFlow** — engineer asks an agent in a terminal to build + deploy a
   spec; the agent runs tools, returns a Cloudflare link; cursor clicks it
   and the doc snaps open (Terminal → BrowserWindow, one continuous beat).
2. **Comment** — cursor selects the artifact, types a comment, clicks the
   Comment button (BrowserWindow + Cursor + popup).
3. **Share** — teammates' comments stack in the doc gutter.
4. **Fix** — engineer asks the agent to address all comments; it ships v2;
   cursor clicks the v2 link (Terminal + Cursor).
5. **V2** — the doc reflects every change (green ring, streak counter),
   each comment resolved.
6. **Outro + LogoCard** — sign-off + spinning pixel-pet logo → wordmark.

It demonstrates: the continuous type→click→open beat, sharp transitions,
the animated `PixelPet`, synced typing/click SFX, an in-doc comment UI
recreated 1:1, and the pixel-verification loop.

This example keeps its own local `theme.ts`/`components.tsx` (frozen) so it
never breaks if the shared library evolves. **Read it for patterns; do not
clone its story** — design each product's own arc (see ../../SKILL.md).

## Render

```bash
bash ../../scripts/make-sfx.sh public      # regenerate SFX if missing
# from the repo root (note --public-dir so staticFile() resolves assets):
npm run render:tdoc
# or directly:
npx remotion render examples/tdoc/src/index.ts TdocDemo \
  out/tdoc-demo.mp4 --public-dir=examples/tdoc/public
```
