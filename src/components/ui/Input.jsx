import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "../../lib/cx.js";

export const Input = forwardRef(function Input({ className, invalid, ...rest }, ref) {
  return <input ref={ref} className={cx("field h-9", invalid && "border-danger", className)} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ className, invalid, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cx("field min-h-[92px] resize-y py-2 leading-relaxed", invalid && "border-danger", className)}
      {...rest}
    />
  );
});

export function Select({ className, options = [], ...rest }) {
  return (
    <div className="relative">
      <select className={cx("field h-9 appearance-none pr-8", className)} {...rest}>
        {options.map((opt) => {
          const o = typeof opt === "string" ? { value: opt, label: opt } : opt;
          return (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
        aria-hidden
      />
    </div>
  );
}

export function Field({ label, hint, optional, htmlFor, children }) {
  const fallbackId = useId();
  const id = htmlFor || fallbackId;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        {optional ? <span className="text-[11.5px] text-faint">Optional</span> : null}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-[12px] leading-5 text-muted">{hint}</p> : null}
    </div>
  );
}
