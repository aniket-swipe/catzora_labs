import { RotateCcw } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  DemoNote,
  Field,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  useToast,
} from "../components/ui/index.js";
import { studios } from "../features/studios.js";
import { useStore } from "../store/AppStore.jsx";

export function Settings() {
  const { user, settings, update, resetWorkspace } = useStore();
  const toast = useToast();

  const setSetting = (key, value) => update("settings")((prev) => ({ ...prev, [key]: value }));
  const setUser = (key, value) => update("user")((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeader title="Settings" description="Workspace preferences. Everything here is stored in this browser only." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="h-fit">
          <CardHeader title="Profile" description="Shown in the header and on generated documents." />
          <div className="space-y-4 px-5 py-4">
            <Field label="Name" htmlFor="set-name">
              <Input id="set-name" value={user.name} onChange={(e) => setUser("name", e.target.value)} />
            </Field>
            <Field label="Email" htmlFor="set-email">
              <Input id="set-email" value={user.email} onChange={(e) => setUser("email", e.target.value)} />
            </Field>
            <Field label="Company" htmlFor="set-company">
              <Input id="set-company" value={user.company} onChange={(e) => setUser("company", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Workspace" description="Defaults applied across the product." />
          <div className="space-y-4 px-5 py-4">
            <Field label="Default studio" htmlFor="set-studio" hint="Where “New” actions start from.">
              <Select
                id="set-studio"
                value={settings.defaultStudio}
                options={studios.map((s) => ({ value: s.key, label: s.title }))}
                onChange={(e) => setSetting("defaultStudio", e.target.value)}
              />
            </Field>

            <Field label="Density" hint="Affects spacing in list-heavy views.">
              <SegmentedControl
                value={settings.density}
                onChange={(value) => setSetting("density", value)}
                options={["comfortable", "compact"]}
                label="Density"
              />
            </Field>

            <DemoNote>
              This is a demo workspace. No account, billing or team management is connected — those screens would live
              here in a production build.
            </DemoNote>

            <Button
              variant="danger"
              icon={RotateCcw}
              onClick={() => {
                resetWorkspace();
                toast({ kind: "success", title: "Workspace reset", body: "Everything is back to the seed data." });
              }}
            >
              Reset workspace
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
