import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { Sidebar } from "./Sidebar.jsx";
import { CommandMenu } from "./CommandMenu.jsx";
import { Button } from "../ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { cx } from "../../lib/cx.js";

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("catzora:theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

export function AppLayout() {
  const { user } = useStore();
  const location = useLocation();
  const [theme, toggleTheme] = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            className="rounded-md p-1.5 text-muted hover:bg-sunken hover:text-ink lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>

          <Link to="/app" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-[13px] font-bold text-white">
              C
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink">Catzora Labs</span>
          </Link>

          <button
            onClick={() => setCommandOpen(true)}
            className="ml-auto hidden items-center gap-2 rounded-md border border-line bg-sunken/60 px-3 py-1.5 text-[13px] text-muted transition-colors hover:text-ink md:flex"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            Jump to…
            <kbd className="rounded border border-line bg-surface px-1 text-[11px]">⌘K</kbd>
          </button>

          <Button
            size="icon"
            variant="ghost"
            className={cx("ml-auto md:ml-0")}
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            icon={theme === "dark" ? Sun : Moon}
          />

          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent"
            title={`${user.name} · ${user.role}`}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-[260px] shrink-0 border-r border-line bg-surface lg:block">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <Sidebar />
          </div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 top-14 z-20 lg:hidden">
            <div className="absolute inset-0 bg-ink/30" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full w-[280px] max-w-[85vw] border-r border-line bg-surface">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1180px] animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandMenu open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
