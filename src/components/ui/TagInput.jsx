import { useState } from "react";
import { X } from "lucide-react";
import { cx } from "../../lib/cx.js";

/** Chip input — Enter or comma commits, Backspace on an empty field removes. */
export function TagInput({ value = [], onChange, placeholder = "Add and press Enter", id, className }) {
  const [draft, setDraft] = useState("");

  function commit(text) {
    const parts = String(text)
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => !value.some((v) => v.toLowerCase() === p.toLowerCase()));
    if (parts.length) onChange([...value, ...parts]);
    setDraft("");
  }

  return (
    <div className={cx("field flex min-h-9 flex-wrap items-center gap-1.5 py-1.5", className)}>
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded bg-sunken px-2 py-0.5 text-xs text-ink">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="text-faint transition-colors hover:text-danger"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={value.length ? "" : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
            e.preventDefault();
            commit(draft);
          }
          if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => draft.trim() && commit(draft)}
        className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
      />
    </div>
  );
}
