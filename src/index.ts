// launch-video-skill — reusable scene library.
// Import these into a project composition; assemble only the scenes the
// product's story actually needs (a CLI tool may use just Terminal+Outro;
// a SaaS app BrowserWindow+Outro; a mobile app MobileFrame; a library
// CodeEditor). The flow is designed PER PRODUCT — see SKILL.md.

export { Terminal } from "./scenes/Terminal";
export type { TermLine } from "./scenes/Terminal";
export { BrowserWindow } from "./scenes/BrowserWindow";
export { MobileFrame } from "./scenes/MobileFrame";
export { CodeEditor } from "./scenes/CodeEditor";
export { Outro, LogoCard } from "./scenes/Outro";

export {
  WaveBackground,
  Caption,
  FadeIn,
  Cursor,
  PixelPet,
} from "./lib/primitives";
export { FPS, W, H, palette, term, ease } from "./lib/theme";
