import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoBadge, PageHeader, Stat } from "../components/ui/index.js";
import { useStore } from "../store/AppStore.jsx";
import { cx } from "../lib/cx.js";

// Static map so Tailwind's scanner sees every class it has to generate.
const ICON_CHIP = {
  create: "bg-create-soft text-create",
  grow: "bg-grow-soft text-grow",
  hire: "bg-hire-soft text-hire",
  automate: "bg-automate-soft text-automate",
  support: "bg-support-soft text-support",
};

/**
 * A studio's landing page: headline numbers, the studio's own dashboard if it
 * has one, then the launcher for everything inside it.
 */
export function StudioHub({ studio }) {
  const store = useStore();
  const stats = studio.stats?.(store) ?? [];
  const Overview = studio.overview;

  return (
    <>
      <PageHeader
        studio={studio.key}
        title={`${studio.title} — ${studio.tagline}`}
        description={studio.description}
        badge={<DemoBadge />}
      />

      {stats.length ? (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <Stat key={stat.label} label={stat.label} value={stat.value} sub={stat.sub} tone={studio.key} />
          ))}
        </div>
      ) : null}

      {Overview ? <Overview /> : null}

      <h2 className="mb-3 text-[15px] font-semibold text-ink">Tools</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {studio.items.map((item) => (
          <Link
            key={item.slug}
            to={`${studio.base}/${item.slug}`}
            className="card group flex gap-4 p-5 transition-shadow hover:shadow-lift"
          >
            <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-md", ICON_CHIP[studio.key])}>
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start gap-1.5 text-[15px] font-semibold text-ink">
                {item.title}
                <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-faint group-hover:text-muted" aria-hidden />
              </span>
              <span className="mt-0.5 block text-[13px] leading-6 text-muted">{item.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
