import { useMemo, useState } from "react";
import { FileText, Lightbulb, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  DemoBadge,
  Drawer,
  EmptyState,
  Field,
  Input,
  MonthCalendar,
  PageHeader,
  Select,
  Tabs,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { BLOG_STAGES, INTENTS, STAGE_TONE, blogDraft, blogIdeas, blogOutline } from "./content.js";
import { shortDate, todayKey } from "../../lib/date.js";
import { sleep } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const IDEA_STEPS = ["Reading the topic", "Finding search angles", "Grouping by intent"];

export function BlogStudioPage() {
  const toast = useToast();
  const { blogPosts, addItem, updateItem, removeItem, log, touchProject } = useStore();

  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [error, setError] = useState("");
  const [view, setView] = useState("board");
  const [openId, setOpenId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const ideaRun = useRun(IDEA_STEPS);

  const sorted = useMemo(() => [...blogPosts].sort((a, b) => a.date.localeCompare(b.date)), [blogPosts]);
  const open = blogPosts.find((p) => p.id === openId) ?? null;

  const byDay = useMemo(() => {
    const map = {};
    blogPosts.forEach((post) => (map[post.date] ||= []).push(post));
    return map;
  }, [blogPosts]);

  async function findIdeas() {
    if (topic.trim().length < 3) {
      setError("Add a topic of at least three characters.");
      return;
    }
    setError("");
    const next = await ideaRun.run(() => blogIdeas(topic, audience));
    if (next) setIdeas(next);
  }

  function schedule(idea) {
    // Space new articles a week apart after the last one already planned.
    const last = sorted.filter((p) => p.stage !== "Published").at(-1);
    const base = last ? new Date(`${last.date}T00:00:00`) : new Date();
    base.setDate(base.getDate() + 7);
    const date = todayKey(Math.max(1, Math.round((base - new Date()) / 86400000)));

    addItem("blogPosts", { ...idea, audience: audience || "General", stage: "Idea", date, outline: null, draft: null }, { append: true });
    setIdeas((prev) => prev.filter((i) => i.title !== idea.title));
    log("grow", `Blog idea added: ${idea.title}`);
    toast({ kind: "success", title: "Added to the calendar", body: `Planned for ${shortDate(`${date}T00:00:00`)}.` });
  }

  function move(id, stage) {
    const post = blogPosts.find((p) => p.id === id);
    if (!post || post.stage === stage) return;
    updateItem("blogPosts", id, { stage });
    log("grow", `${post.title} moved to ${stage}`);
  }

  return (
    <>
      <PageHeader
        studio="grow"
        title="Blog Automation"
        description="Find topics, build SEO outlines and drafts, and move every article from idea to published."
        badge={<DemoBadge label="Sample output" />}
      />

      <Card className="mb-5">
        <div className="grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto] md:items-start">
          <Field label="Topic or niche" htmlFor="b-topic" hint={error || undefined}>
            <Input id="b-topic" value={topic} invalid={Boolean(error)} placeholder="e.g. personal loans" onChange={(e) => setTopic(e.target.value)} />
          </Field>
          <Field label="Audience" htmlFor="b-aud" optional>
            <Input id="b-aud" value={audience} placeholder="e.g. first-time borrowers" onChange={(e) => setAudience(e.target.value)} />
          </Field>
          <Button variant="primary" icon={Lightbulb} loading={ideaRun.busy} className="md:mt-[26px]" onClick={findIdeas}>
            Get topic ideas
          </Button>
        </div>
        {ideas.length ? (
          <div className="border-t border-line px-5 py-4">
            <p className="mb-2 text-[13px] font-medium text-ink">Suggestions</p>
            <ul className="divide-y divide-line">
              {ideas.map((idea) => (
                <li key={idea.title} className="flex flex-wrap items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">{idea.title}</p>
                    <p className="text-[11.5px] text-faint">
                      Keyword: {idea.keyword} · {idea.intent}
                    </p>
                  </div>
                  <Button size="sm" icon={Plus} onClick={() => schedule(idea)}>
                    Add to calendar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Tabs
        className="mb-5"
        value={view}
        onChange={setView}
        tabs={[
          { value: "board", label: "Pipeline" },
          { value: "calendar", label: "Editorial calendar" },
          { value: "list", label: "List", count: blogPosts.length },
        ]}
      />

      {view === "board" ? (
        <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <p className="mb-2 text-[12px] text-faint">Drag a card to another column, or open it to change its stage.</p>
          <div className="grid min-w-[960px] grid-cols-5 gap-3">
            {BLOG_STAGES.map((stage) => {
              const posts = sorted.filter((p) => p.stage === stage);
              return (
                <section
                  key={stage}
                  aria-label={`${stage}, ${posts.length} articles`}
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
                    "rounded-lg bg-sunken/70 p-2.5 transition-colors",
                    dropTarget === stage && "bg-grow-soft ring-2 ring-grow/40"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <Badge tone={STAGE_TONE[stage]} dot>
                      {stage}
                    </Badge>
                    <span className="text-[11.5px] text-faint">{posts.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {posts.map((post) => (
                      <li
                        key={post.id}
                        draggable
                        onDragStart={() => setDragging(post.id)}
                        onDragEnd={() => {
                          setDragging(null);
                          setDropTarget(null);
                        }}
                        className={cx("cursor-grab active:cursor-grabbing", dragging === post.id && "opacity-50")}
                      >
                        <button
                          onClick={() => setOpenId(post.id)}
                          className="w-full rounded-md border border-line bg-surface p-3 text-left shadow-card transition-shadow hover:shadow-lift"
                        >
                          <p className="text-[13px] font-medium leading-snug text-ink">{post.title}</p>
                          <p className="mt-1.5 text-[11px] text-faint">
                            {post.keyword} · {shortDate(`${post.date}T00:00:00`)}
                          </p>
                          {post.outline || post.draft ? (
                            <div className="mt-2 flex gap-1">
                              {post.outline ? <Badge>Outline</Badge> : null}
                              {post.draft ? <Badge>Draft</Badge> : null}
                            </div>
                          ) : null}
                        </button>
                      </li>
                    ))}
                    {posts.length === 0 ? (
                      <li className="rounded-md border border-dashed border-line px-2 py-6 text-center text-[11.5px] text-faint">Drop here</li>
                    ) : null}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "calendar" ? (
        <Card className="p-5">
          <MonthCalendar
            label="Editorial calendar"
            items={byDay}
            renderItem={(post) => (
              <button
                key={post.id}
                onClick={() => setOpenId(post.id)}
                className="mb-1 block w-full truncate rounded bg-grow-soft px-1.5 py-0.5 text-left text-[11px] text-grow transition-shadow hover:shadow-card"
                title={post.title}
              >
                {post.title}
              </button>
            )}
          />
        </Card>
      ) : null}

      {view === "list" ? (
        <Card>
          <DataTable
            rows={sorted}
            getRowKey={(row) => row.id}
            onRowClick={(row) => setOpenId(row.id)}
            empty={<EmptyState compact icon={FileText} title="No articles yet" description="Get topic ideas above to start the pipeline." />}
            columns={[
              { key: "title", header: "Title", render: (r) => <span className="font-medium text-ink">{r.title}</span> },
              { key: "keyword", header: "Keyword", width: 200 },
              { key: "intent", header: "Intent", width: 130 },
              { key: "date", header: "Date", width: 100, render: (r) => shortDate(`${r.date}T00:00:00`) },
              { key: "stage", header: "Status", width: 120, render: (r) => <Badge tone={STAGE_TONE[r.stage]}>{r.stage}</Badge> },
            ]}
          />
        </Card>
      ) : null}

      <ArticleDrawer
        post={open}
        onClose={() => setOpenId(null)}
        onPatch={(patch) => updateItem("blogPosts", open.id, patch)}
        onMove={(stage) => move(open.id, stage)}
        onDelete={() => {
          removeItem("blogPosts", open.id);
          setOpenId(null);
          toast({ kind: "success", title: "Article removed" });
        }}
        onWritten={(title) => touchProject(title, "Blog Article", "grow")}
      />
    </>
  );
}

function ArticleDrawer({ post, onClose, onPatch, onMove, onDelete, onWritten }) {
  const [working, setWorking] = useState(null);

  async function generateOutline() {
    setWorking("outline");
    await sleep(900);
    onPatch({ outline: blogOutline(post) });
    if (post.stage === "Idea") onMove("Outline");
    setWorking(null);
  }

  async function writeDraft() {
    setWorking("draft");
    await sleep(1300);
    onPatch({ draft: blogDraft(post) });
    if (["Idea", "Outline"].includes(post.stage)) onMove("Draft");
    onWritten(post.title);
    setWorking(null);
  }

  return (
    <Drawer
      open={Boolean(post)}
      onClose={onClose}
      width="max-w-2xl"
      title="Article brief"
      description={post?.title}
      footer={
        post ? (
          <>
            <Button variant="ghost" icon={Trash2} className="mr-auto text-danger" onClick={onDelete}>
              Delete
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </>
        ) : null
      }
    >
      {post ? (
        <div className="space-y-5 p-5">
          <Field label="Title" htmlFor="bi-title">
            <Input id="bi-title" value={post.title} onChange={(e) => onPatch({ title: e.target.value })} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary keyword" htmlFor="bi-kw">
              <Input id="bi-kw" value={post.keyword} onChange={(e) => onPatch({ keyword: e.target.value })} />
            </Field>
            <Field label="Search intent" htmlFor="bi-intent">
              <Select id="bi-intent" value={post.intent} options={INTENTS} onChange={(e) => onPatch({ intent: e.target.value })} />
            </Field>
            <Field label="Audience" htmlFor="bi-aud">
              <Input id="bi-aud" value={post.audience} onChange={(e) => onPatch({ audience: e.target.value })} />
            </Field>
            <Field label="Publish date" htmlFor="bi-date">
              <Input id="bi-date" type="date" value={post.date} onChange={(e) => e.target.value && onPatch({ date: e.target.value })} />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink">Status</p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Status">
              {BLOG_STAGES.map((stage) => (
                <button
                  key={stage}
                  role="radio"
                  aria-checked={post.stage === stage}
                  onClick={() => onMove(stage)}
                  className={cx(
                    "rounded-full border px-3 py-1 text-[13px] transition-colors",
                    post.stage === stage ? "border-grow/40 bg-grow-soft text-grow" : "border-line text-muted hover:text-ink"
                  )}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <section className="rounded-md border border-line">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="text-[13px] font-medium text-ink">SEO outline</p>
              <Button size="sm" variant="subtle" icon={Sparkles} loading={working === "outline"} onClick={generateOutline}>
                {post.outline ? "Regenerate" : "Generate outline"}
              </Button>
            </div>
            {post.outline ? (
              <div className="p-4">
                <Textarea
                  aria-label="Outline"
                  className="min-h-[220px] font-mono text-[12.5px]"
                  value={post.outline.join("\n")}
                  onChange={(e) => onPatch({ outline: e.target.value.split("\n") })}
                />
              </div>
            ) : (
              <p className="px-4 py-5 text-[13px] text-muted">Suggested headings built around “{post.keyword}”.</p>
            )}
          </section>

          <section className="rounded-md border border-line">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="text-[13px] font-medium text-ink">Draft article</p>
              <Button size="sm" variant="subtle" icon={FileText} loading={working === "draft"} onClick={writeDraft}>
                {post.draft ? "Rewrite" : "Write draft"}
              </Button>
            </div>
            {post.draft ? (
              <div className="p-4">
                <Textarea aria-label="Draft" className="min-h-[300px]" value={post.draft} onChange={(e) => onPatch({ draft: e.target.value })} />
                <p className="mt-1.5 text-[12px] text-faint">{post.draft.split(/\s+/).length} words · sample draft</p>
              </div>
            ) : (
              <p className="px-4 py-5 text-[13px] text-muted">
                A first draft from the title, keyword and audience. Move it to Review when an editor should look at it.
              </p>
            )}
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}
