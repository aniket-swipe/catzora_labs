import { cx } from "../../lib/cx.js";

const TONES = {
  neutral: "bg-sunken text-muted",
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

export function Badge({ tone = "neutral", dot, className, children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium",
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function DemoBadge({ label = "Sample data" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-2 py-0.5 text-[11.5px] font-medium text-faint">
      {label}
    </span>
  );
}

export function DemoNote({ children }) {
  return (
    <p className="rounded-md bg-sunken px-3 py-2 text-[12.5px] leading-6 text-muted">{children}</p>
  );
}
