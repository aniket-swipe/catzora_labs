import { useMemo, useState } from "react";
import { Check, Circle, Copy, Download, Loader2, Save, Sparkles } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  DemoBadge,
  DemoNote,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Stat,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { ResultSection } from "./ResultSections.jsx";
import { resultToMarkdown } from "./markdown.js";
import { useStore } from "../../store/AppStore.jsx";
import { copyText } from "../../lib/clipboard.js";
import { downloadText } from "../../lib/download.js";
import { sleep } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

/**
 * The generator-tool shell used by most tools across all five studios.
 *
 * A tool supplies: fields (the form), steps (the progress trace), and run(values)
 * which returns { title, summary[], sections[] }. Everything else — layout,
 * validation, progress, copy/download/save — is handled here, so a new tool is
 * a config object rather than a new page.
 */
export function ToolPage({ tool, studio }) {
  const toast = useToast();
  const { saveDraft, log, touchProject } = useStore();

  const [values, setValues] = useState(() =>
    Object.fromEntries(tool.fields.map((f) => [f.name, f.defaultValue ?? ""]))
  );
  const [busy, setBusy] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);

  const setValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const ready = tool.fields
    .filter((f) => f.required)
    .every((f) => String(values[f.name] ?? "").trim().length > 0);

  const markdown = useMemo(
    () => (result ? resultToMarkdown(tool.title, result) : ""),
    [result, tool.title]
  );

  async function run() {
    setBusy(true);
    setResult(null);
    for (let i = 0; i < tool.steps.length; i += 1) {
      setStepIndex(i);
      await sleep(420);
    }
    const next = tool.run(values);
    setResult(next);
    setBusy(false);
    log(studio.key, `${tool.title} — ${next.title || "generated a result"}`);
    touchProject(next.title || tool.title, tool.title, studio.key);
    toast({
      kind: "success",
      title: "Generated",
      body: "Sample output — no live AI service is connected.",
    });
  }

  async function onCopy() {
    const ok = await copyText(markdown);
    toast(ok ? { kind: "success", title: "Copied to clipboard" } : { kind: "error", title: "Copy failed" });
  }

  function onDownload() {
    downloadText(`${tool.fileName || tool.slug}.md`, markdown);
    toast({ kind: "success", title: "Downloaded" });
  }

  function onSaveDraft() {
    saveDraft({
      title: result.title || tool.title,
      studio: studio.key,
      tool: tool.title,
      content: markdown,
    });
    toast({ kind: "success", title: "Saved to drafts", body: "Find it in Projects & History." });
  }

  return (
    <>
      <PageHeader
        studio={studio.key}
        title={tool.title}
        description={tool.description}
        badge={<DemoBadge label="Sample output" />}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader title="Set it up" description="Fill this in, then run the tool." />
          <div className="space-y-4 px-5 py-4">
            {tool.fields.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                hint={field.hint}
                optional={!field.required}
                htmlFor={`field-${field.name}`}
              >
                {field.type === "textarea" ? (
                  <Textarea
                    id={`field-${field.name}`}
                    rows={field.rows || 4}
                    value={values[field.name]}
                    placeholder={field.placeholder}
                    onChange={(e) => setValue(field.name, e.target.value)}
                  />
                ) : field.type === "select" ? (
                  <Select
                    id={`field-${field.name}`}
                    value={values[field.name]}
                    options={field.options}
                    onChange={(e) => setValue(field.name, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`field-${field.name}`}
                    value={values[field.name]}
                    placeholder={field.placeholder}
                    onChange={(e) => setValue(field.name, e.target.value)}
                  />
                )}
              </Field>
            ))}

            {tool.note ? <DemoNote>{tool.note}</DemoNote> : null}

            <Button
              variant="primary"
              className="w-full justify-center"
              icon={Sparkles}
              loading={busy}
              disabled={!ready}
              onClick={run}
            >
              {busy ? "Working…" : tool.runLabel || "Generate"}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Result"
            description={result ? result.title : "Nothing generated yet"}
            action={
              result ? (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" icon={Copy} onClick={onCopy}>
                    Copy
                  </Button>
                  <Button size="sm" variant="ghost" icon={Download} onClick={onDownload}>
                    Download
                  </Button>
                  <Button size="sm" variant="secondary" icon={Save} onClick={onSaveDraft}>
                    Save draft
                  </Button>
                </div>
              ) : null
            }
          />

          {busy ? (
            <div className="px-5 py-6">
              <ul className="space-y-2.5">
                {tool.steps.map((step, i) => (
                  <li
                    key={step}
                    className={cx(
                      "flex items-center gap-2.5 text-[13px]",
                      i < stepIndex ? "text-muted" : i === stepIndex ? "text-ink" : "text-faint"
                    )}
                  >
                    {i < stepIndex ? (
                      <Check className="h-4 w-4 text-success" aria-hidden />
                    ) : i === stepIndex ? (
                      <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
                    ) : (
                      <Circle className="h-4 w-4" aria-hidden />
                    )}
                    {step}
                  </li>
                ))}
              </ul>
              <Skeleton className="mt-5 h-32 w-full" />
            </div>
          ) : result ? (
            <div className="divide-y divide-line">
              {result.summary?.length ? (
                <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4">
                  {result.summary.map((metric) => (
                    <Stat
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      sub={metric.sub}
                      tone={studio.key}
                    />
                  ))}
                </div>
              ) : null}
              {(result.sections || []).map((section, i) => (
                <ResultSection key={i} section={section} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Run the tool to see a result"
              description="Everything here is sample output built from what you type — nothing is sent anywhere."
            />
          )}
        </Card>
      </div>
    </>
  );
}
