import { daysAgo } from "../lib/format.js";
import { todayKey } from "../lib/date.js";

/**
 * Seed data for the demo workspace.
 *
 * Everything in the product reads from here through AppStore, so Settings →
 * Reset workspace puts the whole thing back to a known, demo-ready state.
 * Numbers are invented — they are shaped to look plausible, not measured.
 */
export function createSeedState() {
  return {
    user: {
      name: "Aniket",
      email: "aniket@catzoralabs.com",
      role: "Workspace owner",
      company: "Catzora Labs",
    },

    // ── Shared ────────────────────────────────────────────────────────────
    projects: [
      { id: "p1", title: "Diwali offer launch — ad copy set", kind: "AI Writing", studio: "create", updatedAt: daysAgo(0, 9) },
      { id: "p2", title: "Product explainer — 30s vertical", kind: "Video", studio: "create", updatedAt: daysAgo(-1, 16) },
      { id: "p3", title: "Q4 investor update deck", kind: "Presentation", studio: "create", updatedAt: daysAgo(-2, 11) },
      { id: "p4", title: "Homepage SEO audit", kind: "SEO Audit", studio: "grow", updatedAt: daysAgo(-2, 15) },
      { id: "p5", title: "Keyword strategy — personal loans", kind: "Keyword Research", studio: "grow", updatedAt: daysAgo(-3, 10) },
      { id: "p6", title: "Backend engineer — job description", kind: "Job Description", studio: "hire", updatedAt: daysAgo(-4, 14) },
      { id: "p7", title: "Invoice intake — agent spec", kind: "Agent Spec", studio: "automate", updatedAt: daysAgo(-4, 17) },
      { id: "p8", title: "September feedback analysis", kind: "Feedback Analysis", studio: "support", updatedAt: daysAgo(-5, 12) },
    ],
    drafts: [
      {
        id: "d1",
        title: "Launch email — subject line options",
        studio: "create",
        tool: "AI Writing",
        content: "# Launch email\n\n1. Your Diwali offer is live\n2. 48 hours, then it's gone\n3. We saved you a seat",
        createdAt: daysAgo(-1, 10),
      },
      {
        id: "d2",
        title: "AI visibility — catzoralabs.com",
        studio: "grow",
        tool: "AI Search Visibility (AEO/GEO)",
        content: "# AI visibility\n\nMentioned in 3 of 8 assistant answers. Cited in 2.",
        createdAt: daysAgo(-3, 16),
      },
    ],
    activity: [
      { id: "a1", studio: "support", text: "Ticket triage classified 5 tickets", at: daysAgo(0, 9) },
      { id: "a2", studio: "automate", text: "Invoice intake ran successfully", at: daysAgo(0, 8) },
      { id: "a3", studio: "grow", text: "Keyword strategy generated for personal loans", at: daysAgo(-1, 17) },
      { id: "a4", studio: "create", text: "Ad copy set exported to Markdown", at: daysAgo(-1, 11) },
      { id: "a5", studio: "hire", text: "2 candidates moved to Interview", at: daysAgo(-2, 15) },
    ],

    // ── Create ────────────────────────────────────────────────────────────
    /** Image, video and audio generations, newest first. */
    media: [
      {
        id: "m1",
        kind: "image",
        prompt: "A woman checking her loan status on a phone, warm morning light",
        model: "auto-image",
        status: "done",
        settings: { style: "Photographic", ratio: "4:5", quality: "Standard", count: 4 },
        outputs: [{ id: "m1a", seed: 10427 }, { id: "m1b", seed: 55218 }, { id: "m1c", seed: 90113 }, { id: "m1d", seed: 31884 }],
        createdAt: daysAgo(-1, 12),
      },
      {
        id: "m2",
        kind: "video",
        prompt: "Slow push in on a desk, laptop showing a dashboard, soft daylight",
        model: "auto-video",
        status: "done",
        settings: { mode: "Text to video", duration: "10s", ratio: "16:9", style: "Cinematic" },
        outputs: [{ id: "m2a", seed: 77301 }],
        createdAt: daysAgo(-1, 16),
      },
      {
        id: "m3",
        kind: "voice",
        prompt: "Welcome to Catzora Labs. In two minutes I'll show you how to plan a month of content.",
        model: "auto-voice",
        status: "done",
        settings: { voice: "Warm narrator", language: "English", accent: "Indian", speed: "1×" },
        outputs: [{ id: "m3a", seed: 20944 }],
        createdAt: daysAgo(-2, 11),
      },
    ],
    /** Saved Design Studio canvases. */
    designs: [
      {
        id: "g1",
        preset: "YouTube thumbnail",
        template: "Bold",
        headline: "Plan a month of content in one afternoon",
        sub: "A practical walkthrough for small teams",
        cta: "Watch now",
        color: "#6558F5",
        dark: false,
        createdAt: daysAgo(-2, 14),
      },
    ],
    /** Saved presentation outlines. */
    decks: [
      {
        id: "k1",
        topic: "Q4 investor update",
        theme: "Corporate",
        audience: "Board and investors",
        slides: [
          { title: "Q4 investor update", bullets: ["Prepared for the board", "October 2025"] },
          { title: "Where we are today", bullets: ["ARR up 34% quarter on quarter", "Churn steady at 2.1%", "Two enterprise logos signed"] },
          { title: "What we need", bullets: ["Decision on the Series A timeline", "Two senior engineering hires"] },
        ],
        createdAt: daysAgo(-2, 11),
      },
    ],

    // ── Grow ──────────────────────────────────────────────────────────────
    /** Completed SEO audits, newest first. Issues carry their own resolved flag. */
    audits: [],
    /** Social posts — drafts and scheduled. */
    socialPosts: [
      {
        id: "s1",
        platform: "LinkedIn",
        format: "Post",
        status: "Scheduled",
        content:
          "Most teams underestimate how long content planning takes.\n\nWe looked at how it's handled week to week and found three things that consistently make the difference:\n\n1. A clear owner\n2. A repeatable process\n3. A short weekly review\n\nWhich of these does your team struggle with most?",
        hashtags: ["#ContentStrategy", "#Marketing", "#Leadership"],
        scheduledAt: daysAgo(1, 9, 30),
        createdAt: daysAgo(-1, 14),
      },
      {
        id: "s2",
        platform: "Instagram",
        format: "Carousel",
        status: "Scheduled",
        content: "Stuck on what to post this week? Swipe for five ideas that take ten minutes each.",
        hashtags: ["#ContentCreation", "#MarketingTips"],
        slides: [
          "5 posts you can make in 10 minutes",
          "1. The behind-the-scenes photo",
          "2. The customer question",
          "3. The before / after",
          "4. The quick tip",
          "5. The thank-you",
        ],
        scheduledAt: daysAgo(2, 18),
        createdAt: daysAgo(-1, 14),
      },
      {
        id: "s3",
        platform: "Facebook",
        format: "Post",
        status: "Draft",
        content: "Running a small business means wearing every hat. Here's how one bakery owner cut her weekly marketing time in half.",
        hashtags: ["#SmallBusiness"],
        createdAt: daysAgo(-2, 11),
      },
      {
        id: "s4",
        platform: "LinkedIn",
        format: "Post",
        status: "Scheduled",
        content: "Screening 300 applications by hand takes a recruiter about a week. What would your team do with that week back?",
        hashtags: ["#Hiring", "#HRTech"],
        scheduledAt: daysAgo(4, 10),
        createdAt: daysAgo(-1, 15),
      },
    ],
    /** Editorial pipeline — Idea → Outline → Draft → Review → Published. */
    blogPosts: [
      { id: "b1", title: "UPI autopay explained for first-time borrowers", keyword: "upi autopay", intent: "Informational", audience: "First-time borrowers", stage: "Review", date: todayKey(3), outline: null, draft: null },
      { id: "b2", title: "How to write a job description that attracts the right people", keyword: "how to write job description", intent: "Informational", audience: "HR managers", stage: "Draft", date: todayKey(6), outline: null, draft: null },
      { id: "b3", title: "Content calendar template for small teams", keyword: "content calendar template", intent: "Commercial", audience: "Marketing leads", stage: "Outline", date: todayKey(10), outline: null, draft: null },
      { id: "b4", title: "AI interviews: what candidates should expect", keyword: "ai interview tips", intent: "Informational", audience: "Job seekers", stage: "Idea", date: todayKey(14), outline: null, draft: null },
      { id: "b5", title: "10 SEO fixes you can make in an afternoon", keyword: "quick seo fixes", intent: "Informational", audience: "Founders", stage: "Published", date: todayKey(-5), outline: null, draft: null },
      { id: "b6", title: "Choosing an AI image model for ad creatives", keyword: "ai image generator for ads", intent: "Commercial", audience: "Performance marketers", stage: "Idea", date: todayKey(18), outline: null, draft: null },
    ],

    // ── Hire ──────────────────────────────────────────────────────────────
    jobs: [
      {
        id: "j1",
        title: "Backend Engineer",
        department: "Engineering",
        location: "Pune",
        workMode: "Hybrid",
        employment: "Full-time",
        experience: "2–4 years",
        status: "Active",
        skills: ["Node.js", "TypeScript", "PostgreSQL", "REST APIs", "AWS"],
        summary: "Own backend services end to end for our lending platform, from schema design to the alerts that wake someone up.",
        responsibilities: ["Design and ship REST services", "Own database schemas and migrations", "Review code and mentor juniors"],
        qualifications: ["B.E./B.Tech or equivalent experience", "Production experience with Node.js"],
        createdAt: daysAgo(-12),
      },
      {
        id: "j2",
        title: "Product Designer",
        department: "Design",
        location: "Pune",
        workMode: "Hybrid",
        employment: "Full-time",
        experience: "3–5 years",
        status: "Active",
        skills: ["Figma", "Design systems", "User research", "Prototyping"],
        summary: "Lead design for one product area and keep the design system honest as the team grows.",
        responsibilities: ["Lead end-to-end design for one product area", "Maintain the design system"],
        qualifications: ["Portfolio of shipped product work"],
        createdAt: daysAgo(-2),
      },
      {
        id: "j3",
        title: "QA Engineer",
        department: "Engineering",
        location: "Remote",
        workMode: "Remote",
        employment: "Full-time",
        experience: "1–3 years",
        status: "Active",
        skills: ["Test automation", "Playwright", "JavaScript", "CI/CD"],
        summary: "Own the automated test suites that decide whether a release ships.",
        responsibilities: ["Own end-to-end suites", "Maintain CI test pipelines"],
        qualifications: ["Experience automating web applications"],
        createdAt: daysAgo(-20),
      },
      {
        id: "j4",
        title: "Marketing Intern",
        department: "Marketing",
        location: "Mumbai",
        workMode: "On-site",
        employment: "Internship",
        experience: "0–1 years",
        status: "Paused",
        skills: ["Content writing", "Social media", "Canva"],
        summary: "Support campaigns end to end and own the social calendar with a mentor.",
        responsibilities: ["Draft social posts", "Support campaign reporting"],
        qualifications: ["Final-year student or recent graduate"],
        createdAt: daysAgo(-30),
      },
    ],
    candidates: [
      { id: "c1", name: "Priya Nair", jobId: "j1", role: "Backend Engineer", stage: "Screening", score: 82, source: "Referral", email: "priya.nair@example.com", phone: "+91 90000 00001", location: "Pune", experienceYears: 3, skills: ["Node.js", "TypeScript", "PostgreSQL", "Docker"], summary: "Backend developer with three years building payment APIs in Node.js.", assessment: "Completed", assessmentScore: 82, appliedAt: daysAgo(-9), notes: [{ id: "n1", author: "Priya (HR)", note: "Clear communicator on the screening call.", at: daysAgo(-5) }], history: [{ id: "h1", text: "Applied via Referral", at: daysAgo(-9) }, { id: "h2", text: "Moved to Screening", at: daysAgo(-6) }] },
      { id: "c2", name: "Rahul Desai", jobId: "j1", role: "Backend Engineer", stage: "Interview", score: 88, source: "LinkedIn", email: "rahul.desai@example.com", phone: "+91 90000 00002", location: "Mumbai", experienceYears: 4, skills: ["Node.js", "AWS", "MongoDB", "REST APIs"], summary: "Four years in backend roles; led an AWS migration last year.", assessment: "Assigned", appliedAt: daysAgo(-7), notes: [], history: [{ id: "h3", text: "Applied via LinkedIn", at: daysAgo(-7) }, { id: "h4", text: "Moved to Interview", at: daysAgo(-3) }] },
      { id: "c3", name: "Sana Kulkarni", jobId: "j2", role: "Product Designer", stage: "Applied", score: 74, source: "Careers page", email: "sana.k@example.com", phone: "+91 90000 00003", location: "Pune", experienceYears: 4, skills: ["Figma", "Design systems", "Prototyping"], summary: "Product designer focused on fintech onboarding flows.", assessment: "Not assigned", appliedAt: daysAgo(-2), notes: [], history: [{ id: "h5", text: "Applied via Careers page", at: daysAgo(-2) }] },
      { id: "c4", name: "Mohit Verma", jobId: "j3", role: "QA Engineer", stage: "Interview", score: 79, source: "Careers page", email: "mohit.v@example.com", phone: "+91 90000 00004", location: "Kochi", experienceYears: 2, skills: ["Playwright", "JavaScript", "CI/CD"], summary: "Two years automating regression suites for a retail app.", assessment: "Completed", assessmentScore: 76, appliedAt: daysAgo(-11), notes: [], history: [{ id: "h6", text: "Applied via Careers page", at: daysAgo(-11) }] },
      { id: "c5", name: "Dhruv Rao", jobId: "j1", role: "Backend Engineer", stage: "Offer", score: 91, source: "Referral", email: "dhruv.rao@example.com", phone: "+91 90000 00005", location: "Delhi", experienceYears: 3, skills: ["Node.js", "TypeScript", "AWS", "PostgreSQL"], summary: "Full-stack engineer leaning backend; strong on AWS.", assessment: "Completed", assessmentScore: 91, appliedAt: daysAgo(-21), notes: [{ id: "n2", author: "Rahul (Eng)", note: "Cleared the system design round comfortably.", at: daysAgo(-4) }], history: [{ id: "h7", text: "Applied via Referral", at: daysAgo(-21) }, { id: "h8", text: "Moved to Offer", at: daysAgo(-2) }] },
      { id: "c6", name: "Ritu Khanna", jobId: "j2", role: "Product Designer", stage: "Shortlisted", score: 68, source: "Job board", email: "ritu.k@example.com", phone: "+91 90000 00006", location: "Bengaluru", experienceYears: 5, skills: ["Figma", "User research"], summary: "Senior designer; previously ran research at a SaaS startup.", assessment: "Not assigned", appliedAt: daysAgo(-6), notes: [], history: [{ id: "h9", text: "Applied via Job board", at: daysAgo(-6) }] },
      { id: "c7", name: "Imran Shaikh", jobId: "j3", role: "QA Engineer", stage: "Applied", score: 71, source: "LinkedIn", email: "imran.s@example.com", phone: "+91 90000 00007", location: "Hyderabad", experienceYears: 1, skills: ["JavaScript", "Manual testing"], summary: "One year in manual QA, moving towards automation.", assessment: "Assigned", appliedAt: daysAgo(-1), notes: [], history: [{ id: "h10", text: "Applied via LinkedIn", at: daysAgo(-1) }] },
      { id: "c9", name: "Meera Iyer", jobId: "j2", role: "Product Designer", stage: "Hired", score: 88, source: "Referral", email: "meera.i@example.com", phone: "+91 90000 00009", location: "Bengaluru", experienceYears: 5, skills: ["Figma", "User research", "Design systems", "Prototyping"], summary: "Senior designer; previously led research at a SaaS startup.", assessment: "Completed", assessmentScore: 88, appliedAt: daysAgo(-35), notes: [], history: [{ id: "h13", text: "Applied via Referral", at: daysAgo(-35) }, { id: "h14", text: "Moved to Hired", at: daysAgo(-6) }] },
      { id: "c8", name: "Neha Joshi", jobId: "j1", role: "Backend Engineer", stage: "Rejected", score: 54, source: "Job board", email: "neha.j@example.com", phone: "+91 90000 00008", location: "Nagpur", experienceYears: 2, skills: ["Java", "Spring", "MySQL"], summary: "Java backend developer exploring Node.js roles.", assessment: "Completed", assessmentScore: 54, appliedAt: daysAgo(-14), notes: [], history: [{ id: "h11", text: "Applied via Job board", at: daysAgo(-14) }, { id: "h12", text: "Moved to Rejected", at: daysAgo(-5) }] },
    ],
    interviews: [
      { id: "i1", candidateId: "c2", jobId: "j1", mode: "Text", template: "Backend — technical screen", status: "Scheduled", at: daysAgo(1, 11), questions: [], rubric: null, transcript: null, scores: null, summary: null },
      { id: "i2", candidateId: "c1", jobId: "j1", mode: "Voice", template: "Backend — system design", status: "Scheduled", at: daysAgo(2, 15), questions: [], rubric: null, transcript: null, scores: null, summary: null },
      { id: "i3", candidateId: "c4", jobId: "j3", mode: "Text", template: "QA — automation screen", status: "Scheduled", at: daysAgo(3, 10, 30), questions: [], rubric: null, transcript: null, scores: null, summary: null },
      { id: "i4", candidateId: "c5", jobId: "j1", mode: "Voice", template: "Backend — system design", status: "Completed", at: daysAgo(-4, 14), questions: [], rubric: null, transcript: null, scores: null, summary: null },
    ],
    assessments: [
      {
        id: "q1",
        title: "SQL fundamentals",
        category: "Technical",
        difficulty: "Medium",
        durationMin: 20,
        passMark: 60,
        assignedTo: ["c1", "c4"],
        createdAt: daysAgo(-5),
        questions: [
          { id: "qq1", skill: "SQL", prompt: "Which clause filters rows after aggregation?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], answer: 1 },
          { id: "qq2", skill: "SQL", prompt: "Which join returns all rows from the left table?", options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"], answer: 2 },
          { id: "qq3", skill: "SQL", prompt: "What does COUNT(DISTINCT city) return?", options: ["Number of rows", "Number of unique cities", "Number of NULL cities", "The first city"], answer: 1 },
        ],
      },
      {
        id: "q2",
        title: "Logical reasoning — level 1",
        category: "Logical reasoning",
        difficulty: "Easy",
        durationMin: 15,
        passMark: 50,
        assignedTo: ["c7"],
        createdAt: daysAgo(-8),
        questions: [
          { id: "qq4", skill: "Series", prompt: "Next in the series: 2, 6, 12, 20, 30, …", options: ["38", "40", "42", "44"], answer: 2 },
          { id: "qq5", skill: "Deduction", prompt: "All designers use Figma. Sana is a designer. Therefore…", options: ["Sana uses Figma", "Sana does not use Figma", "Only Sana uses Figma", "Cannot be determined"], answer: 0 },
        ],
      },
    ],

    // ── Automate ──────────────────────────────────────────────────────────
    workflows: [
      {
        id: "wf_lead",
        name: "Inbound lead → CRM",
        trigger: "New form submission",
        status: "Live",
        runs: 412,
        success: 98,
        steps: [
          { type: "Trigger", description: "Website contact form" },
          { type: "AI step", description: "Classify intent and score the lead" },
          { type: "Condition", description: "Score is 70 or above" },
          { type: "Action", description: "Create CRM record" },
          { type: "Action", description: "Notify sales on Slack" },
        ],
      },
      {
        id: "wf_invoice",
        name: "Invoice intake",
        trigger: "Email with attachment",
        status: "Live",
        runs: 268,
        success: 94,
        steps: [
          { type: "Trigger", description: "invoices@ inbox" },
          { type: "AI step", description: "Extract vendor, amount and due date" },
          { type: "Condition", description: "Amount above ₹50,000" },
          { type: "Approval", description: "Finance head" },
          { type: "Action", description: "Push to the accounting sheet" },
        ],
      },
      {
        id: "wf_onboarding",
        name: "Customer onboarding",
        trigger: "Deal marked Won",
        status: "Paused",
        runs: 76,
        success: 91,
        steps: [
          { type: "Trigger", description: "CRM stage is Won" },
          { type: "Action", description: "Create the onboarding checklist" },
          { type: "AI step", description: "Draft the welcome email" },
          { type: "Action", description: "Schedule the kickoff call" },
        ],
      },
    ],
    runs: [
      { id: "r1", workflow: "Inbound lead → CRM", minutesAgo: 4, status: "Success", durationMs: 1840, note: "Lead scored 82 · routed to sales" },
      { id: "r2", workflow: "Invoice intake", minutesAgo: 19, status: "Success", durationMs: 3120, note: "₹18,400 · Vendor: Arya Supplies" },
      { id: "r3", workflow: "Inbound lead → CRM", minutesAgo: 42, status: "Success", durationMs: 1655, note: "Lead scored 41 · nurture list" },
      { id: "r4", workflow: "Invoice intake", minutesAgo: 96, status: "Failed", durationMs: 920, note: "Attachment unreadable (scanned PDF)" },
      { id: "r5", workflow: "Customer onboarding", minutesAgo: 140, status: "Success", durationMs: 2410, note: "Checklist created for Nexa Retail" },
      { id: "r6", workflow: "Inbound lead → CRM", minutesAgo: 210, status: "Retried", durationMs: 4300, note: "CRM timeout · succeeded on retry 2" },
    ],

    // ── Support ───────────────────────────────────────────────────────────
    tickets: [
      { id: "T-1042", subject: "Charged twice for my September plan", from: "ritu.k@example.com", body: "I was billed twice on 3 September for the same subscription. Please refund one of them.", category: null, priority: null, queue: null, sentiment: null },
      { id: "T-1043", subject: "App crashes after the latest update", from: "mohit@example.com", body: "Since version 4.2 the app closes when I open the reports tab on Android.", category: null, priority: null, queue: null, sentiment: null },
      { id: "T-1044", subject: "How do I invite my team?", from: "sana@example.com", body: "Can't find where to add teammates to my workspace.", category: null, priority: null, queue: null, sentiment: null },
      { id: "T-1045", subject: "Cancelling — this is the third time", from: "d.rao@example.com", body: "Nobody replied to my last two emails. If I don't hear back today I am cancelling.", category: null, priority: null, queue: null, sentiment: null },
      { id: "T-1046", subject: "Need GST invoice for August", from: "accounts@nexaretail.in", body: "Please share the GST invoice for the August billing cycle.", category: null, priority: null, queue: null, sentiment: null },
    ],
    escalations: [
      { id: "E-21", customer: "Nexa Retail", issue: "Payout reconciliation mismatch", tier: "Tier 2", owner: "Priya (Support Lead)", dueHours: 3, status: "Open", breached: false },
      { id: "E-22", customer: "Arya Supplies", issue: "Repeated login failures after the SSO change", tier: "Tier 3", owner: "Engineering on-call", dueHours: -1, status: "Open", breached: true },
      { id: "E-23", customer: "Dhruv Mehta", issue: "Refund not received after 9 days", tier: "Tier 2", owner: "Finance", dueHours: 6, status: "Waiting on customer", breached: false },
      { id: "E-24", customer: "Lumen Clinics", issue: "Data export request (compliance)", tier: "Tier 3", owner: "Priya (Support Lead)", dueHours: 22, status: "Resolved", breached: false },
    ],

    settings: {
      theme: "light",
      density: "comfortable",
      defaultStudio: "create",
      emailDigest: true,
      sampleBadges: true,
    },
  };
}
