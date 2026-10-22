import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  Input,
  PageHeader,
} from "../../components/ui/index.js";
import { answerQuestion } from "./knowledgeBase.js";
import { sleep } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const SUGGESTIONS = [
  "I was charged twice",
  "How do I invite my team?",
  "Where is my GST invoice?",
  "The app keeps crashing",
];

export function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm the support assistant. Ask me about billing, your account, invites or anything that isn't working.",
      confidence: 1,
      source: "Greeting",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  async function send(text) {
    const value = (text ?? question).trim();
    if (!value || busy) return;
    setMessages((m) => [...m, { role: "user", text: value }]);
    setQuestion("");
    setBusy(true);
    await sleep(700);
    const reply = answerQuestion(value);
    setMessages((m) => [...m, { role: "bot", ...reply }]);
    setBusy(false);
  }

  return (
    <>
      <PageHeader
        title="AI Customer Chatbot"
        description="A front-line assistant that answers from your knowledge base, shows its confidence, and hands over to a human when it isn't sure."
        badge={<DemoBadge label="Sample answers" />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="flex h-[560px] flex-col">
          <CardHeader title="Live preview" description="Answers come from the sample knowledge base." />
          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((message, i) => (
              <div key={i} className={cx("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cx(
                    "max-w-[80%] rounded-lg px-3.5 py-2.5 text-[13px] leading-6",
                    message.role === "user" ? "bg-accent text-white" : "bg-sunken text-ink"
                  )}
                >
                  {message.text}
                  {message.role === "bot" && message.confidence !== undefined && message.confidence < 1 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={message.confidence > 0.7 ? "success" : "warning"}>
                        {Math.round(message.confidence * 100)}% confident
                      </Badge>
                      <Badge>{message.source}</Badge>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {busy ? (
              <div className="flex justify-start">
                <div className="rounded-lg bg-sunken px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted" aria-hidden />
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-line px-5 py-3">
            <div className="flex gap-2">
              <Input
                value={question}
                placeholder="Type a customer question…"
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                aria-label="Customer question"
              />
              <Button variant="primary" icon={Send} disabled={!question.trim() || busy} onClick={() => send()}>
                Send
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full bg-sunken px-2.5 py-1 text-[12px] text-muted transition-colors hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Behaviour" />
          <div className="space-y-3 px-5 py-4 text-[13px] leading-6 text-muted">
            <p>
              The assistant answers only from the knowledge base. When nothing matches above 70% confidence it says so
              and escalates, rather than inventing an answer.
            </p>
            <p>Every reply shows its confidence and its source, so you can see why it said what it said.</p>
            <p>Asking for a human always works, from any point in the conversation.</p>
          </div>
          <div className="border-t border-line px-5 py-4">
            <p className="mb-2 text-[13px] font-medium text-ink">Topics it knows</p>
            <div className="flex flex-wrap gap-1.5">
              {["Refunds", "Invoices & GST", "Team invites", "App issues", "Sign-in", "Plans & pricing"].map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
