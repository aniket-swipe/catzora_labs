import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Avatar, Badge, Button, Drawer, ProgressBar, Select, Tabs, Textarea, useToast } from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { PIPELINE_STAGES, STAGE_TONES, skillMatch } from "./stages.js";
import { relativeTime, formatDateTime } from "../../lib/format.js";

/** Candidate detail — profile, notes and history — shared by every Hire page that lists people. */
export function CandidateDrawer({ candidateId, onClose }) {
  const toast = useToast();
  const { candidates, jobs, moveCandidate, addCandidateNote } = useStore();
  const [tab, setTab] = useState("profile");
  const [note, setNote] = useState("");

  const candidate = candidates.find((c) => c.id === candidateId) ?? null;
  const job = candidate ? jobs.find((j) => j.id === candidate.jobId) : null;
  const match = candidate && job ? skillMatch(candidate, job) : null;

  return (
    <Drawer
      open={Boolean(candidate)}
      onClose={() => {
        setTab("profile");
        onClose();
      }}
      title={
        candidate ? (
          <span className="flex items-center gap-3">
            <Avatar name={candidate.name} />
            <span>
              <span className="block">{candidate.name}</span>
              <span className="block text-[12px] font-normal text-muted">{job?.title ?? candidate.role}</span>
            </span>
          </span>
        ) : (
          ""
        )
      }
    >
      {candidate ? (
        <div>
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
            <label htmlFor="cd-stage" className="text-[13px] text-muted">
              Stage
            </label>
            <Select
              id="cd-stage"
              className="w-44"
              value={candidate.stage}
              options={PIPELINE_STAGES}
              onChange={(e) => {
                moveCandidate(candidate.id, e.target.value);
                toast({ kind: "success", title: `Moved to ${e.target.value}` });
              }}
            />
            <Badge tone={STAGE_TONES[candidate.stage]} dot className="ml-auto">
              {candidate.stage}
            </Badge>
          </div>

          <Tabs
            className="px-3"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "profile", label: "Profile" },
              { value: "notes", label: "Notes", count: candidate.notes?.length ?? 0 },
              { value: "history", label: "History", count: candidate.history?.length ?? 0 },
            ]}
          />

          {tab === "profile" ? (
            <div className="space-y-5 p-5 text-[13px]">
              <div className="grid gap-2 text-muted sm:grid-cols-2">
                <span className="flex items-center gap-2"><Mail className="h-4 w-4" aria-hidden />{candidate.email}</span>
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" aria-hidden />{candidate.phone}</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden />{candidate.location}</span>
                <span>Applied {relativeTime(candidate.appliedAt)} via {candidate.source}</span>
              </div>
              <div>
                <p className="mb-1 font-medium text-ink">Summary</p>
                <p className="leading-6 text-ink">{candidate.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 font-medium text-ink">Experience</p>
                  <p className="text-muted">{candidate.experienceYears ? `${candidate.experienceYears} years` : "Fresher"}</p>
                </div>
                <div>
                  <p className="mb-1 font-medium text-ink">Assessment</p>
                  <p className="text-muted">
                    {candidate.assessment}
                    {candidate.assessmentScore !== undefined ? ` · ${candidate.assessmentScore}%` : ""}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-1.5 font-medium text-ink">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} tone={match?.matched.includes(skill) ? "hire" : "neutral"}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              {match ? (
                <div className="rounded-md bg-sunken p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-ink">Match: {job.title}</p>
                    <span className="tabular-nums text-ink">{match.pct}%</span>
                  </div>
                  <ProgressBar tone="hire" value={match.pct} label="Skill match" />
                  <p className="mt-2 text-[12.5px] text-muted">Matched: {match.matched.join(", ") || "none"}</p>
                  <p className="text-[12.5px] text-muted">Missing: {match.missing.join(", ") || "none"}</p>
                  <p className="mt-2 text-[11.5px] text-faint">
                    Overlap of listed skills with the job's required skills — a sorting aid, not a judgement. Read the CV.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === "notes" ? (
            <div className="p-5">
              <ul className="mb-4 space-y-3">
                {(candidate.notes ?? []).length === 0 ? (
                  <li className="text-[13px] text-muted">No notes yet. Notes are visible to the whole hiring team.</li>
                ) : (
                  candidate.notes.map((n) => (
                    <li key={n.id} className="rounded-md bg-sunken p-3">
                      <p className="text-[13px] text-ink">{n.note}</p>
                      <p className="mt-1 text-[11.5px] text-faint">
                        {n.author || "You"} · {relativeTime(n.at)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  addCandidateNote(candidate.id, note.trim());
                  setNote("");
                  toast({ kind: "success", title: "Note added" });
                }}
              >
                <label htmlFor="cd-note" className="mb-1.5 block text-[13px] font-medium text-ink">
                  Add a note
                </label>
                <Textarea
                  id="cd-note"
                  rows={3}
                  value={note}
                  placeholder="Interview feedback, availability, salary expectations…"
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button type="submit" variant="primary" icon={Send} disabled={!note.trim()}>
                    Add note
                  </Button>
                </div>
              </form>
            </div>
          ) : null}

          {tab === "history" ? (
            <ol className="space-y-4 p-5">
              {[...(candidate.history ?? [])].reverse().map((event) => (
                <li key={event.id} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-hire" aria-hidden />
                  <div>
                    <p className="text-[13px] text-ink">{event.text}</p>
                    <p className="text-[11.5px] text-faint">{formatDateTime(event.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}
