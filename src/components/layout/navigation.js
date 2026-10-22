import { FolderKanban, LayoutDashboard, Settings } from "lucide-react";
import { studios } from "../../features/studios.js";

/**
 * Sidebar groups. Studio groups are derived from the studio registries so the
 * nav can never drift from the routes — adding a tool adds its nav entry.
 */
export const navGroups = [
  {
    key: "overview",
    label: "Overview",
    items: [{ to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  ...studios.map((studio) => ({
    key: studio.key,
    label: studio.label,
    collapsible: true,
    items: [
      { to: studio.base, label: `${studio.label} Studio`, icon: studio.icon, end: true },
      ...studio.items.map((item) => ({
        to: `${studio.base}/${item.slug}`,
        label: item.navLabel,
        description: item.navDescription,
        icon: item.icon,
      })),
    ],
  })),
  {
    key: "workspace",
    label: "Workspace",
    items: [
      { to: "/app/projects", label: "Projects & History", icon: FolderKanban },
      { to: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

/** Flat list of every navigable destination — used by search and the command menu. */
export const navIndex = navGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label }))
);
