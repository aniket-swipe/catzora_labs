import { useState } from "react";
import { BarChart3, CheckCircle2, ClipboardCheck, Clock, Eye, Plus, Sparkles, Trash2, UserPlus, XCircle } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DemoBadge,
  Drawer,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  ProgressBar,
  ScoreRing,
  SegmentedControl,
  Select,
  Stat,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { ASSESSMENT_CATEGORIES, generateAssessmentQuestions } from "./data.js";
import { sleep } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

export function AssessmentsPage() {
  const toast = useToast();
  const { assessments, removeItem } = useStore();
  const [category, setCategory] = useState("All");
  const [building, setBuilding] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [assignId, setAssignId] = useState(null);
  const [resultsId, setResultsId] = useState(null);

  const visible = assessments.filter((a) => category === "All" || a.category === category);

  return (
    <>
      <PageHeader
        studio="hire"
        title="Quizzes & Assessments"
        description="Build MCQ, reasoning, technical and communication tests; preview them as a candidate, assign them, and review the results."
        badge={<DemoBadge label="Sample results" />}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setBuilding(true)}>
            New assessment
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {["All", ...ASSESSMENT_CATEGORIES].map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cx(
              "rounded-full border px-3 py-1 text-[13px] transition-colors",
              category === c ? "border-hire/40 bg-hire-soft text-hire" : "border-line text-muted hover:text-ink"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardCheck}
            title="No assessments in this category"
            description="Create one with generated questions you can edit."
            action={
              <Button variant="primary" icon={Plus} onClick={() => setBuilding(true)}>
                New assessment
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-ink">{a.title}</h2>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone="hire">{a.category}</Badge>
                    <Badge>{a.difficulty}</Badge>
                    <Badge>Pass at {a.passMark}%</Badge>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  icon={Trash2}
                  aria-label={`Delete ${a.title}`}
                  onClick={() => {
                    removeItem("assessments", a.id);
                    toast({ kind: "success", title: "Assessment deleted" });
                  }}
                />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
                <div>
                  <dt className="text-[11.5px] text-faint">Questions</dt>
                  <dd className="font-medium text-ink">{a.questions.length}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] text-faint">Duration</dt>
                  <dd className="inline-flex items-center gap-1 font-medium text-ink">
                    <Clock className="h-3.5 w-3.5 text-faint" aria-hidden />
                    {a.durationMin} min
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] text-faint">Assigned</dt>
                  <dd className="font-medium text-ink">{a.assignedTo.length}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3">
                <Button size="sm" variant="ghost" icon={Eye} onClick={() => setPreviewId(a.id)}>
                  Preview
                </Button>
                <Button size="sm" variant="ghost" icon={UserPlus} onClick={() => setAssignId(a.id)}>
                  Assign
                </Button>
                <Button size="sm" variant="ghost" icon={BarChart3} onClick={() => setResultsId(a.id)}>
                  Results
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {building ? <Builder onClose={() => setBuilding(false)} /> : null}
      {previewId ? <Preview key={previewId} assessment={assessments.find((a) => a.id === previewId)} onClose={() => setPreviewId(null)} /> : null}
      {assignId ? <Assign key={assignId} assessment={assessments.find((a) => a.id === assignId)} onClose={() => setAssignId(null)} /> : null}
      {resultsId ? <Results assessment={assessments.find((a) => a.id === resultsId)} onClose={() => setResultsId(null)} /> : null}
    </>
  );
}

function Builder({ onClose }) {
  const toast = useToast();
  const { addItem, log } = useStore();
  const [form, setForm] = useState({ title: "", category: "Technical", skill: "", difficulty: "Medium", count: "5", duration: "20", pass: "60" });
  const [questions, setQuestions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const patch = (id, change) => setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...change } : q)));

  async function generate() {
    setBusy(true);
    await sleep(900);
    setQuestions(generateAssessmentQuestions({ category: form.category === "Role-specific" ? "Technical" : form.category, count: Number(form.count), skill: form.skill }));
    setBusy(false);
  }

  function save() {
    if (!form.title.trim()) return setError("Give the assessment a title.");
    if (!questions.length) return toast({ kind: "error", title: "Add at least one question" });
    if (questions.some((q) => !q.prompt.trim() || q.options.some((o) => !o.trim()))) return toast({ kind: "error", title: "Fill in every question and option" });
    addItem("assessments", {
      title: form.title.trim(),
      category: form.category,
      difficulty: form.difficulty,
      durationMin: Number(form.duration),
      passMark: Number(form.pass),
      questions,
      assignedTo: [],
    });
    log("hire", `Assessment created: ${form.title.trim()}`);
    toast({ kind: "success", title: "Assessment saved", body: "Assign it to candidates from its card." });
    onClose();
  }

  return (
    <Drawer
      open
      onClose={onClose}
      width="max-w-3xl"
      title="New assessment"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Save assessment
          </Button>
        </>
      }
    >
      <div className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Title" htmlFor="a-title" hint={error || undefined}>
              <Input id="a-title" invalid={Boolean(error)} value={form.title} placeholder="e.g. JavaScript basics for interns" onChange={(e) => { set("title", e.target.value); setError(""); }} />
            </Field>
          </div>
          <Field label="Category" htmlFor="a-cat">
            <Select id="a-cat" value={form.category} options={ASSESSMENT_CATEGORIES} onChange={(e) => set("category", e.target.value)} />
          </Field>
          <Field label="Skill focus" htmlFor="a-skill" optional>
            <Input id="a-skill" value={form.skill} placeholder="e.g. SQL" onChange={(e) => set("skill", e.target.value)} />
          </Field>
          <Field label="Difficulty">
            <SegmentedControl size="sm" label="Difficulty" value={form.difficulty} options={["Easy", "Medium", "Hard"]} onChange={(v) => set("difficulty", v)} />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Questions" htmlFor="a-n">
              <Select id="a-n" value={form.count} options={["3", "5", "10"]} onChange={(e) => set("count", e.target.value)} />
            </Field>
            <Field label="Minutes" htmlFor="a-d">
              <Select id="a-d" value={form.duration} options={["10", "15", "20", "30", "45"]} onChange={(e) => set("duration", e.target.value)} />
            </Field>
            <Field label="Pass %" htmlFor="a-p">
              <Select id="a-p" value={form.pass} options={["40", "50", "60", "70", "80"]} onChange={(e) => set("pass", e.target.value)} />
            </Field>
          </div>
        </div>

        <Button variant="subtle" icon={Sparkles} loading={busy} onClick={generate}>
          {questions.length ? "Regenerate questions" : "Generate questions"}
        </Button>

        {questions.length ? (
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-md border border-line p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-faint">Q{i + 1}</span>
                  <Badge>{q.skill}</Badge>
                  <Button size="icon" variant="ghost" className="ml-auto h-7 w-7" icon={Trash2} aria-label="Remove question" onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))} />
                </div>
                <Input aria-label={`Question ${i + 1}`} className="mt-2 font-medium" value={q.prompt} onChange={(e) => patch(q.id, { prompt: e.target.value })} />
                <fieldset className="mt-2 grid gap-2 sm:grid-cols-2">
                  <legend className="sr-only">Options — select the correct answer</legend>
                  {q.options.map((option, j) => (
                    <label key={j} className={cx("flex items-center gap-2 rounded-md border px-2", q.answer === j ? "border-success/50 bg-success/5" : "border-line")}>
                      <input
                        type="radio"
                        name={`ans-${q.id}`}
                        checked={q.answer === j}
                        onChange={() => patch(q.id, { answer: j })}
                        aria-label={`Mark option ${j + 1} correct`}
                        className="accent-[rgb(var(--success))]"
                      />
                      <input
                        aria-label={`Option ${j + 1}`}
                        value={option}
                        onChange={(e) => patch(q.id, { options: q.options.map((o, k) => (k === j ? e.target.value : o)) })}
                        className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-ink outline-none"
                      />
                    </label>
                  ))}
                </fieldset>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[13px] text-muted">Generate a set of questions, then edit any prompt or option and mark the correct answer.</p>
        )}
      </div>
    </Drawer>
  );
}

function Preview({ assessment, onClose }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  if (!assessment) return null;

  const q = assessment.questions[index];
  const score = Math.round((assessment.questions.filter((x) => answers[x.id] === x.answer).length / assessment.questions.length) * 100);
  const last = index === assessment.questions.length - 1;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Preview: ${assessment.title}`}
      description={`${assessment.questions.length} questions · ${assessment.durationMin} min · pass at ${assessment.passMark}%`}
      footer={
        submitted ? (
          <>
            <Button onClick={() => { setSubmitted(false); setAnswers({}); setIndex(0); }}>Retake</Button>
            <Button variant="primary" onClick={onClose}>Close</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>Back</Button>
            {last ? (
              <Button variant="primary" disabled={answers[q.id] === undefined} onClick={() => setSubmitted(true)}>Submit</Button>
            ) : (
              <Button variant="primary" disabled={answers[q.id] === undefined} onClick={() => setIndex(index + 1)}>Next</Button>
            )}
          </>
        )
      }
    >
      {submitted ? (
        <div className="text-center">
          <div className="mx-auto w-fit">
            <ScoreRing value={score} size={88} tone={score >= assessment.passMark ? "success" : "danger"} />
          </div>
          <p className="mt-2 text-[14px] font-medium text-ink">{score >= assessment.passMark ? "Passed" : "Below the pass mark"}</p>
          <p className="text-[12px] text-muted">This is how a candidate sees their result.</p>
          <ul className="mt-5 space-y-2 text-left">
            {assessment.questions.map((x, i) => (
              <li key={x.id} className="flex items-start gap-2 text-[13px]">
                {answers[x.id] === x.answer ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                )}
                <span>
                  <span className="text-faint">Q{i + 1}.</span> {x.prompt} <span className="text-muted">— {x.options[x.answer]}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <ProgressBar tone="hire" className="mb-4" value={((index + 1) / assessment.questions.length) * 100} label="Progress" />
          <p className="text-[12px] text-muted">
            Question {index + 1} of {assessment.questions.length} · {q.skill}
          </p>
          <p className="mt-1 text-[15px] font-medium text-ink">{q.prompt}</p>
          <div className="mt-4 space-y-2" role="radiogroup" aria-label="Answer options">
            {q.options.map((option, j) => (
              <button
                key={j}
                role="radio"
                aria-checked={answers[q.id] === j}
                onClick={() => setAnswers({ ...answers, [q.id]: j })}
                className={cx(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-[13px] transition-colors",
                  answers[q.id] === j ? "border-hire/50 bg-hire-soft" : "border-line hover:bg-sunken"
                )}
              >
                <span className={cx("grid h-5 w-5 place-items-center rounded-full border text-[11px]", answers[q.id] === j ? "border-hire bg-hire text-white" : "border-line text-muted")}>
                  {String.fromCharCode(65 + j)}
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Assign({ assessment, onClose }) {
  const toast = useToast();
  const { candidates, updateItem, update } = useStore();
  const [chosen, setChosen] = useState(new Set(assessment?.assignedTo ?? []));
  if (!assessment) return null;
  const open = candidates.filter((c) => !["Hired", "Rejected"].includes(c.stage));

  return (
    <Modal
      open
      onClose={onClose}
      title={`Assign “${assessment.title}”`}
      description="Candidates would receive a link once email is connected."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              const ids = [...chosen];
              updateItem("assessments", assessment.id, { assignedTo: ids });
              update("candidates")((prev) => prev.map((c) => (ids.includes(c.id) && c.assessment === "Not assigned" ? { ...c, assessment: "Assigned" } : c)));
              toast({ kind: "success", title: `Assigned to ${ids.length} candidate${ids.length === 1 ? "" : "s"}` });
              onClose();
            }}
          >
            Save assignment
          </Button>
        </>
      }
    >
      <ul className="space-y-1">
        {open.map((c) => (
          <li key={c.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-sunken">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[rgb(var(--accent))]"
                checked={chosen.has(c.id)}
                onChange={(e) =>
                  setChosen((prev) => {
                    const next = new Set(prev);
                    e.target.checked ? next.add(c.id) : next.delete(c.id);
                    return next;
                  })
                }
              />
              <Avatar name={c.name} size="sm" />
              <span className="flex-1 text-[13px] text-ink">
                {c.name}
                <span className="block text-[11.5px] text-faint">{c.role} · {c.stage}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function Results({ assessment, onClose }) {
  const { candidates } = useStore();
  if (!assessment) return null;
  const assigned = assessment.assignedTo.map((id) => candidates.find((c) => c.id === id)).filter(Boolean);
  const scored = assigned.filter((c) => c.assessmentScore !== undefined);
  const avg = scored.length ? Math.round(scored.reduce((s, c) => s + c.assessmentScore, 0) / scored.length) : null;
  const passRate = scored.length ? Math.round((scored.filter((c) => c.assessmentScore >= assessment.passMark).length / scored.length) * 100) : null;

  return (
    <Drawer open onClose={onClose} width="max-w-2xl" title={`Results: ${assessment.title}`} description="Scores come from each candidate's record — sample data.">
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Assigned" value={assigned.length} tone="hire" />
          <Stat label="Average" value={avg === null ? "—" : `${avg}%`} tone="hire" />
          <Stat label="Pass rate" value={passRate === null ? "—" : `${passRate}%`} tone="hire" />
        </div>
        {assigned.length === 0 ? (
          <EmptyState compact icon={UserPlus} title="Not assigned yet" description="Assign this assessment to see results here." />
        ) : (
          <ul className="divide-y divide-line rounded-md border border-line">
            {assigned.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={c.name} size="sm" />
                <span className="flex-1 text-[13px] font-medium text-ink">{c.name}</span>
                {c.assessmentScore !== undefined ? (
                  <>
                    <ProgressBar tone={c.assessmentScore >= assessment.passMark ? "success" : "danger"} value={c.assessmentScore} className="w-24" label="Score" />
                    <span className="w-10 text-right text-[13px] tabular-nums text-ink">{c.assessmentScore}%</span>
                  </>
                ) : (
                  <Badge>Pending</Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
