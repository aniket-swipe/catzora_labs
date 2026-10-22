import { Check, Circle, Loader2 } from "lucide-react";
import { cx } from "../../lib/cx.js";

const BARS = {
  accent: "bg-accent",
  create: "bg-create",
  grow: "bg-grow",
  hire: "bg-hire",
  automate: "bg-automate",
  support: "bg-support",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({ value, tone = "accent", className, label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className={cx("h-1.5 w-full overflow-hidden rounded-full bg-sunken", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cx("h-full rounded-full transition-all", BARS[tone] || BARS.accent)} style={{ width: `${pct}%` }} />
    </div>
  );
}

const RING_STROKE = {
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
  accent: "stroke-accent",
  grow: "stroke-grow",
};

/** Score donut — used by the SEO health score and assessment results. */
export function ScoreRing({ value, size = 64, label, tone }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const auto = pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger";
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={radius} fill="none" strokeWidth="3.5" className="stroke-sunken" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          className={cx("transition-all", RING_STROKE[tone || auto])}
          strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[13px] font-semibold tabular-nums text-ink">
        {Math.round(pct)}
      </span>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}

/** The step trace shown while a tool is "working". */
export function StepProgress({ steps, current, done }) {
  return (
    <ol className="space-y-2.5" aria-live="polite">
      {steps.map((step, i) => {
        const complete = done || i < current;
        const active = !done && i === current;
        return (
          <li
            key={step}
            className={cx(
              "flex items-center gap-2.5 text-[13px]",
              complete ? "text-muted" : active ? "text-ink" : "text-faint"
            )}
          >
            {complete ? (
              <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : active ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {step}
          </li>
        );
      })}
    </ol>
  );
}
