import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Target, Upload, UserPlus, Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  DemoBadge,
  DemoNote,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  ProgressBar,
  Select,
  Tabs,
  TagInput,
  useToast,
} from "../../components/ui/index.js";
import { CandidateDrawer } from "./CandidateDrawer.jsx";
import { useStore } from "../../store/AppStore.jsx";
import { PIPELINE_STAGES, STAGE_TONES, skillMatch } from "./stages.js";
import { relativeTime } from "../../lib/format.js";
import { uid } from "../../lib/id.js";
import { cx } from "../../lib/cx.js";

const EXPERIENCE = [
  { value: "All", label: "Any experience" },
  { value: "0-1", label: "0–1 years" },
  { value: "2-4", label: "2–4 years" },
  { value: "5+", label: "5+ years" },
];

function inExperience(years, band) {
  if (band === "0-1") return years <= 1;
  if (band === "2-4") return years >= 2 && years <= 4;
  if (band === "5+") return years >= 5;
  return true;
}

function MatchBar({ pct }) {
  return (
    <div className="flex items-center gap-2" title={`${pct}% of required skills`}>
      <ProgressBar tone="hire" value={pct} className="w-16" label="Skill match" />
      <span className="text-[12px] tabular-nums text-muted">{pct}%</span>
    </div>
  );
}

export function CandidatesPage() {
  const { candidates, jobs } = useStore();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState("directory");
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ job: "All", stage: "All", exp: "All", assessment: "All" });
  const [sort, setSort] = useState({ key: "appliedAt", direction: -1 });
  const [matchJob, setMatchJob] = useState(() => jobs.find((j) => j.status === "Active")?.id ?? jobs[0]?.id);

  // ?c=<id> deep-links straight to a candidate — used by search and the dashboard.
  useEffect(() => {
    const id = params.get("c");
    if (id) {
      setOpenId(id);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const jobOf = (c) => jobs.find((j) => j.id === c.jobId);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = candidates.filter(
      (c) =>
        (!q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.skills.some((s) => s.toLowerCase().includes(q))) &&
        (filters.job === "All" || c.jobId === filters.job) &&
        (filters.stage === "All" || c.stage === filters.stage) &&
        (filters.assessment === "All" || c.assessment === filters.assessment) &&
        inExperience(c.experienceYears, filters.exp)
    );
    const value = (c) => (sort.key === "match" ? skillMatch(c, jobOf(c)).pct : c[sort.key]);
    return filtered.sort((a, b) => {
      const x = value(a);
      const y = value(b);
      return (x < y ? -1 : x > y ? 1 : 0) * sort.direction;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates, jobs, query, filters, sort]);

  const target = jobs.find((j) => j.id === matchJob);
  const ranked = target
    ? candidates
        .filter((c) => c.stage !== "Rejected")
        .map((c) => ({ c, m: skillMatch(c, target) }))
        .sort((a, b) => b.m.pct - a.m.pct)
    : [];

  return (
    <>
      <PageHeader
        studio="hire"
        title="Candidates"
        description="Search, filter and screen everyone who has applied, and rank people against a role's required skills."
        badge={<DemoBadge label="Sample candidates" />}
        actions={
          <Button variant="primary" icon={UserPlus} onClick={() => setAdding(true)}>
            Add candidate
          </Button>
        }
      />

      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "directory", label: "Directory", count: candidates.length },
          { value: "match", label: "Match to role" },
        ]}
      />

      {tab === "directory" ? (
        <Card>
          <div className="grid gap-2 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
              <Input aria-label="Search candidates" value={query} placeholder="Name, skill or city" className="pl-9" onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Select
              aria-label="Role"
              value={filters.job}
              options={[{ value: "All", label: "All roles" }, ...jobs.map((j) => ({ value: j.id, label: j.title }))]}
              onChange={(e) => setFilters((p) => ({ ...p, job: e.target.value }))}
            />
            <Select
              aria-label="Stage"
              value={filters.stage}
              options={[{ value: "All", label: "All stages" }, ...PIPELINE_STAGES]}
              onChange={(e) => setFilters((p) => ({ ...p, stage: e.target.value }))}
            />
            <Select aria-label="Experience" value={filters.exp} options={EXPERIENCE} onChange={(e) => setFilters((p) => ({ ...p, exp: e.target.value }))} />
            <Select
              aria-label="Assessment"
              value={filters.assessment}
              options={[{ value: "All", label: "Any assessment" }, "Not assigned", "Assigned", "Completed"]}
              onChange={(e) => setFilters((p) => ({ ...p, assessment: e.target.value }))}
            />
          </div>
          <p className="px-4 py-2 text-[12px] text-faint">
            {rows.length} of {candidates.length} · click a row to open the profile
          </p>
          <DataTable
            rows={rows}
            getRowKey={(c) => c.id}
            onRowClick={(c) => setOpenId(c.id)}
            sort={sort}
            onSortChange={setSort}
            minWidth={860}
            empty={
              <EmptyState
                compact
                icon={Users}
                title="No one matches these filters"
                description="Clear a filter or search for a different skill."
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setFilters({ job: "All", stage: "All", exp: "All", assessment: "All" });
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            }
            columns={[
              {
                key: "name",
                header: "Name",
                sortable: true,
                render: (c) => (
                  <span className="flex items-center gap-2.5">
                    <Avatar name={c.name} size="sm" />
                    <span>
                      <span className="block font-medium text-ink">{c.name}</span>
                      <span className="text-[11.5px] text-faint">{c.location}</span>
                    </span>
                  </span>
                ),
              },
              { key: "role", header: "Role", render: (c) => jobOf(c)?.title ?? c.role },
              {
                key: "skills",
                header: "Skills",
                render: (c) => (
                  <span className="flex max-w-[220px] flex-wrap gap-1">
                    {c.skills.slice(0, 3).map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                    {c.skills.length > 3 ? <span className="text-[11.5px] text-faint">+{c.skills.length - 3}</span> : null}
                  </span>
                ),
              },
              { key: "experienceYears", header: "Exp.", sortable: true, width: 80, render: (c) => (c.experienceYears ? `${c.experienceYears} yr` : "Fresher") },
              { key: "match", header: "Match", sortable: true, width: 130, render: (c) => <MatchBar pct={skillMatch(c, jobOf(c)).pct} /> },
              { key: "stage", header: "Stage", width: 120, render: (c) => <Badge tone={STAGE_TONES[c.stage]} dot>{c.stage}</Badge> },
              { key: "appliedAt", header: "Applied", sortable: true, width: 100, render: (c) => relativeTime(c.appliedAt) },
            ]}
          />
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Candidate-to-role matching"
            description="Everyone still in play, ranked by overlap with the role's required skills."
            action={
              <Select
                aria-label="Role to match"
                className="w-56"
                value={matchJob}
                options={jobs.map((j) => ({ value: j.id, label: `${j.title} (${j.status})` }))}
                onChange={(e) => setMatchJob(e.target.value)}
              />
            }
          />
          {target ? (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-5 py-3">
              <span className="mr-1 text-[12px] text-muted">Required:</span>
              {target.skills.map((s) => (
                <Badge key={s} tone="hire">
                  {s}
                </Badge>
              ))}
            </div>
          ) : null}
          {ranked.length === 0 ? (
            <EmptyState compact icon={Target} title="Nobody to rank" description="Add candidates or choose another role." />
          ) : (
            <ul className="divide-y divide-line">
              {ranked.map(({ c, m }, index) => (
                <li key={c.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <span className="w-6 text-[12px] tabular-nums text-faint">{index + 1}</span>
                  <button onClick={() => setOpenId(c.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                    <Avatar name={c.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">{c.name}</span>
                      <span className="block truncate text-[11.5px] text-faint">Missing: {m.missing.join(", ") || "nothing"}</span>
                    </span>
                  </button>
                  <MatchBar pct={m.pct} />
                  <Badge tone={c.jobId === target.id ? "hire" : "neutral"}>{c.jobId === target.id ? "Applied" : "Other role"}</Badge>
                </li>
              ))}
            </ul>
          )}
          <p className="border-t border-line px-5 py-3 text-[12px] text-faint">
            Matching compares listed skills only. Reading the CV — and the person — stays with you.
          </p>
        </Card>
      )}

      <CandidateDrawer candidateId={openId} onClose={() => setOpenId(null)} />
      {adding ? <AddCandidateModal onClose={() => setAdding(false)} /> : null}
    </>
  );
}

function AddCandidateModal({ onClose }) {
  const toast = useToast();
  const { jobs, addItem, log } = useStore();
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    jobId: jobs.find((j) => j.status === "Active")?.id ?? "",
    experienceYears: "0",
    skills: [],
  });
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function save() {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.jobId) next.jobId = "Choose a role.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const job = jobs.find((j) => j.id === form.jobId);
    const at = new Date().toISOString();
    addItem("candidates", {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone || "—",
      location: form.location || "—",
      jobId: form.jobId,
      role: job.title,
      stage: "Applied",
      score: 0,
      source: file ? "Resume upload" : "Added manually",
      experienceYears: Number(form.experienceYears),
      skills: form.skills,
      summary: file ? `Resume on file: ${file.name}` : "Added by a recruiter.",
      assessment: "Not assigned",
      appliedAt: at,
      notes: [],
      history: [{ id: uid("h"), text: file ? `Added with resume ${file.name}` : "Added manually", at }],
    });
    log("hire", `${form.name.trim()} added for ${job.title}`);
    toast({ kind: "success", title: "Candidate added", body: `${form.name.trim()} is in Applied.` });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Add candidate"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Add candidate
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label
          htmlFor="cv"
          className={cx(
            "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed px-4 py-6 text-center transition-colors",
            file ? "border-hire/50 bg-hire-soft/40" : "border-line hover:bg-sunken"
          )}
        >
          <Upload className="h-5 w-5 text-faint" aria-hidden />
          <span className="text-[13px] font-medium text-ink">{file ? file.name : "Upload a resume"}</span>
          <span className="text-[11.5px] text-faint">{file ? `${Math.round(file.size / 1024)} KB · stays on this device` : "PDF or DOCX, up to 5 MB"}</span>
          <input
            id="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => {
              const picked = e.target.files?.[0];
              if (picked && picked.size > 5 * 1024 * 1024) {
                toast({ kind: "error", title: "File too large", body: "Choose a resume under 5 MB." });
                return;
              }
              setFile(picked ?? null);
            }}
          />
        </label>
        <DemoNote>Resume parsing isn't connected, so details are not extracted automatically — enter them below.</DemoNote>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" htmlFor="ac-name" hint={errors.name}>
            <Input id="ac-name" invalid={Boolean(errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="ac-email" hint={errors.email}>
            <Input id="ac-email" type="email" invalid={Boolean(errors.email)} value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="ac-phone" optional>
            <Input id="ac-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Location" htmlFor="ac-loc" optional>
            <Input id="ac-loc" value={form.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Applying for" htmlFor="ac-job" hint={errors.jobId}>
            <Select
              id="ac-job"
              value={form.jobId}
              options={jobs.filter((j) => j.status !== "Closed").map((j) => ({ value: j.id, label: j.title }))}
              onChange={(e) => set("jobId", e.target.value)}
            />
          </Field>
          <Field label="Experience" htmlFor="ac-exp">
            <Select
              id="ac-exp"
              value={form.experienceYears}
              options={Array.from({ length: 16 }, (_, i) => ({ value: String(i), label: i === 0 ? "Fresher" : `${i} years` }))}
              onChange={(e) => set("experienceYears", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Skills" htmlFor="ac-skills" hint="Press Enter after each — used for role matching.">
              <TagInput id="ac-skills" value={form.skills} onChange={(v) => set("skills", v)} />
            </Field>
          </div>
        </div>
      </div>
    </Modal>
  );
}
