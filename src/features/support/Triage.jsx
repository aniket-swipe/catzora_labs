import { useState } from "react";
import { ArrowDownUp, Check, Inbox, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  PageHeader,
  Stat,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { sleep } from "../../lib/format.js";

/** Rule-based stand-in for a classification model, so the behaviour is inspectable. */
export function classifyTicket(ticket) {
  const text = `${ticket.subject} ${ticket.body}`.toLowerCase();
  let category = "General question";
  let queue = "Tier 1";
  let priority = "Normal";
  let sentiment = "Neutral";

  if (/charg|refund|invoice|gst|bill|payment/.test(text)) {
    category = "Billing";
    queue = "Billing";
  }
  if (/crash|bug|error|not working|fail/.test(text)) {
    category = "Technical issue";
    queue = "Tier 2";
    priority = "High";
  }
  if (/invite|team|account|login|password/.test(text)) {
    category = "Account";
    queue = "Tier 1";
  }
  if (/cancel|third time|nobody replied|angry|unacceptable|worst/.test(text)) {
    category = "Churn risk";
    queue = "Retention";
    priority = "Urgent";
    sentiment = "Frustrated";
  }
  if (/twice|duplicate/.test(text) && priority === "Normal") priority = "High";
  if (/thank|great|love/.test(text)) sentiment = "Positive";

  return { category, queue, priority, sentiment };
}

const PRIORITY_TONE = { Urgent: "danger", High: "warning", Normal: "neutral" };

export function TriagePage() {
  const { tickets, update } = useStore();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const classified = tickets.filter((t) => t.category).length;

  async function classifyAll() {
    setBusy(true);
    for (const ticket of tickets) {
      if (ticket.category) continue;
      await sleep(360);
      update("tickets")((list) => list.map((t) => (t.id === ticket.id ? { ...t, ...classifyTicket(t) } : t)));
    }
    setBusy(false);
    toast({ kind: "success", title: "Tickets classified", body: "Sample classification — nothing was sent anywhere." });
  }

  function reset() {
    update("tickets")((list) =>
      list.map((t) => ({ ...t, category: null, priority: null, queue: null, sentiment: null }))
    );
    toast({ kind: "info", title: "Triage reset" });
  }

  return (
    <>
      <PageHeader
        title="Ticket Classification & Routing"
        description="Read every incoming ticket, work out what it is about and how urgent it is, and send it to the right queue."
        badge={<DemoBadge label="Sample tickets" />}
        actions={
          <>
            <Button variant="ghost" icon={RotateCcw} onClick={reset}>
              Reset
            </Button>
            <Button
              variant="primary"
              icon={Sparkles}
              loading={busy}
              disabled={classified === tickets.length}
              onClick={classifyAll}
            >
              {classified === tickets.length ? "All classified" : "Classify inbox"}
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open tickets" value={tickets.length} sub="In the inbox" icon={Inbox} tone="support" />
        <Stat label="Classified" value={`${classified}/${tickets.length}`} sub="By the assistant" icon={Check} tone="success" />
        <Stat label="Urgent" value={tickets.filter((t) => t.priority === "Urgent").length} sub="Need a reply today" icon={TriangleAlert} tone="warning" />
        <Stat label="Queues used" value={new Set(tickets.filter((t) => t.queue).map((t) => t.queue)).size} sub="Routing destinations" icon={ArrowDownUp} tone="support" />
      </div>

      <Card>
        <CardHeader title="Inbox" description="Run Classify inbox to see how each ticket is categorised and routed." />
        <ul className="divide-y divide-line">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-medium text-ink">{ticket.subject}</span>
                <span className="text-xs text-muted">
                  {ticket.id} · {ticket.from}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-6 text-muted">{ticket.body}</p>
              {ticket.category ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="accent">{ticket.category}</Badge>
                  <Badge tone={PRIORITY_TONE[ticket.priority] || "neutral"} dot>
                    {ticket.priority}
                  </Badge>
                  <Badge tone="support">→ {ticket.queue}</Badge>
                  <Badge tone={ticket.sentiment === "Frustrated" ? "danger" : ticket.sentiment === "Positive" ? "success" : "neutral"}>
                    {ticket.sentiment}
                  </Badge>
                </div>
              ) : (
                <p className="mt-2 text-xs text-faint">Not classified yet</p>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
