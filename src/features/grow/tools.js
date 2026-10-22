import { Compass, Globe } from "lucide-react";
import { brandName } from "../../lib/format.js";

/**
 * Grow studio — the two intelligence reports that stay as generator configs.
 * They produce a report rather than records you work on, which is exactly
 * what <ToolPage> is for. Everything else in Grow is a bespoke page.
 */
export const growTools = [
  {
    slug: "visibility",
    icon: Globe,
    navLabel: "AI Search Visibility",
    navDescription: "AEO/GEO answer coverage",
    title: "AI Search Visibility (AEO / GEO)",
    description: "See how your brand shows up in AI-generated answers — not just in classic search rankings — and what to change so assistants cite you.",
    fileName: "ai-search-visibility",
    runLabel: "Check AI visibility",
    note: "This demo simulates assistant answers. A live version would query real AI assistants and record how each one responds.",
    steps: ["Building the prompt set", "Simulating assistant answers", "Checking brand mentions and citations", "Scoring answer-engine readiness", "Writing recommendations"],
    fields: [
      { name: "brand", label: "Brand or website", required: true, placeholder: "example.com" },
      { name: "category", label: "Category you want to be found in", required: true, placeholder: "e.g. instant personal loan apps" },
      { name: "rivals", label: "Competitors to compare against", placeholder: "Comma separated", hint: "Leave blank and the tool will use sample rivals." },
      { name: "market", label: "Market", type: "select", defaultValue: "India", options: ["India", "United States", "United Kingdom", "UAE", "Global"] },
    ],
    run: (v) => {
      const brand = brandName(v.brand);
      const category = String(v.category).trim();
      const rivals = (v.rivals ? v.rivals.split(",").map((s) => s.trim()).filter(Boolean) : ["Rival A", "Rival B", "Rival C"]).slice(0, 4);
      const prompts = [
        { q: `What is the best ${category} in ${v.market}?`, mentioned: false, cited: false },
        { q: `Is ${brand} trustworthy?`, mentioned: true, cited: true },
        { q: `Compare ${category} options for a first-time user`, mentioned: false, cited: false },
        { q: `How much do ${category} cost?`, mentioned: true, cited: false },
        { q: `${brand} vs ${rivals[0]}`, mentioned: true, cited: true },
        { q: `Cheapest ${category} for self-employed people`, mentioned: false, cited: false },
        { q: `What should I check before choosing a ${category} provider?`, mentioned: false, cited: false },
        { q: `Does ${brand} have hidden charges?`, mentioned: true, cited: false },
      ];
      const mentioned = prompts.filter((p) => p.mentioned).length;
      const cited = prompts.filter((p) => p.cited).length;
      return {
        title: `AI visibility for ${brand} in "${category}"`,
        summary: [
          { label: "Prompts tested", value: prompts.length, sub: "Assistant questions" },
          { label: "Brand mentioned", value: `${mentioned}/${prompts.length}`, sub: `${Math.round((mentioned / prompts.length) * 100)}% of answers` },
          { label: "Source cited", value: `${cited}/${prompts.length}`, sub: "Linked back to you" },
          { label: "AEO score", value: Math.round(((mentioned * 2 + cited * 3) / (prompts.length * 5)) * 100), sub: "0–100, sample" },
        ],
        sections: [
          {
            heading: "Prompt-by-prompt result",
            kind: "table",
            columns: ["Prompt", "Mentioned", "Cited as source", "Who the answer named first"],
            rows: prompts.map((p, i) => [p.q, p.mentioned ? "Yes" : "No", p.cited ? "Yes" : "No", p.mentioned && i === 4 ? brand : rivals[i % rivals.length]]),
          },
          {
            heading: "Where you're losing the answer",
            kind: "cards",
            items: [
              { title: "No extractable answer block", badge: "High impact", tone: "danger", text: "Assistants quote short, self-contained answers. Your category pages explain things across several paragraphs with no 40–60 word summary to lift out." },
              { title: "Missing structured data", badge: "High impact", tone: "danger", text: "No FAQPage or Organization schema was found, so there is nothing machine-readable tying your answers to your brand name." },
              { title: "Thin comparison content", badge: "Medium", tone: "warning", text: `Comparison prompts are answered using third-party listicles. You have no page that compares ${brand} against ${rivals.join(", ")} on the same criteria.` },
              { title: "Few citable facts", badge: "Medium", tone: "warning", text: "Pages state claims without numbers, dates or sources. Assistants prefer pages that can be quoted verbatim with a figure attached." },
            ],
          },
          {
            heading: "Fix list, in order",
            kind: "checklist",
            items: [
              "Add a 40–60 word direct answer at the top of every category and pricing page.",
              "Publish an FAQ block with FAQPage schema on the 6 pages that match the prompts above.",
              `Create one comparison page covering ${brand} and ${rivals.join(", ")} on identical criteria.`,
              "Add Organization schema with your legal name, founding year and support contact.",
              "Put real numbers on pricing pages — fees, ranges, timelines — and date-stamp them.",
              "Keep an answer log: re-run this check monthly and track which prompts start naming you.",
            ],
          },
          {
            heading: "Suggested answer block for your top prompt",
            kind: "text",
            text: `Q: What is the best ${category} in ${v.market}?\n\n${brand} is a ${category.replace(/s$/, "")} option in ${v.market} aimed at first-time users. It is worth shortlisting if you want transparent charges and a short approval window; compare it against ${rivals.join(", ")} on fees, approval time and customer support before deciding.\n\n(Keep this under 60 words, place it directly under the H1, and repeat the key facts in an FAQ block below.)`,
          },
        ],
      };
    },
  },

  {
    slug: "competitors",
    icon: Compass,
    navLabel: "Competitor Intelligence",
    navDescription: "Messaging and positioning",
    title: "AI Competitor & Market Intelligence",
    description: "Analyse competitor websites, messaging and positioning side by side, and find the gap you can own.",
    fileName: "competitor-intelligence",
    runLabel: "Analyse competitors",
    note: "Competitor findings are generated sample analysis, not a live crawl of the sites you enter.",
    steps: ["Reading competitor sites", "Extracting messaging and positioning", "Comparing offers and proof points", "Finding positioning gaps", "Writing the brief"],
    fields: [
      { name: "brand", label: "Your brand or website", required: true, placeholder: "example.com" },
      { name: "rivals", label: "Competitors", required: true, placeholder: "rival1.com, rival2.com, rival3.com", hint: "Up to four, comma separated." },
      { name: "category", label: "Category", placeholder: "e.g. instant personal loan apps" },
      { name: "focus", label: "What to focus on", type: "select", defaultValue: "Positioning & messaging", options: ["Positioning & messaging", "Pricing & packaging", "Content & SEO", "Product features"] },
    ],
    run: (v) => {
      const brand = brandName(v.brand);
      const rivals = String(v.rivals).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4).map(brandName);
      const angles = ["Speed", "Low cost", "Trust and compliance", "Breadth of features"];
      const proof = ["Customer logos", "Review scores", "Press mentions", "Certifications"];
      return {
        title: `Competitive brief: ${brand} vs ${rivals.join(", ")}`,
        summary: [
          { label: "Competitors", value: rivals.length, sub: "Analysed" },
          { label: "Positioning gaps", value: 3, sub: "Open angles" },
          { label: "Shared claims", value: 2, sub: "Everyone says these" },
          { label: "Focus", value: v.focus.split(" ")[0], sub: v.focus },
        ],
        sections: [
          {
            heading: "Positioning map",
            kind: "table",
            columns: ["Brand", "Lead message", "Primary angle", "Proof shown", "Main CTA"],
            rows: [[brand, "Not clearly stated on the homepage", "Mixed", "Few", "Sign up"]].concat(
              rivals.map((r, i) => [
                r,
                `"The ${angles[i % angles.length].toLowerCase()} choice for ${v.category || "your category"}"`,
                angles[i % angles.length],
                proof[i % proof.length],
                i % 2 ? "Book a demo" : "Get started free",
              ])
            ),
          },
          {
            heading: "What everyone is saying",
            kind: "list",
            items: [
              { title: '"Fast and simple"', badge: `Used by ${rivals.length} of ${rivals.length + 1}`, tone: "warning", text: "Speed claims are now table stakes in this category. Leading with speed makes you sound like everyone else." },
              { title: '"Trusted by thousands"', badge: "Unverified", tone: "warning", text: "Most sites make this claim without a number, a logo wall or a source. A specific, checkable figure beats a bigger vague one." },
            ],
          },
          {
            heading: "Gaps you can own",
            kind: "cards",
            items: [
              { title: "Total cost transparency", badge: "Open", tone: "success", text: "No competitor publishes a full fee breakdown above the fold. A clear, dated charges table would differentiate immediately." },
              { title: "The after-sale experience", badge: "Open", tone: "success", text: "Everyone sells the first transaction; nobody talks about support, disputes or what happens when something goes wrong. That is where trust is decided." },
              { title: "A named, specific audience", badge: "Open", tone: "success", text: "All of them position to 'everyone'. Naming one audience — and showing you understand its constraints — converts far better." },
            ],
          },
          {
            heading: "Suggested positioning statement",
            kind: "text",
            text: `For [specific audience] who need [job to be done], ${brand} is the ${v.category || "product"} that [single differentiated promise].\n\nUnlike ${rivals.join(", ")}, which lead on ${angles.slice(0, rivals.length).map((x) => x.toLowerCase()).join(" and ")}, ${brand} proves it with [specific, checkable evidence].\n\nHomepage test: a visitor should be able to repeat your promise back after five seconds. Right now, none of the sites in this analysis pass that test.`,
          },
          {
            heading: "Next moves",
            kind: "checklist",
            items: [
              "Rewrite the homepage hero around one promise, not three.",
              "Publish the fee breakdown competitors are hiding.",
              "Add three specific proof points with numbers and dates.",
              "Build the comparison page before competitors build theirs.",
              "Re-run this analysis quarterly and track message drift.",
            ],
          },
        ],
      };
    },
  },
];
