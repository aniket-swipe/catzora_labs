import { useEffect, useRef, useState } from "react";
import { Film, ImagePlus, Play, Sparkles, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  DemoBadge,
  DemoNote,
  EmptyState,
  Field,
  PageHeader,
  SegmentedControl,
  Select,
  Skeleton,
  StepProgress,
  Tabs,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { PlaceholderArt } from "./Artwork.jsx";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { shotList } from "./generators.js";
import { VIDEO_MODELS, modelLabel } from "./constants.js";
import { hash } from "../../lib/art.js";
import { relativeTime } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const STEPS = ["Submitting the job", "Interpreting the prompt", "Planning the shots", "Rendering frames", "Assembling the clip"];

const STATUS_TONE = { queued: "neutral", running: "accent", done: "success", failed: "danger" };
const STATUS_LABEL = { queued: "Queued", running: "Rendering", done: "Finished", failed: "Failed" };

export function VideoStudioPage() {
  const toast = useToast();
  const { media, addItem, updateItem, removeItem, log, touchProject } = useStore();

  const videos = media.filter((m) => m.kind === "video");
  const [mode, setMode] = useState("text");
  const [selectedId, setSelectedId] = useState(() => videos[0]?.id ?? null);
  const [form, setForm] = useState({ prompt: "", duration: "10s", ratio: "16:9", style: "Cinematic", model: "auto-video" });
  const [still, setStill] = useState(null);
  const [error, setError] = useState("");
  const { busy, step, run } = useRun(STEPS, { delay: 460 });
  const stillUrl = useRef(null);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const selected = videos.find((v) => v.id === selectedId) ?? videos[0] ?? null;

  useEffect(
    () => () => {
      if (stillUrl.current) URL.revokeObjectURL(stillUrl.current);
    },
    []
  );

  function pickStill(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (stillUrl.current) URL.revokeObjectURL(stillUrl.current);
    stillUrl.current = URL.createObjectURL(file);
    setStill({ name: file.name, url: stillUrl.current });
  }

  async function submit() {
    if (form.prompt.trim().length < 5) {
      setError("Describe the shot in a few more words.");
      return;
    }
    if (mode === "image" && !still) {
      setError("Add a starting image for image-to-video.");
      return;
    }
    setError("");

    // Queue the job first so it is visible in history while it renders —
    // the status transitions are what this page is really demonstrating.
    const job = addItem("media", {
      kind: "video",
      prompt: form.prompt.trim(),
      model: form.model,
      status: "queued",
      settings: {
        mode: mode === "text" ? "Text to video" : "Image to video",
        duration: form.duration,
        ratio: form.ratio,
        style: form.style,
        still: still?.name ?? null,
      },
      outputs: [],
    });
    setSelectedId(job.id);

    const timer = setTimeout(() => updateItem("media", job.id, { status: "running" }), 500);
    await run(() => {
      clearTimeout(timer);
      updateItem("media", job.id, {
        status: "done",
        outputs: [{ id: "o0", seed: hash(`${job.prompt}:${job.id}`) }],
      });
      return true;
    });

    log("create", `Video Studio — ${job.prompt.slice(0, 48)}`);
    touchProject(job.prompt.slice(0, 60), "Video", "create");
    toast({ kind: "success", title: "Job finished", body: "Placeholder — no video was rendered." });
  }

  return (
    <>
      <PageHeader
        studio="create"
        title="Video Studio"
        description="Turn a prompt or a still into a short clip brief — with the job queue, shot list and settings a real render would need."
        badge={<DemoBadge label="Placeholder output" />}
      />

      <div className="mb-5">
        <DemoNote>
          Jobs move through real queued → rendering → finished states, but nothing is rendered: the preview is a
          labelled placeholder. The shot list and settings are the usable output.
        </DemoNote>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <Card className="h-fit">
          <Tabs
            className="px-3"
            value={mode}
            onChange={(v) => { setMode(v); setError(""); }}
            tabs={[
              { value: "text", label: "Text to video" },
              { value: "image", label: "Image to video" },
            ]}
          />
          <div className="space-y-4 px-5 py-4">
            {mode === "image" ? (
              <Field label="Starting image">
                <input id="v-still" type="file" accept="image/*" className="sr-only" onChange={pickStill} />
                {still ? (
                  <div className="flex items-center gap-3 rounded-md border border-line p-2">
                    <img src={still.url} alt="" className="h-12 w-12 rounded object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{still.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => setStill(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="v-still"
                    className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed border-line px-4 py-6 text-center transition-colors hover:bg-sunken"
                  >
                    <ImagePlus className="h-5 w-5 text-faint" aria-hidden />
                    <span className="text-[13px] font-medium text-ink">Choose an image</span>
                    <span className="text-[11.5px] text-faint">Stays on your device — nothing is uploaded.</span>
                  </label>
                )}
              </Field>
            ) : null}

            <Field label={mode === "text" ? "Prompt" : "Motion prompt"} htmlFor="v-prompt" hint={error || undefined}>
              <Textarea
                id="v-prompt"
                value={form.prompt}
                invalid={Boolean(error)}
                placeholder={
                  mode === "text"
                    ? "Slow dolly through a busy street market at dusk, warm lights"
                    : "Camera pushes in slowly; steam rises from the cup"
                }
                onChange={(e) => set("prompt", e.target.value)}
              />
            </Field>

            <Field label="Duration">
              <SegmentedControl size="sm" label="Duration" value={form.duration} options={["5s", "10s", "15s"]} onChange={(v) => set("duration", v)} />
            </Field>

            <Field label="Aspect ratio">
              <SegmentedControl size="sm" label="Aspect ratio" value={form.ratio} options={["16:9", "9:16", "1:1"]} onChange={(v) => set("ratio", v)} />
            </Field>

            <Field label="Visual style" htmlFor="v-style">
              <Select
                id="v-style"
                value={form.style}
                options={["Cinematic", "Documentary", "Animated", "Product demo", "Stop motion"]}
                onChange={(e) => set("style", e.target.value)}
              />
            </Field>

            <Field label="Model" htmlFor="v-model">
              <Select id="v-model" value={form.model} options={VIDEO_MODELS} onChange={(e) => set("model", e.target.value)} />
            </Field>

            <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={submit}>
              {busy ? "Rendering…" : "Submit video job"}
            </Button>
          </div>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Preview" description={selected?.prompt || "No job selected"} />
            <div className="px-5 py-4">
              {selected ? (
                <>
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <Badge tone={STATUS_TONE[selected.status]} dot>
                      {STATUS_LABEL[selected.status]}
                    </Badge>
                    <Badge tone="create">{modelLabel(VIDEO_MODELS, selected.model)}</Badge>
                    <Badge>{selected.settings.mode}</Badge>
                    <Badge>
                      {selected.settings.duration} · {selected.settings.ratio}
                    </Badge>
                  </div>

                  <div
                    className={cx(
                      "mx-auto",
                      selected.settings.ratio === "9:16" ? "max-w-[260px]" : selected.settings.ratio === "1:1" ? "max-w-sm" : ""
                    )}
                  >
                    {selected.status === "done" && selected.outputs[0] ? (
                      <PlaceholderArt seed={selected.outputs[0].seed} ratio={selected.settings.ratio} label="No video rendered">
                        <span className="pointer-events-none absolute inset-0 grid place-items-center">
                          <span className="grid h-12 w-12 place-items-center rounded-full bg-surface/85 text-muted shadow-card">
                            <Play className="ml-0.5 h-5 w-5" aria-hidden />
                          </span>
                        </span>
                      </PlaceholderArt>
                    ) : (
                      <Skeleton
                        className="grid w-full place-items-center"
                        style={{ aspectRatio: selected.settings.ratio.replace(":", " / ") }}
                      />
                    )}
                  </div>

                  {busy ? (
                    <div className="mt-4">
                      <StepProgress steps={STEPS} current={step} />
                    </div>
                  ) : null}
                </>
              ) : (
                <EmptyState icon={Film} title="No video job yet" description="Submit a job to watch it move through the queue." />
              )}
            </div>
          </Card>

          {selected && selected.status === "done" ? (
            <Card>
              <CardHeader title="Shot list" description={`${selected.settings.duration} · ${selected.settings.style}`} />
              <DataTable
                minWidth={520}
                getRowKey={(row) => row.time}
                columns={[
                  { key: "time", header: "Time", width: 90, render: (r) => <span className="font-medium tabular-nums text-ink">{r.time}</span> },
                  { key: "shot", header: "Shot", width: 110 },
                  { key: "camera", header: "Camera", width: 150 },
                  { key: "note", header: "Direction" },
                ]}
                rows={shotList({ prompt: selected.prompt, duration: selected.settings.duration, style: selected.settings.style })}
              />
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Job history" description={`${videos.length} job${videos.length === 1 ? "" : "s"}`} />
            {videos.length === 0 ? (
              <EmptyState compact icon={Film} title="No jobs yet" description="Every video job is listed here with its status." />
            ) : (
              <ul className="divide-y divide-line">
                {videos.map((job) => (
                  <li key={job.id} className={cx("flex items-center gap-3 px-5 py-3", job.id === selected?.id && "bg-sunken/50")}>
                    <button className="min-w-0 flex-1 text-left" onClick={() => setSelectedId(job.id)}>
                      <span className="block truncate text-[13px] text-ink">{job.prompt}</span>
                      <span className="block text-[11.5px] text-faint">
                        {job.settings.mode} · {modelLabel(VIDEO_MODELS, job.model)} · {relativeTime(job.createdAt)}
                      </span>
                    </button>
                    <Badge tone={STATUS_TONE[job.status]}>{STATUS_LABEL[job.status]}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      icon={Trash2}
                      aria-label={`Delete job: ${job.prompt.slice(0, 40)}`}
                      onClick={() => {
                        removeItem("media", job.id);
                        if (job.id === selectedId) setSelectedId(null);
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
