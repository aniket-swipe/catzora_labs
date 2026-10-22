import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, CalendarClock, ClipboardCheck, FileSignature, Mic, Plus, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, EmptyState } from "../../components/ui/index.js";
import { CandidateDrawer } from "./CandidateDrawer.jsx";
import { useStore } from "../../store/AppStore.jsx";
import { PIPELINE_STAGES, STAGE_TONES } from "./stages.js";
import { formatDateTime, relativeTime } from "../../lib/format.js";

const QUICK = [
  { to: "/app/hire/jobs?new=1", label: "Post a job", icon: Briefcase },
  { to: "/app/hire/candidates", label: "Screen candidates", icon: Users },
  { to: "/app/hire/interviews", label: "Set up an interview", icon: Mic },
  { to: "/app/hire/assessments", label: "Create an assessment", icon: ClipboardCheck },
  { to: "/app/hire/hr-tools", label: "Draft an offer letter", icon: FileSignature },
];

/** The Recruitment Dashboard — funnel, recent applications, interviews and job health. */
export function HireOverview() {
  const { candidates, jobs, interviews } = useStore();
  const [openId, setOpenId] = useState(null);

  const funnel = PIPELINE_STAGES.filter((s) => s !== "Rejected").map((stage) => ({
    stage,
    count: candidates.filter((c) => c.stage === stage).length,
  }));
  const max = Math.max(1, ...funnel.map((f) => f.count));
  const recent = [...candidates].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)).slice(0, 6);
  const upcoming = interviews.filter((i) => i.status === "Scheduled").sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} className="card flex items-center gap-2.5 px-3 py-3 text-[13px] font-medium text-ink transition-shadow hover:shadow-lift">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-hire-soft text-hire">
              <q.icon className="h-4 w-4" aria-hidden />
            </span>
            {q.label}
          </Link>
        ))}
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader
            title="Recent applications"
            action={
              <Link to="/app/hire/candidates" className="text-[13px] font-medium text-accent hover:underline">
                All candidates
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {recent.map((c) => (
              <li key={c.id}>
                <button onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-sunken/50">
                  <Avatar name={c.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{c.name}</span>
                    <span className="block truncate text-[11.5px] text-faint">{jobs.find((j) => j.id === c.jobId)?.title ?? c.role}</span>
                  </span>
                  <Badge tone={STAGE_TONES[c.stage]} dot>
                    {c.stage}
                  </Badge>
                  <span className="hidden w-16 shrink-0 text-right text-[11.5px] text-faint sm:block">{relativeTime(c.appliedAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Hiring funnel" description="Candidates in each stage now" />
          <div className="space-y-2.5 px-5 py-4">
            {funnel.map((f) => (
              <div key={f.stage} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[12.5px] text-muted">{f.stage}</span>
                <div className="h-5 flex-1 rounded bg-sunken">
                  <div
                    className="flex h-5 items-center rounded bg-hire/80 px-1.5 text-[11px] font-medium text-white transition-all"
                    style={{ width: `${f.count ? Math.max(8, (f.count / max) * 100) : 0}%` }}
                  >
                    {f.count || ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Upcoming interviews"
            action={
              <Link to="/app/hire/interviews" className="text-[13px] font-medium text-accent hover:underline">
                AI Interviews
              </Link>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState compact icon={CalendarClock} title="Nothing scheduled" description="Set up an AI interview to see it here." />
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.slice(0, 4).map((iv) => {
                const c = candidates.find((x) => x.id === iv.candidateId);
                return (
                  <li key={iv.id} className="flex items-center gap-3 px-5 py-3">
                    <Mic className="h-4 w-4 shrink-0 text-hire" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{c?.name}</p>
                      <p className="truncate text-[11.5px] text-faint">{iv.template}</p>
                    </div>
                    <div className="text-right">
                      <Badge tone="hire">{iv.mode}</Badge>
                      <p className="mt-1 text-[11.5px] text-faint">{formatDateTime(iv.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Job performance"
            action={
              <Link to="/app/hire/jobs" className="text-[13px] font-medium text-accent hover:underline">
                Manage jobs
              </Link>
            }
          />
          {jobs.filter((j) => j.status !== "Closed").length === 0 ? (
            <EmptyState
              compact
              icon={Briefcase}
              title="No open roles"
              action={
                <Link to="/app/hire/jobs?new=1">
                  <Button size="sm" icon={Plus}>Post a job</Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {jobs
                .filter((j) => j.status !== "Closed")
                .map((job) => {
                  const pool = candidates.filter((c) => c.jobId === job.id);
                  const deep = pool.filter((c) => ["Interview", "Offer", "Hired"].includes(c.stage)).length;
                  return (
                    <li key={job.id} className="flex items-center gap-3 px-5 py-3">
                      <Link to={`/app/hire/ats?job=${job.id}`} className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink hover:text-accent">{job.title}</span>
                        <span className="block text-[11.5px] text-faint">{job.location} · {job.workMode}</span>
                      </Link>
                      <span className="w-16 text-right text-[11.5px] text-muted">
                        <span className="block text-[14px] font-semibold tabular-nums text-ink">{pool.length}</span>applicants
                      </span>
                      <span className="w-20 text-right text-[11.5px] text-muted">
                        <span className="block text-[14px] font-semibold tabular-nums text-ink">{deep}</span>interview+
                      </span>
                      <Badge tone={job.status === "Active" ? "success" : "warning"}>{job.status}</Badge>
                    </li>
                  );
                })}
            </ul>
          )}
        </Card>
      </div>

      <CandidateDrawer candidateId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
