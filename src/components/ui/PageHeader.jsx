import { cx } from "../../lib/cx.js";

const DOTS = {
  create: "bg-create",
  grow: "bg-grow",
  hire: "bg-hire",
  automate: "bg-automate",
  support: "bg-support",
};

export function PageHeader({ studio, title, description, badge, actions, className }) {
  return (
    <header className={cx("mb-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {studio ? <span className={cx("h-2 w-2 rounded-full", DOTS[studio])} aria-hidden /> : null}
            <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 max-w-3xl text-[13.5px] leading-6 text-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
