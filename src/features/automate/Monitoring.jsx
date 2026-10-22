import { useState } from "react";
import { CheckCircle2, Clock, RotateCcw, TriangleAlert, XCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  DemoBadge,
  DemoNote,
  EmptyState,
  PageHeader,
  Stat,
  Tabs,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { minutesAgoLabel } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const STATUS_ICON = { Success: CheckCircle2, Failed: XCircle, Retried: RotateCcw };

export function MonitoringPage() {
  const { runs, workflows } = useStore();
  const [filter, setFilter] = useState("all");

  const shown = runs.filter((r) => filter === "all" || r.status.toLowerCase() === filter);
  const succeeded = runs.filter((r) => r.status === "Success").length;
  const averageMs = Math.round(runs.reduce((sum, r) => sum + r.durationMs, 0) / Math.max(runs.length, 1));

  return (
    <>
      <PageHeader
        title="Automation Monitoring"
        description="Every run, how long it took, what it produced and what failed — so a broken automation is noticed the same day."
        badge={<DemoBadge />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Runs (last 24h)" value={runs.length} sub={`${workflows.filter((w) => w.status === "Live").length} live workflows`} icon={RotateCcw} tone="automate" />
        <Stat label="Success rate" value={`${Math.round((succeeded / Math.max(runs.length, 1)) * 100)}%`} sub={`${succeeded} of ${runs.length}`} icon={CheckCircle2} tone="success" />
        <Stat label="Average duration" value={`${(averageMs / 1000).toFixed(1)}s`} sub="Across all runs" icon={Clock} tone="automate" />
        <Stat label="Needs attention" value={runs.filter((r) => r.status !== "Success").length} sub="Failed or retried" icon={TriangleAlert} tone="warning" />
      </div>

      <Tabs
        className="mb-5"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: "all", label: "All runs", count: runs.length },
          { value: "success", label: "Success", count: runs.filter((r) => r.status === "Success").length },
          { value: "failed", label: "Failed", count: runs.filter((r) => r.status === "Failed").length },
          { value: "retried", label: "Retried", count: runs.filter((r) => r.status === "Retried").length },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Run log" description={`${shown.length} runs`} />
          {shown.length === 0 ? (
            <EmptyState compact icon={CheckCircle2} title="Nothing here" description="No runs match this filter." />
          ) : (
            <ul className="divide-y divide-line">
              {shown.map((run) => {
                const Icon = STATUS_ICON[run.status] || CheckCircle2;
                return (
                  <li key={run.id} className="flex items-start gap-3 px-5 py-3">
                    <span
                      className={cx(
                        "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md",
                        run.status === "Success"
                          ? "bg-success/10 text-success"
                          : run.status === "Failed"
                            ? "bg-danger/10 text-danger"
                            : "bg-warning/10 text-warning"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-ink">
                        {run.workflow} <span className="font-normal text-muted">· {minutesAgoLabel(run.minutesAgo)}</span>
                      </p>
                      <p className="text-[13px] text-muted">{run.note}</p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted">{(run.durationMs / 1000).toFixed(1)}s</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="Health by workflow" />
          <div className="space-y-3 px-5 py-4">
            {workflows.map((w) => (
              <div key={w.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] text-ink">{w.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted">{w.success}%</span>
                </div>
                <div className="h-2 rounded-full bg-sunken">
                  <div
                    className={cx("h-2 rounded-full", w.success >= 95 ? "bg-success" : "bg-warning")}
                    style={{ width: `${w.success}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line px-5 py-4">
            <DemoNote>
              In a live workspace this view would also alert the workflow owner on consecutive failures and hold a
              30-day run history.
            </DemoNote>
          </div>
        </Card>
      </div>
    </>
  );
}
