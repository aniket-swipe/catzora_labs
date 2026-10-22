import { hash, pick } from "../../lib/art.js";
import { titleCase } from "../../lib/format.js";

/**
 * Content generators for the Create studio.
 *
 * Nothing here calls a model. Each function is a deterministic transform of
 * what you typed, shaped to look like plausible output so the workflow around
 * it — editing, exporting, saving — can be exercised honestly.
 */

// ── Writing ──────────────────────────────────────────────────────────────

const LENGTH_PARAGRAPHS = { Short: 1, Medium: 2, Long: 4 };

const BODY_BEATS = [
  (topic, audience) =>
    `${titleCase(topic)} matters more to ${audience} than most teams assume. The ones who treat it as a system — rather than something that gets done when there is time — move faster with noticeably less effort.`,
  () =>
    `Start small. Pick the one task that recurs every week, write down how it is handled today, and time it honestly. That baseline is what makes every later improvement visible instead of merely felt.`,
  () =>
    `Then remove the steps that do not change the outcome. Most processes carry two or three habits nobody remembers adding, and they are usually the ones costing the most.`,
  () =>
    `Review it monthly. What worked last quarter may not fit this one, and a short, scheduled check-in keeps the system honest without turning it into another project.`,
];

export function writeCopy({ type, topic, audience, tone, length, language }) {
  const who = audience?.trim() || "your audience";
  const subject = titleCase(topic);
  const paragraphs = LENGTH_PARAGRAPHS[length] || 2;
  const languageNote =
    language && language !== "English"
      ? `\n\n[Demo output is written in English. A connected model would write this in ${language}.]`
      : "";

  const variants = [
    {
      id: "a",
      label: "A — the benefit",
      angle: "Leads with what the reader gets",
      body: buildBody(type, subject, who, tone, paragraphs, "benefit"),
    },
    {
      id: "b",
      label: "B — the objection",
      angle: "Answers the reason they hesitate",
      body: buildBody(type, subject, who, tone, paragraphs, "objection"),
    },
    {
      id: "c",
      label: "C — the proof",
      angle: "Leads with evidence, not promises",
      body: buildBody(type, subject, who, tone, paragraphs, "proof"),
    },
  ].map((v) => ({ ...v, body: v.body + languageNote }));

  return {
    title: `${type} — ${subject}`,
    variants,
    checks: [
      "Every claim is one you could evidence if a customer asked.",
      "Required disclaimers are present and readable at the size they will ship at.",
      "The call to action matches where the link actually goes.",
      "Read it aloud — anything you stumble over gets cut.",
    ],
    guidance: [
      {
        title: "Run A against B first",
        text: "Benefit against objection tells you whether the audience needs convincing or reassuring. That answer shapes everything else you write.",
      },
      {
        title: "Change one thing at a time",
        text: "Swap the headline or the call to action, never both — otherwise the result tells you nothing about why it moved.",
      },
      {
        title: "Hold urgency back",
        text: "Deadlines win in the short term and erode trust over time. Save them for the last few days of a real deadline.",
      },
    ],
  };
}

function buildBody(type, subject, who, tone, paragraphs, angle) {
  const openers = {
    benefit: `${subject} — and you keep the time you would have spent on it.`,
    objection: `"What's the catch?"\n\nNothing hidden: ${subject.toLowerCase()}, with the full detail on the page before you commit.`,
    proof: `Teams using this cut ${subject.toLowerCase()} from a weekly scramble to a 40-minute routine. Here is what changed.`,
  };
  const closers = {
    benefit: "See what it looks like for your team →",
    objection: "Read exactly what is included →",
    proof: "Try it on this week's work →",
  };

  if (type === "Social caption") {
    return `${openers[angle]}\n\nWritten for ${who}, in a ${tone.toLowerCase()} register.\n\n${closers[angle]}`;
  }

  if (type === "Email") {
    return [
      `Subject: ${subject}`,
      "",
      `Hi there,`,
      "",
      openers[angle],
      "",
      ...BODY_BEATS.slice(1, paragraphs + 1).map((beat) => beat(subject, who)),
      "",
      closers[angle],
      "",
      "— The team",
    ].join("\n");
  }

  const heading = type === "Long-form article" ? `# ${subject}\n\n` : "";
  return (
    heading +
    [openers[angle], ...BODY_BEATS.slice(1, paragraphs + 1).map((beat) => beat(subject, who)), closers[angle]].join(
      "\n\n"
    )
  );
}

export function suggestHeadlines(topic) {
  const subject = (topic || "your offer").trim();
  const cap = titleCase(subject);
  return [
    `${cap}, made simple`,
    `The faster way to ${subject.toLowerCase()}`,
    `Stop overthinking ${subject.toLowerCase()}`,
    `${cap} in one afternoon`,
    `What nobody tells you about ${subject.toLowerCase()}`,
  ];
}

// ── Image ────────────────────────────────────────────────────────────────

const LIGHTING = ["soft directional light from the left", "overcast daylight", "warm golden-hour light", "clean studio key light with a soft fill"];
const COMPOSITION = ["subject on the left third, clear negative space on the right for a headline", "centred, symmetrical, shallow depth of field", "low angle, subject filling two-thirds of the frame", "flat top-down arrangement on a plain surface"];

export function imagePrompt({ subject, style, mood, ratio, avoid }) {
  const seed = `${subject}|${style}|${ratio}`;
  const prompt = [
    subject.trim(),
    style.toLowerCase(),
    mood?.trim() || "natural and unforced",
    pick(LIGHTING, seed, 1),
    pick(COMPOSITION, seed, 2),
    `${ratio} aspect ratio`,
    "high detail, no text",
  ].join(", ");

  const negative = [
    avoid?.trim(),
    "text, watermark, logo",
    "distorted hands, extra fingers",
    "harsh flash, oversaturated colours",
    "cluttered background, obvious stock-photo posing",
  ]
    .filter(Boolean)
    .join(", ");

  return { prompt, negative };
}

export function artDirection({ subject, style, ratio }) {
  const seed = `${subject}|${style}`;
  return [
    { title: "Composition", text: pick(COMPOSITION, seed, 2) },
    { title: "Lighting", text: pick(LIGHTING, seed, 1) },
    { title: "Palette", text: "Muted base with one accent colour; keep the accent off the subject's face." },
    { title: "Safe area", text: `Keep the outer 12% of the ${ratio} frame clear so crops and overlays do not cut anything important.` },
  ];
}

// ── Video ────────────────────────────────────────────────────────────────

export function shotList({ prompt, duration, style }) {
  const seconds = Number(String(duration).replace(/\D/g, "")) || 10;
  const beats = seconds <= 5 ? 2 : seconds <= 10 ? 3 : 4;
  const subject = prompt.trim().replace(/\.$/, "");
  const templates = [
    { shot: "Opening", camera: "Slow push in", note: `Establish ${subject}. Hold two beats before any motion.` },
    { shot: "Detail", camera: "Close-up, handheld", note: "One specific detail that proves the scene is real — hands, texture, a screen." },
    { shot: "Reaction", camera: "Medium, locked off", note: "The moment the viewer is meant to feel. No dialogue needed." },
    { shot: "Close", camera: "Pull back", note: "Return to the wide frame and leave space for an end card." },
  ];
  return templates.slice(0, beats).map((t, i) => ({
    ...t,
    time: `${Math.round((seconds / beats) * i)}–${Math.round((seconds / beats) * (i + 1))}s`,
    style,
  }));
}

// ── Presentations ────────────────────────────────────────────────────────

const DECK_SKELETON = [
  { title: null, bullets: ["{purpose}", "Prepared for {audience}"] },
  { title: "Where we are today", bullets: ["The situation in one line", "The number that matters most", "What changed since last time"] },
  { title: "The problem worth solving", bullets: ["Who feels it", "What it costs today", "Why now"] },
  { title: "Our approach", bullets: ["The three-step plan", "What we will deliberately not do", "How we will measure progress"] },
  { title: "Plan and milestones", bullets: ["Next 30 days", "Next 90 days", "Owner for each milestone"] },
  { title: "Risks and mitigations", bullets: ["The top risk and its fallback", "Dependencies on other teams"] },
  { title: "What we need", bullets: ["The decision being requested", "Budget or headcount", "Timeline for a yes or no"] },
  { title: "Summary", bullets: ["One-sentence takeaway", "The next step, and who owns it"] },
];

export function buildOutline({ topic, purpose, audience, count }) {
  const total = Math.max(3, Number(count) || 8);
  const slides = [];

  for (let i = 0; i < total; i += 1) {
    const template = DECK_SKELETON[i];
    if (template) {
      slides.push({
        title: template.title ?? titleCase(topic),
        bullets: template.bullets.map((b) =>
          b.replace("{purpose}", purpose || "Overview").replace("{audience}", audience || "the team")
        ),
      });
    } else {
      slides.push({
        title: `Supporting detail ${i - DECK_SKELETON.length + 1}`,
        bullets: ["The key point", "The evidence behind it", "What it implies for the plan"],
      });
    }
  }

  // Always land on the summary, however many slides were asked for.
  if (total >= 3) slides[total - 1] = { ...DECK_SKELETON[DECK_SKELETON.length - 1] };
  return slides;
}

// ── Audio ────────────────────────────────────────────────────────────────

export function musicBrief({ prompt, genre, mood, duration }) {
  const seed = `${prompt}|${genre}|${mood}`;
  const bpm = 70 + (hash(seed) % 60);
  const keys = ["C major", "A minor", "F major", "D minor", "G major", "E minor"];
  return {
    bpm,
    key: pick(keys, seed, 3),
    structure: [
      { part: "Intro", bars: "0–8", note: `${mood} ${genre.toLowerCase()} texture; keep it sparse so a voice-over sits on top.` },
      { part: "Build", bars: "9–24", note: "Add percussion and one melodic motif. This is where the product appears on screen." },
      { part: "Peak", bars: "25–40", note: "Full arrangement. Land this on the main claim." },
      { part: "Outro", bars: "41–end", note: "Strip back to the intro texture for the end card." },
    ],
    duration,
  };
}
