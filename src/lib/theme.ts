// Shared video constants + a calm default palette. Override per project by
// passing colors into scene props — nothing here is product-specific.

export const FPS = 24;
export const W = 1920;
export const H = 1080;

// A calm, launch-video palette (sage background + warm accent). Swap freely.
export const palette = {
  bg1: "#bedacb",
  bg2: "#b8d4c8",
  bg3: "#a8c8bc",
  wave: "rgba(255,255,255,0.15)",
  waveDark: "rgba(120,158,140,0.16)",
  ink: "#283a30",
  accent: "#e07856", // warm coral — CTA / mascot / logo
  mono: "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
  serif:
    "'Iowan Old Style', 'Palatino', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
};

// Terminal/dark-surface palette (used by the Terminal scene).
export const term = {
  bg: "#1b1b1b",
  chrome: "#2c2c2c",
  text: "#e6e6e6",
  amber: "#d18a4e",
  lime: "#9ccc65",
  dim: "#828282",
  alert: "#d65959",
  mono: "ui-monospace, 'SF Mono', 'Menlo', 'Consolas', monospace",
};

// Linear ease helper used everywhere (clamped both ends).
import { interpolate } from "remotion";
export const ease = (
  f: number,
  a: number,
  b: number,
  x: number,
  y: number
) =>
  interpolate(f, [a, b], [x, y], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
