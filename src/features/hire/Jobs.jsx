import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, Copy, MapPin, Pause, Pencil, Play, Plus, Search, Sparkles, Users, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DemoBadge,
  Drawer,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Tabs,
  TagInput,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { generateJobDescription, jobMarkdown, suggestSkills } from "./data.js";
import { copyText } from "../../lib/clipboard.js";
import { shortDate } from "../../lib/date.js";
import { sleep } from "../../lib/format.js";

const BLANK = {
  title: "",
  department: "",
  location: "",
  workMode: "Hybrid",
  employment: "Full-time",
  experience: "",
  status: "Active",
  skills: [],
  summary: "",
  responsibilities: [],
  qualifications: [],
};

const STATUS_TONE = { Active: "success", Paused: "warning", Closed: "neutral" };

export function JobsPage() {
  const toast = useToast();
  const { jobs, candidates, updateItem } = useStore();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState("Active");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);

  // ?new=1 opens a blank job — used by the dashboard's "Post a job" action.
  useEffect(() => {
    if (params.get("new")) {
      setEditing({ ...BLANK });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const visible = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (status === "All" || job.status === status) &&
          (!query || `${job.title} ${job.department} ${job.location}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [jobs, status, query]
  );

  function setJobStatus(job, next) {
    updateItem("jobs", job.id, { status: next });
    toast({ kind: "success", title: `${job.title} ${next === "Active" ? "reactivated" : next.toLowerCase()}` });
  }

  return (
    <>
      <PageHeader
        studio="hire"
        title="Job Management"
        description="Create roles, generate the description and required skills, and manage each opening's status."
        badge={<DemoBadge />}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setEditing({ ...BLANK })}>
            New job
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Tabs
          className="border-0"
          value={status}
          onChange={setStatus}
          tabs={["Active", "Paused", "Closed", "All"].map((s) => ({
            value: s,
            label: s,
            count: s === "All" ? jobs.length : jobs.filter((j) => j.status === s).length,
          }))}
        />
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
          <Input aria-label="Search roles" value={query} placeholder="Search roles" className="pl-9" onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No roles here"
            description={query ? "No roles match your search." : "Create a job to start receiving applicants."}
            action={
              <Button variant="primary" icon={Plus} onClick={() => setEditing({ ...BLANK })}>
                New job
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((job) => {
            const applicants = candidates.filter((c) => c.jobId === job.id);
            const inInterview = applicants.filter((c) => ["Interview", "Offer", "Hired"].includes(c.stage)).length;
            return (
              <Card key={job.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-ink">{job.title}</h2>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">
                      <span>{job.department}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {job.location} · {job.workMode}
                      </span>
                      <span>{job.employment}</span>
                      <span>{job.experience}</span>
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[job.status]} dot>
                    {job.status}
                  </Badge>
                </div>

                {job.summary ? <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-muted">{job.summary}</p> : null}

                <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
                  {job.skills.slice(0, 6).map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <Link to={`/app/hire/ats?job=${job.id}`} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-accent">
                    <Users className="h-4 w-4" aria-hidden />
                    {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
                  </Link>
                  <span className="text-[12px] text-faint">
                    · {inInterview} in interview+ · posted {shortDate(job.createdAt)}
                  </span>
                  <div className="ml-auto flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      icon={Copy}
                      aria-label={`Copy ${job.title} description`}
                      onClick={async () => {
                        const ok = await copyText(jobMarkdown(job));
                        toast({ kind: ok ? "success" : "error", title: ok ? "Job description copied" : "Copy failed" });
                      }}
                    />
                    <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(job)}>
                      Edit
                    </Button>
                    {job.status === "Active" ? (
                      <Button size="sm" variant="ghost" icon={Pause} onClick={() => setJobStatus(job, "Paused")}>
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" icon={Play} onClick={() => setJobStatus(job, "Active")}>
                        Activate
                      </Button>
                    )}
                    {job.status !== "Closed" ? (
                      <Button size="sm" variant="ghost" icon={XCircle} onClick={() => setJobStatus(job, "Closed")}>
                        Close
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editing ? <JobEditor key={editing.id || "new"} initial={editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function JobEditor({ initial, onClose }) {
  const toast = useToast();
  const { addItem, updateItem, log, touchProject } = useStore();
  const [job, setJob] = useState(initial);
  const [errors, setErrors] = useState({});
  const [working, setWorking] = useState(null);
  const isNew = !initial.id;

  const set = (key, value) => setJob((prev) => ({ ...prev, [key]: value }));

  async function generate() {
    if (!job.title.trim()) {
      setErrors({ title: "Add a job title first." });
      return;
    }
    setErrors({});
    setWorking("jd");
    await sleep(1100);
    const jd = generateJobDescription(job);
    setJob((prev) => ({
      ...prev,
      summary: jd.summary,
      responsibilities: jd.responsibilities,
      qualifications: jd.qualifications,
      skills: [...new Set([...prev.skills, ...jd.skills])],
    }));
    setWorking(null);
  }

  async function skills() {
    if (!job.title.trim()) {
      setErrors({ title: "Add a job title first." });
      return;
    }
    setWorking("skills");
    await sleep(500);
    setJob((prev) => ({ ...prev, skills: [...new Set([...prev.skills, ...suggestSkills(prev.title)])] }));
    setWorking(null);
  }

  function save() {
    const next = {};
    if (!job.title.trim()) next.title = "Job title is required.";
    if (!job.location.trim()) next.location = "Add a location, or “Remote”.";
    if (!job.skills.length) next.skills = "Add at least one required skill — candidates are matched on these.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const clean = {
      ...job,
      responsibilities: job.responsibilities.filter((r) => r.trim()),
      qualifications: job.qualifications.filter((q) => q.trim()),
    };
    if (isNew) {
      addItem("jobs", clean);
      log("hire", `New job posted: ${clean.title} (${clean.workMode}, ${clean.location})`);
      touchProject(`${clean.title} — job description`, "Job Description", "hire");
      toast({ kind: "success", title: "Job created", body: `${clean.title} is now active.` });
    } else {
      updateItem("jobs", clean.id, clean);
      toast({ kind: "success", title: "Job updated" });
    }
    onClose();
  }

  return (
    <Drawer
      open
      onClose={onClose}
      width="max-w-2xl"
      title={isNew ? "New job" : `Edit: ${initial.title}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            {isNew ? "Create job" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Job title" htmlFor="j-title" hint={errors.title}>
              <Input id="j-title" invalid={Boolean(errors.title)} value={job.title} placeholder="e.g. Backend Engineer" onChange={(e) => set("title", e.target.value)} />
            </Field>
          </div>
          <Field label="Department" htmlFor="j-dep">
            <Input id="j-dep" value={job.department} placeholder="Engineering" onChange={(e) => set("department", e.target.value)} />
          </Field>
          <Field label="Experience" htmlFor="j-exp">
            <Input id="j-exp" value={job.experience} placeholder="2–4 years" onChange={(e) => set("experience", e.target.value)} />
          </Field>
          <Field label="Location" htmlFor="j-loc" hint={errors.location}>
            <Input id="j-loc" invalid={Boolean(errors.location)} value={job.location} placeholder="Pune" onChange={(e) => set("location", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Work mode" htmlFor="j-mode">
              <Select id="j-mode" value={job.workMode} options={["On-site", "Hybrid", "Remote"]} onChange={(e) => set("workMode", e.target.value)} />
            </Field>
            <Field label="Type" htmlFor="j-emp">
              <Select id="j-emp" value={job.employment} options={["Full-time", "Internship", "Contract"]} onChange={(e) => set("employment", e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-md bg-hire-soft/60 p-3">
          <Sparkles className="h-4 w-4 text-hire" aria-hidden />
          <p className="flex-1 text-[13px] text-ink">Fill the summary, responsibilities, qualifications and skills from the title.</p>
          <Button size="sm" variant="primary" loading={working === "jd"} onClick={generate}>
            Generate description
          </Button>
        </div>

        <Field label="Role summary" htmlFor="j-sum" optional>
          <Textarea id="j-sum" rows={3} value={job.summary} onChange={(e) => set("summary", e.target.value)} />
        </Field>

        <Field label="Required skills" htmlFor="j-skills" hint={errors.skills || "Candidates are matched against these. Press Enter to add."}>
          <TagInput id="j-skills" value={job.skills} onChange={(v) => set("skills", v)} placeholder="Node.js, SQL…" />
        </Field>
        <div className="-mt-3">
          <Button size="sm" variant="subtle" icon={Sparkles} loading={working === "skills"} onClick={skills}>
            Suggest skills
          </Button>
        </div>

        <Field label="Responsibilities" htmlFor="j-resp" hint="One per line.">
          <Textarea id="j-resp" value={job.responsibilities.join("\n")} onChange={(e) => set("responsibilities", e.target.value.split("\n"))} />
        </Field>
        <Field label="Qualifications" htmlFor="j-qual" hint="One per line.">
          <Textarea id="j-qual" value={job.qualifications.join("\n")} onChange={(e) => set("qualifications", e.target.value.split("\n"))} />
        </Field>
      </div>
    </Drawer>
  );
}
