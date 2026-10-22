import { useEffect, useRef, useState } from "react";
import { Bot, Copy, FileSignature, MailPlus, Save, Send, ShieldCheck, Sparkles, Trash2, User } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  DemoNote,
  EmptyState,
  Field,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  Tabs,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { FAQ_SUGGESTIONS, HR_TEMPLATES, faqAnswer, interviewInvite, offerLetter } from "./data.js";
import { copyText } from "../../lib/clipboard.js";
import { combineDateTime, longDate, todayKey } from "../../lib/date.js";
import { relativeTime, sleep } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

function useDraftActions() {
  const toast = useToast();
  const { saveDraft, log } = useStore();
  return {
    copy: async (text) => {
      const ok = await copyText(text);
      toast({ kind: ok ? "success" : "error", title: ok ? "Copied to clipboard" : "Copy failed" });
    },
    save: (tool, title, content) => {
      saveDraft({ tool, title, studio: "hire", content });
      log("hire", `${tool} saved: ${title}`);
      toast({ kind: "success", title: "Draft saved", body: "Find it under Templates & drafts." });
    },
  };
}

export function HrToolsPage() {
  const [tab, setTab] = useState("offer");
  return (
    <>
      <PageHeader
        studio="hire"
        title="HR Tools"
        description="Draft offer letters and interview invitations, test the candidate FAQ bot, and reuse HR templates."
        badge={<DemoBadge label="Drafts only" />}
      />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "offer", label: "Offer letter" },
          { value: "invite", label: "Interview invitation" },
          { value: "faq", label: "Candidate FAQ bot" },
          { value: "templates", label: "Templates & drafts" },
        ]}
      />
      {tab === "offer" ? <OfferLetter /> : null}
      {tab === "invite" ? <Invitation /> : null}
      {tab === "faq" ? <FaqBot /> : null}
      {tab === "templates" ? <Templates /> : null}
    </>
  );
}

const CHECKS = [
  "Compensation and start date match the approved offer",
  "Notice, probation and confidentiality clauses come from the approved legal template",
  "Reviewed by an authorised HR signatory",
];

function OfferLetter() {
  const toast = useToast();
  const actions = useDraftActions();
  const { candidates, jobs, user } = useStore();
  const eligible = candidates.filter((c) => ["Offer", "Interview", "Shortlisted"].includes(c.stage));

  const [candidateId, setCandidateId] = useState(eligible[0]?.id ?? "");
  const candidate = candidates.find((c) => c.id === candidateId);
  const job = jobs.find((j) => j.id === candidate?.jobId);

  const [form, setForm] = useState({ company: user.company, location: "", ctc: "", start: "", deadline: "", signatory: "", signatoryTitle: "HR Manager" });
  const [errors, setErrors] = useState({});
  const [letter, setLetter] = useState("");
  const [busy, setBusy] = useState(false);
  const [checks, setChecks] = useState([false, false, false]);
  const [final, setFinal] = useState(false);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => set("location", job?.location ?? ""), [job]);

  async function draft() {
    const next = {};
    if (!form.ctc.trim()) next.ctc = "Enter the agreed compensation.";
    if (!form.start) next.start = "Choose a start date.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setChecks([false, false, false]);
    setFinal(false);
    await sleep(900);
    setLetter(
      offerLetter({
        ...form,
        candidate: candidate?.name,
        role: job?.title,
        date: longDate(new Date()),
        start: longDate(`${form.start}T00:00:00`),
        deadline: form.deadline ? longDate(`${form.deadline}T00:00:00`) : "",
      })
    );
    setBusy(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
      <Card className="h-fit">
        <CardHeader title="Terms" />
        <div className="space-y-4 px-5 py-4">
          <Field label="Candidate" htmlFor="o-c">
            <Select id="o-c" value={candidateId} options={eligible.map((c) => ({ value: c.id, label: `${c.name} · ${c.stage}` }))} onChange={(e) => setCandidateId(e.target.value)} />
          </Field>
          <Field label="Company" htmlFor="o-co">
            <Input id="o-co" value={form.company} onChange={(e) => set("company", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" htmlFor="o-loc">
              <Input id="o-loc" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label="Annual CTC" htmlFor="o-ctc" hint={errors.ctc}>
              <Input id="o-ctc" invalid={Boolean(errors.ctc)} value={form.ctc} placeholder="₹12,00,000" onChange={(e) => set("ctc", e.target.value)} />
            </Field>
            <Field label="Start date" htmlFor="o-start" hint={errors.start}>
              <Input id="o-start" type="date" min={todayKey()} invalid={Boolean(errors.start)} value={form.start} onChange={(e) => set("start", e.target.value)} />
            </Field>
            <Field label="Reply by" htmlFor="o-dl" optional>
              <Input id="o-dl" type="date" min={todayKey()} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            </Field>
            <Field label="Signatory" htmlFor="o-sig" optional>
              <Input id="o-sig" value={form.signatory} onChange={(e) => set("signatory", e.target.value)} />
            </Field>
            <Field label="Title" htmlFor="o-sigt">
              <Input id="o-sigt" value={form.signatoryTitle} onChange={(e) => set("signatoryTitle", e.target.value)} />
            </Field>
          </div>
          <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={draft}>
            Draft offer letter
          </Button>
        </div>
      </Card>

      <Card className="min-w-0">
        <CardHeader
          title="Offer letter"
          action={letter ? (final ? <Badge tone="success">Final</Badge> : <Badge tone="warning">Draft · needs review</Badge>) : null}
        />
        {letter ? (
          <div className="space-y-4 p-5">
            <Textarea aria-label="Offer letter text" className="min-h-[340px] leading-6" disabled={final} value={letter} onChange={(e) => setLetter(e.target.value)} />
            <fieldset className="rounded-md bg-sunken p-4">
              <legend className="flex items-center gap-2 text-[13px] font-medium text-ink">
                <ShieldCheck className="h-4 w-4 text-hire" aria-hidden />
                Review before finalising
              </legend>
              <div className="mt-2 space-y-2">
                {CHECKS.map((label, i) => (
                  <label key={label} className="flex items-start gap-2.5 text-[13px] text-ink">
                    <input
                      type="checkbox"
                      disabled={final}
                      checked={checks[i]}
                      onChange={(e) => setChecks((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
                      className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" icon={Copy} onClick={() => actions.copy(letter)}>Copy</Button>
              <Button icon={Save} onClick={() => actions.save("Offer letter", `Offer — ${candidate?.name}`, letter)}>Save draft</Button>
              {final ? (
                <Button onClick={() => setFinal(false)}>Reopen for edits</Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={!checks.every(Boolean)}
                  title={checks.every(Boolean) ? undefined : "Complete the review checklist first"}
                  onClick={() => {
                    setFinal(true);
                    actions.save("Offer letter (final)", `Offer — ${candidate?.name}`, letter);
                    toast({ kind: "success", title: "Marked as final", body: "Sending needs a connected email or e-sign service." });
                  }}
                >
                  Mark as final
                </Button>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={FileSignature}
            title="No draft yet"
            description="Pick a candidate, enter the agreed terms and draft the letter. It stays a draft until the review checklist is complete."
          />
        )}
      </Card>
    </div>
  );
}

function Invitation() {
  const actions = useDraftActions();
  const { candidates, jobs, user } = useStore();
  const open = candidates.filter((c) => !["Hired", "Rejected"].includes(c.stage));
  const [form, setForm] = useState({
    candidateId: open[0]?.id ?? "",
    mode: "Video",
    day: todayKey(2),
    time: "11:00",
    duration: "45 minutes",
    round: "Technical round",
    address: "",
    signatory: "",
  });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const candidate = candidates.find((c) => c.id === form.candidateId);

  async function write() {
    setBusy(true);
    await sleep(700);
    const when = new Date(combineDateTime(form.day, form.time)).toLocaleString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
    setText(
      interviewInvite({
        ...form,
        when,
        candidate: candidate?.name.split(" ")[0],
        role: jobs.find((j) => j.id === candidate?.jobId)?.title,
        company: user.company,
      })
    );
    setBusy(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
      <Card className="h-fit">
        <CardHeader title="Slot" />
        <div className="space-y-4 px-5 py-4">
          <Field label="Candidate" htmlFor="inv-c">
            <Select id="inv-c" value={form.candidateId} options={open.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => set("candidateId", e.target.value)} />
          </Field>
          <Field label="Format">
            <SegmentedControl size="sm" label="Format" value={form.mode} options={["Video", "Phone", "On-site"]} onChange={(v) => set("mode", v)} />
          </Field>
          {form.mode === "On-site" ? (
            <Field label="Office address" htmlFor="inv-a">
              <Input id="inv-a" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" htmlFor="inv-d">
              <Input id="inv-d" type="date" min={todayKey()} value={form.day} onChange={(e) => set("day", e.target.value)} />
            </Field>
            <Field label="Time" htmlFor="inv-t">
              <Input id="inv-t" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </Field>
            <Field label="Duration" htmlFor="inv-du">
              <Select id="inv-du" value={form.duration} options={["30 minutes", "45 minutes", "60 minutes", "90 minutes"]} onChange={(e) => set("duration", e.target.value)} />
            </Field>
            <Field label="Round" htmlFor="inv-r">
              <Select id="inv-r" value={form.round} options={["Screening call", "Technical round", "System design", "HR discussion", "Final round"]} onChange={(e) => set("round", e.target.value)} />
            </Field>
          </div>
          <Field label="Your name" htmlFor="inv-s" optional>
            <Input id="inv-s" value={form.signatory} onChange={(e) => set("signatory", e.target.value)} />
          </Field>
          <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={write}>
            Write invitation
          </Button>
        </div>
      </Card>
      <Card className="min-w-0">
        <CardHeader title="Invitation" />
        {text ? (
          <div className="space-y-3 p-5">
            <Textarea aria-label="Invitation text" className="min-h-[300px]" value={text} onChange={(e) => setText(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" icon={Copy} onClick={() => actions.copy(text)}>Copy</Button>
              <Button variant="primary" icon={Save} onClick={() => actions.save("Interview invitation", `Invite — ${candidate?.name}`, text)}>Save draft</Button>
            </div>
          </div>
        ) : (
          <EmptyState icon={MailPlus} title="No invitation yet" description="Choose a candidate and slot. The invite covers format, timing and next steps." />
        )}
      </Card>
    </div>
  );
}

function FaqBot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I answer common questions from applicants about the hiring process. What would you like to know?", confident: true },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);

  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [messages]);

  async function ask(question) {
    if (!question.trim() || busy) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    await sleep(600);
    const answer = faqAnswer(question);
    setMessages((prev) => [...prev, { role: "bot", ...answer }]);
    setBusy(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <Card className="flex h-[560px] flex-col">
        <CardHeader title="Candidate FAQ bot" description="Test how the bot answers applicants." />
        <div className="flex-1 space-y-3 overflow-y-auto p-5" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={cx("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
              <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full", m.role === "bot" ? "bg-hire-soft text-hire" : "bg-sunken text-muted")}>
                {m.role === "bot" ? <Bot className="h-4 w-4" aria-hidden /> : <User className="h-4 w-4" aria-hidden />}
              </span>
              <div className={cx("max-w-[80%]", m.role === "user" && "text-right")}>
                <p className={cx("inline-block rounded-lg px-3 py-2 text-left text-[13px] leading-6", m.role === "bot" ? "bg-sunken text-ink" : "bg-accent text-white")}>{m.text}</p>
                {m.role === "bot" && !m.confident ? (
                  <p className="mt-1">
                    <Badge tone="warning">Handed to a recruiter</Badge>
                  </p>
                ) : null}
              </div>
            </div>
          ))}
          {busy ? <div className="ml-9 h-9 w-48 animate-pulse rounded-lg bg-sunken" /> : null}
          <div ref={end} />
        </div>
        <form
          className="flex gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <label htmlFor="faq-q" className="sr-only">
            Ask a question
          </label>
          <Input id="faq-q" value={input} placeholder="Ask as a candidate would…" onChange={(e) => setInput(e.target.value)} />
          <Button type="submit" variant="primary" icon={Send} disabled={!input.trim() || busy}>
            Send
          </Button>
        </form>
      </Card>
      <div className="space-y-4">
        <Card className="p-5">
          <p className="text-[13px] font-medium text-ink">Try asking</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {FAQ_SUGGESTIONS.map((q) => (
              <button key={q} onClick={() => ask(q)} className="rounded-md border border-line px-2.5 py-1.5 text-left text-[13px] text-ink transition-colors hover:bg-sunken">
                {q}
              </button>
            ))}
          </div>
        </Card>
        <DemoNote>
          Answers come from a small sample FAQ. In production the bot would answer from your own policies and job posts, and
          hand off to a recruiter whenever it is not sure.
        </DemoNote>
      </div>
    </div>
  );
}

function Templates() {
  const actions = useDraftActions();
  const { drafts, update } = useStore();
  const [active, setActive] = useState(HR_TEMPLATES[0].id);
  const [edits, setEdits] = useState({});
  const template = HR_TEMPLATES.find((t) => t.id === active);
  const body = edits[active] ?? template.body;
  const hrDrafts = drafts.filter((d) => d.studio === "hire");

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Card className="h-fit p-2">
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">Templates</p>
        {HR_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            aria-current={active === t.id}
            className={cx("block w-full rounded-md px-2.5 py-2 text-left text-[13px] transition-colors", active === t.id ? "bg-hire-soft font-medium text-ink" : "text-muted hover:bg-sunken")}
          >
            {t.name}
          </button>
        ))}
      </Card>
      <div className="min-w-0 space-y-5">
        <Card>
          <CardHeader title={template.name} description="Replace the [placeholders] before sending." />
          <div className="space-y-3 p-5">
            <Textarea aria-label="Template text" className="min-h-[220px]" value={body} onChange={(e) => setEdits({ ...edits, [active]: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" icon={Copy} onClick={() => actions.copy(body)}>Copy</Button>
              <Button icon={Save} onClick={() => actions.save("HR template", template.name, body)}>Save as draft</Button>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Saved HR drafts" description={`${hrDrafts.length} saved`} />
          {hrDrafts.length === 0 ? (
            <EmptyState compact icon={FileSignature} title="No saved drafts" description="Offer letters, invitations and templates you save appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {hrDrafts.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{d.title}</p>
                    <p className="text-[11.5px] text-faint">{d.tool} · {relativeTime(d.createdAt)}</p>
                  </div>
                  <Button size="icon" variant="ghost" icon={Copy} aria-label="Copy draft" onClick={() => actions.copy(d.content)} />
                  <Button size="icon" variant="ghost" icon={Trash2} aria-label="Delete draft" onClick={() => update("drafts")((prev) => prev.filter((x) => x.id !== d.id))} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
