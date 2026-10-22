import { useMemo, useState } from "react";
import { CalendarDays, Copy, Heart, Link2, List, MessageCircle, Send, Share2, Sparkles, SquarePen, Trash2 } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  DemoNote,
  EmptyState,
  Field,
  Input,
  Modal,
  MonthCalendar,
  PageHeader,
  SegmentedControl,
  Select,
  StepProgress,
  TagInput,
  Tabs,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { PLATFORMS, PLATFORM_LIMIT, composePost } from "./social.js";
import { copyText } from "../../lib/clipboard.js";
import { combineDateTime, dateKey, timeLabel, timeOf, todayKey } from "../../lib/date.js";
import { formatDateTime } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const STEPS = ["Reading the topic", "Shaping it for the platform", "Writing the caption", "Picking hashtags"];

/** What the post will look like in the feed — the check that catches bad line breaks. */
function PostPreview({ post }) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-2.5 p-3">
        <Avatar name="Catzora Labs" size="sm" />
        <div>
          <p className="text-[13px] font-semibold text-ink">Your brand</p>
          <p className="text-[11px] text-faint">{post.platform} · preview</p>
        </div>
      </div>
      {post.platform === "Instagram" ? (
        <div className="aspect-square bg-gradient-to-br from-grow-soft to-accent-soft p-6">
          <div className="grid h-full place-items-center rounded-md bg-surface/70 p-4 text-center text-[15px] font-semibold text-ink">
            {post.slides?.[0] ?? post.content.split("\n")[0]}
          </div>
        </div>
      ) : null}
      <p className="whitespace-pre-wrap px-3 pb-2 pt-1 text-[13px] leading-5 text-ink">
        {post.content}
        {post.hashtags?.length ? <span className="text-accent">{`\n\n${post.hashtags.join(" ")}`}</span> : null}
      </p>
      {post.format === "Carousel" && post.slides && post.platform !== "Instagram" ? (
        <p className="px-3 pb-2 text-[11.5px] text-faint">+ {post.slides.length}-slide carousel</p>
      ) : null}
      <div className="flex gap-5 border-t border-line px-3 py-2 text-faint">
        <Heart className="h-4 w-4" aria-hidden />
        <MessageCircle className="h-4 w-4" aria-hidden />
        <Send className="h-4 w-4" aria-hidden />
      </div>
    </div>
  );
}

export function SocialStudioPage() {
  const toast = useToast();
  const { socialPosts, addItem, updateItem, removeItem, log, touchProject } = useStore();

  const [tab, setTab] = useState("compose");
  const [form, setForm] = useState({ platform: "LinkedIn", format: "Post", topic: "", goal: "Awareness", tone: "Professional" });
  const [draft, setDraft] = useState(null);
  const [when, setWhen] = useState({ day: todayKey(1), time: "10:00" });
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [connect, setConnect] = useState(null);
  const [filters, setFilters] = useState({ platform: "All", status: "All" });
  const { busy, step, run } = useRun(STEPS);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const limit = PLATFORM_LIMIT[form.platform];
  const overLimit = draft ? draft.content.length > limit : false;

  const scheduled = socialPosts.filter((p) => p.status === "Scheduled");

  const byDay = useMemo(() => {
    const map = {};
    scheduled.forEach((post) => {
      const key = dateKey(post.scheduledAt);
      (map[key] ||= []).push(post);
    });
    return map;
  }, [scheduled]);

  const listed = socialPosts
    .filter((p) => (filters.platform === "All" || p.platform === filters.platform) && (filters.status === "All" || p.status === filters.status))
    .sort((a, b) => (b.scheduledAt ?? b.createdAt).localeCompare(a.scheduledAt ?? a.createdAt));

  async function generate() {
    if (form.topic.trim().length < 3) {
      setError("Give the post a topic.");
      return;
    }
    setError("");
    const next = await run(() => composePost(form));
    if (!next) return;
    setDraft({ ...next, platform: form.platform, format: form.format });
  }

  function save(status) {
    let scheduledAt;
    if (status === "Scheduled") {
      scheduledAt = combineDateTime(when.day, when.time);
      if (new Date(scheduledAt).getTime() < Date.now()) {
        toast({ kind: "error", title: "Pick a future date and time" });
        return;
      }
    }
    addItem("socialPosts", {
      platform: form.platform,
      format: form.format,
      content: draft.content,
      hashtags: draft.hashtags,
      slides: draft.slides,
      status,
      scheduledAt,
    });
    log("grow", status === "Scheduled" ? `${form.platform} post scheduled for ${formatDateTime(scheduledAt)}` : `${form.platform} draft saved`);
    touchProject(draft.content.split("\n")[0].slice(0, 60), `Social · ${form.platform}`, "grow");
    toast({
      kind: "success",
      title: status === "Scheduled" ? "Post scheduled" : "Draft saved",
      body: status === "Scheduled" ? `It stays queued until ${form.platform} is connected.` : undefined,
    });
    setDraft(null);
    set("topic", "");
  }

  return (
    <>
      <PageHeader
        studio="grow"
        title="Social Media"
        description="Write posts shaped for each platform, see them as they will appear, and schedule them on a calendar you can edit."
        badge={<DemoBadge label="Nothing is published" />}
      />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
          <p className="text-[13px] font-medium text-ink">Accounts</p>
          {PLATFORMS.map((platform) => (
            <div key={platform} className="flex items-center gap-2">
              <span className="text-[13px] text-muted">{platform}</span>
              <Badge>Not connected</Badge>
              <Button size="sm" variant="ghost" icon={Link2} onClick={() => setConnect(platform)}>
                Connect
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "compose", label: "Compose" },
          { value: "calendar", label: "Calendar", count: scheduled.length },
          { value: "list", label: "All posts", count: socialPosts.length },
        ]}
      />

      {tab === "compose" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
          <Card className="h-fit">
            <CardHeader title="Compose" description="What to say, and where it goes." />
            <div className="space-y-4 px-5 py-4">
              <Field label="Platform">
                <SegmentedControl label="Platform" value={form.platform} options={PLATFORMS} onChange={(v) => set("platform", v)} />
              </Field>

              <Field label="Format">
                <SegmentedControl size="sm" label="Format" value={form.format} options={["Post", "Carousel"]} onChange={(v) => set("format", v)} />
              </Field>

              <Field label="Topic" htmlFor="s-topic" hint={error || undefined}>
                <Input
                  id="s-topic"
                  value={form.topic}
                  invalid={Boolean(error)}
                  placeholder="e.g. how small teams save time on hiring"
                  onChange={(e) => set("topic", e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Goal" htmlFor="s-goal">
                  <Select
                    id="s-goal"
                    value={form.goal}
                    options={["Awareness", "Engagement", "Traffic", "Lead generation", "Hiring"]}
                    onChange={(e) => set("goal", e.target.value)}
                  />
                </Field>
                <Field label="Tone" htmlFor="s-tone">
                  <Select
                    id="s-tone"
                    value={form.tone}
                    options={["Professional", "Friendly", "Bold", "Witty"]}
                    onChange={(e) => set("tone", e.target.value)}
                  />
                </Field>
              </div>

              <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={busy} onClick={generate}>
                {busy ? "Writing…" : draft ? "Rewrite" : "Generate post"}
              </Button>

              {busy ? <StepProgress steps={STEPS} current={step} /> : null}
            </div>
          </Card>

          <div className="min-w-0">
            {draft ? (
              <div className="grid gap-5 xl:grid-cols-2">
                <Card>
                  <CardHeader title="Edit" description={`${form.platform} · ${form.format}`} />
                  <div className="space-y-4 px-5 py-4">
                    <Field
                      label="Caption"
                      htmlFor="s-caption"
                      hint={
                        <span className={cx(overLimit && "text-danger")}>
                          {draft.content.length.toLocaleString()} / {limit.toLocaleString()} characters
                        </span>
                      }
                    >
                      <Textarea
                        id="s-caption"
                        className="min-h-[180px]"
                        invalid={overLimit}
                        value={draft.content}
                        onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                      />
                    </Field>

                    <Field label="Hashtags" htmlFor="s-tags" hint="Press Enter after each.">
                      <TagInput
                        id="s-tags"
                        value={draft.hashtags}
                        onChange={(tags) => setDraft({ ...draft, hashtags: tags.map((t) => (t.startsWith("#") ? t : `#${t}`)) })}
                      />
                    </Field>

                    {draft.slides ? (
                      <Field label="Carousel slides" htmlFor="s-slides" hint="One slide per line.">
                        <Textarea
                          id="s-slides"
                          value={draft.slides.join("\n")}
                          onChange={(e) => setDraft({ ...draft, slides: e.target.value.split("\n") })}
                        />
                      </Field>
                    ) : null}

                    <div className="rounded-md bg-sunken p-3">
                      <p className="mb-1.5 text-[13px] font-medium text-ink">Schedule</p>
                      <div className="flex flex-wrap gap-2">
                        <Input
                          type="date"
                          aria-label="Date"
                          className="flex-1"
                          min={todayKey()}
                          value={when.day}
                          onChange={(e) => setWhen((p) => ({ ...p, day: e.target.value }))}
                        />
                        <Input
                          type="time"
                          aria-label="Time"
                          className="w-auto"
                          value={when.time}
                          onChange={(e) => setWhen((p) => ({ ...p, time: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="ghost"
                        icon={Copy}
                        onClick={async () => {
                          const ok = await copyText(`${draft.content}\n\n${draft.hashtags.join(" ")}`);
                          toast({ kind: ok ? "success" : "error", title: ok ? "Copied" : "Copy failed" });
                        }}
                      >
                        Copy
                      </Button>
                      <Button onClick={() => save("Draft")}>Save draft</Button>
                      <Button variant="primary" icon={CalendarDays} onClick={() => save("Scheduled")}>
                        Schedule
                      </Button>
                    </div>
                  </div>
                </Card>

                <div>
                  <p className="mb-2 text-[13px] font-medium text-muted">{form.platform} preview</p>
                  <PostPreview post={{ ...draft, platform: form.platform, format: form.format }} />
                </div>
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={Share2}
                  title="Generate a post to start"
                  description="You will get a caption shaped for the platform, hashtag suggestions and — for carousels — a slide outline. Everything is editable before it is scheduled."
                />
              </Card>
            )}
          </div>
        </div>
      ) : null}

      {tab === "calendar" ? (
        <Card className="p-5">
          <MonthCalendar
            label="Social calendar"
            items={byDay}
            renderItem={(post) => (
              <button
                key={post.id}
                onClick={() => setEditing(post)}
                className="mb-1 block w-full truncate rounded bg-grow-soft px-1.5 py-0.5 text-left text-[11px] text-grow transition-shadow hover:shadow-card"
              >
                {timeLabel(post.scheduledAt)} {post.platform}
              </button>
            )}
          />
          <DemoNote>
            Double-click a day to see it in the list. Scheduled posts stay in Catzora — nothing is published anywhere.
          </DemoNote>
        </Card>
      ) : null}

      {tab === "list" ? (
        <Card>
          <CardHeader
            title="All posts"
            description={`${listed.length} of ${socialPosts.length}`}
            action={
              <div className="flex gap-2">
                <Select
                  aria-label="Filter by platform"
                  className="w-32"
                  value={filters.platform}
                  options={["All", ...PLATFORMS]}
                  onChange={(e) => setFilters((p) => ({ ...p, platform: e.target.value }))}
                />
                <Select
                  aria-label="Filter by status"
                  className="w-32"
                  value={filters.status}
                  options={["All", "Draft", "Scheduled"]}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                />
              </div>
            }
          />
          {listed.length === 0 ? (
            <EmptyState compact icon={List} title="No posts match" description="Change the filters, or compose a new post." />
          ) : (
            <ul className="divide-y divide-line">
              {listed.map((post) => (
                <li key={post.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center">
                  <div className="flex shrink-0 gap-1.5">
                    <Badge tone="grow">{post.platform}</Badge>
                    <Badge tone={post.status === "Scheduled" ? "accent" : "neutral"}>{post.status}</Badge>
                  </div>
                  <button onClick={() => setEditing(post)} className="min-w-0 flex-1 truncate text-left text-[13px] text-ink hover:text-accent">
                    {post.content.split("\n")[0]}
                  </button>
                  <span className="shrink-0 text-[11.5px] text-faint">
                    {post.scheduledAt ? formatDateTime(post.scheduledAt) : "Not scheduled"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      <EditPostModal key={editing?.id ?? "none"} post={editing} onClose={() => setEditing(null)} onUpdate={updateItem} onRemove={removeItem} onAdd={addItem} />

      <Modal
        open={Boolean(connect)}
        onClose={() => setConnect(null)}
        size="sm"
        title={`Connect ${connect ?? ""}`}
        footer={
          <Button variant="primary" onClick={() => setConnect(null)}>
            Understood
          </Button>
        }
      >
        <p className="text-[13px] leading-6 text-muted">
          Publishing to {connect} would use its official API and a sign-in on your own account. That integration is not
          configured in this build, so posts you schedule stay inside Catzora and are never published automatically.
        </p>
      </Modal>
    </>
  );
}

function EditPostModal({ post, onClose, onUpdate, onRemove, onAdd }) {
  const toast = useToast();
  const [value, setValue] = useState(post);

  // Remount per post via the key below keeps this in step with the selection.
  if (!post || !value) return null;

  const scheduled = Boolean(value.scheduledAt);
  const day = scheduled ? dateKey(value.scheduledAt) : todayKey(1);
  const time = scheduled ? timeOf(value.scheduledAt) : "10:00";

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`${value.platform} ${value.status.toLowerCase()}`}
      footer={
        <>
          <Button
            variant="ghost"
            icon={Trash2}
            className="mr-auto text-danger"
            onClick={() => {
              onRemove("socialPosts", value.id);
              toast({ kind: "success", title: "Post deleted" });
              onClose();
            }}
          >
            Delete
          </Button>
          <Button
            icon={Copy}
            onClick={() => {
              onAdd("socialPosts", { ...value, id: undefined, status: "Draft", scheduledAt: undefined, createdAt: undefined });
              toast({ kind: "success", title: "Duplicated as a draft" });
              onClose();
            }}
          >
            Duplicate
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onUpdate("socialPosts", value.id, value);
              toast({ kind: "success", title: "Post updated" });
              onClose();
            }}
          >
            Save changes
          </Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Caption" htmlFor="e-content">
            <Textarea id="e-content" className="min-h-[160px]" value={value.content} onChange={(e) => setValue({ ...value, content: e.target.value })} />
          </Field>
          <Field label="Hashtags" htmlFor="e-tags">
            <TagInput id="e-tags" value={value.hashtags || []} onChange={(tags) => setValue({ ...value, hashtags: tags })} />
          </Field>
          <Field label="Scheduled for" htmlFor="e-day" hint={scheduled ? undefined : "Setting a time schedules this draft."}>
            <div className="flex gap-2">
              <Input
                id="e-day"
                type="date"
                className="flex-1"
                value={day}
                onChange={(e) => setValue({ ...value, scheduledAt: combineDateTime(e.target.value, time), status: "Scheduled" })}
              />
              <Input
                type="time"
                aria-label="Time"
                className="w-auto"
                value={time}
                onChange={(e) => setValue({ ...value, scheduledAt: combineDateTime(day, e.target.value), status: "Scheduled" })}
              />
            </div>
          </Field>
          {scheduled ? (
            <Button size="sm" variant="ghost" icon={SquarePen} onClick={() => setValue({ ...value, status: "Draft", scheduledAt: undefined })}>
              Unschedule — move to drafts
            </Button>
          ) : null}
        </div>
        <PostPreview post={value} />
      </div>
    </Modal>
  );
}
