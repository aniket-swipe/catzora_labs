import { ArrowUpRight, FolderKanban, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  CardHeader,
  DemoBadge,
  EmptyState,
  PageHeader,
  Stat,
} from "../components/ui/index.js";
import { studios } from "../features/studios.js";
import { useStore } from "../store/AppStore.jsx";
import { relativeTime } from "../lib/format.js";
import { cx } from "../lib/cx.js";

const DOT = {
  create: "bg-create",
  grow: "bg-grow",
  hire: "bg-hire",
  automate: "bg-automate",
  support: "bg-support",
};

const ICON_CHIP = {
  create: "bg-create-soft text-create",
  grow: "bg-grow-soft text-grow",
  hire: "bg-hire-soft text-hire",
  automate: "bg-automate-soft text-automate",
  support: "bg-support-soft text-support",
};

export function Dashboard() {
  const { user, projects, drafts, activity, workflows, tickets } = useStore();
  const totalTools = studios.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <>
      <PageHeader
        title={`Good to see you, ${user.name}`}
        description="Five studios, one workspace. Pick up where you left off, or start something new."
        badge={<DemoBadge />}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Studios" value={studios.length} sub="Create to Support" icon={Sparkles} tone="accent" />
        <Stat label="Tools" value={totalTools} sub="Across the platform" icon={Sparkles} tone="create" />
        <Stat label="Live workflows" value={workflows.filter((w) => w.status === "Live").length} sub={`${workflows.length} total`} tone="automate" />
        <Stat label="Open tickets" value={tickets.length} sub="In support triage" tone="support" />
      </div>

      <section className="mb-6" aria-labelledby="studios-heading">
        <h2 id="studios-heading" className="mb-3 text-[15px] font-semibold text-ink">
          Studios
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <Link key={studio.key} to={studio.base} className="card group flex gap-4 p-5 transition-shadow hover:shadow-lift">
              <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-md", ICON_CHIP[studio.key])}>
                <studio.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                  {studio.title}
                  <ArrowUpRight className="h-3.5 w-3.5 text-faint group-hover:text-muted" aria-hidden />
                </span>
                <span className="block text-[12px] text-faint">{studio.tagline}</span>
                <span className="mt-1 block text-[13px] leading-6 text-muted">{studio.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader
            title="Recent work"
            description={`${projects.length} projects`}
            action={
              <Link to="/app/projects" className="text-[13px] font-medium text-accent hover:underline">
                View all
              </Link>
            }
          />
          {projects.length === 0 ? (
            <EmptyState compact icon={FolderKanban} title="Nothing yet" description="Run any tool and it shows up here." />
          ) : (
            <ul className="divide-y divide-line">
              {projects.slice(0, 6).map((project) => (
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

        <Card className="h-fit">
          <CardHeader title="Activity" description={`${drafts.length} drafts saved`} />
          <ul className="space-y-3 px-5 py-4">
            {activity.slice(0, 8).map((entry) => (
              <li key={entry.id} className="flex items-start gap-2.5">
                <span className={cx("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", DOT[entry.studio] || "bg-faint")} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[13px] leading-5 text-ink">{entry.text}</p>
                  <p className="text-[11.5px] text-faint">{relativeTime(entry.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
