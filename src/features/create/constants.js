/**
 * Model menus.
 *
 * None of these are connected. They are listed because choosing a model per
 * job is part of the workflow being demonstrated, and the selection is carried
 * through to the saved record so history shows what was asked for.
 */
const model = (id, vendor, name) => ({ id, vendor, name, value: id, label: `${vendor} · ${name}` });

export const TEXT_MODELS = [
  model("auto-text", "Catzora", "Auto (best available)"),
  model("anthropic-claude", "Anthropic", "Claude"),
  model("openai-gpt", "OpenAI", "GPT"),
  model("google-gemini", "Google", "Gemini"),
];

export const IMAGE_MODELS = [
  model("auto-image", "Catzora", "Auto (best available)"),
  model("openai-image", "OpenAI", "GPT Image"),
  model("google-imagen", "Google", "Imagen"),
  model("bfl-flux", "Black Forest Labs", "FLUX"),
  model("stability-sd", "Stability AI", "Stable Diffusion"),
];

export const VIDEO_MODELS = [
  model("auto-video", "Catzora", "Auto (best available)"),
  model("google-veo", "Google", "Veo"),
  model("runway", "Runway", "Gen series"),
  model("kling", "Kuaishou", "Kling"),
  model("luma", "Luma AI", "Dream Machine"),
];

export const VOICE_MODELS = [
  model("auto-voice", "Catzora", "Auto (best available)"),
  model("elevenlabs", "ElevenLabs", "Multilingual TTS"),
  model("openai-tts", "OpenAI", "Text-to-speech"),
  model("google-tts", "Google Cloud", "Text-to-Speech"),
];

export const MUSIC_MODELS = [
  model("auto-music", "Catzora", "Auto (best available)"),
  model("stability-audio", "Stability AI", "Stable Audio"),
  model("google-lyria", "Google", "Lyria"),
];

/** Human label for a stored model id. */
export function modelLabel(list, id) {
  const found = list.find((m) => m.id === id);
  return found ? `${found.vendor} · ${found.name}` : id;
}

export const IMAGE_STYLES = [
  "Photographic",
  "Editorial illustration",
  "Flat vector",
  "3D render",
  "Watercolour",
  "Product shot",
];

export const RATIOS = ["1:1", "4:5", "16:9", "9:16"];

export const VOICES = [
  { id: "warm", name: "Warm narrator", description: "Calm, mid-pitch. Explainers and walkthroughs.", pitch: 1, rate: 1 },
  { id: "upbeat", name: "Upbeat host", description: "Energetic. Ads, reels and openers.", pitch: 1.15, rate: 1.1 },
  { id: "corporate", name: "Corporate", description: "Neutral and clear. Training and internal comms.", pitch: 0.95, rate: 0.98 },
  { id: "storyteller", name: "Storyteller", description: "Expressive, slower pace. Brand films.", pitch: 1.05, rate: 0.88 },
];

export const LANGUAGES = {
  English: { accents: ["Indian", "American", "British"], codes: { Indian: "en-IN", American: "en-US", British: "en-GB" } },
  Hindi: { accents: ["Standard"], codes: { Standard: "hi-IN" } },
  Marathi: { accents: ["Standard"], codes: { Standard: "mr-IN" } },
  Spanish: { accents: ["Spain", "Latin American"], codes: { Spain: "es-ES", "Latin American": "es-MX" } },
};

/** Canvas sizes for Design Studio, in real export pixels. */
export const DESIGN_PRESETS = {
  "YouTube thumbnail": { w: 1280, h: 720 },
  "Website banner": { w: 1920, h: 600 },
  "Ad creative (square)": { w: 1080, h: 1080 },
  "Instagram post": { w: 1080, h: 1350 },
  "Story / Reel cover": { w: 1080, h: 1920 },
};

export const BRAND_COLORS = ["#6558F5", "#0D9488", "#D97706", "#DC2626", "#111827", "#2563EB"];

/** Slide themes — background, foreground, accent, muted. */
export const DECK_THEMES = {
  Corporate: { bg: "#FFFFFF", fg: "#111827", accent: "#4F46E5", sub: "#64748B" },
  Bold: { bg: "#111827", fg: "#F8FAFC", accent: "#A78BFA", sub: "#94A3B8" },
  Calm: { bg: "#F0FDFA", fg: "#134E4A", accent: "#0D9488", sub: "#3F6F6A" },
};
