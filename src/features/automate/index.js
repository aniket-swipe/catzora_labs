import { Bot, ChartColumn, LayoutTemplate, SquareKanban } from "lucide-react";
import { pageItem, toolItem } from "../studio-utils.js";
import { automateTools } from "./tools.js";
import { WorkflowBuilderPage } from "./WorkflowBuilder.jsx";
import { MonitoringPage } from "./Monitoring.jsx";
import { TemplatesPage } from "./Templates.jsx";
import { workflowTemplates } from "./templates.js";

const bySlug = (slug) => automateTools.find((t) => t.slug === slug);

export const automateStudio = {
  key: "automate",
  label: "Automate",
  title: "Automate",
  tagline: "AI Agents & Workflow Automation",
  description:
    "Build the agent, wire the workflow, schedule it and watch every run — with approvals and a human in the loop where it matters.",
  icon: Bot,
  base: "/app/automate",
  items: [
    toolItem(bySlug("agents")),
    pageItem({
      slug: "workflows",
      icon: SquareKanban,
      navLabel: "Workflow Builder",
      navDescription: "Triggers, steps, actions",
      title: "Visual Workflow Builder",
      description: "Chain triggers, AI steps, conditions and actions into a workflow.",
      component: WorkflowBuilderPage,
    }),
    toolItem(bySlug("processes")),
    toolItem(bySlug("documents")),
    toolItem(bySlug("tasks")),
    toolItem(bySlug("scheduled")),
    pageItem({
      slug: "monitoring",
      icon: ChartColumn,
      navLabel: "Automation Monitoring",
      navDescription: "Runs, failures, health",
      title: "Automation Monitoring",
      description: "Every run, duration and failure in one place.",
      component: MonitoringPage,
    }),
    pageItem({
      slug: "templates",
      icon: LayoutTemplate,
      navLabel: "Workflow Templates",
      navDescription: "Start from a pattern",
      title: "Workflow Templates",
      description: "Start from a proven pattern instead of a blank canvas.",
      component: TemplatesPage,
    }),
  ],
  stats: (store) => [
    { label: "Workflows", value: store.workflows.length, sub: `${store.workflows.filter((w) => w.status === "Live").length} live` },
    { label: "Runs (24h)", value: store.runs.length, sub: "Across all workflows" },
    {
      label: "Success rate",
      value: `${Math.round((store.runs.filter((r) => r.status === "Success").length / Math.max(store.runs.length, 1)) * 100)}%`,
      sub: "Last 24 hours",
    },
    { label: "Templates", value: workflowTemplates.length, sub: "Ready to use" },
  ],
};
