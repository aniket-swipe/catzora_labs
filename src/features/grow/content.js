import { hash } from "../../lib/art.js";
import { titleCase } from "../../lib/format.js";

/**
 * Generators for email, blog and keyword research.
 * Deterministic transforms of your input — no model is called.
 */

// ── Email ────────────────────────────────────────────────────────────────

export function writeEmail(f) {
  const first = f.recipientName.trim().split(/\s+/)[0] || "there";
  const company = f.recipientCompany.trim() || "your team";
  const offer = f.offer.trim();
  const opener = f.context.trim()
    ? `I noticed ${f.context.trim().replace(/\.$/, "")}, and`
    : `I've been following ${company}'s work, and`;
  const role = f.recipientRole.trim() ? `a ${f.recipientRole.trim().toLowerCase()} like you` : company;
  const short = f.length === "Short";
  const sign = f.tone === "Formal" ? "Kind regards" : "Best";

  const body = [
    `Hi ${first},`,
    "",
    `${opener} thought ${offer} might be useful for ${role}.`,
    ...(short
      ? []
      : ["", `${f.senderCompany.trim() || "We"} help teams like ${company} take the repetitive part of this off their plate, so people spend their time on the work that actually needs them.`]),
    "",
    f.tone === "Direct"
      ? "Worth 15 minutes next week?"
      : "Would a 15-minute call next week be useful? If the timing isn't right, no problem at all.",
    "",
    `${sign},`,
    "[Your name]",
    f.senderCompany.trim() || "[Company]",
  ].join("\n");

  return {
    subjects: [`Quick idea for ${company}`, `${first}, 15 minutes next week?`, `${titleCase(offer)} for ${company}`],
    body,
    followUps: f.sequence
      ? [
          { day: 3, body: `Hi ${first},\n\nBringing this back to the top of your inbox. Happy to send a two-line summary instead of a call if that's easier.\n\n${sign},\n[Your name]` },
          { day: 7, body: `Hi ${first},\n\nI'll close the loop here so I don't crowd your inbox. If ${offer} becomes a priority later, just reply to this email.\n\n${sign},\n[Your name]` },
        ]
      : [],
  };
}

// ── Blog ─────────────────────────────────────────────────────────────────

export const BLOG_STAGES = ["Idea", "Outline", "Draft", "Review", "Published"];
export const STAGE_TONE = { Idea: "neutral", Outline: "accent", Draft: "grow", Review: "warning", Published: "success" };
export const INTENTS = ["Informational", "Commercial", "Transactional", "Navigational"];

export function blogIdeas(topic, audience) {
  const t = topic.trim().toLowerCase();
  const who = audience.trim() || "teams";
  return [
    { title: `The beginner's guide to ${t}`, keyword: `${t} guide`, intent: "Informational" },
    { title: `${titleCase(t)}: 7 mistakes ${who} make`, keyword: `${t} mistakes`, intent: "Informational" },
    { title: `How to choose the right ${t} tool`, keyword: `best ${t} tool`, intent: "Commercial" },
    { title: `${titleCase(t)} checklist (free template)`, keyword: `${t} checklist`, intent: "Transactional" },
    { title: `What changed in ${t} this year`, keyword: `${t} trends`, intent: "Informational" },
  ];
}

export function blogOutline({ title, keyword }) {
  return [
    `H1: ${title}`,
    `Intro — the problem in two sentences; use "${keyword}" naturally once`,
    `H2: What is ${keyword}?`,
    "H2: Why it matters now",
    "H2: How to get started, step by step",
    "H3: Step 1 — set the goal",
    "H3: Step 2 — choose the approach",
    "H3: Step 3 — measure the result",
    "H2: Common mistakes to avoid",
    'H2: FAQs (answer the "People also ask" questions)',
    "Conclusion + call to action",
  ];
}

export function blogDraft({ title, keyword, audience }) {
  const who = audience || "readers";
  return [
    `# ${title}`,
    "",
    `If you are one of the ${who.toLowerCase()} trying to make sense of ${keyword}, you are not alone — most people meet it at the exact moment it starts costing them time.`,
    "",
    `## What is ${keyword}?`,
    "",
    `In plain terms, ${keyword} is the practice of making a recurring task predictable. That predictability is what makes it worth writing about.`,
    "",
    "## Why it matters now",
    "",
    "Teams that treat it as a system move faster with less effort. Teams that treat it as an afterthought repeat the same work every month.",
    "",
    "## How to get started",
    "",
    "1. **Set the goal.** Decide what good looks like before you change anything.",
    "2. **Choose the approach.** Pick the smallest change that would move the goal.",
    "3. **Measure the result.** Compare against the baseline after two weeks.",
    "",
    "## Common mistakes",
    "",
    "- Changing everything at once, so nothing can be attributed.",
    "- Skipping the baseline.",
    "- Treating a one-off win as a pattern.",
    "",
    "## Wrapping up",
    "",
    `Start small, measure honestly, and revisit monthly. That is most of ${keyword}.`,
  ].join("\n");
}

// ── Keywords ─────────────────────────────────────────────────────────────

const MODIFIERS = [
  { pattern: "{t}", intent: "Informational" },
  { pattern: "what is {t}", intent: "Informational" },
  { pattern: "how to {t}", intent: "Informational" },
  { pattern: "{t} for beginners", intent: "Informational" },
  { pattern: "{t} examples", intent: "Informational" },
  { pattern: "{t} checklist", intent: "Transactional" },
  { pattern: "{t} template", intent: "Transactional" },
  { pattern: "best {t} tools", intent: "Commercial" },
  { pattern: "{t} software", intent: "Commercial" },
  { pattern: "{t} pricing", intent: "Commercial" },
  { pattern: "{t} vs alternatives", intent: "Commercial" },
  { pattern: "{t} near me", intent: "Navigational" },
];

const CLUSTER = { Informational: "Learn", Commercial: "Compare", Transactional: "Act", Navigational: "Find" };

/** Invented volumes and difficulty, stable per keyword so a re-run agrees with itself. */
export function researchKeywords(seed, market) {
  const t = seed.trim().toLowerCase();
  const scale = market === "India" ? 1 : market === "Global" ? 4 : 1.6;
  return MODIFIERS.map(({ pattern, intent }) => {
    const keyword = pattern.replace("{t}", t);
    const h = hash(`${keyword}|${market}`);
    const base = pattern === "{t}" ? 18000 : 400 + (h % 6000);
    const volume = Math.round((base * scale) / 10) * 10;
    const difficulty = pattern === "{t}" ? 72 : 12 + (h % 66);
    const opportunity = Math.round((Math.log10(volume + 10) * 20) * ((100 - difficulty) / 100));
    return { id: keyword, keyword, intent, cluster: CLUSTER[intent], volume, difficulty, cpc: ((h % 900) / 100 + 0.2).toFixed(2), opportunity };
  });
}

export function difficultyTone(d) {
  return d >= 60 ? "danger" : d >= 35 ? "warning" : "success";
}
