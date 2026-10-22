import { useRef, useState } from "react";
import { Download, LayoutTemplate, Save, Sparkles, Trash2 } from "lucide-react";
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
  Toggle,
  useToast,
} from "../../components/ui/index.js";
import { DesignCanvas } from "./DesignCanvas.jsx";
import { useStore } from "../../store/AppStore.jsx";
import { suggestHeadlines } from "./generators.js";
import { BRAND_COLORS, DESIGN_PRESETS } from "./constants.js";
import { downloadBlob, svgToPngBlob } from "../../lib/media.js";
import { relativeTime, sleep } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const DEFAULT_DESIGN = {
  preset: "YouTube thumbnail",
  template: "Bold",
  headline: "Plan a month of content in one afternoon",
  sub: "A practical walkthrough for small teams",
  cta: "Watch now",
  color: "#6558F5",
  dark: false,
};

export function DesignStudioPage() {
  const toast = useToast();
  const { designs, addItem, removeItem, log, touchProject } = useStore();

  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [ideas, setIdeas] = useState([]);
  const [thinking, setThinking] = useState(false);
  const canvasRef = useRef(null);

  const set = (key, value) => setDesign((prev) => ({ ...prev, [key]: value }));
  const size = DESIGN_PRESETS[design.preset];

  async function suggest() {
    setThinking(true);
    await sleep(600);
    setIdeas(suggestHeadlines(design.headline.split(" ").slice(0, 4).join(" ")));
    setThinking(false);
  }

  async function exportPng() {
    if (!canvasRef.current) return;
    try {
      const blob = await svgToPngBlob(canvasRef.current, size.w, size.h);
      downloadBlob(`${design.preset.toLowerCase().replace(/[^a-z]+/g, "-")}.png`, blob);
      log("create", `Design exported — ${design.preset}`);
      toast({ kind: "success", title: "Exported PNG", body: `${size.w}×${size.h}px` });
    } catch {
      toast({ kind: "error", title: "Export failed", body: "The browser blocked the download. Try again." });
    }
  }

  function save() {
    addItem("designs", { ...design });
    touchProject(design.headline.slice(0, 60), `Design · ${design.preset}`, "create");
    log("create", `Design saved — ${design.preset}`);
    toast({ kind: "success", title: "Saved to gallery" });
  }

  return (
    <>
      <PageHeader
        studio="create"
        title="Design Studio"
        description="Thumbnails, banners and ad creatives, sized for the placement — edit on the left, export the exact pixels on the right."
        badge={<DemoBadge label="Real PNG export" />}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(300px,360px)_1fr]">
        <Card className="h-fit">
          <CardHeader title="Canvas" description={`${size.w} × ${size.h} px`} />
          <div className="space-y-4 px-5 py-4">
            <Field label="Size preset" htmlFor="d-preset">
              <Select
                id="d-preset"
                value={design.preset}
                options={Object.keys(DESIGN_PRESETS)}
                onChange={(e) => set("preset", e.target.value)}
              />
            </Field>

            <Field label="Template">
              <SegmentedControl
                size="sm"
                label="Template"
                value={design.template}
                options={["Bold", "Split", "Minimal"]}
                onChange={(v) => set("template", v)}
              />
            </Field>

            <Field label="Headline" htmlFor="d-headline">
              <Input id="d-headline" value={design.headline} maxLength={70} onChange={(e) => set("headline", e.target.value)} />
            </Field>

            <div className="-mt-2">
              <Button size="sm" variant="subtle" icon={Sparkles} loading={thinking} onClick={suggest}>
                Suggest headlines
              </Button>
              {ideas.length ? (
                <ul className="mt-2 space-y-0.5">
                  {ideas.map((idea) => (
                    <li key={idea}>
                      <button
                        onClick={() => set("headline", idea)}
                        className="block w-full rounded-md px-2 py-1.5 text-left text-[13px] text-ink transition-colors hover:bg-sunken"
                      >
                        {idea}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <Field label="Supporting line" htmlFor="d-sub" optional>
              <Input id="d-sub" value={design.sub} maxLength={80} onChange={(e) => set("sub", e.target.value)} />
            </Field>

            <Field label="Button text" htmlFor="d-cta" optional>
              <Input id="d-cta" value={design.cta} maxLength={20} onChange={(e) => set("cta", e.target.value)} />
            </Field>

            <Field label="Brand colour">
              <div className="flex flex-wrap items-center gap-2">
                {BRAND_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${color}`}
                    aria-pressed={design.color === color}
                    onClick={() => set("color", color)}
                    className={cx(
                      "h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-shadow",
                      design.color === color ? "ring-ink" : "ring-transparent"
                    )}
                    style={{ background: color }}
                  />
                ))}
                <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-line" title="Custom colour">
                  <span className="sr-only">Custom colour</span>
                  <input
                    type="color"
                    value={design.color}
                    onChange={(e) => set("color", e.target.value)}
                    className="absolute -inset-2 h-12 w-12 cursor-pointer"
                  />
                </label>
              </div>
            </Field>

            {design.template === "Minimal" ? (
              <Toggle
                checked={design.dark}
                onChange={(v) => set("dark", v)}
                label="Dark background"
                description="Minimal only — swaps the canvas and text colours."
              />
            ) : null}
          </div>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title="Preview"
              description={`${design.preset} · exports at ${size.w}×${size.h}`}
              action={
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" icon={Save} onClick={save}>
                    Save
                  </Button>
                  <Button size="sm" variant="primary" icon={Download} onClick={exportPng}>
                    Export PNG
                  </Button>
                </div>
              }
            />
            <div className="grid place-items-center bg-sunken/50 p-5">
              <div
                className={cx(
                  "w-full overflow-hidden rounded-md shadow-lift",
                  size.h > size.w ? "max-w-[300px]" : size.h === size.w ? "max-w-[460px]" : ""
                )}
              >
                <DesignCanvas ref={canvasRef} design={design} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Gallery" description={`${designs.length} saved`} />
            {designs.length === 0 ? (
              <EmptyState
                compact
                icon={LayoutTemplate}
                title="Gallery is empty"
                description="Save a design to compare versions side by side, or reopen one to edit it."
              />
            ) : (
              <ul className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
                {designs.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setDesign({ ...DEFAULT_DESIGN, ...item })}
                      className="block w-full overflow-hidden rounded-md border border-line transition-shadow hover:shadow-lift"
                      aria-label={`Open design: ${item.headline}`}
                    >
                      <DesignCanvas design={item} />
                    </button>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-[11.5px] text-faint">
                        {item.preset} · {relativeTime(item.createdAt)}
                      </span>
                      <button
                        onClick={() => removeItem("designs", item.id)}
                        aria-label={`Delete design: ${item.headline}`}
                        className="shrink-0 text-faint transition-colors hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
