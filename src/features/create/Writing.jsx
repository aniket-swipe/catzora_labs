import { useMemo, useState } from "react";
import { Copy, Download, PenLine, RefreshCw, Save, Sparkles } from "lucide-react";
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
  StepProgress,
  Tabs,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { writeCopy } from "./generators.js";
import { TEXT_MODELS, modelLabel } from "./constants.js";
import { copyText } from "../../lib/clipboard.js";
import { downloadText } from "../../lib/download.js";
import { relativeTime } from "../../lib/format.js";

const STEPS = ["Reading the brief", "Choosing an angle", "Drafting three variants", "Tightening the language", "Adding the call to action"];

const TYPES = ["Ad copy", "Email", "Landing page section", "Social caption", "Long-form article"];
const TONES = ["Professional", "Friendly", "Direct", "Playful"];
const LENGTHS = ["Short", "Medium", "Long"];
const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Spanish", "French"];

export function WritingPage() {
  const toast = useToast();
  const { drafts, saveDraft, log, touchProject } = useStore();

  const [form, setForm] = useState({
    type: "Ad copy",
    topic: "",
    audience: "",
    tone: "Professional",
    length: "Medium",
    language: "English",
    model: "auto-text",
  });
  const [result, setResult] = useState(null);
  const [active, setActive] = useState("a");
  const [edited, setEdited] = useState({});
  const [error, setError] = useState("");

  const { busy, step, run } = useRun(STEPS);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const variant = result?.variants.find((v) => v.id === active) ?? null;
  const body = variant ? edited[variant.id] ?? variant.body : "";

  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);

  const recent = drafts.filter((d) => d.tool === "AI Writing").slice(0, 4);

  async function generate() {
    if (form.topic.trim().length < 3) {
      setError("Describe what you are writing about — at least a few words.");
      return;
    }
    setError("");
    const next = await run(() => writeCopy(form));
    if (!next) return;
    setResult(next);
    setEdited({});
    setActive("a");
    log("create", `AI Writing — ${next.title}`);
    touchProject(next.title, "AI Writing", "create");
    toast({ kind: "success", title: "Three variants ready", body: "Sample output — no model is connected." });
  }

  function markdown() {
    if (!result) return "";
    return [
      `# ${result.title}`,
      "",
      ...result.variants.flatMap((v) => [`## ${v.label}`, `_${v.angle}_`, "", edited[v.id] ?? v.body, ""]),
      "## Before publishing",
      ...result.checks.map((c) => `- [ ] ${c}`),
      "",
      "_Sample output generated in the Catzora Labs demo. No live AI service is connected._",
    ].join("\n");
  }

  return (
    <>
      <PageHeader
        studio="create"
        title="AI Writing"
        description="Ad copy, emails, landing page sections and long-form drafts — three angles on the same brief, so you can compare rather than guess."
        badge={<DemoBadge label="Sample output" />}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader title="The brief" description="What you want, and who it is for." />
          <div className="space-y-4 px-5 py-4">
            <Field label="What are you writing?" htmlFor="w-type">
              <Select id="w-type" value={form.type} options={TYPES} onChange={(e) => set("type", e.target.value)} />
            </Field>

            <Field label="Topic or offer" htmlFor="w-topic" hint={error || undefined}>
              <Input
                id="w-topic"
                value={form.topic}
                invalid={Boolean(error)}
                placeholder="e.g. Diwali offer — zero processing fee"
                onChange={(e) => set("topic", e.target.value)}
              />
            </Field>

            <Field label="Audience" htmlFor="w-audience" optional>
              <Input
                id="w-audience"
                value={form.audience}
                placeholder="e.g. salaried users aged 24–40"
                onChange={(e) => set("audience", e.target.value)}
              />
            </Field>

            <Field label="Tone">
              <SegmentedControl size="sm" label="Tone" value={form.tone} options={TONES} onChange={(v) => set("tone", v)} />
            </Field>

            <Field label="Length">
              <SegmentedControl size="sm" label="Length" value={form.length} options={LENGTHS} onChange={(v) => set("length", v)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Language" htmlFor="w-lang">
                <Select id="w-lang" value={form.language} options={LANGUAGES} onChange={(e) => set("language", e.target.value)} />
              </Field>
              <Field label="Model" htmlFor="w-model">
                <Select id="w-model" value={form.model} options={TEXT_MODELS} onChange={(e) => set("model", e.target.value)} />
              </Field>
            </div>

            <DemoNote>Copy is built from your brief on this device. Read it before it goes near a customer.</DemoNote>

            <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={generate}>
              {busy ? "Writing…" : result ? "Rewrite" : "Write it"}
            </Button>
          </div>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card className="min-w-0">
            <CardHeader
              title="Draft"
              description={result ? result.title : "Nothing written yet"}
              action={
                result && !busy ? (
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Copy}
                      onClick={async () => {
                        const ok = await copyText(body);
                        toast({ kind: ok ? "success" : "error", title: ok ? "Variant copied" : "Copy failed" });
                      }}
                    >
                      Copy
                    </Button>
                    <Button size="sm" variant="ghost" icon={Download} onClick={() => { downloadText("ai-writing.md", markdown()); toast({ kind: "success", title: "Downloaded" }); }}>
                      Download
                    </Button>
                    <Button size="sm" variant="ghost" icon={RefreshCw} onClick={generate}>
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Save}
                      onClick={() => {
                        saveDraft({ title: result.title, studio: "create", tool: "AI Writing", content: markdown() });
                        toast({ kind: "success", title: "Saved to drafts", body: "Find it in Projects & History." });
                      }}
                    >
                      Save draft
                    </Button>
                  </div>
                ) : null
              }
            />

            {busy ? (
              <div className="px-5 py-6">
                <StepProgress steps={STEPS} current={step} />
              </div>
            ) : result ? (
              <>
                <Tabs
                  className="px-3"
                  value={active}
                  onChange={setActive}
                  tabs={result.variants.map((v) => ({ value: v.id, label: v.label }))}
                />
                <div className="space-y-3 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="create">{variant.angle}</Badge>
                    <span className="text-[12px] text-faint">
                      {words} words · {body.length} characters · {modelLabel(TEXT_MODELS, form.model)}
                    </span>
                  </div>
                  <Textarea
                    aria-label={`${variant.label} draft`}
                    className="min-h-[300px] leading-7"
                    value={body}
                    onChange={(e) => setEdited((prev) => ({ ...prev, [variant.id]: e.target.value }))}
                  />
                  <p className="text-[12px] text-faint">Edit freely — copy, download and save all use what is in this box.</p>
                </div>
              </>
            ) : (
              <EmptyState
                icon={PenLine}
                title="Your draft will appear here"
                description="Fill in the brief and write it. You will get three angles on the same message, each editable."
              />
            )}
          </Card>

          {result ? (
            <div className="grid gap-5 md:grid-cols-2">
              <Card>
                <CardHeader title="How to choose" />
                <ul className="space-y-3 px-5 py-4">
                  {result.guidance.map((item) => (
                    <li key={item.title}>
                      <p className="text-[13px] font-medium text-ink">{item.title}</p>
                      <p className="text-[12.5px] leading-6 text-muted">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <CardHeader title="Before publishing" />
                <ul className="space-y-2 px-5 py-4">
                  {result.checks.map((check) => (
                    <li key={check} className="flex items-start gap-2.5 text-[13px] leading-6 text-muted">
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-create" aria-hidden />
                      {check}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : null}

          {recent.length ? (
            <Card>
              <CardHeader title="Recent writing drafts" description={`${recent.length} saved`} />
              <ul className="divide-y divide-line">
                {recent.map((draft) => (
                  <li key={draft.id} className="flex items-center gap-3 px-5 py-3">
                    <p className="min-w-0 flex-1 truncate text-[13px] text-ink">{draft.title}</p>
                    <span className="shrink-0 text-[12px] text-faint">{relativeTime(draft.createdAt)}</span>
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
