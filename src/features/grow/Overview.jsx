import { Link } from "react-router-dom";
import { CalendarClock, Search } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, ProgressBar, ScoreRing } from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { BLOG_STAGES } from "./content.js";
import { healthScore } from "./audit.js";
import { formatDateTime, relativeTime } from "../../lib/format.js";

/** The Grow studio dashboard — what is scheduled, what is in the pipeline, how the site scores. */
export function GrowOverview() {
  const { socialPosts, blogPosts, audits, activity } = useStore();
  const upcoming = socialPosts
    .filter((p) => p.status === "Scheduled" && new Date(p.scheduledAt) > new Date())
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const latest = audits[0];
  const growActivity = activity.filter((a) => a.studio === "grow").slice(0, 4);

  return (
    <div className="mb-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardHeader
          title="Scheduled posts"
          description={`${upcoming.length} upcoming`}
          action={
            <Link to="/app/grow/social" className="text-[13px] font-medium text-accent hover:underline">
              Calendar
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <EmptyState compact icon={CalendarClock} title="Nothing scheduled" description="Compose a post and pick a date to see it here." />
        ) : (
          <ul className="divide-y divide-line">
            {upcoming.slice(0, 5).map((post) => (
              <li key={post.id} className="flex items-center gap-3 px-5 py-3">
                <Badge tone="grow" className="w-[78px] justify-center">
                  {post.platform}
                </Badge>
                <p className="min-w-0 flex-1 truncate text-[13px] text-ink">{post.content.split("\n")[0]}</p>
                <span className="shrink-0 text-[11.5px] text-faint">{formatDateTime(post.scheduledAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Site health" description={latest ? new URL(latest.url).hostname : "No audit yet"} />
          {latest ? (
            <div className="flex items-center gap-4 px-5 py-4">
              <ScoreRing value={healthScore(latest)} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-ink">
                  {latest.issues.filter((i) => !i.resolved && i.severity === "Critical").length} critical issues open
                </p>
                <p className="text-[11.5px] text-faint">Audited {relativeTime(latest.startedAt)}</p>
              </div>
              <Link to="/app/grow/seo">
                <Button size="sm">Open</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <p className="text-[13px] text-muted">Run an audit to see a health score here.</p>
              <Link to="/app/grow/seo">
                <Button size="sm" icon={Search}>
                  Audit a site
                </Button>
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Blog pipeline"
            description={`${blogPosts.length} articles`}
            action={
              <Link to="/app/grow/blog" className="text-[13px] font-medium text-accent hover:underline">
                Open
              </Link>
            }
          />
          <div className="space-y-2.5 px-5 py-4">
            {BLOG_STAGES.map((stage) => {
              const count = blogPosts.filter((p) => p.stage === stage).length;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-20 text-[12.5px] text-muted">{stage}</span>
                  <ProgressBar
                    tone={stage === "Published" ? "success" : "grow"}
                    value={(count / Math.max(1, blogPosts.length)) * 100}
                    label={`${stage}: ${count}`}
                  />
                  <span className="w-5 text-right text-[12.5px] tabular-nums text-ink">{count}</span>
                </div>
              );
            })}
          </div>
          {growActivity.length ? (
            <ul className="space-y-1.5 border-t border-line px-5 py-3">
              {growActivity.map((a) => (
                <li key={a.id} className="text-[12px] text-muted">
                  <span className="text-ink">{a.text}</span> · {relativeTime(a.at)}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
