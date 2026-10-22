import { useId } from "react";
import { cx } from "../../lib/cx.js";

export function Toggle({ checked, onChange, label, description, id }) {
  const fallback = useId();
  const inputId = id || fallback;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        {description ? <p className="text-[12px] leading-5 text-muted">{description}</p> : null}
      </div>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-line"
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
