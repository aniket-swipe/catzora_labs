/** Turn a generator-tool config into a studio item used by nav, routes and hubs. */
export function toolItem(tool) {
  return {
    slug: tool.slug,
    kind: "tool",
    tool,
    icon: tool.icon,
    navLabel: tool.navLabel,
    navDescription: tool.navDescription,
    title: tool.title,
    description: tool.description,
  };
}

/** Wrap a bespoke page component as a studio item. */
export function pageItem({ slug, icon, navLabel, navDescription, title, description, component }) {
  return { slug, kind: "page", component, icon, navLabel, navDescription, title, description };
}
