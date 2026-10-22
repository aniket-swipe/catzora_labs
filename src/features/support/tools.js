import { Handshake, Heart, Lightbulb, MessageSquareText, SquarePen } from "lucide-react";
import { titleCase } from "../../lib/format.js";

/** Support studio — generator tools. Chatbot, triage and escalations are separate pages. */
export const supportTools = [
  {
    slug: "copilot",
    icon: MessageSquareText,
    navLabel: "Service Copilot",
    navDescription: "Agent-side draft and checks",
    title: "Customer Service Copilot",
    description: "Paste a customer message and get the agent's side: what they actually want, the facts to check, a suggested reply and what not to say.",
    fileName: "support-copilot",
    runLabel: "Help me answer this",
    note: "The copilot assists an agent — it never replies to the customer on its own.",
    steps: ["Reading the message", "Working out the real request", "Checking policy", "Drafting a reply", "Adding agent notes"],
    fields: [
      { name: "message", label: "Customer message", required: true, type: "textarea", rows: 5, placeholder: "Paste what the customer wrote…" },
      { name: "customer", label: "Customer name", placeholder: "e.g. Ritu" },
      { name: "plan", label: "Account type", type: "select", defaultValue: "Paid — monthly", options: ["Free", "Paid — monthly", "Paid — annual", "Enterprise"] },
      { name: "tone", label: "Reply tone", type: "select", defaultValue: "Warm and direct", options: ["Warm and direct", "Formal", "Apologetic", "Brief"] },
    ],
    run: (v) => {
      const message = String(v.message);
      const lower = message.toLowerCase();
      const who = v.customer ? titleCase(v.customer) : "there";
      const angry = /cancel|third time|nobody|unacceptable|furious|angry|worst|refund now/.test(lower);
      const topic = /charg|refund|invoice|bill|payment/.test(lower)
        ? "Billing"
        : /crash|bug|error|not working/.test(lower)
          ? "Technical issue"
          : /invite|team|login|password|account/.test(lower)
            ? "Account"
            : "General";
      const body =
        topic === "Billing"
          ? "I've checked the account and I can see the charge you mean. I'm raising the correction now; it takes 5–7 working days to appear back on the original payment method, and I'll email you the confirmation reference today.\n\n"
          : topic === "Technical issue"
            ? "I've logged this with our engineering team with your session details attached. In the meantime, updating to the latest version and clearing the app cache resolves it for most people — if it doesn't, reply here and I'll keep the thread open.\n\n"
            : topic === "Account"
              ? "Here's exactly where to do it: Settings → Team → Invite, add the email address and choose a role. The invite link stays valid for seven days. If the option isn't showing, you're on a member role rather than admin and I can change that for you.\n\n"
              : "I've read through what you've described and I want to make sure I solve the right thing. Here's what I understand you need, and what I can do about it today.\n\n";
      const reply =
        (v.tone === "Formal" ? `Dear ${who},\n\n` : `Hi ${who},\n\n`) +
        (angry ? "You're right to be annoyed — this should not have taken three attempts, and I'm sorry it did.\n\n" : "Thanks for writing in.\n\n") +
        body +
        (angry ? "I've also flagged this thread so it comes straight back to me rather than the general queue.\n\n" : "") +
        "If anything above isn't quite right, just reply and I'll pick it up.\n\nBest,\n[Your name]";
      return {
        title: `Copilot notes — ${topic.toLowerCase()} enquiry`,
        summary: [
          { label: "Topic", value: topic, sub: "Detected" },
          { label: "Sentiment", value: angry ? "Frustrated" : "Neutral", sub: angry ? "Handle with care" : "Standard" },
          { label: "Priority", value: angry ? "Urgent" : topic === "Technical issue" ? "High" : "Normal", sub: "Suggested" },
          { label: "Account", value: v.plan.split(" ")[0], sub: v.plan },
        ],
        sections: [
          {
            heading: "What they're actually asking for",
            kind: "list",
            items: [
              { title: "The stated request", text: message.length > 180 ? `${message.slice(0, 180)}…` : message },
              { title: "The underlying need", text: angry ? "To be taken seriously and to get a definite answer today — not another acknowledgement. Lead with the resolution, not the apology." : "A clear answer and confirmation that someone has actually looked at their specific account." },
              { title: "What would end the conversation", text: topic === "Billing" ? "A reference number and a date." : topic === "Technical issue" ? "Confirmation it's logged, plus something they can try now." : "The exact steps, in order, with no assumed knowledge." },
            ],
          },
          {
            heading: "Check before you send",
            kind: "checklist",
            items: [
              "Confirm the account email matches the one that wrote in.",
              topic === "Billing" ? "Pull the actual transaction and quote the amount and date." : "Confirm the version, device or workspace they're on.",
              "Check whether they have contacted us about this before.",
              "Make sure any date you promise is one the team can actually hit.",
              angry ? "Flag the thread so it returns to you, not the shared queue." : "Set a follow-up reminder if no reply in 48 hours.",
            ],
          },
          { heading: `Suggested reply (${v.tone.toLowerCase()})`, kind: "text", text: reply },
          {
            heading: "Don't say",
            kind: "list",
            items: [
              { title: '"As per our policy…"', text: "It reads as a refusal before the customer has heard an answer. State what you can do first, the policy second, and only if it's needed." },
              { title: '"Unfortunately…"', text: "Front-loads bad news. If the answer is no, say what you can do instead in the same sentence." },
              { title: "A time you can't commit to", text: "A missed promise costs more trust than a slower, honest estimate." },
            ],
          },
        ],
      };
    },
  },

  {
    slug: "replies",
    icon: SquarePen,
    navLabel: "Response Drafts",
    navDescription: "Three ready-to-edit replies",
    title: "Automated Response Drafts",
    description: "Generate three ready-to-edit replies for a common situation — short, standard and detailed — so agents start from a draft, not a blank box.",
    fileName: "response-drafts",
    runLabel: "Draft replies",
    note: "Drafts are for an agent to review and send. Nothing is sent automatically.",
    steps: ["Reading the situation", "Picking the structure", "Writing three versions", "Checking tone", "Adding follow-up lines"],
    fields: [
      { name: "situation", label: "Situation", required: true, placeholder: "e.g. customer was double-charged and wants a refund" },
      { name: "outcome", label: "What you can offer", type: "textarea", placeholder: "e.g. full refund of the duplicate charge in 5–7 working days" },
      { name: "channel", label: "Channel", type: "select", defaultValue: "Email", options: ["Email", "Live chat", "WhatsApp", "In-app message"] },
      { name: "tone", label: "Tone", type: "select", defaultValue: "Warm and direct", options: ["Warm and direct", "Formal", "Apologetic", "Brief"] },
    ],
    run: (v) => {
      const situation = String(v.situation).trim();
      const outcome = String(v.outcome || "sort this out for you today").trim().replace(/^I can /i, "");
      const brief = `Hi [name] — thanks for flagging this. I've looked at your account and I can ${outcome}. You'll get a confirmation by email shortly. Anything else, just reply here.`;
      const standard = `Hi [name],\n\nThanks for writing in about ${situation.toLowerCase()}.\n\nI've checked your account and here's where things stand: I can ${outcome}. I've started that now and you'll get a confirmation with a reference number by email.\n\nIf anything about this doesn't look right when it arrives, reply to this message and it'll come straight back to me.\n\nBest,\n[Your name]`;
      const detailed = standard.replace(
        "Best,\n[Your name]",
        "What happens next:\n\n1. The change is applied today and logged against your account.\n2. You'll get a confirmation email with a reference number.\n3. If it involves a payment, allow 5–7 working days for it to show on your statement — the timing there is with your bank, not us.\n\nWhy this happened: [one plain sentence, no blame, no jargon].\n\nWhat we're changing so it doesn't repeat: [one sentence — only include this if it's true].\n\nBest,\n[Your name]"
      );
      return {
        title: `Reply drafts — ${titleCase(situation)}`,
        summary: [
          { label: "Drafts", value: 3, sub: "Short, standard, detailed" },
          { label: "Channel", value: v.channel, sub: "Formatting adjusted" },
          { label: "Tone", value: v.tone.split(" ")[0], sub: v.tone },
          { label: "Review", value: "Required", sub: "Agent sends, not the bot" },
        ],
        sections: [
          { heading: "Short — for chat or a quick follow-up", kind: "text", text: brief },
          { heading: "Standard — the default", kind: "text", text: standard },
          { heading: "Detailed — when it went badly wrong", kind: "text", text: detailed },
          {
            heading: "Follow-up lines",
            kind: "list",
            items: [
              { title: "No reply after 48 hours", text: '"Just checking this landed — is there anything still outstanding on your side?"' },
              { title: "They reply unhappy", text: '"That\'s not the outcome I wanted for you either. Let me take this to [role] and come back with an answer by [time]."' },
              { title: "They reply happy", text: '"Glad that\'s sorted. If it would help anyone else on your team, I\'m happy to walk them through it too."' },
            ],
          },
          {
            heading: "Before sending",
            kind: "checklist",
            items: [
              "Replace every bracket — an unfilled [name] undoes the whole message.",
              "Check the promise matches what the team can actually deliver.",
              "Cut one sentence. These drafts are deliberately a little long.",
              `On ${v.channel.toLowerCase()}, keep paragraphs to two lines or fewer.`,
            ],
          },
        ],
      };
    },
  },

  {
    slug: "knowledge",
    icon: Lightbulb,
    navLabel: "Knowledge Base",
    navDescription: "Turn questions into articles",
    title: "Knowledge Base Assistant",
    description: "Turn a recurring question into a proper help article — answer first, steps, edge cases and the search terms customers actually use.",
    fileName: "knowledge-article",
    runLabel: "Write the article",
    note: "Articles are drafts for your help centre. Publishing is a manual step.",
    steps: ["Reading the question", "Writing the direct answer", "Laying out the steps", "Adding edge cases", "Choosing search terms"],
    fields: [
      { name: "question", label: "The question customers ask", required: true, placeholder: "e.g. How do I add someone to my workspace?" },
      { name: "answer", label: "The actual answer", type: "textarea", placeholder: "Rough notes are fine — the tool will structure them." },
      { name: "audience", label: "Written for", type: "select", defaultValue: "Any customer", options: ["Any customer", "Admins only", "Developers", "New users"] },
      { name: "frequency", label: "How often it's asked", type: "select", defaultValue: "Weekly", options: ["Daily", "Weekly", "Monthly", "Occasionally"] },
    ],
    run: (v) => {
      const question = String(v.question).trim().replace(/\?*$/, "?");
      const notes = String(v.answer || "").trim();
      return {
        title: question,
        summary: [
          { label: "Reading level", value: "Grade 7", sub: "Plain language" },
          { label: "Length", value: "~320 words", sub: "Target" },
          { label: "Audience", value: v.audience, sub: "Written for" },
          { label: "Asked", value: v.frequency, sub: "Priority to publish" },
        ],
        sections: [
          {
            heading: "Short answer (goes first, before anything else)",
            kind: "text",
            text: notes ? notes.split("\n")[0] : "Answer the question in one or two sentences here. If a reader stops after this paragraph, they should already have what they came for.",
          },
          {
            heading: "Steps",
            kind: "table",
            columns: ["Step", "What the customer does", "What they should see"],
            rows: [
              ["1", "Open the relevant screen", "The correct section is visible"],
              ["2", "Choose the action", "A form or dialog opens"],
              ["3", "Fill in the required details", "Validation passes with no errors"],
              ["4", "Confirm", "A success message, and the change is visible immediately"],
            ],
          },
          {
            heading: "If it doesn't work",
            kind: "list",
            items: [
              { title: "The option isn't showing", text: "Almost always a permissions issue. Say which role is needed and who can change it, rather than telling them to contact support." },
              { title: "It worked but nothing changed", text: "Mention caching or propagation delays explicitly, with a realistic time — vague reassurance generates a second ticket." },
              { title: "They get an error", text: "List the two or three real error messages verbatim with what each one means. Customers search for the exact string." },
            ],
          },
          {
            heading: "Search terms to include",
            kind: "list",
            items: [
              { text: "Use the customer's words in the title, not your internal product terminology." },
              { text: "Add the three or four phrasings people actually type, including the wrong ones." },
              { text: "Link to the two articles most often read just before and just after this one." },
            ],
          },
          {
            heading: "Review checklist",
            kind: "checklist",
            items: [
              "The answer appears before any explanation.",
              "No internal jargon or team names.",
              "Every screen name matches what the product actually says today.",
              "Screenshots, if any, are dated so stale ones can be spotted.",
              "Someone who has never used the product followed it successfully.",
            ],
          },
        ],
      };
    },
  },

  {
    slug: "onboarding",
    icon: Handshake,
    navLabel: "Customer Onboarding",
    navDescription: "First 30 days plan",
    title: "Customer Onboarding",
    description: "Build a first-30-days plan: welcome sequence, milestones, check-ins and the signals that say a customer is about to go quiet.",
    fileName: "customer-onboarding",
    runLabel: "Build onboarding plan",
    note: "Sequences are plans for your team to run. Nothing is scheduled or sent from this demo.",
    steps: ["Reading the product and segment", "Defining activation", "Building the day-by-day plan", "Writing the touchpoints", "Adding risk signals"],
    fields: [
      { name: "product", label: "Product or plan", required: true, placeholder: "e.g. SwipeLoan business account" },
      { name: "activation", label: "What counts as activated?", placeholder: "e.g. completed first transaction", hint: "The one action that predicts they'll stay." },
      { name: "segment", label: "Customer type", type: "select", defaultValue: "Small business", options: ["Individual", "Small business", "Mid-market", "Enterprise"] },
      { name: "touch", label: "Touch model", type: "select", defaultValue: "Low touch (email + in-app)", options: ["Self-serve (in-app only)", "Low touch (email + in-app)", "High touch (named owner)"] },
    ],
    run: (v) => {
      const activation = v.activation || "the first meaningful action in the product";
      const high = v.touch.startsWith("High");
      return {
        title: `30-day onboarding — ${titleCase(v.product)}`,
        summary: [
          { label: "Touchpoints", value: high ? 9 : 6, sub: v.touch },
          { label: "Activation target", value: "Day 7", sub: activation },
          { label: "Segment", value: v.segment, sub: "Plan tuned for this" },
          { label: "Check-ins", value: high ? 3 : 1, sub: "Human conversations" },
        ],
        sections: [
          {
            heading: "Day-by-day plan",
            kind: "table",
            columns: ["When", "Touchpoint", "Channel", "Goal"],
            rows: [
              ["Day 0", "Welcome + one next step", "Email", "Get them to open the product once"],
              ["Day 1", "Setup nudge if not started", "In-app", "Remove the first blocker"],
              ["Day 3", high ? "Kickoff call" : "Short how-to, one feature only", high ? "Call" : "Email", `Reach ${activation}`],
              ["Day 7", "Activation check", "In-app + email", "Confirm activation or diagnose why not"],
              ["Day 14", "Second-feature prompt based on usage", "In-app", "Widen usage beyond one person"],
              ["Day 21", high ? "Review call with named owner" : "Progress summary", high ? "Call" : "Email", "Surface problems before renewal matters"],
              ["Day 30", '"How is it going?" with a real reply address', "Email", "Open a conversation, not a survey"],
            ],
          },
          {
            heading: "Welcome email",
            kind: "text",
            text: `Subject: You're in — here's the one thing to do first\n\nHi [name],\n\nWelcome to ${titleCase(v.product)}.\n\nMost people get value fastest by doing one thing first: ${activation}. It takes about five minutes and everything else makes more sense afterwards.\n\n[Do that now →]\n\nIf you get stuck, reply to this email. It comes to a real person${high ? ", and [owner name] is looking after your account personally." : " on the support team."}\n\n[Your name]`,
          },
          {
            heading: "Signals someone is about to go quiet",
            kind: "list",
            items: [
              { title: "No login by day 3", text: "The strongest churn signal there is. Intervene with a person, not another automated email." },
              { title: "Only one user active by day 14", text: "Single-user accounts churn far more often. Prompt an invite with a specific reason to add someone." },
              { title: "Setup started, never finished", text: "Something blocked them and they didn't tell you. Ask what stopped them rather than resending instructions." },
              { title: "A support ticket with no reply from them", text: "Silence after a ticket often means they gave up. Follow up once, directly." },
            ],
          },
          {
            heading: "Make sure",
            kind: "checklist",
            items: [
              "Every message has exactly one call to action.",
              "Automated emails come from a monitored address someone reads.",
              "Stop the sequence the moment they activate — don't nudge people who already did it.",
              "Track activation rate by week so you can see whether changes helped.",
              high ? "The named owner is introduced by name in the first message." : "There's a clear, visible path to a human at every step.",
            ],
          },
        ],
      };
    },
  },

  {
    slug: "feedback",
    icon: Heart,
    navLabel: "Feedback & Sentiment",
    navDescription: "Themes and what to fix",
    title: "Feedback & Sentiment Analysis",
    description: "Paste raw feedback — reviews, survey replies, ticket comments — and get themes, sentiment and the two or three things worth fixing first.",
    fileName: "feedback-analysis",
    runLabel: "Analyse feedback",
    note: "Analysis is generated from the text you paste. Nothing is stored or sent.",
    steps: ["Reading the feedback", "Scoring sentiment", "Grouping into themes", "Ranking by impact", "Writing the summary"],
    fields: [
      { name: "feedback", label: "Feedback, one item per line", required: true, type: "textarea", rows: 7, placeholder: "App is fast but the fees page is confusing\nSupport took three days to reply\nLove how simple the signup was" },
      { name: "source", label: "Source", type: "select", defaultValue: "Support tickets", options: ["Support tickets", "App store reviews", "NPS survey", "Sales calls", "Mixed"] },
      { name: "period", label: "Period", placeholder: "e.g. September 2026" },
    ],
    run: (v) => {
      const items = String(v.feedback).split("\n").map((s) => s.trim()).filter(Boolean);
      const score = (text) => {
        const l = text.toLowerCase();
        const neg = (l.match(/slow|confus|bug|crash|bad|worst|hate|difficult|expensive|wait|never|poor|fail/g) || []).length;
        const pos = (l.match(/love|great|easy|fast|simple|good|excellent|helpful|smooth|clear/g) || []).length;
        return pos > neg ? "Positive" : neg > pos ? "Negative" : "Neutral";
      };
      const themeOf = (text) => {
        const l = text.toLowerCase();
        if (/fee|price|charge|cost|expensive|refund/.test(l)) return "Pricing & charges";
        if (/support|reply|respond|agent|wait|ticket/.test(l)) return "Support responsiveness";
        if (/slow|crash|bug|error|load|freeze/.test(l)) return "Reliability & speed";
        if (/confus|understand|unclear|hard to find|where/.test(l)) return "Clarity & navigation";
        if (/signup|onboard|setup|start/.test(l)) return "Getting started";
        return "Other";
      };
      const scored = items.map((text) => ({ text, sentiment: score(text) }));
      const positive = scored.filter((x) => x.sentiment === "Positive").length;
      const negative = scored.filter((x) => x.sentiment === "Negative").length;
      const themes = {};
      scored.forEach((x) => {
        const key = themeOf(x.text);
        themes[key] = themes[key] || { count: 0, negative: 0, example: x.text };
        themes[key].count += 1;
        if (x.sentiment === "Negative") themes[key].negative += 1;
      });
      const ranked = Object.entries(themes).sort((a, b) => b[1].count - a[1].count);
      const advice = {
        "Pricing & charges": "People aren't objecting to the price so much as being surprised by it. Publishing a clear charges table usually removes most of these comments without changing a single price.",
        "Support responsiveness": "Response time, not answer quality, is what people remember. Set and publish a first-reply target, and measure against it weekly.",
        "Reliability & speed": "Reliability complaints compound — each one makes the next customer less patient. Reproduce the top three reports before adding anything new.",
        "Clarity & navigation": "People can't find something that already exists. Cheapest possible fix: rename the thing to what customers call it.",
        "Getting started": "The first session decides retention. Watch five new users do it without helping them and the problem will be obvious.",
        Other: "Worth a closer read — these didn't group cleanly, which usually means they're individually specific rather than systemic.",
      };
      return {
        title: `Feedback analysis — ${v.period || v.source}`,
        summary: [
          { label: "Items analysed", value: items.length, sub: v.source },
          { label: "Positive", value: `${Math.round((positive / items.length) * 100)}%`, sub: `${positive} items` },
          { label: "Negative", value: `${Math.round((negative / items.length) * 100)}%`, sub: `${negative} items` },
          { label: "Themes found", value: ranked.length, sub: "Grouped" },
        ],
        sections: [
          {
            heading: "Themes, most common first",
            kind: "table",
            columns: ["Theme", "Mentions", "Negative", "Example"],
            rows: ranked.map(([key, data]) => [key, String(data.count), String(data.negative), data.example.length > 90 ? `${data.example.slice(0, 90)}…` : data.example]),
          },
          {
            heading: "Fix these first",
            kind: "list",
            items: ranked.slice(0, 3).map(([key, data], i) => ({
              title: `${i + 1}. ${key}`,
              badge: `${data.negative} negative`,
              tone: data.negative > data.count / 2 ? "danger" : "warning",
              text: advice[key] || advice.Other,
            })),
          },
          {
            heading: "Line-by-line sentiment",
            kind: "table",
            columns: ["Feedback", "Sentiment", "Theme"],
            rows: scored.slice(0, 15).map((x) => [x.text.length > 80 ? `${x.text.slice(0, 80)}…` : x.text, x.sentiment, themeOf(x.text)]),
          },
          {
            heading: "How to use this",
            kind: "checklist",
            items: [
              "Pick one theme, not three — a fixed theme shows up as fewer tickets next month.",
              "Reply personally to the negative items that named something specific.",
              "Share the positive quotes with the team who built that part.",
              "Re-run this with next period's feedback and compare theme counts.",
            ],
          },
        ],
      };
    },
  },
];
