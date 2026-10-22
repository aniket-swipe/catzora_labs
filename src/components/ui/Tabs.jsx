import { cx } from "../../lib/cx.js";

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cx("flex flex-wrap gap-1 border-b border-line", className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cx(
              "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className="ml-1.5 rounded-full bg-sunken px-1.5 py-0.5 text-[11px] text-muted">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function SegmentedControl({ value, onChange, options, label, size = "md" }) {
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-md bg-sunken p-1">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="radio"
          aria-checked={value === item.value}
          onClick={() => onChange(item.value)}
          className={cx(
            "rounded font-medium transition-colors",
            size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-[13px]",
            value === item.value ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
