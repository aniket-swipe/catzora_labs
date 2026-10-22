import { uid } from "../../lib/id.js";
import { pick } from "../../lib/art.js";

/**
 * Hire studio content: job descriptions, interview questions, assessment
 * questions, HR letters and the candidate FAQ bot. All deterministic — no model
 * is called — and every generated document is labelled as a draft for review.
 */

// ── Jobs ─────────────────────────────────────────────────────────────────

const SKILL_BANK = {
  engineer: ["System design", "Git", "Testing", "Code review", "APIs"],
  backend: ["Node.js", "TypeScript", "PostgreSQL", "REST APIs", "AWS"],
  frontend: ["React", "TypeScript", "CSS", "Accessibility", "Testing"],
  designer: ["Figma", "Prototyping", "User research", "Visual design", "Design systems"],
  analyst: ["SQL", "Excel", "Data visualisation", "Statistics", "Python"],
  qa: ["Test automation", "Playwright", "JavaScript", "CI/CD"],
  marketing: ["Copywriting", "Social media", "Campaign analytics", "SEO basics", "Canva"],
  sales: ["Prospecting", "CRM", "Negotiation", "Pipeline management"],
  default: ["Communication", "Problem solving", "Ownership", "Collaboration"],
};

export function suggestSkills(title) {
  const t = String(title).toLowerCase();
  const key = Object.keys(SKILL_BANK).find((k) => k !== "default" && t.includes(k));
  return SKILL_BANK[key] ?? SKILL_BANK.default;
}

export function generateJobDescription(job) {
  const where = job.location ? ` in ${job.location}` : "";
  return {
    summary: `We're hiring a ${job.title} to join our ${job.department || "growing"} team${where} (${String(job.workMode).toLowerCase()}). You'll own meaningful work from the first week and help shape how the team operates as it grows.`,
    responsibilities: [
      `Own day-to-day ${job.title.toLowerCase()} work from brief to delivery`,
      "Work closely with product, design and business teams",
      "Write down decisions so the next person does not have to rediscover them",
      "Improve how the team works as it grows",
    ],
    qualifications: [
      `${job.experience || "Relevant"} of experience in a similar role`,
      "Clear written and spoken communication",
      "Comfortable making progress when the brief is incomplete",
    ],
    skills: suggestSkills(job.title),
  };
}

export function jobMarkdown(job) {
  return [
    `# ${job.title}`,
    `${job.department} · ${job.location} · ${job.workMode} · ${job.employment} · ${job.experience}`,
    "",
    job.summary || "",
    "",
    "## What you'll do",
    ...job.responsibilities.filter(Boolean).map((r) => `- ${r}`),
    "",
    "## What we're looking for",
    ...job.qualifications.filter(Boolean).map((q) => `- ${q}`),
    "",
    "## Skills",
    job.skills.join(", "),
  ].join("\n");
}

// ── Interviews ───────────────────────────────────────────────────────────

export const INTERVIEW_TEMPLATES = [
  "Backend — technical screen",
  "Backend — system design",
  "Design — portfolio review",
  "QA — automation screen",
  "Campus — general aptitude",
  "Custom",
];

const BEHAVIOURAL = [
  "Tell me about a time you disagreed with a teammate. How was it resolved?",
  "Describe a deadline you nearly missed. What did you change afterwards?",
  "What feedback have you received that changed how you work?",
  "Tell me about something you shipped that you're proud of, and your part in it.",
];

export function generateQuestions({ skills, technical, behavioural }) {
  const list = skills.length ? skills : ["the core tools of this role"];
  const tech = Array.from({ length: technical }, (_, i) => {
    const skill = list[i % list.length];
    return {
      id: uid("q"),
      type: "Technical",
      text: pick(
        [
          `Walk me through a recent problem you solved using ${skill}. What trade-offs did you make?`,
          `How would you explain ${skill} to a new teammate on their first day?`,
          `What's a common mistake people make with ${skill}, and how do you avoid it?`,
        ],
        `${skill}:${i}`
      ),
      lookFor: `A concrete example, real depth in ${skill}, and awareness of the trade-offs`,
    };
  });
  const behave = BEHAVIOURAL.slice(0, behavioural).map((text) => ({
    id: uid("q"),
    type: "Behavioural",
    text,
    lookFor: "A specific situation, their own actions, and a clear outcome",
  }));
  return [...tech, ...behave];
}

export const DEFAULT_RUBRIC = () => [
  { id: uid("r"), name: "Technical depth", weight: 40 },
  { id: uid("r"), name: "Problem solving", weight: 30 },
  { id: uid("r"), name: "Communication", weight: 20 },
  { id: uid("r"), name: "Role motivation", weight: 10 },
];

/** The demo interviewer's reply to one answer. */
export function interviewerReply(answer, next) {
  const words = answer.trim().split(/\s+/).length;
  const ack =
    words < 12
      ? "Thanks. Could you add a specific example — what you did, and what happened?"
      : pick(["Thanks, that's helpful.", "Got it, thank you.", "Understood — that's a clear example."], answer);
  return next ? `${ack}\n\nNext question: ${next}` : `${ack}\n\nThat's the end of this interview. The hiring team will review your answers.`;
}

export const SAMPLE_TRANSCRIPT = [
  { role: "ai", text: "Walk me through a recent problem you solved using AWS. What trade-offs did you make?" },
  {
    role: "candidate",
    text: "We moved payment webhooks to SQS with a Lambda consumer. Timeouts dropped to near zero, but delivery became at-least-once, so I added idempotency keys in PostgreSQL.",
  },
  { role: "ai", text: "Thanks, that's helpful.\n\nNext question: Tell me about a time you disagreed with a teammate. How was it resolved?" },
  {
    role: "candidate",
    text: "A teammate wanted Redis caching everywhere. I suggested we measure first; we found two slow queries, indexed them, and only cached one endpoint.",
  },
];

// ── Assessments ──────────────────────────────────────────────────────────

export const ASSESSMENT_CATEGORIES = ["Technical", "Logical reasoning", "Communication", "Role-specific"];

const QUESTION_BANK = {
  "Logical reasoning": [
    { skill: "Series", prompt: "Next in the series: 3, 9, 27, 81, …", options: ["162", "243", "324", "108"], answer: 1 },
    { skill: "Deduction", prompt: "If some A are B and all B are C, which must be true?", options: ["All A are C", "Some A are C", "No A are C", "All C are A"], answer: 1 },
    { skill: "Arithmetic", prompt: "A task takes 6 people 4 days. How long for 8 people?", options: ["2 days", "3 days", "5 days", "6 days"], answer: 1 },
    { skill: "Patterns", prompt: "Odd one out: 121, 144, 169, 196, 210", options: ["121", "169", "196", "210"], answer: 3 },
    { skill: "Direction", prompt: "Facing north, you turn right twice. Which way do you face?", options: ["North", "East", "South", "West"], answer: 2 },
  ],
  Technical: [
    { skill: "Web", prompt: "Which HTTP status means 'Not Found'?", options: ["200", "301", "404", "500"], answer: 2 },
    { skill: "JavaScript", prompt: "What does typeof null return?", options: ["'null'", "'object'", "'undefined'", "'number'"], answer: 1 },
    { skill: "SQL", prompt: "Which keyword removes duplicate rows from a result?", options: ["UNIQUE", "DISTINCT", "DIFFERENT", "SINGLE"], answer: 1 },
    { skill: "Git", prompt: "Which command creates a branch and switches to it?", options: ["git branch -d", "git switch -c", "git merge", "git fetch"], answer: 1 },
    { skill: "Data structures", prompt: "Which structure gives O(1) average lookup by key?", options: ["Array", "Linked list", "Hash map", "Binary tree"], answer: 2 },
  ],
  Communication: [
    { skill: "Email", prompt: "The best subject line for a meeting reschedule is…", options: ["Hi", "Urgent!!!", "Moving Thursday's review to Friday 3 pm", "Meeting"], answer: 2 },
    { skill: "Clarity", prompt: "Which sentence is clearest?", options: ["We might possibly look into it", "I'll send the report by 5 pm today", "It will be done soon-ish", "Let's circle back"], answer: 1 },
    { skill: "Listening", prompt: "A customer is upset. Your first step is to…", options: ["Explain the policy", "Acknowledge their concern", "Escalate immediately", "Offer a refund"], answer: 1 },
  ],
};

export function generateAssessmentQuestions({ category, count, skill }) {
  const bank = QUESTION_BANK[category] ?? QUESTION_BANK.Technical;
  return Array.from({ length: count }, (_, i) => {
    const base = bank[i % bank.length];
    return { ...base, options: [...base.options], skill: skill.trim() || base.skill, id: uid("qq") };
  });
}

// ── HR documents ─────────────────────────────────────────────────────────

export function offerLetter(f) {
  return `${f.company || "[Company name]"}
${f.date}

Dear ${f.candidate || "[Candidate name]"},

We are pleased to offer you the position of ${f.role || "[Role]"} with ${f.company || "[Company]"}, based in ${f.location || "[Location]"}. Your expected start date is ${f.start || "[Start date]"}.

Your annual compensation will be ${f.ctc || "[CTC]"}, as set out in Annexure A. This offer is subject to successful background verification and the documents listed in Annexure B.

Please confirm your acceptance by signing and returning a copy of this letter by ${f.deadline || "[Acceptance deadline]"}.

We look forward to welcoming you to the team.

Sincerely,
${f.signatory || "[Name]"}
${f.signatoryTitle || "[Title]"}

[DRAFT — review with HR and legal before sending. Notice period, probation and confidentiality clauses must come from your approved template.]`;
}

export function interviewInvite(f) {
  return `Subject: Interview invitation — ${f.role || "[Role]"} at ${f.company || "[Company]"}

Hi ${f.candidate || "[Candidate name]"},

Thank you for applying for the ${f.role || "[Role]"} role. We'd like to invite you to a ${String(f.mode).toLowerCase()} interview.

Date & time: ${f.when}
Duration: ${f.duration}
Round: ${f.round}
${f.mode === "On-site" ? `Address: ${f.address || "[Office address]"}` : "Meeting link: shared once you confirm"}

Please reply to confirm, or suggest another time if this one doesn't work.

Best regards,
${f.signatory || "[Recruiter name]"}`;
}

export const HR_TEMPLATES = [
  {
    id: "t1",
    name: "Application received",
    body: "Hi [Name],\n\nThanks for applying for [Role] at [Company]. We've received your application and will get back to you within 5 working days.\n\nBest,\n[Recruiter]",
  },
  {
    id: "t2",
    name: "Document request",
    body: "Hi [Name],\n\nTo complete background verification, please share:\n• Government ID\n• Education certificates\n• Relieving letter from your last employer\n\nYou can reply to this email with the documents attached.\n\nThanks,\n[HR]",
  },
  {
    id: "t3",
    name: "Regret — after interview",
    body: "Hi [Name],\n\nThank you for the time you spent with our team. After careful consideration, we've decided to move forward with other candidates for [Role].\n\nWe'd be glad to keep your profile for future openings.\n\nBest wishes,\n[Recruiter]",
  },
  {
    id: "t4",
    name: "Onboarding welcome",
    body: "Hi [Name],\n\nWelcome to [Company]! Your first day is [Date]. Please arrive at [Time] at [Address]; [Buddy] will meet you at reception.\n\nSee you soon,\n[HR]",
  },
];

// ── Candidate FAQ bot ────────────────────────────────────────────────────

const FAQ = [
  { match: /(status|update|hear back|result)/i, answer: "You'll get an update by email within 5 working days of each round. You can also reply to your application email to ask for a status check." },
  { match: /(salary|ctc|pay|compensation)/i, answer: "Compensation is discussed with the recruiter after the first interview round and depends on experience and role level." },
  { match: /(remote|hybrid|office|location|wfh)/i, answer: "Each job post lists its work mode — on-site, hybrid or remote. Hybrid roles in Pune are typically three days a week in the office." },
  { match: /(interview|round|process|steps)/i, answer: "The usual process is resume screening → an online assessment → one or two interviews → an HR discussion. Some roles start with an AI-assisted first interview." },
  { match: /(document|id|certificate|verification)/i, answer: "After an offer, you'll be asked for ID, education certificates and previous employment letters for background verification." },
  { match: /(reschedul|cancel|another time)/i, answer: "Reply to your interview invitation at least 24 hours before the slot and the recruiter will share new options." },
];

export function faqAnswer(question) {
  const hit = FAQ.find((f) => f.match.test(question));
  return hit
    ? { text: hit.answer, confident: true }
    : { text: "I don't have an answer for that yet, so I've flagged your question for the recruiting team. They'll reply by email.", confident: false };
}

export const FAQ_SUGGESTIONS = [
  "How long until I hear back?",
  "Is this role remote?",
  "What are the interview rounds?",
  "Which documents do I need?",
  "Can I reschedule my interview?",
];
