import { useState } from "react";
import { Copy, Mail, RefreshCw, Save, Send, Sparkles, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  SegmentedControl,
  Select,
  StepProgress,
  Textarea,
  Toggle,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { writeEmail } from "./content.js";
import { copyText } from "../../lib/clipboard.js";
import { relativeTime } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const STEPS = ["Reading the context", "Finding the angle", "Writing the email", "Drafting the follow-ups"];
const KINDS = ["Cold email", "Business outreach", "Personalised sales email", "Partnership pitch", "Follow-up"];

export function EmailStudioPage() {
  const toast = useToast();
  const { drafts, saveDraft, update, log, touchProject } = useStore();

  const [form, setForm] = useState({
    kind: "Cold email",
    senderCompany: "",
    offer: "",
    recipientName: "",
    recipientRole: "",
    recipientCompany: "",
    context: "",
    tone: "Friendly",
    length: "Medium",
    sequence: true,
  });
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState(null);
  const [subject, setSubject] = useState(0);
  const [sendOpen, setSendOpen] = useState(false);
  const { busy, step, run } = useRun(STEPS);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const saved = drafts.filter((d) => d.tool === "Email");

  const fullText = email
    ? [
        `Subject: ${email.subjects[subject]}`,
        "",
        email.body,
        ...email.followUps.flatMap((f) => ["", "---", `Follow-up · day ${f.day}`, "", f.body]),
      ].join("\n")
    : "";

  async function generate() {
    const next = {};
    if (!form.offer.trim()) next.offer = "Say what you are offering, in a few words.";
    if (!form.recipientName.trim()) next.recipientName = "Add the recipient's name so the email can be personal.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const result = await run(() => writeEmail(form));
    if (!result) return;
    setEmail(result);
    setSubject(0);
    touchProject(`${form.kind} → ${form.recipientName}`, "Email", "grow");
  }

  return (
    <>
      <PageHeader
        studio="grow"
        title="Email Marketing"
        description="Personalised cold emails and outreach with a follow-up sequence, written from the context you give it."
        badge={<DemoBadge label="Nothing is sent" />}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,400px)_1fr]">
        <Card className="h-fit">
          <CardHeader title="Who and why" description="The more specific the context, the more personal the draft." />
          <div className="space-y-4 px-5 py-4">
            <Field label="Email type" htmlFor="e-kind">
              <Select id="e-kind" value={form.kind} options={KINDS} onChange={(e) => set("kind", e.target.value)} />
            </Field>

            <fieldset className="space-y-3">
              <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-faint">About you</legend>
              <Field label="Your company" htmlFor="e-sc" optional>
                <Input id="e-sc" value={form.senderCompany} placeholder="e.g. Catzora Labs" onChange={(e) => set("senderCompany", e.target.value)} />
              </Field>
              <Field label="What you're offering" htmlFor="e-offer" hint={errors.offer}>
                <Input
                  id="e-offer"
                  invalid={Boolean(errors.offer)}
                  value={form.offer}
                  placeholder="e.g. AI screening for high-volume hiring"
                  onChange={(e) => set("offer", e.target.value)}
                />
              </Field>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-faint">About the recipient</legend>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" htmlFor="e-rn" hint={errors.recipientName}>
                  <Input
                    id="e-rn"
                    invalid={Boolean(errors.recipientName)}
                    value={form.recipientName}
                    placeholder="Priya Shah"
                    onChange={(e) => set("recipientName", e.target.value)}
                  />
                </Field>
                <Field label="Role" htmlFor="e-rr" optional>
                  <Input id="e-rr" value={form.recipientRole} placeholder="Head of HR" onChange={(e) => set("recipientRole", e.target.value)} />
                </Field>
              </div>
              <Field label="Company" htmlFor="e-rc" optional>
                <Input id="e-rc" value={form.recipientCompany} placeholder="Acme Logistics" onChange={(e) => set("recipientCompany", e.target.value)} />
              </Field>
              <Field
                label="Personal context"
                htmlFor="e-ctx"
                optional
                hint="Something specific and public — a launch, a post, a hiring push."
              >
                <Textarea
                  id="e-ctx"
                  rows={3}
                  value={form.context}
                  placeholder="you're hiring 40 delivery associates in Pune this quarter"
                  onChange={(e) => set("context", e.target.value)}
                />
              </Field>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Tone">
                <SegmentedControl size="sm" label="Tone" value={form.tone} options={["Friendly", "Formal", "Direct"]} onChange={(v) => set("tone", v)} />
              </Field>
              <Field label="Length">
                <SegmentedControl size="sm" label="Length" value={form.length} options={["Short", "Medium"]} onChange={(v) => set("length", v)} />
              </Field>
            </div>

            <Toggle
              checked={form.sequence}
              onChange={(v) => set("sequence", v)}
              label="Add a follow-up sequence"
              description="Two follow-ups, on day 3 and day 7."
            />

            <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={generate}>
              {busy ? "Writing…" : "Write email"}
            </Button>
          </div>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card className="min-h-[420px]">
            <CardHeader
              title="Draft"
              description={email ? `${form.kind} → ${form.recipientName}` : "Nothing written yet"}
              action={
                email && !busy ? (
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Copy}
                      onClick={async () => {
                        const ok = await copyText(fullText);
                        toast({ kind: ok ? "success" : "error", title: ok ? "Copied the email and follow-ups" : "Copy failed" });
                      }}
                    >
                      Copy
                    </Button>
                    <Button size="sm" variant="ghost" icon={RefreshCw} onClick={generate}>
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      icon={Save}
                      onClick={() => {
                        saveDraft({ title: `${form.kind} → ${form.recipientName}`, studio: "grow", tool: "Email", content: fullText });
                        log("grow", `Email draft saved for ${form.recipientName}`);
                        toast({ kind: "success", title: "Draft saved" });
                      }}
                    >
                      Save draft
                    </Button>
                    <Button size="sm" variant="primary" icon={Send} onClick={() => setSendOpen(true)}>
                      Send…
                    </Button>
                  </div>
                ) : null
              }
            />

            {busy ? (
              <div className="px-5 py-6">
                <StepProgress steps={STEPS} current={step} />
              </div>
            ) : email ? (
              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="mb-1.5 text-[13px] font-medium text-ink">Subject line</p>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Subject line">
                    {email.subjects.map((line, i) => (
                      <button
                        key={line}
                        role="radio"
                        aria-checked={subject === i}
                        onClick={() => setSubject(i)}
                        className={cx(
                          "rounded-full border px-3 py-1 text-[13px] transition-colors",
                          subject === i ? "border-grow/40 bg-grow-soft text-grow" : "border-line text-muted hover:text-ink"
                        )}
                      >
                        {line}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Body" htmlFor="e-body" hint={`${email.body.split(/\s+/).length} words`}>
                  <Textarea id="e-body" className="min-h-[260px]" value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} />
                </Field>

                {email.followUps.length ? (
                  <div>
                    <p className="mb-1.5 text-[13px] font-medium text-ink">Follow-up sequence</p>
                    <ol className="space-y-3">
                      {email.followUps.map((followUp, i) => (
                        <li key={followUp.day} className="rounded-md border border-line p-3">
                          <Badge tone="grow">Day {followUp.day} · if no reply</Badge>
                          <Textarea
                            aria-label={`Follow-up ${i + 1}`}
                            className="mt-2"
                            value={followUp.body}
                            onChange={(e) =>
                              setEmail({
                                ...email,
                                followUps: email.followUps.map((f, j) => (j === i ? { ...f, body: e.target.value } : f)),
                              })
                            }
                          />
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState
                icon={Mail}
                title="Your email will appear here"
                description="Say what you offer and who you are writing to. You will get three subject lines, an editable body and an optional follow-up sequence."
              />
            )}
          </Card>

          <Card>
            <CardHeader title="Saved email drafts" description={`${saved.length} saved`} />
            {saved.length === 0 ? (
              <EmptyState compact icon={Mail} title="No saved drafts" description="Drafts you save stay here so you can reuse them." />
            ) : (
              <ul className="divide-y divide-line">
                {saved.map((draft) => (
                  <li key={draft.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{draft.title}</p>
                      <p className="text-[11.5px] text-faint">{relativeTime(draft.createdAt)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      icon={Copy}
                      aria-label="Copy draft"
                      onClick={async () => {
                        const ok = await copyText(draft.content);
                        toast({ kind: ok ? "success" : "error", title: ok ? "Copied" : "Copy failed" });
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      icon={Trash2}
                      aria-label="Delete draft"
                      onClick={() => update("drafts")((prev) => prev.filter((d) => d.id !== draft.id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        size="sm"
        title="Sending isn't connected"
        footer={
          <>
            <Button onClick={() => setSendOpen(false)}>Close</Button>
            <Button
              variant="primary"
              icon={Copy}
              onClick={async () => {
                await copyText(`Subject: ${email.subjects[subject]}\n\n${email.body}`);
                setSendOpen(false);
                toast({ kind: "success", title: "Copied — paste it into your email app" });
              }}
            >
              Copy email
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-6 text-muted">
          No email provider is configured, so Catzora cannot send this. Copy it into your own email client for now. When
          sending is enabled, every send will still need your explicit confirmation.
        </p>
      </Modal>
    </>
  );
}
