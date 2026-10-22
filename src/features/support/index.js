import { Bot, Inbox, MessagesSquare, TriangleAlert } from "lucide-react";
import { pageItem, toolItem } from "../studio-utils.js";
import { supportTools } from "./tools.js";
import { ChatbotPage } from "./Chatbot.jsx";
import { TriagePage } from "./Triage.jsx";
import { EscalationsPage } from "./Escalations.jsx";

const bySlug = (slug) => supportTools.find((t) => t.slug === slug);

export const supportStudio = {
  key: "support",
  label: "Support",
  title: "Support",
  tagline: "Customer Experience & Service Automation",
  description:
    "Answer, triage, draft, onboard and escalate — with confidence scores, routing rules and a clear path to a human.",
  icon: MessagesSquare,
  base: "/app/support",
  items: [
    pageItem({
      slug: "chatbot",
      icon: Bot,
      navLabel: "AI Customer Chatbot",
      navDescription: "Front-line answers, handover",
      title: "AI Customer Chatbot",
      description: "Front-line answers from your knowledge base, with handover.",
      component: ChatbotPage,
    }),
    toolItem(bySlug("copilot")),
    pageItem({
      slug: "triage",
      icon: Inbox,
      navLabel: "Classification & Routing",
      navDescription: "Category, priority, queue",
      title: "Ticket Classification & Routing",
      description: "Categorise, prioritise and route every incoming ticket.",
      component: TriagePage,
    }),
    toolItem(bySlug("replies")),
    toolItem(bySlug("knowledge")),
    toolItem(bySlug("onboarding")),
    toolItem(bySlug("feedback")),
    pageItem({
      slug: "escalations",
      icon: TriangleAlert,
      navLabel: "Escalation Management",
      navDescription: "Owners, SLAs, breaches",
      title: "Escalation Management",
      description: "Owners, SLAs and the issues that outgrew normal support.",
      component: EscalationsPage,
    }),
  ],
  stats: (store) => [
    { label: "Open tickets", value: store.tickets.length, sub: `${store.tickets.filter((t) => t.category).length} classified` },
    {
      label: "Open escalations",
      value: store.escalations.filter((e) => e.status !== "Resolved").length,
      sub: `${store.escalations.filter((e) => e.breached).length} SLA breached`,
    },
    { label: "Bot deflection", value: "61%", sub: "Sample metric" },
    { label: "First reply", value: "2.4h", sub: "Median, sample" },
  ],
};
