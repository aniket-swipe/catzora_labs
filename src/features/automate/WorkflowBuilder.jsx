import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Pause, Play, Plus, SquareKanban, X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBadge,
  Input,
  PageHeader,
  Select,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { copyText } from "../../lib/clipboard.js";
import { uid } from "../../lib/id.js";
import { cx } from "../../lib/cx.js";
import { STEP_TONES, STEP_TYPES } from "./templates.js";

export function WorkflowBuilderPage() {
  const { workflows, update } = useStore();
  const toast = useToast();

  const [selectedId, setSelectedId] = useState(workflows[0]?.id ?? null);
  const [stepType, setStepType] = useState("Action");
  const [stepText, setStepText] = useState("");

  const workflow = workflows.find((w) => w.id === selectedId) || workflows[0];

  const mutate = (fn) => update("workflows")((list) => list.map((w) => (w.id === workflow.id ? fn(w) : w)));

  function addStep() {
    if (!stepText.trim()) return;
    mutate((w) => ({ ...w, steps: [...w.steps, { type: stepType, description: stepText.trim() }] }));
    setStepText("");
    toast({ kind: "success", title: "Step added" });
  }

  function moveStep(index, direction) {
    mutate((w) => {
      const steps = [...w.steps];
      const target = index + direction;
      if (target < 0 || target >= steps.length) return w;
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...w, steps };
    });
  }

  function removeStep(index) {
    mutate((w) => ({ ...w, steps: w.steps.filter((_, i) => i !== index) }));
  }

  function toggleStatus() {
    const next = workflow.status === "Live" ? "Paused" : "Live";
    mutate((w) => ({ ...w, status: next }));
    toast({ kind: "info", title: `Workflow ${next.toLowerCase()}`, body: "Demo only — nothing actually runs." });
  }

  function createWorkflow() {
    const id = uid("wf");
    update("workflows")((list) => [
      ...list,
      { id, name: "Untitled workflow", trigger: "Manual", status: "Draft", runs: 0, success: 0, steps: [{ type: "Trigger", description: "Manual run" }] },
    ]);
    setSelectedId(id);
    toast({ kind: "success", title: "Workflow created" });
  }

  async function copyWorkflow() {
    const markdown = [
      `# ${workflow.name}`,
      "",
      `Trigger: ${workflow.trigger}`,
      "",
      ...workflow.steps.map((s, i) => `${i + 1}. [${s.type}] ${s.description}`),
    ].join("\n");
    const ok = await copyText(markdown);
    toast(ok ? { kind: "success", title: "Copied" } : { kind: "error", title: "Copy failed" });
  }

  if (!workflow) {
    return (
      <>
        <PageHeader title="Visual Workflow Builder" description="No workflows yet." />
        <Button variant="primary" icon={Plus} onClick={createWorkflow}>
          New workflow
        </Button>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Visual Workflow Builder"
        description="Chain triggers, AI steps, conditions and actions into a workflow. Reorder steps and switch a workflow live or paused."
        badge={<DemoBadge />}
        actions={
          <Button variant="primary" icon={Plus} onClick={createWorkflow}>
            New workflow
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(280px,340px)_1fr]">
        <Card className="h-fit">
          <CardHeader title="Workflows" description={`${workflows.length} in this workspace`} />
          <ul className="divide-y divide-line">
            {workflows.map((w) => (
              <li key={w.id}>
                <button
                  onClick={() => setSelectedId(w.id)}
                  className={cx(
                    "flex w-full items-start gap-3 px-5 py-3 text-left transition-colors",
                    w.id === workflow.id ? "bg-sunken/70" : "hover:bg-sunken/50"
                  )}
                >
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-automate-soft text-automate">
                    <SquareKanban className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-ink">{w.name}</span>
                    <span className="block text-xs text-muted">
                      {w.steps.length} steps · {w.runs} runs
                    </span>
                  </span>
                  <Badge tone={w.status === "Live" ? "success" : w.status === "Paused" ? "warning" : "neutral"}>
                    {w.status}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title={workflow.name}
            description={`Trigger: ${workflow.trigger}`}
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" icon={workflow.status === "Live" ? Pause : Play} onClick={toggleStatus}>
                  {workflow.status === "Live" ? "Pause" : "Set live"}
                </Button>
                <Button size="sm" variant="secondary" icon={Copy} onClick={copyWorkflow}>
                  Copy
                </Button>
              </div>
            }
          />

          <ol className="space-y-2 px-5 py-4">
            {workflow.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 rounded-md bg-sunken p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold text-muted">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Badge tone={STEP_TONES[step.type] || "neutral"} className="mb-1">
                    {step.type}
                  </Badge>
                  <p className="text-[13px] leading-6 text-ink">{step.description}</p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <Button size="icon" variant="ghost" icon={ArrowUp} aria-label="Move step up" onClick={() => moveStep(index, -1)} />
                  <Button size="icon" variant="ghost" icon={ArrowDown} aria-label="Move step down" onClick={() => moveStep(index, 1)} />
                  <Button size="icon" variant="ghost" icon={X} aria-label="Remove step" onClick={() => removeStep(index)} />
                </div>
              </li>
            ))}
          </ol>

          <div className="border-t border-line px-5 py-4">
            <p className="mb-2 text-[13px] font-medium text-ink">Add a step</p>
            <div className="grid gap-2 md:grid-cols-[150px_1fr_auto]">
              <Select value={stepType} options={STEP_TYPES} onChange={(e) => setStepType(e.target.value)} aria-label="Step type" />
              <Input
                value={stepText}
                placeholder="What happens at this step?"
                onChange={(e) => setStepText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStep()}
              />
              <Button variant="primary" icon={Plus} disabled={!stepText.trim()} onClick={addStep}>
                Add
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
