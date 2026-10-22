import { cx } from "../../lib/cx.js";

const TONES = {
  accent: "bg-accent-soft text-accent",
  create: "bg-create-soft text-create",
  grow: "bg-grow-soft text-grow",
  hire: "bg-hire-soft text-hire",
  automate: "bg-automate-soft text-automate",
  support: "bg-support-soft text-support",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export function Stat({ label, value, sub, icon: Icon, tone = "accent" }) {
  return (
    <div className="card flex items-start gap-3 p-4">
      {Icon ? (
        <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-md", TONES[tone] || TONES.accent)}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-faint">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-ink">{value}</p>
        {sub ? <p className="text-[12px] text-muted">{sub}</p> : null}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, compact }) {
  return (
    <div className={cx("flex flex-col items-center text-center", compact ? "px-5 py-8" : "px-5 py-14")}>
      {Icon ? (
        <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-sunken text-faint">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      ) : null}
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[13px] leading-6 text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className, ...rest }) {
  return <div className={cx("animate-pulse rounded-md bg-sunken", className)} {...rest} />;
}
