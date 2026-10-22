import { useState } from "react";
import { Check, CheckCircle2, CircleAlert, Clock, RotateCcw, TriangleAlert, UserCheck } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  EmptyState,
  PageHeader,
  Stat,
  Tabs,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";

const POLICY = [
  ["Tier 1 → Tier 2", "Unresolved after two replies, or the customer asks twice for the same thing."],
  ["Tier 2 → Tier 3", "Needs a code change, affects more than one customer, or touches data."],
  ["Immediate Tier 3", "Security, privacy or anything with legal exposure."],
  ["Named owner", "Every escalation has one person accountable, never a queue."],
  ["Customer update", "At least once every 24 hours, even when there is no news."],
];

export function EscalationsPage() {
  const { escalations, update } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState("open");

  const shown = escalations.filter((e) =>
    tab === "all" ? true : tab === "open" ? e.status !== "Resolved" : e.status === "Resolved"
  );

  function setStatus(id, status) {
    update("escalations")((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
    toast({ kind: "success", title: "Escalation updated", body: `Marked as ${status.toLowerCase()}.` });
  }

  return (
    <>
      <PageHeader
        title="Escalation Management"
        description="Track the issues that have outgrown normal support — who owns them, when they are due and which ones have breached their SLA."
        badge={<DemoBadge />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open escalations" value={escalations.filter((e) => e.status !== "Resolved").length} sub="Across all tiers" icon={TriangleAlert} tone="warning" />
        <Stat label="SLA breached" value={escalations.filter((e) => e.breached).length} sub="Need attention now" icon={CircleAlert} tone="danger" />
        <Stat label="Tier 3" value={escalations.filter((e) => e.tier === "Tier 3").length} sub="With engineering" icon={UserCheck} tone="support" />
        <Stat label="Resolved" value={escalations.filter((e) => e.status === "Resolved").length} sub="This period" icon={CheckCircle2} tone="success" />
      </div>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "open", label: "Open", count: escalations.filter((e) => e.status !== "Resolved").length },
          { value: "resolved", label: "Resolved", count: escalations.filter((e) => e.status === "Resolved").length },
          { value: "all", label: "All", count: escalations.length },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Escalations" description={`${shown.length} shown`} />
          {shown.length === 0 ? (
            <EmptyState compact icon={CheckCircle2} title="Nothing open" description="No escalations match this filter." />
          ) : (
            <ul className="divide-y divide-line">
              {shown.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium text-ink">{item.customer}</span>
                    <Badge tone={item.tier === "Tier 3" ? "danger" : "warning"}>{item.tier}</Badge>
                    {item.breached ? (
                      <Badge tone="danger" dot>
                        SLA breached
                      </Badge>
                    ) : (
                      <Badge>Due in {item.dueHours}h</Badge>
                    )}
                    <span className="ml-auto text-xs text-muted">{item.id}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-muted">{item.issue}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted">
                      Owner: {item.owner} · {item.status}
                    </span>
                    {item.status !== "Resolved" ? (
                      <div className="ml-auto flex gap-2">
                        <Button size="sm" variant="ghost" icon={Clock} onClick={() => setStatus(item.id, "Waiting on customer")}>
                          Waiting
                        </Button>
                        <Button size="sm" variant="secondary" icon={Check} onClick={() => setStatus(item.id, "Resolved")}>
                          Resolve
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="ml-auto" icon={RotateCcw} onClick={() => setStatus(item.id, "Open")}>
                        Reopen
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="Escalation policy" />
          <ul className="space-y-3 px-5 py-4 text-[13px] leading-6 text-muted">
            {POLICY.map(([title, text]) => (
              <li key={title}>
                <span className="font-medium text-ink">{title}</span> — {text}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
