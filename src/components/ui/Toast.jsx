import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, AlertTriangle, XCircle } from "lucide-react";
import { cx } from "../../lib/cx.js";
import { uid } from "../../lib/id.js";

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, info: Info, warning: AlertTriangle, error: XCircle };
const TONES = {
  success: "text-success",
  info: "text-accent",
  warning: "text-warning",
  error: "text-danger",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    ({ kind = "info", title, body, duration = 4000 }) => {
      const id = uid("t");
      setToasts((t) => [...t, { id, kind, title, body }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind] || Info;
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex animate-fade-up items-start gap-3 rounded-lg border border-line bg-surface p-3 shadow-pop"
            >
              <Icon className={cx("mt-0.5 h-4 w-4 shrink-0", TONES[toast.kind])} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink">{toast.title}</p>
                {toast.body ? <p className="mt-0.5 text-[12.5px] leading-5 text-muted">{toast.body}</p> : null}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded p-0.5 text-faint hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
