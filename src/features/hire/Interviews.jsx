import { useEffect, useRef, useState } from "react";
import { Bot, CalendarPlus, FileText, MessageSquareText, Mic, Play, Plus, Send, Sparkles, Trash2, User } from "lucide-react";
import {
  Avatar,
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
  Modal,
  PageHeader,
  SegmentedControl,
  Select,
  Tabs,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { DEFAULT_RUBRIC, INTERVIEW_TEMPLATES, SAMPLE_TRANSCRIPT, generateQuestions, interviewerReply } from "./data.js";
import { combineDateTime, todayKey } from "../../lib/date.js";
import { formatDateTime, sleep } from "../../lib/format.js";
import { uid } from "../../lib/id.js";
import { cx } from "../../lib/cx.js";

export function InterviewsPage() {
  const { interviews, candidates, jobs } = useStore();
  const [tab, setTab] = useState("sessions");
  const [sessionId, setSessionId] = useState(null);
  const [resultsId, setResultsId] = useState(null);

  const sorted = [...interviews].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <PageHeader
        studio="hire"
        title="AI Interviews"
        description="Configure text or voice interviews with role-specific questions and a weighted rubric, run them, and score the transcript."
        badge={<DemoBadge label="Scripted interviewer" />}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setTab("setup")}>
            New interview
          </Button>
        }
      />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "sessions", label: "Sessions", count: interviews.length },
          { value: "setup", label: "Set up interview" },
        ]}
      />

      {tab === "sessions" ? (
        <Card>
          {sorted.length === 0 ? (
            <EmptyState icon={Mic} title="No interviews yet" description="Set up an AI interview for a candidate to see it here." />
          ) : (
            <ul className="divide-y divide-line">
              {sorted.map((iv) => {
                const candidate = candidates.find((c) => c.id === iv.candidateId);
                const job = jobs.find((j) => j.id === iv.jobId);
                return (
                  <li key={iv.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={candidate?.name ?? "?"} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{candidate?.name ?? "Removed candidate"}</p>
                        <p className="truncate text-[12px] text-muted">
                          {iv.template} · {job?.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="hire">
                        {iv.mode === "Voice" ? <Mic className="h-3 w-3" aria-hidden /> : <MessageSquareText className="h-3 w-3" aria-hidden />}
                        {iv.mode}
                      </Badge>
                      <Badge tone={iv.status === "Completed" ? "success" : "accent"} dot>
                        {iv.status}
                      </Badge>
                      <span className="text-[12px] text-faint">{formatDateTime(iv.at)}</span>
                      {iv.status === "Completed" ? (
                        <Button size="sm" icon={FileText} onClick={() => setResultsId(iv.id)}>
                          Results
                        </Button>
                      ) : (
                        <Button size="sm" variant="primary" icon={Play} onClick={() => setSessionId(iv.id)}>
                          Try demo session
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : (
        <InterviewSetup onScheduled={() => setTab("sessions")} />
      )}

      {sessionId ? <DemoSession key={sessionId} interviewId={sessionId} onClose={() => setSessionId(null)} onDone={(id) => setResultsId(id)} /> : null}
      {resultsId ? <ResultsDrawer key={resultsId} interviewId={resultsId} onClose={() => setResultsId(null)} /> : null}
    </>
  );
}

function InterviewSetup({ onScheduled }) {
  const toast = useToast();
  const { candidates, jobs, addItem, log } = useStore();
  const open = candidates.filter((c) => !["Hired", "Rejected"].includes(c.stage));

  const [form, setForm] = useState({
    candidateId: open[0]?.id ?? "",
    mode: "Text",
    template: INTERVIEW_TEMPLATES[0],
    technical: "3",
    behavioural: "2",
    day: todayKey(1),
    time: "11:00",
    instructions: "Answer in your own words. There are no trick questions — take your time.",
  });
  const [questions, setQuestions] = useState([]);
  const [rubric, setRubric] = useState(DEFAULT_RUBRIC);
  const [busy, setBusy] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const candidate = candidates.find((c) => c.id === form.candidateId);
  const job = jobs.find((j) => j.id === candidate?.jobId);
  const total = rubric.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);

  async function generate() {
    setBusy(true);
    await sleep(900);
    setQuestions(generateQuestions({ skills: job?.skills ?? [], technical: Number(form.technical), behavioural: Number(form.behavioural) }));
    setBusy(false);
  }

  function schedule() {
    if (!candidate) return toast({ kind: "error", title: "Choose a candidate" });
    if (!questions.filter((q) => q.text.trim()).length) return toast({ kind: "error", title: "Add questions first", body: "Generate them or write your own." });
    if (total !== 100) return toast({ kind: "error", title: "Rubric weights must total 100%", body: `They currently total ${total}%.` });
    const at = combineDateTime(form.day, form.time);
    if (new Date(at).getTime() < Date.now()) return toast({ kind: "error", title: "Pick a future date and time" });

    addItem("interviews", {
      candidateId: candidate.id,
      jobId: candidate.jobId,
      mode: form.mode,
      template: form.template,
      status: "Scheduled",
      at,
      instructions: form.instructions,
      questions: questions.filter((q) => q.text.trim()),
      rubric,
      transcript: null,
      scores: null,
      summary: null,
    });
    log("hire", `${form.mode} AI interview scheduled for ${candidate.name}`);
    toast({ kind: "success", title: "Interview scheduled", body: `${candidate.name} · ${formatDateTime(at)}. No invitation is sent in demo mode.` });
    setQuestions([]);
    onScheduled();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
      <Card className="h-fit">
        <CardHeader title="Session" />
        <div className="space-y-4 px-5 py-4">
          <Field label="Candidate" htmlFor="iv-c" hint={job ? `Applied for ${job.title}` : undefined}>
            <Select id="iv-c" value={form.candidateId} options={open.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => set("candidateId", e.target.value)} />
          </Field>
          <Field label="Mode">
            <SegmentedControl label="Mode" value={form.mode} options={["Text", "Voice"]} onChange={(v) => set("mode", v)} />
          </Field>
          {form.mode === "Voice" ? <DemoNote>Voice interviews need speech services on the backend. You can configure one now; the demo session runs as text.</DemoNote> : null}
          <Field label="Template" htmlFor="iv-t">
            <Select id="iv-t" value={form.template} options={INTERVIEW_TEMPLATES} onChange={(e) => set("template", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Technical" htmlFor="iv-tq">
              <Select id="iv-tq" value={form.technical} options={["0", "2", "3", "4", "5"]} onChange={(e) => set("technical", e.target.value)} />
            </Field>
            <Field label="Behavioural" htmlFor="iv-bq">
              <Select id="iv-bq" value={form.behavioural} options={["0", "1", "2", "3", "4"]} onChange={(e) => set("behavioural", e.target.value)} />
            </Field>
          </div>
          <Button variant="subtle" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={generate}>
            Generate questions from the role
          </Button>
          <Field label="Instructions for the candidate" htmlFor="iv-ins">
            <Textarea id="iv-ins" rows={3} value={form.instructions} onChange={(e) => set("instructions", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" htmlFor="iv-d">
              <Input id="iv-d" type="date" min={todayKey()} value={form.day} onChange={(e) => set("day", e.target.value)} />
            </Field>
            <Field label="Time" htmlFor="iv-tm">
              <Input id="iv-tm" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </Field>
          </div>
          <Button variant="primary" className="w-full justify-center" icon={CalendarPlus} onClick={schedule}>
            Schedule interview
          </Button>
        </div>
      </Card>

      <div className="min-w-0 space-y-5">
        <Card>
          <CardHeader title="Questions" description="Edit, remove, or add your own." />
          {questions.length === 0 ? (
            <EmptyState
              compact
              icon={Sparkles}
              title="No questions yet"
              description="Generate questions from the candidate's role, or write your own."
              action={
                <Button size="sm" icon={Plus} onClick={() => setQuestions([{ id: uid("q"), type: "Technical", text: "", lookFor: "" }])}>
                  Add question
                </Button>
              }
            />
          ) : (
            <ol className="space-y-3 p-5">
              {questions.map((q, i) => (
                <li key={q.id} className="rounded-md border border-line p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[12px] font-medium text-faint">Q{i + 1}</span>
                    <Select
                      aria-label="Question type"
                      className="h-7 w-36 text-xs"
                      value={q.type}
                      options={["Technical", "Behavioural"]}
                      onChange={(e) => setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, type: e.target.value } : x)))}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-auto h-7 w-7"
                      icon={Trash2}
                      aria-label="Remove question"
                      onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}
                    />
                  </div>
                  <Textarea
                    aria-label={`Question ${i + 1}`}
                    rows={2}
                    className="min-h-[56px]"
                    value={q.text}
                    onChange={(e) => setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, text: e.target.value } : x)))}
                  />
                  <Input
                    aria-label={`What a strong answer to question ${i + 1} includes`}
                    className="mt-2 text-xs"
                    value={q.lookFor}
                    placeholder="What a strong answer includes"
                    onChange={(e) => setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, lookFor: e.target.value } : x)))}
                  />
                </li>
              ))}
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setQuestions((prev) => [...prev, { id: uid("q"), type: "Behavioural", text: "", lookFor: "" }])}>
                Add question
              </Button>
            </ol>
          )}
        </Card>

        <Card>
          <CardHeader title="Evaluation rubric" description="Weights must total 100%." action={<Badge tone={total === 100 ? "success" : "danger"}>{total}%</Badge>} />
          <ul className="space-y-2 p-5">
            {rubric.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <Input aria-label="Criterion" value={r.name} onChange={(e) => setRubric((prev) => prev.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))} />
                <div className="relative w-24 shrink-0">
                  <Input
                    aria-label={`${r.name} weight`}
                    type="number"
                    min={0}
                    max={100}
                    className="pr-7"
                    value={r.weight}
                    onChange={(e) => setRubric((prev) => prev.map((x) => (x.id === r.id ? { ...x, weight: Number(e.target.value) || 0 } : x)))}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">%</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  icon={Trash2}
                  aria-label="Remove criterion"
                  disabled={rubric.length <= 1}
                  onClick={() => setRubric((prev) => prev.filter((x) => x.id !== r.id))}
                />
              </li>
            ))}
            <Button size="sm" variant="ghost" icon={Plus} onClick={() => setRubric((prev) => [...prev, { id: uid("r"), name: "New criterion", weight: 0 }])}>
              Add criterion
            </Button>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function DemoSession({ interviewId, onClose, onDone }) {
  const toast = useToast();
  const { interviews, candidates, jobs, updateItem, log } = useStore();
  const iv = interviews.find((i) => i.id === interviewId);
  const candidate = candidates.find((c) => c.id === iv?.candidateId);
  const job = jobs.find((j) => j.id === iv?.jobId);

  const questions = iv?.questions?.length
    ? iv.questions.map((q) => q.text)
    : generateQuestions({ skills: job?.skills ?? [], technical: 2, behavioural: 1 }).map((q) => q.text);

  const [messages, setMessages] = useState(() => [
    {
      role: "ai",
      text: `Hi ${candidate?.name.split(" ")[0] ?? "there"}, thanks for joining. ${iv?.instructions ? `${iv.instructions} ` : ""}Let's begin.\n\n${questions[0]}`,
    },
  ]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [thinking, setThinking] = useState(false);
  const end = useRef(null);
  const finished = index >= questions.length;

  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [messages]);

  async function send() {
    if (!answer.trim() || finished || thinking) return;
    const text = answer.trim();
    setAnswer("");
    setMessages((prev) => [...prev, { role: "candidate", text }]);
    setThinking(true);
    await sleep(700);
    setMessages((prev) => [...prev, { role: "ai", text: interviewerReply(text, questions[index + 1]) }]);
    setThinking(false);
    setIndex((i) => i + 1);
  }

  function save() {
    updateItem("interviews", iv.id, { status: "Completed", transcript: messages });
    log("hire", `AI interview completed: ${candidate?.name}`);
    toast({ kind: "success", title: "Transcript saved", body: "Score it in Results." });
    onClose();
    onDone(iv.id);
  }

  if (!iv) return null;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`${iv.mode} interview · ${candidate?.name}`}
      description={iv.template}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Leave without saving
          </Button>
          <Button variant="primary" disabled={messages.length < 2} onClick={save}>
            End & save transcript
          </Button>
        </>
      }
    >
      <DemoNote>You are playing the candidate. Replies come from a scripted demo interviewer, not a live model.</DemoNote>
      <div className="mt-4 max-h-[46vh] space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={cx("flex gap-2.5", m.role === "candidate" && "flex-row-reverse")}>
            <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full", m.role === "ai" ? "bg-hire-soft text-hire" : "bg-sunken text-muted")}>
              {m.role === "ai" ? <Bot className="h-4 w-4" aria-hidden /> : <User className="h-4 w-4" aria-hidden />}
            </span>
            <p className={cx("max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[13px] leading-6", m.role === "ai" ? "bg-sunken text-ink" : "bg-accent text-white")}>
              {m.text}
            </p>
          </div>
        ))}
        {thinking ? <div className="ml-9 h-9 w-40 animate-pulse rounded-lg bg-sunken" /> : null}
        <div ref={end} />
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor="iv-answer" className="sr-only">
          Your answer
        </label>
        <Textarea
          id="iv-answer"
          rows={2}
          className="min-h-[44px]"
          disabled={finished || thinking}
          value={answer}
          placeholder={finished ? "Interview finished — save the transcript." : "Type your answer… (Enter to send)"}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button type="submit" variant="primary" size="icon" icon={Send} aria-label="Send answer" className="h-11 w-11 self-end" disabled={!answer.trim() || finished || thinking} />
      </form>
    </Modal>
  );
}

function ResultsDrawer({ interviewId, onClose }) {
  const toast = useToast();
  const { interviews, candidates, updateItem, moveCandidate } = useStore();
  const iv = interviews.find((i) => i.id === interviewId);
  const candidate = candidates.find((c) => c.id === iv?.candidateId);

  const rubric = iv?.rubric ?? DEFAULT_RUBRIC();
  const transcript = iv?.transcript ?? SAMPLE_TRANSCRIPT;
  const [scores, setScores] = useState(iv?.scores ?? {});
  const [summary, setSummary] = useState(
    iv?.summary ??
      `${candidate?.name.split(" ")[0] ?? "The candidate"} gave specific, structured answers with clear ownership of outcomes. Technical answers showed awareness of trade-offs. Probe testing practice in the next round.`
  );

  if (!iv) return null;

  const weighted = rubric.reduce((sum, r) => sum + ((scores[r.id] ?? 0) / 5) * r.weight, 0);
  const complete = rubric.every((r) => scores[r.id]);

  function save() {
    updateItem("interviews", iv.id, { rubric, scores, summary });
    toast({ kind: "success", title: "Evaluation saved" });
  }

  return (
    <Drawer
      open
      onClose={onClose}
      width="max-w-3xl"
      title={`Results · ${candidate?.name ?? ""}`}
      description={iv.template}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              if (candidate) moveCandidate(candidate.id, "On Hold");
              toast({ kind: "success", title: `${candidate?.name} moved to On Hold` });
            }}
          >
            Put on hold
          </Button>
          <Button onClick={save}>Save evaluation</Button>
          <Button
            variant="primary"
            disabled={!complete}
            title={complete ? undefined : "Score every criterion first"}
            onClick={() => {
              save();
              if (candidate) moveCandidate(candidate.id, "Offer");
              toast({ kind: "success", title: `${candidate?.name} moved to Offer` });
              onClose();
            }}
          >
            Advance to Offer
          </Button>
        </>
      }
    >
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="border-b border-line p-5 md:border-b-0 md:border-r">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-ink">Transcript</p>
            {!iv.transcript ? <DemoBadge label="Sample transcript" /> : null}
          </div>
          <ol className="space-y-3">
            {transcript.map((m, i) => (
              <li key={i} className="text-[13px]">
                <p className="mb-0.5 text-[11.5px] font-medium text-faint">{m.role === "ai" ? "Interviewer" : candidate?.name}</p>
                <p className="whitespace-pre-wrap leading-6 text-ink">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[14px] font-semibold text-ink">Scorecard</p>
              <span className="text-2xl font-semibold tabular-nums text-ink">
                {Math.round(weighted)}
                <span className="text-sm text-muted">/100</span>
              </span>
            </div>
            <ul className="space-y-3">
              {rubric.map((r) => (
                <li key={r.id}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="text-ink">{r.name}</span>
                    <span className="text-muted">{r.weight}%</span>
                  </div>
                  <div className="flex gap-1" role="radiogroup" aria-label={`${r.name} score`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        role="radio"
                        aria-checked={scores[r.id] === n}
                        onClick={() => setScores((prev) => ({ ...prev, [r.id]: n }))}
                        className={cx(
                          "h-8 flex-1 rounded border text-xs font-medium transition-colors",
                          scores[r.id] === n ? "border-hire bg-hire text-white" : "border-line text-muted hover:bg-sunken"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11.5px] text-faint">Scores are entered by the reviewer. The AI never makes the hiring decision.</p>
          </div>
          <Field label="Summary" htmlFor="iv-sum" hint={iv.summary ? undefined : "Demo summary — edit before saving."}>
            <Textarea id="iv-sum" className="min-h-[120px]" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>
        </div>
      </div>
    </Drawer>
  );
}
