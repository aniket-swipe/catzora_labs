/**
 * Deterministic visuals for the demo.
 *
 * Generated media is a placeholder, not a render — but the same prompt should
 * always produce the same placeholder, so the gallery and history stay stable
 * across reloads. Everything here is seeded from a string hash.
 */

/** FNV-1a — small, fast, and stable across reloads. */
export function hash(text) {
  let h = 2166136261;
  const s = String(text ?? "");
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** A 0–1 float from a seed and a channel, so one seed drives many values. */
export function rand(seed, channel = 0) {
  return ((hash(`${seed}:${channel}`) % 10000) / 10000);
}

export function pick(list, seed, channel = 0) {
  return list[hash(`${seed}:${channel}`) % list.length];
}

/** Placeholder palettes — background, mid, accent. */
export const PALETTES = [
  ["#EEF2FF", "#C7D2FE", "#6366F1"],
  ["#ECFEFF", "#A5F3FC", "#0E7490"],
  ["#FFFBEB", "#FDE68A", "#B45309"],
  ["#F0FDF4", "#BBF7D0", "#15803D"],
  ["#FDF2F8", "#FBCFE8", "#BE185D"],
  ["#F5F3FF", "#DDD6FE", "#7C3AED"],
  ["#F1F5F9", "#CBD5E1", "#334155"],
];

export function paletteFor(seed) {
  return PALETTES[hash(seed) % PALETTES.length];
}

/** Aspect ratio string → { w, h } box used by previews and exports. */
export const RATIO_BOX = {
  "1:1": { w: 1024, h: 1024 },
  "4:5": { w: 896, h: 1120 },
  "3:2": { w: 1200, h: 800 },
  "16:9": { w: 1280, h: 720 },
  "9:16": { w: 720, h: 1280 },
  "2:1": { w: 1280, h: 640 },
};

export function ratioBox(ratio) {
  return RATIO_BOX[ratio] || RATIO_BOX["1:1"];
}
