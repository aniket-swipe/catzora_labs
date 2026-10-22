import { useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Download, Globe, Search } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  DemoNote,
  Drawer,
  EmptyState,
  Field,
  Input,
  PageHeader,
  ProgressBar,
  ScoreRing,
  Select,
  StepProgress,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { CRAWL_STEPS, SEVERITY_TONE, auditMarkdown, buildAudit, healthScore, normaliseUrl } from "./audit.js";
import { copyText } from "../../lib/clipboard.js";
import { downloadText } from "../../lib/download.js";
import { formatDateTime } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const SEVERITIES = ["Critical", "High", "Medium", "Low"];

export function SeoAuditPage() {
  const toast = useToast();
  const { audits, addItem, updateItem, log, touchProject } = useStore();

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(() => audits[0]?.id ?? null);
  const [severity, setSeverity] = useState("All");
  const [category, setCategory] = useState("All");
  const [openIssue, setOpenIssue] = useState(null);
  const [edits, setEdits] = useState({});
  const { busy, step, run } = useRun(CRAWL_STEPS, { delay: 620 });

  const audit = audits.find((a) => a.id === selectedId) ?? audits[0] ?? null;
  const score = healthScore(audit);

  const categories = audit ? ["All", ...new Set(audit.issues.map((i) => i.category))] : ["All"];
  const visible = (audit?.issues ?? []).filter(
    (issue) => (severity === "All" || issue.severity === severity) && (category === "All" || issue.category === category)
  );
  const open = (audit?.issues ?? []).filter((i) => !i.resolved);

  async function start() {
    const origin = normaliseUrl(input);
    if (!origin) {
      setError("Enter a valid website address, like example.com");
      return;
    }
    setError("");
    const built = await run(() => buildAudit(origin));
    if (!built) return;
    const saved = addItem("audits", built, { limit: 10 });
    setSelectedId(saved.id);
    setSeverity("All");
    setCategory("All");
    log("grow", `SEO audit finished for ${new URL(origin).hostname}`);
    touchProject(`SEO audit — ${new URL(origin).hostname}`, "SEO Audit", "grow");
    toast({ kind: "success", title: "Audit complete", body: `${built.issues.length} findings. Nothing was crawled.` });
  }

  function toggleResolved(issue) {
    updateItem("audits", audit.id, (current) => ({
      issues: current.issues.map((i) => (i.id === issue.id ? { ...i, resolved: !i.resolved } : i)),
    }));
    setOpenIssue((prev) => (prev && prev.id === issue.id ? { ...prev, resolved: !prev.resolved } : prev));
    toast({ kind: "success", title: issue.resolved ? "Marked as open" : "Marked as resolved" });
  }

  return (
    <>
      <PageHeader
        studio="grow"
        title="SEO Automation"
        description="Audit a site, triage what it finds by severity, and work through the fixes with the exact markup to paste."
        badge={<DemoBadge label="Sample findings" />}
      />

      <Card className="mb-5">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
          <div className="flex-1">
            <label htmlFor="seo-url" className="sr-only">
              Website address
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
              <Input
                id="seo-url"
                value={input}
                invalid={Boolean(error)}
                disabled={busy}
                placeholder="yourwebsite.com"
                className="h-10 pl-9"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start()}
              />
            </div>
            {error ? (
              <p className="mt-1.5 text-[12px] text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <Button variant="primary" size="lg" icon={Search} loading={busy} className="h-10" onClick={start}>
            Start audit
          </Button>
        </div>
        <div className="border-t border-line px-5 py-3">
          <DemoNote>
            No page is fetched and no request leaves the browser. The findings are a fixed catalogue applied to the
            address you enter — and fixes are only ever suggested, never applied to your site.
          </DemoNote>
        </div>
      </Card>

      {busy ? (
        <Card className="mb-5 p-5">
          <p className="mb-3 text-[13px] font-medium text-ink">Auditing {normaliseUrl(input)}</p>
          <ProgressBar tone="grow" className="mb-4" value={((step + 1) / CRAWL_STEPS.length) * 100} label="Audit progress" />
          <StepProgress steps={CRAWL_STEPS} current={step} />
        </Card>
      ) : null}

      {!audit && !busy ? (
        <Card>
          <EmptyState
            icon={Search}
            title="No audits yet"
            description="Enter a website address above. You will get a health score, findings grouped by severity, and a fix for each one."
          />
        </Card>
      ) : null}

      {audit && !busy ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold text-ink">{audit.url}</h2>
              <span className="text-[12px] text-faint">
                {formatDateTime(audit.startedAt)} · {audit.pagesScanned} pages
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {audits.length > 1 ? (
                <Select
                  aria-label="Previous audits"
                  className="w-56"
                  value={audit.id}
                  onChange={(e) => setSelectedId(e.target.value)}
                  options={audits.map((a) => ({ value: a.id, label: `${new URL(a.url).hostname} · ${formatDateTime(a.startedAt)}` }))}
                />
              ) : null}
              <Button
                icon={Download}
                onClick={() => {
                  downloadText(`seo-report-${new URL(audit.url).hostname}.md`, auditMarkdown(audit));
                  toast({ kind: "success", title: "Report exported" });
                }}
              >
                Export report
              </Button>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="card col-span-2 flex items-center gap-4 p-4 md:col-span-1">
              <ScoreRing value={score} />
              <div>
                <p className="text-[13px] font-medium text-ink">Health score</p>
                <p className="text-[11.5px] text-muted">Rises as you resolve issues</p>
              </div>
            </div>
            {SEVERITIES.map((level) => {
              const count = open.filter((i) => i.severity === level).length;
              return (
                <button
                  key={level}
                  onClick={() => setSeverity((prev) => (prev === level ? "All" : level))}
                  aria-pressed={severity === level}
                  className={cx(
                    "card p-4 text-left transition-shadow hover:shadow-lift",
                    severity === level && "ring-2 ring-accent"
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-faint">{level}</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-ink">{count}</p>
                  <p className="text-[12px] text-muted">{level === "Critical" ? "Fix first" : "Open"}</p>
                </button>
              );
            })}
          </div>

          <Card>
            <CardHeader
              title="Findings"
              description={`${visible.length} shown · ${audit.issues.length - open.length} resolved`}
              action={
                <div className="flex gap-2">
                  <Select
                    aria-label="Filter by severity"
                    className="w-32"
                    value={severity}
                    options={["All", ...SEVERITIES]}
                    onChange={(e) => setSeverity(e.target.value)}
                  />
                  <Select
                    aria-label="Filter by category"
                    className="w-40"
                    value={category}
                    options={categories}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              }
            />
            {visible.length === 0 ? (
              <EmptyState compact icon={CheckCircle2} title="Nothing matches these filters" description="Clear a filter to see more findings." />
            ) : (
              <ul className="divide-y divide-line">
                {visible.map((issue) => (
                  <li key={issue.id}>
                    <button
                      onClick={() => setOpenIssue(issue)}
                      className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-sunken/50"
                    >
                      <Badge tone={SEVERITY_TONE[issue.severity]} className="mt-0.5 w-[68px] justify-center">
                        {issue.severity}
                      </Badge>
                      <span className="min-w-0 flex-1">
                        <span className={cx("block text-[13.5px] font-medium", issue.resolved ? "text-muted line-through" : "text-ink")}>
                          {issue.title}
                        </span>
                        <span className="block truncate text-[11.5px] text-faint">
                          {issue.category} · {issue.url}
                        </span>
                      </span>
                      {issue.resolved ? <Badge tone="success">Resolved</Badge> : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="mt-5 p-5">
            <h3 className="text-[14px] font-semibold text-ink">Recommended next steps</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] leading-6 text-muted">
              <li>Clear the {open.filter((i) => i.severity === "Critical").length} critical issues first — those can remove pages from search entirely.</li>
              <li>Work through the high-priority metadata and canonical problems next.</li>
              <li>Deploy, then re-run the audit to confirm each fix landed.</li>
            </ol>
          </Card>
        </>
      ) : null}

      <Drawer
        open={Boolean(openIssue)}
        onClose={() => setOpenIssue(null)}
        title={openIssue?.title ?? ""}
        description={openIssue ? `${openIssue.category} · ${openIssue.severity}` : ""}
        footer={
          openIssue ? (
            <>
              <Button variant="ghost" onClick={() => setOpenIssue(null)}>
                Close
              </Button>
              <Button variant={openIssue.resolved ? "secondary" : "primary"} onClick={() => toggleResolved(openIssue)}>
                {openIssue.resolved ? "Reopen issue" : "Mark as resolved"}
              </Button>
            </>
          ) : null
        }
      >
        {openIssue ? (
          <div className="space-y-5 p-5 text-[13px]">
            <div>
              <p className="mb-1 font-medium text-ink">Affected URL</p>
              <p className="break-all text-muted">{openIssue.url}</p>
            </div>
            <div>
              <p className="mb-1 font-medium text-ink">Why it matters</p>
              <p className="leading-6 text-muted">{openIssue.explanation}</p>
            </div>
            <div>
              <p className="mb-1 font-medium text-ink">Recommended fix</p>
              <p className="leading-6 text-ink">{openIssue.fix}</p>
            </div>
            {openIssue.current ? (
              <div>
                <p className="mb-1 font-medium text-ink">Current</p>
                <pre className="overflow-x-auto rounded-md bg-sunken p-3 font-mono text-[12px] text-danger">{openIssue.current}</pre>
              </div>
            ) : null}
            {openIssue.suggestion ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="seo-fix" className="font-medium text-ink">
                    Suggested change
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Copy}
                    onClick={async () => {
                      const ok = await copyText(edits[openIssue.id] ?? openIssue.suggestion);
                      toast({ kind: ok ? "success" : "error", title: ok ? "Fix copied" : "Copy failed" });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <Textarea
                  id="seo-fix"
                  className="font-mono text-[12px]"
                  value={edits[openIssue.id] ?? openIssue.suggestion}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [openIssue.id]: e.target.value }))}
                />
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-faint">
                  <AlertTriangle className="h-3 w-3" aria-hidden />
                  Apply this in your CMS or codebase — Catzora never changes your site.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
