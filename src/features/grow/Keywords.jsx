import { useMemo, useState } from "react";
import { Download, KeyRound, Plus, Search } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  DemoBadge,
  DemoNote,
  EmptyState,
  Field,
  Input,
  PageHeader,
  ProgressBar,
  SegmentedControl,
  Select,
  StepProgress,
  useToast,
} from "../../components/ui/index.js";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { difficultyTone, researchKeywords } from "./content.js";
import { downloadText } from "../../lib/download.js";
import { todayKey } from "../../lib/date.js";
import { titleCase } from "../../lib/format.js";

const STEPS = ["Expanding the seed", "Estimating volume", "Scoring difficulty", "Grouping into clusters"];
const CLUSTERS = ["All", "Learn", "Compare", "Act", "Find"];

export function KeywordsPage() {
  const toast = useToast();
  const { addItem, log, touchProject } = useStore();

  const [seed, setSeed] = useState("");
  const [market, setMarket] = useState("India");
  const [rows, setRows] = useState([]);
  const [cluster, setCluster] = useState("All");
  const [sort, setSort] = useState({ key: "opportunity", direction: -1 });
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");
  const { busy, step, run } = useRun(STEPS);

  const visible = useMemo(() => {
    const list = rows.filter((r) => cluster === "All" || r.cluster === cluster);
    return [...list].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * sort.direction;
    });
  }, [rows, cluster, sort]);

  const totals = useMemo(
    () =>
      ["Learn", "Compare", "Act", "Find"].map((name) => {
        const items = rows.filter((r) => r.cluster === name);
        return { name, count: items.length, volume: items.reduce((s, r) => s + r.volume, 0) };
      }),
    [rows]
  );
  const maxVolume = Math.max(1, ...totals.map((t) => t.volume));

  async function research() {
    if (seed.trim().length < 3) {
      setError("Enter a seed topic of at least three characters.");
      return;
    }
    setError("");
    const next = await run(() => researchKeywords(seed, market));
    if (!next) return;
    setRows(next);
    setSelected(new Set());
    setCluster("All");
    log("grow", `Keyword research for "${seed.trim()}"`);
    touchProject(`Keyword strategy — ${seed.trim()}`, "Keyword Research", "grow");
  }

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function sendToBlog() {
    const chosen = rows.filter((r) => selected.has(r.id));
    chosen.forEach((row, i) =>
      addItem(
        "blogPosts",
        {
          title: titleCase(row.keyword.startsWith("how") || row.keyword.startsWith("what") ? `${row.keyword}?` : `${row.keyword}: a practical guide`),
          keyword: row.keyword,
          intent: row.intent,
          audience: "General",
          stage: "Idea",
          date: todayKey(7 * (i + 1)),
          outline: null,
          draft: null,
        },
        { append: true }
      )
    );
    setSelected(new Set());
    toast({ kind: "success", title: `${chosen.length} added to Blog Automation`, body: "They start in the Idea column." });
  }

  function exportCsv() {
    const header = "keyword,intent,cluster,volume,difficulty,cpc_usd,opportunity";
    const lines = rows.map((r) => [`"${r.keyword}"`, r.intent, r.cluster, r.volume, r.difficulty, r.cpc, r.opportunity].join(","));
    downloadText(`keywords-${seed.trim().replace(/\s+/g, "-")}.csv`, [header, ...lines].join("\n"), "text/csv;charset=utf-8");
    toast({ kind: "success", title: "CSV downloaded" });
  }

  return (
    <>
      <PageHeader
        studio="grow"
        title="Keyword Research"
        description="Expand a seed topic into keywords grouped by intent, pick the ones worth writing for, and send them to the blog pipeline."
        badge={<DemoBadge label="Invented metrics" />}
      />

      <Card className="mb-5">
        <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto_auto] md:items-end">
          <Field label="Seed topic" htmlFor="k-seed" hint={error || undefined}>
            <Input
              id="k-seed"
              value={seed}
              invalid={Boolean(error)}
              placeholder="e.g. content calendar"
              onChange={(e) => setSeed(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && research()}
            />
          </Field>
          <Field label="Market">
            <SegmentedControl label="Market" value={market} options={["India", "US", "Global"]} onChange={setMarket} />
          </Field>
          <Button variant="primary" icon={Search} loading={busy} onClick={research}>
            Research
          </Button>
        </div>
        <div className="border-t border-line px-5 py-3">
          <DemoNote>
            Volumes, difficulty and CPC are invented — stable per keyword so a re-run agrees with itself, but not measured.
            Connect a keyword data provider before relying on them.
          </DemoNote>
        </div>
      </Card>

      {busy ? (
        <Card className="p-5">
          <StepProgress steps={STEPS} current={step} />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={KeyRound} title="No research yet" description="Enter a seed topic. You will get a keyword table grouped by search intent." />
        </Card>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {totals.map((t) => (
              <button
                key={t.name}
                onClick={() => setCluster((c) => (c === t.name ? "All" : t.name))}
                aria-pressed={cluster === t.name}
                className={`card p-4 text-left transition-shadow hover:shadow-lift ${cluster === t.name ? "ring-2 ring-accent" : ""}`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-faint">{t.name}</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-ink">{t.volume.toLocaleString()}</p>
                <p className="mb-2 text-[12px] text-muted">{t.count} keywords · monthly searches</p>
                <ProgressBar tone="grow" value={(t.volume / maxVolume) * 100} label={`${t.name} volume`} />
              </button>
            ))}
          </div>

          <Card>
            <CardHeader
              title={`Keywords for “${seed.trim()}”`}
              description={`${visible.length} shown · ${selected.size} selected`}
              action={
                <div className="flex flex-wrap gap-2">
                  <Select aria-label="Cluster" className="w-28" value={cluster} options={CLUSTERS} onChange={(e) => setCluster(e.target.value)} />
                  <Button size="sm" variant="ghost" icon={Download} onClick={exportCsv}>
                    CSV
                  </Button>
                  <Button size="sm" variant="primary" icon={Plus} disabled={!selected.size} onClick={sendToBlog}>
                    Add to blog ({selected.size})
                  </Button>
                </div>
              }
            />
            <DataTable
              rows={visible}
              getRowKey={(r) => r.id}
              sort={sort}
              onSortChange={setSort}
              minWidth={760}
              columns={[
                {
                  key: "select",
                  header: "",
                  width: 40,
                  render: (r) => (
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[rgb(var(--grow))]"
                      aria-label={`Select ${r.keyword}`}
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                    />
                  ),
                },
                { key: "keyword", header: "Keyword", sortable: true, render: (r) => <span className="font-medium text-ink">{r.keyword}</span> },
                { key: "intent", header: "Intent", sortable: true, width: 130, render: (r) => <Badge tone="grow">{r.intent}</Badge> },
                { key: "volume", header: "Volume", sortable: true, align: "right", width: 100, render: (r) => <span className="tabular-nums">{r.volume.toLocaleString()}</span> },
                { key: "difficulty", header: "Difficulty", sortable: true, width: 110, render: (r) => <Badge tone={difficultyTone(r.difficulty)}>{r.difficulty}</Badge> },
                { key: "cpc", header: "CPC", align: "right", width: 80, render: (r) => <span className="tabular-nums">${r.cpc}</span> },
                { key: "opportunity", header: "Opportunity", sortable: true, align: "right", width: 120, render: (r) => <span className="font-medium tabular-nums text-ink">{r.opportunity}</span> },
              ]}
            />
            <p className="border-t border-line px-5 py-3 text-[12px] text-faint">
              Opportunity weighs volume against difficulty — a high score means plenty of searches you have a realistic chance of ranking for.
            </p>
          </Card>
        </>
      )}
    </>
  );
}
