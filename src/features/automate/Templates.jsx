import { useState } from "react";
import { LayoutTemplate, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  DemoBadge,
  PageHeader,
  SegmentedControl,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { uid } from "../../lib/id.js";
import { STEP_TONES, workflowTemplates } from "./templates.js";

export function TemplatesPage() {
  const { update } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(workflowTemplates.map((t) => t.category))];
  const shown = workflowTemplates.filter((t) => category === "All" || t.category === category);

  function useTemplate(template) {
    update("workflows")((list) => [
      ...list,
      {
        id: uid("wf"),
        name: `${template.name} (from template)`,
        trigger: template.steps[0].description,
        status: "Draft",
        runs: 0,
        success: 0,
        steps: template.steps.map((s) => ({ ...s })),
      },
    ]);
    toast({ kind: "success", title: "Template added", body: "Opened in the workflow builder as a draft." });
    navigate("/app/automate/workflows");
  }

  return (
    <>
      <PageHeader
        title="Workflow Templates"
        description="Start from a proven pattern instead of a blank canvas. Every template lands in the builder as an editable draft."
        badge={<DemoBadge label="Sample templates" />}
      />

      <div className="mb-5">
        <SegmentedControl value={category} onChange={setCategory} options={categories} label="Template category" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((template) => (
          <Card key={template.id} className="flex flex-col p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-automate-soft text-automate">
                <LayoutTemplate className="h-4 w-4" aria-hidden />
              </span>
              <Badge>{template.category}</Badge>
            </div>
            <p className="text-[15px] font-semibold text-ink">{template.name}</p>
            <p className="mt-1 text-[13px] leading-6 text-muted">{template.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {template.steps.slice(0, 4).map((step, i) => (
                <Badge key={i} tone={STEP_TONES[step.type] || "neutral"}>
                  {step.type}
                </Badge>
              ))}
              {template.steps.length > 4 ? <Badge>+{template.steps.length - 4}</Badge> : null}
            </div>
            <div className="mt-auto pt-4">
              <Button variant="secondary" size="sm" icon={Plus} onClick={() => useTemplate(template)}>
                Use template
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
