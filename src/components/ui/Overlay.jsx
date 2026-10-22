import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button.jsx";
import { cx } from "../../lib/cx.js";

/** Escape to close, focus moved in, focus restored on the way out, body locked. */
function useOverlay(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !ref.current) return;
      const focusable = ref.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      const node = ref.current;
      const target =
        node?.querySelector("[data-autofocus]") ??
        node?.querySelector("input:not([type=hidden]), textarea, select") ??
        node?.querySelector("button");
      target?.focus();
    }, 20);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer);
      previous?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}

const MODAL_SIZES = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" };

export function Modal({ open, onClose, title, description, size = "md", footer, children }) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Dialog"}
        className={cx(
          "relative flex max-h-[92vh] w-full animate-fade-up flex-col rounded-t-xl border border-line bg-surface shadow-pop sm:rounded-xl",
          MODAL_SIZES[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-[13px] leading-6 text-muted">{description}</p> : null}
          </div>
          <Button size="icon" variant="ghost" icon={X} onClick={onClose} aria-label="Close" />
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

export function Drawer({ open, onClose, title, description, width = "max-w-xl", footer, children }) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Panel"}
        className={cx(
          "absolute right-0 top-0 flex h-full w-full flex-col border-l border-line bg-surface shadow-pop",
          width
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-ink">{title}</div>
            {description ? <p className="mt-0.5 text-[13px] leading-6 text-muted">{description}</p> : null}
          </div>
          <Button size="icon" variant="ghost" icon={X} onClick={onClose} aria-label="Close" />
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
