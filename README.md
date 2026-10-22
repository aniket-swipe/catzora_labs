# Catzora Labs — AI Platform

A React source codebase for the Catzora Labs platform: **five studios** — Create, Grow, Hire,
Automate, Support — in one workspace, with a shared design system, 37 app routes and 33 tools.

This is written from scratch as a normal Vite + React project. It reproduces the behaviour of the
single-file HTML demo in readable, editable source.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
npm test         # jsdom smoke tests — every route, plus key interactions
```

Node 18 or newer.

---

## What's in it

### Studios

| Studio | Focus | Tools |
| --- | --- | --- |
| **Create** | Content | Writing, Image, Video, Audio, Design, Presentations |
| **Grow** | Marketing | SEO Audit, Social, Email, Blog, Keyword Research, AI Search Visibility (AEO/GEO), Competitor Intelligence |
| **Hire** | Recruitment | Job Descriptions, Candidates, Applicant Tracking, Interview Kits, Assessments, HR Tools |
| **Automate** | AI agents & workflow automation | Agent Builder, Workflow Builder, Process Automation, Document Automation, Tasks & Approvals, Scheduled Automations, Monitoring, Templates |
| **Support** | Customer experience & service automation | Chatbot, Service Copilot, Classification & Routing, Response Drafts, Knowledge Base, Onboarding, Feedback & Sentiment, Escalation Management |

Plus: landing page, dashboard, Projects & History, Settings, 404.

### Interactive pages (not generators)

- **Workflow Builder** — add, reorder and remove steps; pause or set a workflow live
- **Workflow Templates** — eight starters; "Use template" drops a draft into the builder
- **Automation Monitoring** — run log, status filters, per-workflow health
- **AI Customer Chatbot** — real conversation with confidence scores and human handover
- **Ticket Classification & Routing** — classifies the sample inbox with inspectable rules
- **Escalation Management** — tiers, SLA breaches, status changes
- **Candidates / Applicant Tracking** — a shared pipeline; moving someone on the board updates the list

---

## Project structure

```
src/
  main.jsx                   entry — providers, theme bootstrap
  App.jsx                    routes, generated from the studio registries
  index.css                  design tokens (CSS variables) + Tailwind layers

  lib/                       cx, ids, dates, clipboard, download
  store/
    AppStore.jsx             React context store, persisted to localStorage
    seed.js                  the demo workspace in one file

  components/
    ui/                      Button, Card, Badge, Input, Select, Field, Tabs,
                             SegmentedControl, Stat, EmptyState, Skeleton,
                             PageHeader, Toast
    layout/
      navigation.js          sidebar groups, derived from the studios
      Sidebar.jsx            collapsible studio groups
      AppLayout.jsx          header, sidebar, theme toggle, mobile nav
      CommandMenu.jsx        ⌘K / Ctrl-K jump-to-anything

  features/
    tool-framework/
      ToolPage.jsx           the shell every generator tool uses
      ResultSections.jsx     renders list / table / cards / checklist / text
      markdown.js            result → Markdown for copy, download and drafts
    studios.js               the five registries in one place
    studio-utils.js          toolItem() / pageItem()
    create|grow|hire|automate|support/
      tools.js               tool configs (fields, steps, run())
      index.js               the studio registry
      *.jsx                  bespoke pages for that studio

  pages/                     Landing, Dashboard, StudioHub, Projects, Settings, NotFound
tests/                       jsdom smoke tests
```

### The idea behind the structure

**Routes, nav and hub cards all come from the same registries.** `src/features/studios.js` is the
single source of truth. Adding a tool means adding one config object — its route, its sidebar entry,
its hub card and its ⌘K entry all appear automatically. A tool cannot exist in the nav without a
route, or the other way round.

**Most tools are config, not components.** A generator tool supplies `fields` (the form), `steps`
(the progress trace) and `run(values)` which returns `{ title, summary[], sections[] }`. `ToolPage`
handles layout, validation, progress, copy, download and save-to-drafts. Sections are `list`,
`table`, `cards`, `checklist` or `text`.

```js
{
  slug: "keywords",
  title: "AI Keyword Research & Content Strategy",
  fields: [{ name: "topic", label: "Seed topic", required: true }],
  steps: ["Expanding seed keywords", "Grouping into clusters"],
  run: (v) => ({ title: `Strategy for ${v.topic}`, summary: [...], sections: [...] }),
}
```

**Theming is CSS variables, not class swapping.** Tokens live on `:root` in `index.css` and are
redefined under `:root[data-theme="dark"]`; `tailwind.config.js` maps them to colour names. Every
studio has its own accent (`--create`, `--grow`, `--hire`, `--automate`, `--support`).

One constraint worth knowing: Tailwind scans source text, so class names are never built from
template strings. Where a class depends on data, there is an explicit map — see `ICON_CHIP` in
`StudioHub.jsx`. Building `` `bg-${studio.key}` `` would compile and then silently render unstyled.

---

## State

`AppStore.jsx` is a React context store persisted to `localStorage` under `catzora:workspace:v1`.
It holds projects, drafts, activity, candidates, workflows, runs, tickets, escalations and settings.
Loading shallow-merges over the seed, so adding a field later does not break a saved workspace.
**Settings → Reset workspace** restores the seed.

There is no backend and no AI service. Every result is generated locally in the tool's `run()` from
what you type. Each tool says so on screen.

---

## Testing

```bash
npm test
```

Builds an IIFE bundle (`vite.smoke.config.js`) and runs it inside jsdom:

- `tests/routes.cjs` — mounts all 45 routes, fails on any console error or an empty render
- `tests/interactions.cjs` — runs a generator end to end, sends a chatbot message, classifies the
  ticket inbox, adds a workflow step, moves a candidate on the ATS board

All of these pass on the code as shipped. jsdom is not a browser, so it will not catch layout or
styling problems — only crashes and wiring mistakes. Look at it in a real browser before shipping.

---

## Adding things

**A new tool in an existing studio** — add a config object to that studio's `tools.js`. Route, nav
entry, hub card and ⌘K entry follow automatically.

**A bespoke page** — write the component in the studio folder, then register it in that studio's
`index.js` with `pageItem({ slug, icon, navLabel, title, description, component })`.

**A new studio** — create `src/features/<name>/` with `tools.js` and `index.js`, add it to
`studios.js`, then add its two colour variables to `index.css` and the matching entries to
`tailwind.config.js` and the static class maps in `Sidebar.jsx`, `StudioHub.jsx` and `Dashboard.jsx`.

---

## Honest notes

- No AI model, API or integration is wired up. The tool outputs are deterministic functions of your
  input, written to look like plausible output. They are demo content, not analysis.
- Numbers in sample data (search volumes, difficulty scores, deflection rates) are invented.
- Create's image, video and audio tools produce briefs, prompts and scripts — not rendered media.
- State is per-browser. There is no account, no sync, no multi-user.
- This is a new codebase, not a decompilation. It reproduces the behaviour of the HTML demo; it is
  not byte-identical to whatever produced that bundle.
