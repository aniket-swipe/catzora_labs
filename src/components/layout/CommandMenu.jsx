import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navIndex } from "./navigation.js";
import { cx } from "../../lib/cx.js";

/** Cmd/Ctrl-K jump-to-anything over the flattened nav index. */
export function CommandMenu({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? navIndex.filter((item) => `${item.label} ${item.group} ${item.description || ""}`.toLowerCase().includes(q))
      : navIndex;
    return list.slice(0, 8);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setCursor((c) => Math.min(c + 1, results.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (event.key === "Enter" && results[cursor]) {
        navigate(results[cursor].to);
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, cursor, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 px-4 pt-[12vh]" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Jump to"
        className="w-full max-w-lg overflow-hidden rounded-lg border border-line bg-surface shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Jump to a studio or tool…"
            aria-label="Jump to a studio or tool"
            className="h-12 w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
          />
        </div>

        <ul className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-[13px] text-muted">Nothing matches that.</li>
          ) : (
            results.map((item, i) => (
              <li key={item.to}>
                <button
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    navigate(item.to);
                    onClose();
                  }}
                  className={cx(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px]",
                    i === cursor ? "bg-sunken text-ink" : "text-muted"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 text-[11.5px] text-faint">{item.group}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
