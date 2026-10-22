import { Check } from "lucide-react";
import { Badge } from "../../components/ui/index.js";
import { cx } from "../../lib/cx.js";

function Heading({ children }) {
  return <p className="mb-2 text-[13px] font-medium text-ink">{children}</p>;
}

export function ResultSection({ section }) {
  switch (section.kind) {
    case "table":
      return (
        <div className="px-5 py-4">
          <Heading>{section.heading}</Heading>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line">
                  {section.columns.map((col) => (
                    <th key={col} className="py-2 pr-3 font-medium text-muted">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line/70">
                    {row.map((cell, j) => (
                      <td key={j} className={cx("py-2 pr-3 align-top", j === 0 && "font-medium text-ink")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "checklist":
      return (
        <div className="px-5 py-4">
          <Heading>{section.heading}</Heading>
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] leading-6 text-muted">
                <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "cards":
      return (
        <div className="px-5 py-4">
          <Heading>{section.heading}</Heading>
          <div className="grid gap-3 sm:grid-cols-2">
            {section.items.map((item, i) => (
              <div key={i} className="rounded-md bg-sunken p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-ink">{item.title}</p>
                  {item.badge ? <Badge tone={item.tone || "accent"}>{item.badge}</Badge> : null}
                </div>
                <p className="text-[12.5px] leading-6 text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "text":
      return (
        <div className="px-5 py-4">
          <Heading>{section.heading}</Heading>
          <pre className="whitespace-pre-wrap rounded-md bg-sunken p-3 font-sans text-[13px] leading-6 text-ink">
            {section.text}
          </pre>
        </div>
      );

    default:
      return (
        <div className="px-5 py-4">
          <Heading>{section.heading}</Heading>
          <ul className="space-y-2">
            {section.items.map((item, i) => {
              const o = typeof item === "string" ? { text: item } : item;
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <div className="min-w-0">
                    {o.title ? (
                      <p className="text-[13px] font-medium text-ink">
                        {o.title}
                        {o.badge ? (
                          <Badge tone={o.tone || "neutral"} className="ml-2">
                            {o.badge}
                          </Badge>
                        ) : null}
                      </p>
                    ) : null}
                    <p className="text-[13px] leading-6 text-muted">{o.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
  }
}
