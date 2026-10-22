import { useRef, useState } from "react";
import { Copy, Download, Image as ImageIcon, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  DemoNote,
  EmptyState,
  Field,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  Skeleton,
  StepProgress,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { PlaceholderArt } from "./Artwork.jsx";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { artDirection, imagePrompt } from "./generators.js";
import { IMAGE_MODELS, IMAGE_STYLES, RATIOS, modelLabel } from "./constants.js";
import { hash, ratioBox } from "../../lib/art.js";
import { copyText } from "../../lib/clipboard.js";
import { downloadBlob, svgToPngBlob } from "../../lib/media.js";
import { relativeTime } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const STEPS = ["Reading the subject", "Setting composition", "Choosing lighting and palette", "Writing the prompt", "Rendering variations"];

export function ImageStudioPage() {
  const toast = useToast();
  const { media, addItem, removeItem, log, touchProject } = useStore();

  const images = media.filter((m) => m.kind === "image");
  const [selectedId, setSelectedId] = useState(() => images[0]?.id ?? null);
  const [form, setForm] = useState({
    prompt: "",
    style: "Photographic",
    ratio: "4:5",
    quality: "Standard",
    count: "4",
    avoid: "",
    model: "auto-image",
  });
  const [error, setError] = useState("");
  const { busy, step, run } = useRun(STEPS);
  const svgRefs = useRef({});

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const selected = images.find((m) => m.id === selectedId) ?? images[0] ?? null;

  async function generate(source = form) {
    if (String(source.prompt).trim().length < 5) {
      setError("Describe the image in a few more words.");
      return;
    }
    setError("");
    const record = await run(() => {
      const count = Number(source.count) || 1;
      const base = `${source.prompt}|${source.style}|${source.ratio}|${Date.now()}`;
      return {
        kind: "image",
        prompt: source.prompt.trim(),
        model: source.model,
        status: "done",
        settings: {
          style: source.style,
          ratio: source.ratio,
          quality: source.quality,
          count,
          avoid: source.avoid,
        },
        outputs: Array.from({ length: count }, (_, i) => ({ id: `o${i}`, seed: hash(`${base}:${i}`) })),
      };
    });
    if (!record) return;
    const saved = addItem("media", record);
    setSelectedId(saved.id);
    log("create", `Image Studio — ${saved.prompt.slice(0, 48)}`);
    touchProject(saved.prompt.slice(0, 60), "Image", "create");
    toast({ kind: "success", title: "Variations ready", body: "Placeholders — no image model is connected." });
  }

  async function downloadOne(output) {
    const node = svgRefs.current[output.id];
    if (!node) return;
    const box = ratioBox(selected.settings.ratio);
    try {
      const blob = await svgToPngBlob(node, box.w, box.h);
      downloadBlob(`image-${output.seed}.png`, blob);
      toast({ kind: "success", title: "Saved PNG", body: `${box.w}×${box.h} placeholder.` });
    } catch {
      toast({ kind: "error", title: "Export failed", body: "The browser blocked the download." });
    }
  }

  const prompts = selected
    ? imagePrompt({
        subject: selected.prompt,
        style: selected.settings.style,
        ratio: selected.settings.ratio,
        avoid: selected.settings.avoid,
        mood: "",
      })
    : null;

  return (
    <>
      <PageHeader
        studio="create"
        title="Image Studio"
        description="Describe an image, pick a style and model, and compare variations side by side with the prompt that produced them."
        badge={<DemoBadge label="Placeholder output" />}
      />

      <div className="mb-5">
        <DemoNote>
          No image model is connected, so each result is a labelled placeholder drawn from the prompt — not a render.
          The prompt, negative prompt and art direction are real output you can take to a model that is connected.
        </DemoNote>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader title="Prompt" description="Subject, setting, mood." />
          <div className="space-y-4 px-5 py-4">
            <Field label="Describe the image" htmlFor="i-prompt" hint={error || undefined}>
              <Textarea
                id="i-prompt"
                value={form.prompt}
                invalid={Boolean(error)}
                placeholder="A cosy home office at golden hour, laptop showing a dashboard, plants on the desk"
                onChange={(e) => set("prompt", e.target.value)}
              />
            </Field>

            <Field label="Style">
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    aria-pressed={form.style === style}
                    onClick={() => set("style", style)}
                    className={cx(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      form.style === style
                        ? "border-create/40 bg-create-soft text-create"
                        : "border-line text-muted hover:text-ink"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Aspect ratio">
              <SegmentedControl size="sm" label="Aspect ratio" value={form.ratio} options={RATIOS} onChange={(v) => set("ratio", v)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quality">
                <SegmentedControl size="sm" label="Quality" value={form.quality} options={["Standard", "High"]} onChange={(v) => set("quality", v)} />
              </Field>
              <Field label="Variations" htmlFor="i-count">
                <Select id="i-count" value={form.count} options={["1", "2", "4", "6"]} onChange={(e) => set("count", e.target.value)} />
              </Field>
            </div>

            <Field label="Avoid" htmlFor="i-avoid" optional hint="Fed into the negative prompt.">
              <Input id="i-avoid" value={form.avoid} placeholder="text, clutter, stock-photo smiles" onChange={(e) => set("avoid", e.target.value)} />
            </Field>

            <Field label="Model" htmlFor="i-model">
              <Select id="i-model" value={form.model} options={IMAGE_MODELS} onChange={(e) => set("model", e.target.value)} />
            </Field>

            <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={() => generate()}>
              {busy ? "Generating…" : "Generate images"}
            </Button>
          </div>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title="Results"
              description={selected ? selected.prompt : "Nothing generated yet"}
              action={
                selected && !busy ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={RefreshCw}
                    onClick={() =>
                      generate({
                        prompt: selected.prompt,
                        ...selected.settings,
                        count: String(selected.settings.count),
                        model: selected.model,
                      })
                    }
                  >
                    Regenerate
                  </Button>
                ) : null
              }
            />

            {busy ? (
              <div className="space-y-4 px-5 py-5">
                <StepProgress steps={STEPS} current={step} />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: Number(form.count) || 1 }, (_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              </div>
            ) : selected ? (
              <div className="space-y-4 px-5 py-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="create">{modelLabel(IMAGE_MODELS, selected.model)}</Badge>
                  <Badge>{selected.settings.ratio}</Badge>
                  <Badge>{selected.settings.style}</Badge>
                  <Badge>{selected.settings.quality}</Badge>
                </div>

                <div className={cx("grid gap-3", selected.outputs.length > 1 ? "sm:grid-cols-2" : "max-w-sm")}>
                  {selected.outputs.map((output) => (
                    <figure key={output.id}>
                      <PlaceholderArt
                        ref={(node) => {
                          svgRefs.current[output.id] = node;
                        }}
                        seed={output.seed}
                        ratio={selected.settings.ratio}
                        label="Placeholder"
                      />
                      <figcaption className="mt-1.5 flex items-center justify-between">
                        <span className="text-[11.5px] text-faint">Seed {output.seed}</span>
                        <Button size="sm" variant="ghost" icon={Download} onClick={() => downloadOne(output)}>
                          PNG
                        </Button>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={ImageIcon}
                title="No images yet"
                description="Write a prompt and generate. Results appear here with the settings that produced them."
              />
            )}
          </Card>

          {prompts && !busy ? (
            <div className="grid gap-5 md:grid-cols-2">
              <Card>
                <CardHeader
                  title="Prompt"
                  action={
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Copy}
                      onClick={async () => {
                        const ok = await copyText(prompts.prompt);
                        toast({ kind: ok ? "success" : "error", title: ok ? "Prompt copied" : "Copy failed" });
                      }}
                    >
                      Copy
                    </Button>
                  }
                />
                <div className="space-y-3 px-5 py-4">
                  <p className="rounded-md bg-sunken p-3 text-[12.5px] leading-6 text-ink">{prompts.prompt}</p>
                  <div>
                    <p className="mb-1 text-[12px] font-medium text-ink">Negative prompt</p>
                    <p className="rounded-md bg-sunken p-3 text-[12.5px] leading-6 text-muted">{prompts.negative}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader title="Art direction" />
                <ul className="space-y-3 px-5 py-4">
                  {artDirection({ subject: selected.prompt, style: selected.settings.style, ratio: selected.settings.ratio }).map((item) => (
                    <li key={item.title}>
                      <p className="text-[13px] font-medium text-ink">{item.title}</p>
                      <p className="text-[12.5px] leading-6 text-muted">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : null}

          <Card>
            <CardHeader title="History" description={`${images.length} generation${images.length === 1 ? "" : "s"}`} />
            {images.length === 0 ? (
              <EmptyState compact icon={ImageIcon} title="History is empty" description="Each generation is kept here so you can return to it." />
            ) : (
              <ul className="divide-y divide-line">
                {images.map((item) => (
                  <li key={item.id} className={cx("flex items-center gap-3 px-5 py-3", item.id === selected?.id && "bg-sunken/50")}>
                    <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setSelectedId(item.id)}>
                      <PlaceholderArt seed={item.outputs[0].seed} ratio="1:1" label="" className="w-10 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] text-ink">{item.prompt}</span>
                        <span className="block text-[11.5px] text-faint">
                          {modelLabel(IMAGE_MODELS, item.model)} · {item.outputs.length} outputs · {relativeTime(item.createdAt)}
                        </span>
                      </span>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      icon={Trash2}
                      aria-label={`Delete generation: ${item.prompt.slice(0, 40)}`}
                      onClick={() => {
                        removeItem("media", item.id);
                        if (item.id === selectedId) setSelectedId(null);
                        toast({ kind: "success", title: "Removed from history" });
                      }}
                    />
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
