import { useState } from "react";
import { Copy, FolderKanban, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  EmptyState,
  Input,
  PageHeader,
  Tabs,
  useToast,
} from "../components/ui/index.js";
import { studios } from "../features/studios.js";
import { useStore } from "../store/AppStore.jsx";
import { copyText } from "../lib/clipboard.js";
import { relativeTime } from "../lib/format.js";

export function Projects() {
  const { projects, drafts, update } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const matches = (item) =>
    (tab === "all" || item.studio === tab) &&
    (!query.trim() || `${item.title} ${item.kind || item.tool || ""}`.toLowerCase().includes(query.toLowerCase()));

  const shownProjects = projects.filter(matches);
  const shownDrafts = drafts.filter(matches);

  async function copyDraft(draft) {
    const ok = await copyText(draft.content);
    toast(ok ? { kind: "success", title: "Copied" } : { kind: "error", title: "Copy failed" });
  }

  function deleteDraft(id) {
    update("drafts")((list) => list.filter((d) => d.id !== id));
    toast({ kind: "info", title: "Draft deleted" });
  }

  return (
    <>
      <PageHeader
        title="Projects & History"
        description="Everything you have produced in this workspace — recent projects on the left, saved drafts on the right."
        badge={<DemoBadge />}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: "All", count: projects.length },
            ...studios.map((s) => ({
              value: s.key,
              label: s.label,
              count: projects.filter((p) => p.studio === s.key).length,
            })),
          ]}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full sm:w-56"
          aria-label="Search projects and drafts"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Projects" description={`${shownProjects.length} shown`} />
          {shownProjects.length === 0 ? (
            <EmptyState compact icon={FolderKanban} title="Nothing here" description="Run a tool and it appears in this list." />
          ) : (
            <ul className="divide-y divide-line">
              {shownProjects.map((project) => (
                <li key={project.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink">{project.title}</p>
                    <p className="text-xs text-muted">
                      {project.kind} · {relativeTime(project.updatedAt)}
                    </p>
                  </div>
                  <Badge tone={project.studio}>{project.studio}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Saved drafts" description={`${shownDrafts.length} shown`} />
          {shownDrafts.length === 0 ? (
            <EmptyState compact icon={FolderKanban} title="No drafts" description="Use “Save draft” on any tool result." />
          ) : (
            <ul className="divide-y divide-line">
              {shownDrafts.map((draft) => (
                <li key={draft.id} className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-ink">{draft.title}</p>
                      <p className="text-xs text-muted">
                        {draft.tool} · {relativeTime(draft.createdAt)}
                      </p>
                    </div>
                    <Badge tone={draft.studio}>{draft.studio}</Badge>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="ghost" icon={Copy} onClick={() => copyDraft(draft)}>
                      Copy
                    </Button>
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => deleteDraft(draft.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
