import { brandName } from "../../lib/format.js";
import { uid } from "../../lib/id.js";

/**
 * SEO audit model.
 *
 * Nothing is fetched: no page is crawled and no request leaves the browser.
 * The findings below are a fixed catalogue applied to whatever address you
 * enter, so the triage workflow — severity, filtering, fixes, re-scoring,
 * exporting — can be worked through end to end on believable material.
 */

export const CRAWL_STEPS = [
  "Fetching robots.txt and the sitemap",
  "Crawling pages",
  "Checking titles, meta and headings",
  "Checking links and images",
  "Checking mobile and structured data",
  "Building the report",
];

/** Severity → the number of points an open issue removes from the score. */
export const SEVERITY_WEIGHT = { Critical: 12, High: 6, Medium: 3, Low: 1 };

export const SEVERITY_TONE = { Critical: "danger", High: "warning", Medium: "accent", Low: "neutral" };

export function normaliseUrl(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    return url.hostname.includes(".") ? url.origin : null;
  } catch {
    return null;
  }
}

export function buildAudit(origin) {
  const brand = brandName(origin);
  const issues = [
    {
      severity: "Critical",
      category: "Crawlability",
      title: "Pages blocked by a robots meta tag",
      url: `${origin}/pricing`,
      explanation:
        'This page carries <meta name="robots" content="noindex">, so search engines drop it from results entirely — including for people searching your brand name alongside "pricing".',
      fix: "Remove the noindex directive if this page is meant to rank.",
      current: '<meta name="robots" content="noindex, nofollow">',
      suggestion: '<meta name="robots" content="index, follow">',
    },
    {
      severity: "Critical",
      category: "Titles & meta",
      title: "Missing page title",
      url: `${origin}/about`,
      explanation:
        "With no <title>, search engines invent one from the page content. You lose control of the single most prominent line in the result.",
      fix: "Add a unique, descriptive title of 50–60 characters.",
      current: "<title></title>",
      suggestion: `<title>About ${brand} — our team and mission</title>`,
    },
    {
      severity: "Critical",
      category: "Links",
      title: "Broken internal link (404)",
      url: `${origin}/blog`,
      explanation:
        "A link on the blog index points to /blog/getting-started-old, which returns 404. Crawl budget is spent on a dead end and readers hit an error.",
      fix: "Point the link at the live article, or add a 301 redirect from the old path.",
    },
    {
      severity: "Critical",
      category: "Sitemap",
      title: "Sitemap lists redirected URLs",
      url: `${origin}/sitemap.xml`,
      explanation:
        "Six URLs in the sitemap redirect somewhere else. A sitemap is meant to list final destinations; redirects there waste crawl budget.",
      fix: "Regenerate the sitemap with destination URLs only.",
    },
    {
      severity: "High",
      category: "Titles & meta",
      title: "Duplicate meta descriptions",
      url: `${origin}/features`,
      explanation:
        "Four pages share one description, so results for different pages look identical and none of them argues for its own page.",
      fix: "Write a distinct description of 140–160 characters per page.",
      current: `<meta name="description" content="${brand} — the best platform.">`,
      suggestion: `<meta name="description" content="Every ${brand} feature in one place: content, marketing and hiring tools. Compare plans and start free.">`,
    },
    {
      severity: "High",
      category: "Canonical",
      title: "Missing canonical URL",
      url: `${origin}/features?ref=nav`,
      explanation:
        "Parameter variants of this page compete with each other. Without a canonical, search engines pick a winner for you — often the wrong one.",
      fix: "Add a self-referencing canonical pointing at the clean URL.",
      current: "(none)",
      suggestion: `<link rel="canonical" href="${origin}/features">`,
    },
    {
      severity: "High",
      category: "Headings",
      title: "Multiple H1 headings",
      url: origin,
      explanation: "The homepage has three H1 elements, which blurs what the page is actually about.",
      fix: "Keep one H1 and demote the rest to H2.",
    },
    {
      severity: "Medium",
      category: "Images",
      title: "Images missing alt text",
      url: origin,
      explanation:
        "Fourteen images have no alt attribute. Alt text carries meaning for screen readers and is how image search understands a picture.",
      fix: 'Describe each meaningful image; use alt="" for decorative ones.',
      current: '<img src="/hero.png">',
      suggestion: `<img src="/hero.png" alt="${brand} dashboard showing content and hiring tools">`,
    },
    {
      severity: "Medium",
      category: "Mobile",
      title: "Tap targets too close together",
      url: `${origin}/contact`,
      explanation: "Footer links sit under 24px apart on a phone, which produces mis-taps.",
      fix: "Space targets so each is at least 44×44px.",
    },
    {
      severity: "Medium",
      category: "Content",
      title: "Thin content",
      url: `${origin}/services`,
      explanation: "About 120 words — not enough to answer what someone searching for this would want to know.",
      fix: "Expand with specifics: who it is for, how it works, pricing context and the questions people actually ask.",
    },
    {
      severity: "Low",
      category: "Structured data",
      title: "No Organization schema",
      url: origin,
      explanation: "Structured data is how a search engine learns your logo, name and social profiles.",
      fix: "Add Organization JSON-LD to the homepage.",
      current: "(none)",
      suggestion: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"${brand}","url":"${origin}"}</script>`,
    },
    {
      severity: "Low",
      category: "Titles & meta",
      title: "Title longer than 60 characters",
      url: `${origin}/blog`,
      explanation: "Long titles are truncated in results, so the end of the sentence never gets read.",
      fix: "Shorten it so the key phrase sits inside the first 60 characters.",
    },
  ];

  return {
    url: origin,
    pagesScanned: 38,
    startedAt: new Date().toISOString(),
    issues: issues.map((issue) => ({ ...issue, id: uid("iss"), resolved: false })),
  };
}

/** 100 minus the weight of everything still open. */
export function healthScore(audit) {
  if (!audit) return 0;
  const penalty = audit.issues
    .filter((issue) => !issue.resolved)
    .reduce((total, issue) => total + SEVERITY_WEIGHT[issue.severity], 0);
  return Math.max(0, 100 - penalty);
}

export function auditMarkdown(audit) {
  const open = audit.issues.filter((i) => !i.resolved);
  return [
    `# SEO audit — ${audit.url}`,
    "",
    `Run: ${new Date(audit.startedAt).toLocaleString()} · Pages scanned: ${audit.pagesScanned}`,
    `Health score: ${healthScore(audit)} / 100 · ${open.length} open, ${audit.issues.length - open.length} resolved`,
    "",
    "## Summary",
    ...["Critical", "High", "Medium", "Low"].map(
      (severity) => `- ${severity}: ${open.filter((i) => i.severity === severity).length} open`
    ),
    "",
    "## Findings",
    ...audit.issues.flatMap((issue) => [
      `### [${issue.severity}] ${issue.title}${issue.resolved ? " (resolved)" : ""}`,
      `- Category: ${issue.category}`,
      `- URL: ${issue.url}`,
      `- Why it matters: ${issue.explanation}`,
      `- Recommended fix: ${issue.fix}`,
      ...(issue.suggestion ? ["", "```html", issue.suggestion, "```"] : []),
      "",
    ]),
    "## Next steps",
    "1. Clear the critical issues first — those can remove pages from search entirely.",
    "2. Work through the high-priority metadata and canonical problems.",
    "3. Re-run the audit after deploying, and schedule a monthly check.",
    "",
    "_Sample report generated in the Catzora Labs demo. No site was crawled and no request left the browser._",
  ].join("\n");
}
