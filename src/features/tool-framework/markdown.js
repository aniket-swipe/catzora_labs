/** Render a tool result object as Markdown — used for copy, download and drafts. */
export function resultToMarkdown(toolTitle, result) {
  const lines = [`# ${toolTitle}`, ""];
  if (result.title) lines.push(result.title, "");

  if (result.summary?.length) {
    lines.push("## Summary");
    result.summary.forEach((m) => lines.push(`- ${m.label}: ${m.value}`));
    lines.push("");
  }

  (result.sections || []).forEach((section) => {
    lines.push(`## ${section.heading}`);
    switch (section.kind) {
      case "table":
        lines.push(`| ${section.columns.join(" | ")} |`);
        lines.push(`|${section.columns.map(() => " --- ").join("|")}|`);
        section.rows.forEach((row) => lines.push(`| ${row.join(" | ")} |`));
        break;
      case "text":
        lines.push(section.text);
        break;
      case "cards":
        section.items.forEach((item) =>
          lines.push(`- **${item.title}**${item.badge ? ` (${item.badge})` : ""} — ${item.text}`)
        );
        break;
      case "checklist":
        section.items.forEach((item) => lines.push(`- [ ] ${item}`));
        break;
      default:
        section.items.forEach((item) => {
          const o = typeof item === "string" ? { text: item } : item;
          lines.push(`- ${o.title ? `**${o.title}** — ` : ""}${o.text}`);
        });
    }
    lines.push("");
  });

  lines.push("_Sample output generated in the Catzora Labs demo. No live AI service is connected._");
  return lines.join("\n");
}
