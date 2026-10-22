import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Columns3, Search, Table2 } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DataTable,
  DemoBadge,
  Input,
  PageHeader,
  ProgressBar,
  Select,
  Tabs,
  useToast,
} from "../../components/ui/index.js";
import { CandidateDrawer } from "./CandidateDrawer.jsx";
import { useStore } from "../../store/AppStore.jsx";
import { PIPELINE_STAGES, STAGE_TONES, nextStage, skillMatch } from "./stages.js";
import { relativeTime } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

export function AtsBoardPage() {
  const toast = useToast();
  const { candidates, jobs, moveCandidate } = useStore();
  const [params, setParams] = useSearchParams();
  const jobFilter = params.get("job") ?? "All";
  const [view, setView] = useState("board");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const jobOf = (c) => jobs.find((j) => j.id === c.jobId);

  const visible = useMemo(
    () =>
      candidates.filter(
        (c) => (jobFilter === "All" || c.jobId === jobFilter) && (!query || c.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [candidates, jobFilter, query]
  );

  function move(id, stage) {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate || candidate.stage === stage) return;
    moveCandidate(id, stage);
    toast({ kind: "success", title: `${candidate.name} moved to ${stage}`, body: "Logged in their history." });
  }

  return (
    <>
      <PageHeader
        studio="hire"
        title="Applicant Tracking"
        description="Move applicants from application to hire. Every change is logged on the candidate's history and the activity feed."
        badge={<DemoBadge />}
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <Tabs
          className="border-0"
          value={view}
          onChange={setView}
          tabs={[
            { value: "board", label: <span className="inline-flex items-center gap-1.5"><Columns3 className="h-4 w-4" aria-hidden />Pipeline</span> },
            { value: "table", label: <span className="inline-flex items-center gap-1.5"><Table2 className="h-4 w-4" aria-hidden />Table</span> },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            aria-label="Filter by role"
            className="sm:w-56"
            value={jobFilter}
            options={[{ value: "All", label: "All roles" }, ...jobs.map((j) => ({ value: j.id, label: j.title }))]}
            onChange={(e) => setParams(e.target.value === "All" ? {} : { job: e.target.value })}
          />
          <div className="relative sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
            <Input aria-label="Search applicants" value={query} placeholder="Search applicants" className="pl-9" onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {view === "board" ? (
        <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          <p className="mb-2 text-[12px] text-faint">Drag cards between stages, use the stage menu, or the arrow to move one stage forward.</p>
          <div className="flex gap-3" style={{ minWidth: PIPELINE_STAGES.length * 236 }}>
            {PIPELINE_STAGES.map((stage) => {
              const column = visible.filter((c) => c.stage === stage);
              return (
                <section
                  key={stage}
                  aria-label={`${stage}, ${column.length} applicants`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTarget(stage);
                  }}
                  onDragLeave={() => setDropTarget((s) => (s === stage ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragging) move(dragging, stage);
                    setDragging(null);
                    setDropTarget(null);
                  }}
                  className={cx(
                    "flex w-[224px] shrink-0 flex-col rounded-lg bg-sunken/70 p-2 transition-colors",
                    dropTarget === stage && "bg-hire-soft ring-2 ring-hire/40"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <Badge tone={STAGE_TONES[stage]} dot>
                      {stage}
                    </Badge>
                    <span className="text-[11.5px] tabular-nums text-faint">{column.length}</span>
                  </div>
                  <ul className="flex-1 space-y-2">
                    {column.map((c) => {
                      const job = jobOf(c);
                      const forward = nextStage(c.stage);
                      return (
                        <li
                          key={c.id}
                          draggable
                          onDragStart={() => setDragging(c.id)}
                          onDragEnd={() => {
                            setDragging(null);
                            setDropTarget(null);
                          }}
                          className={cx(
                            "cursor-grab rounded-md border border-line bg-surface p-3 shadow-card active:cursor-grabbing",
                            dragging === c.id && "opacity-50"
                          )}
                        >
                          <button onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-2 text-left">
                            <Avatar name={c.name} size="sm" />
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-medium text-ink hover:text-accent">{c.name}</span>
                              <span className="block truncate text-[11px] text-faint">{job?.title ?? c.role}</span>
                            </span>
                          </button>
                          <div className="mt-2 flex items-center gap-2">
                            <ProgressBar tone="hire" value={skillMatch(c, job).pct} label="Skill match" />
                            <span className="text-[11px] tabular-nums text-muted">{skillMatch(c, job).pct}%</span>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5">
                            <select
                              aria-label={`Move ${c.name} to stage`}
                              value={c.stage}
                              onChange={(e) => move(c.id, e.target.value)}
                              className="min-w-0 flex-1 rounded border border-line bg-sunken px-1.5 py-0.5 text-[11px] text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
                            >
                              {PIPELINE_STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            {forward ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                icon={ChevronRight}
                                aria-label={`Move ${c.name} forward a stage`}
                                title={`Move to ${forward}`}
                                onClick={() => move(c.id, forward)}
                              />
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-[10.5px] text-faint">Applied {relativeTime(c.appliedAt)}</p>
                        </li>
                      );
                    })}
                    {column.length === 0 ? (
                      <li className="rounded-md border border-dashed border-line px-2 py-6 text-center text-[11px] text-faint">Drop here</li>
                    ) : null}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <DataTable
            rows={visible}
            getRowKey={(c) => c.id}
            minWidth={820}
            columns={[
              {
                key: "name",
                header: "Applicant",
                render: (c) => (
                  <button onClick={() => setOpenId(c.id)} className="flex items-center gap-2.5 text-left font-medium text-ink hover:text-accent">
                    <Avatar name={c.name} size="sm" />
                    {c.name}
                  </button>
                ),
              },
              { key: "role", header: "Role", render: (c) => jobOf(c)?.title ?? c.role },
              { key: "match", header: "Match", width: 90, render: (c) => `${skillMatch(c, jobOf(c)).pct}%` },
              {
                key: "assessment",
                header: "Assessment",
                width: 140,
                render: (c) => `${c.assessment}${c.assessmentScore !== undefined ? ` (${c.assessmentScore}%)` : ""}`,
              },
              {
                key: "stage",
                header: "Stage",
                width: 170,
                render: (c) => (
                  <Select
                    aria-label={`Change stage for ${c.name}`}
                    className="h-8 text-xs"
                    value={c.stage}
                    options={PIPELINE_STAGES}
                    onChange={(e) => move(c.id, e.target.value)}
                  />
                ),
              },
              {
                key: "last",
                header: "Last update",
                render: (c) => {
                  const last = c.history?.at(-1);
                  return <span className="text-[12px]">{last ? `${last.text} · ${relativeTime(last.at)}` : "—"}</span>;
                },
              },
            ]}
          />
        </Card>
      )}

      <CandidateDrawer candidateId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
