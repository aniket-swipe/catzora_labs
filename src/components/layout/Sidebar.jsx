import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navGroups } from "./navigation.js";
import { cx } from "../../lib/cx.js";

// Written out rather than built from a template string, so Tailwind's content
// scanner can see every class name it needs to generate.
const GROUP_DOT = {
  create: "bg-create",
  grow: "bg-grow",
  hire: "bg-hire",
  automate: "bg-automate",
  support: "bg-support",
};

export function Sidebar({ onNavigate }) {
  const [open, setOpen] = useState(() =>
    Object.fromEntries(navGroups.filter((g) => g.collapsible).map((g) => [g.key, true]))
  );

  return (
    <nav className="scrollbar-thin h-full overflow-y-auto px-3 py-4" aria-label="Main">
      {navGroups.map((group) => {
        const expanded = !group.collapsible || open[group.key];
        return (
          <div key={group.key} className="mb-4 last:mb-0">
            {group.collapsible ? (
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [group.key]: !prev[group.key] }))}
                aria-expanded={expanded}
                className="mb-1 flex w-full items-center gap-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-faint transition-colors hover:text-muted"
              >
                <span className={cx("h-1.5 w-1.5 rounded-full", GROUP_DOT[group.key])} aria-hidden />
                {group.label}
                <ChevronDown
                  className={cx("ml-auto h-3.5 w-3.5 transition-transform", !expanded && "-rotate-90")}
                  aria-hidden
                />
              </button>
            ) : (
              <p className="mb-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-faint">
                {group.label}
              </p>
            )}

            {expanded ? (
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cx(
                          "flex items-start gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                          isActive ? "bg-sunken font-medium text-ink" : "text-muted hover:bg-sunken/60 hover:text-ink"
                        )
                      }
                    >
                      <item.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{item.label}</span>
                        {item.description ? (
                          <span className="block truncate text-[11.5px] text-faint">{item.description}</span>
                        ) : null}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
