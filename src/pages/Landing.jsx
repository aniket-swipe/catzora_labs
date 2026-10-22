import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { studios } from "../features/studios.js";
import { Badge } from "../components/ui/index.js";
import { cx } from "../lib/cx.js";

const ICON_CHIP = {
  create: "bg-create-soft text-create",
  grow: "bg-grow-soft text-grow",
  hire: "bg-hire-soft text-hire",
  automate: "bg-automate-soft text-automate",
  support: "bg-support-soft text-support",
};

const STEPS = [
  { title: "Pick a studio", text: "Five studios cover content, marketing, hiring, automation and support. Start where the work already is." },
  { title: "Describe the job", text: "Every tool asks for a short brief rather than a prompt. Specific inputs, predictable outputs." },
  { title: "Keep what's useful", text: "Copy it, download it as Markdown, or save it to the workspace and come back to it later." },
];

const FAQS = [
  { q: "Is this connected to a real AI model?", a: "No. This build is a product demo: every result is generated locally from what you type, so the interface and the flow are real but the intelligence is not." },
  { q: "Where is my data stored?", a: "In your browser's local storage, and nowhere else. Resetting the workspace in Settings clears it." },
  { q: "Can I use this as a starting point?", a: "Yes. It is a standard Vite + React + Tailwind project. The tool framework is config-driven, so adding a tool is a config object rather than a new page." },
  { q: "Why five studios?", a: "They map to the five places most teams repeat work: producing content, marketing it, hiring for it, automating around it, and supporting the people who buy it." },
];

export function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const toolCount = studios.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-[13px] font-bold text-white">C</span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">Catzora Labs</span>
          <nav className="ml-auto hidden items-center gap-6 text-[13px] text-muted md:flex">
            <a href="#studios" className="hover:text-ink">Studios</a>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
          <Link
            to="/app"
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3.5 text-sm font-medium text-white hover:bg-accent/90 md:ml-4"
          >
            Open the platform
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <Badge tone="accent">Demo build · {toolCount} tools across {studios.length} studios</Badge>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          One AI platform.
          <br />
          Five studios that actually ship work.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted">
          Create content, market it, hire for it, automate around it and support the people who buy it — in one
          workspace, with the same design system and the same way of working throughout.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/app"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-[15px] font-medium text-white hover:bg-accent/90"
          >
            Explore the platform
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href="#studios"
            className="inline-flex h-11 items-center rounded-md border border-line bg-surface px-5 text-[15px] font-medium text-ink hover:bg-sunken"
          >
            See the studios
          </a>
        </div>
      </section>

      <section id="studios" className="border-t border-line bg-surface/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">The five studios</h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-7 text-muted">
            Each studio is a set of tools around one job. They share a workspace, so output from one is available to the
            next.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <Link key={studio.key} to={studio.base} className="card group p-6 transition-shadow hover:shadow-lift">
                <span className={cx("grid h-10 w-10 place-items-center rounded-md", ICON_CHIP[studio.key])}>
                  <studio.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 flex items-center gap-1.5 text-[17px] font-semibold text-ink">
                  {studio.title}
                  <ArrowRight className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5" aria-hidden />
                </h3>
                <p className="text-[12.5px] text-faint">{studio.tagline}</p>
                <p className="mt-2 text-[13.5px] leading-6 text-muted">{studio.description}</p>
                <p className="mt-3 text-[12.5px] text-faint">{studio.items.length} tools</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-[13px] font-semibold text-accent">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-[13.5px] leading-6 text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What's actually built</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              `${toolCount} tools across ${studios.length} studios`,
              "A shared design system with light and dark themes",
              "A config-driven tool framework",
              "Workflow builder with reorderable steps",
              "Ticket triage and a support chatbot",
              "Workspace state persisted in the browser",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-6 text-muted">
                <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Questions</h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {FAQS.map((faq, i) => (
              <li key={faq.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center gap-3 py-4 text-left text-[14px] font-medium text-ink"
                >
                  {faq.q}
                  <ChevronDown
                    className={cx("ml-auto h-4 w-4 shrink-0 text-faint transition-transform", openFaq === i && "rotate-180")}
                    aria-hidden
                  />
                </button>
                {openFaq === i ? <p className="pb-4 text-[13.5px] leading-7 text-muted">{faq.a}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 text-[13px] text-muted">
          <span className="grid h-6 w-6 place-items-center rounded bg-accent text-[11px] font-bold text-white">C</span>
          Catzora Labs — demo build. No AI service is connected; all output is generated locally.
          <Link to="/app" className="ml-auto font-medium text-accent hover:underline">
            Open the platform
          </Link>
        </div>
      </footer>
    </div>
  );
}
