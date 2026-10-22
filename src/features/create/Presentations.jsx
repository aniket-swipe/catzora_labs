import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Plus,
  Presentation,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  DemoBadge,
  EmptyState,
  Field,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  StepProgress,
  Tabs,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { buildOutline } from "./generators.js";
import { DECK_THEMES } from "./constants.js";
import { downloadText } from "../../lib/download.js";
import { relativeTime } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const STEPS = ["Reading the topic", "Choosing a structure", "Writing slide titles", "Filling in the points", "Ordering the story"];

function SlideView({ slide, index, total, theme }) {
  const t = DECK_THEMES[theme];
  const title = index === 0;
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-md border border-line"
      style={{ background: t.bg, color: t.fg }}
    >
      <div className="absolute left-[6%] top-[9%] h-[1.2%] w-[8%] rounded" style={{ background: t.accent }} />
      {title ? (
        <div className="absolute inset-x-[6%] top-[34%]">
          <p className="text-[clamp(16px,4vw,34px)] font-semibold leading-tight tracking-tight">{slide.title}</p>
          {slide.bullets.map((b) => (
            <p key={b} className="mt-1 text-[clamp(10px,1.6vw,15px)]" style={{ color: t.sub }}>
              {b}
            </p>
          ))}
        </div>
      ) : (
        <div className="absolute inset-x-[6%] top-[16%]">
          <p className="text-[clamp(14px,2.8vw,26px)] font-semibold tracking-tight">{slide.title}</p>
          <ul className="mt-[3%] space-y-[1.5%]">
            {slide.bullets.map((b) => (
              <li key={b} className="flex gap-2 text-[clamp(10px,1.7vw,16px)]">
                <span style={{ color: t.accent }}>•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <span className="absolute bottom-[5%] right-[5%] text-[clamp(8px,1.1vw,11px)]" style={{ color: t.sub }}>
        {index + 1} / {total}
      </span>
    </div>
  );
}

export function PresentationsPage() {
  const toast = useToast();
  const { decks, addItem, removeItem, log, touchProject } = useStore();

  const [form, setForm] = useState({ topic: "", purpose: "Pitch an idea", audience: "", count: "8", theme: "Corporate" });
  const [slides, setSlides] = useState([]);
  const [view, setView] = useState("outline");
  const [current, setCurrent] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const { busy, step, run } = useRun(STEPS);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function generate() {
    if (form.topic.trim().length < 3) {
      setError("Give the deck a topic.");
      return;
    }
    setError("");
    const next = await run(() => buildOutline({ ...form, count: Number(form.count) }));
    if (!next) return;
    setSlides(next);
    setCurrent(0);
    setView("outline");
    log("create", `Presentation outline — ${form.topic}`);
    touchProject(form.topic, "Presentation", "create");
    toast({ kind: "success", title: "Outline ready", body: "Edit any slide before exporting." });
  }

  function patchSlide(index, patch) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function moveSlide(index, delta) {
    setSlides((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function markdown() {
    return [
      `# ${form.topic || "Presentation"}`,
      "",
      ...slides.flatMap((s, i) => [`## Slide ${i + 1} — ${s.title}`, ...s.bullets.map((b) => `- ${b}`), ""]),
      "_Outline generated in the Catzora Labs demo. No live AI service is connected._",
    ].join("\n");
  }

  /**
   * Real .pptx export. pptxgenjs is loaded on demand so the ~400 kB library
   * stays out of the main bundle for everyone who never exports a deck.
   */
  async function exportPptx() {
    setExporting(true);
    try {
      const { default: PptxGenJS } = await import("pptxgenjs");
      const theme = DECK_THEMES[form.theme];
      const hex = (value) => value.replace("#", "");

      const deck = new PptxGenJS();
      deck.layout = "LAYOUT_WIDE";

      slides.forEach((slide, index) => {
        const page = deck.addSlide();
        page.background = { color: hex(theme.bg) };
        page.addShape("rect", { x: 0.6, y: 0.55, w: 0.9, h: 0.08, fill: { color: hex(theme.accent) }, line: { color: hex(theme.accent) } });

        if (index === 0) {
          page.addText(slide.title, { x: 0.6, y: 2.4, w: 12, h: 1.2, fontSize: 40, bold: true, color: hex(theme.fg) });
          page.addText(slide.bullets.join("\n"), { x: 0.6, y: 3.7, w: 12, h: 1.2, fontSize: 18, color: hex(theme.sub) });
        } else {
          page.addText(slide.title, { x: 0.6, y: 0.9, w: 12, h: 0.9, fontSize: 30, bold: true, color: hex(theme.fg) });
          page.addText(
            slide.bullets.map((text) => ({ text, options: { bullet: true } })),
            { x: 0.6, y: 2, w: 12, h: 4.5, fontSize: 20, color: hex(theme.fg), valign: "top", paraSpaceAfter: 8 }
          );
        }

        page.addText(`${index + 1}`, { x: 12.2, y: 6.9, w: 0.6, h: 0.3, fontSize: 10, color: hex(theme.sub), align: "right" });
      });

      await deck.writeFile({ fileName: `${(form.topic || "presentation").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pptx` });
      log("create", `Deck exported — ${form.topic}`);
      toast({ kind: "success", title: "Exported PowerPoint", body: `${slides.length} slides as a real .pptx file.` });
    } catch (error) {
      toast({ kind: "error", title: "Export failed", body: String(error.message || error) });
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader
        studio="create"
        title="Presentations"
        description="Generate an outline, edit it slide by slide, then export a real PowerPoint file."
        badge={<DemoBadge label="Real .pptx export" />}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(300px,360px)_1fr]">
        <Card className="h-fit">
          <CardHeader title="The deck" description="What it covers, and who is in the room." />
          <div className="space-y-4 px-5 py-4">
            <Field label="Topic" htmlFor="p-topic" hint={error || undefined}>
              <Input
                id="p-topic"
                value={form.topic}
                invalid={Boolean(error)}
                placeholder="e.g. Q4 growth plan"
                onChange={(e) => set("topic", e.target.value)}
              />
            </Field>

            <Field label="Purpose" htmlFor="p-purpose">
              <Select
                id="p-purpose"
                value={form.purpose}
                options={["Pitch an idea", "Report results", "Train a team", "Sales proposal", "Investor update"]}
                onChange={(e) => set("purpose", e.target.value)}
              />
            </Field>

            <Field label="Audience" htmlFor="p-audience" optional>
              <Input id="p-audience" value={form.audience} placeholder="e.g. the leadership team" onChange={(e) => set("audience", e.target.value)} />
            </Field>

            <Field label="Slides" htmlFor="p-count">
              <Select id="p-count" value={form.count} options={["5", "6", "8", "10", "12"]} onChange={(e) => set("count", e.target.value)} />
            </Field>

            <Field label="Theme">
              <SegmentedControl size="sm" label="Theme" value={form.theme} options={Object.keys(DECK_THEMES)} onChange={(v) => set("theme", v)} />
            </Field>

            <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={generate}>
              {busy ? "Building…" : slides.length ? "Regenerate outline" : "Generate outline"}
            </Button>
          </div>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card className="min-w-0">
            <CardHeader
              title={form.topic || "Your presentation"}
              description={slides.length ? `${slides.length} slides · ${form.theme}` : "No outline yet"}
              action={
                slides.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="ghost" icon={FileDown} onClick={() => downloadText("outline.md", markdown())}>
                      Markdown
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Save}
                      onClick={() => {
                        addItem("decks", { topic: form.topic, theme: form.theme, audience: form.audience, slides });
                        toast({ kind: "success", title: "Deck saved" });
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="primary" icon={Download} loading={exporting} onClick={exportPptx}>
                      Export .pptx
                    </Button>
                  </div>
                ) : null
              }
            />

            {busy ? (
              <div className="px-5 py-6">
                <StepProgress steps={STEPS} current={step} />
              </div>
            ) : slides.length ? (
              <>
                <Tabs
                  className="px-3"
                  value={view}
                  onChange={setView}
                  tabs={[
                    { value: "outline", label: "Outline" },
                    { value: "slides", label: "Slide preview" },
                  ]}
                />

                {view === "outline" ? (
                  <div className="space-y-3 px-5 py-4">
                    <ol className="space-y-3">
                      {slides.map((slide, index) => (
                        <li key={index} className="rounded-md border border-line p-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 shrink-0 text-center text-[11.5px] font-medium text-faint">{index + 1}</span>
                            <Input
                              aria-label={`Slide ${index + 1} title`}
                              className="h-8 font-medium"
                              value={slide.title}
                              onChange={(e) => patchSlide(index, { title: e.target.value })}
                            />
                            <Button size="icon" variant="ghost" icon={ArrowUp} aria-label="Move up" disabled={index === 0} onClick={() => moveSlide(index, -1)} />
                            <Button size="icon" variant="ghost" icon={ArrowDown} aria-label="Move down" disabled={index === slides.length - 1} onClick={() => moveSlide(index, 1)} />
                            <Button
                              size="icon"
                              variant="ghost"
                              icon={Trash2}
                              aria-label="Delete slide"
                              disabled={slides.length <= 1}
                              onClick={() => setSlides((prev) => prev.filter((_, i) => i !== index))}
                            />
                          </div>
                          <Textarea
                            aria-label={`Slide ${index + 1} bullet points, one per line`}
                            className="ml-8 mt-2 w-[calc(100%-2rem)] text-[13px] leading-6"
                            rows={Math.max(2, slide.bullets.length)}
                            value={slide.bullets.join("\n")}
                            onChange={(e) => patchSlide(index, { bullets: e.target.value.split("\n") })}
                          />
                        </li>
                      ))}
                    </ol>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Plus}
                      onClick={() => setSlides((prev) => [...prev, { title: "New slide", bullets: ["Point"] }])}
                    >
                      Add slide
                    </Button>
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    <SlideView slide={slides[current]} index={current} total={slides.length} theme={form.theme} />
                    <div className="mt-3 flex items-center justify-between">
                      <Button size="sm" variant="ghost" icon={ChevronLeft} disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
                        Previous
                      </Button>
                      <span className="text-[12px] text-muted">
                        Slide {current + 1} of {slides.length}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={ChevronRight}
                        className="flex-row-reverse"
                        disabled={current === slides.length - 1}
                        onClick={() => setCurrent((c) => c + 1)}
                      >
                        Next
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {slides.map((slide, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrent(index)}
                          aria-current={index === current}
                          aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                          className={cx(
                            "flex aspect-video flex-col justify-between rounded border p-1.5 text-left transition-colors",
                            index === current ? "border-accent ring-1 ring-accent" : "border-line"
                          )}
                          style={{ background: DECK_THEMES[form.theme].bg, color: DECK_THEMES[form.theme].fg }}
                        >
                          <span className="line-clamp-2 text-[9px] font-semibold leading-tight">{slide.title}</span>
                          <span className="text-[8px]" style={{ color: DECK_THEMES[form.theme].sub }}>
                            {index + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Presentation}
                title="No outline yet"
                description="Describe the deck on the left. You will get an editable outline, a slide preview, and a real .pptx export."
              />
            )}
          </Card>

          {decks.length ? (
            <Card>
              <CardHeader title="Saved decks" description={`${decks.length} saved`} />
              <ul className="divide-y divide-line">
                {decks.map((deck) => (
                  <li key={deck.id} className="flex items-center gap-3 px-5 py-3">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, topic: deck.topic, theme: deck.theme, audience: deck.audience || "" }));
                        setSlides(deck.slides);
                        setCurrent(0);
                        setView("outline");
                      }}
                    >
                      <span className="block truncate text-[13px] font-medium text-ink">{deck.topic}</span>
                      <span className="block text-[11.5px] text-faint">
                        {deck.slides.length} slides · {deck.theme} · {relativeTime(deck.createdAt)}
                      </span>
                    </button>
                    <Button size="icon" variant="ghost" icon={Trash2} aria-label={`Delete deck: ${deck.topic}`} onClick={() => removeItem("decks", deck.id)} />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
