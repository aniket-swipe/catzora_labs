import { useEffect, useState } from "react";
import { AudioLines, Download, Music, Pause, Sparkles, Trash2, Volume2 } from "lucide-react";
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
  PageHeader,
  SegmentedControl,
  Select,
  StepProgress,
  Tabs,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { Waveform } from "./Artwork.jsx";
import { useStore } from "../../store/AppStore.jsx";
import { useRun } from "../tool-framework/useRun.js";
import { musicBrief } from "./generators.js";
import { LANGUAGES, MUSIC_MODELS, VOICES, VOICE_MODELS, modelLabel } from "./constants.js";
import { speak, speechSupported, stopSpeaking } from "../../lib/speech.js";
import { hash } from "../../lib/art.js";
import { relativeTime } from "../../lib/format.js";
import { cx } from "../../lib/cx.js";

const VOICE_STEPS = ["Reading the script", "Setting pace and emphasis", "Shaping the delivery", "Rendering audio"];
const MUSIC_STEPS = ["Reading the brief", "Choosing instrumentation", "Arranging the structure", "Rendering the track"];

const SPEED_RATE = { "0.9×": 0.9, "1×": 1, "1.1×": 1.1 };

export function AudioStudioPage() {
  const toast = useToast();
  const { media, addItem, removeItem, log, touchProject } = useStore();

  const [tab, setTab] = useState("voice");
  const [voice, setVoice] = useState({
    script: "",
    voice: "warm",
    language: "English",
    accent: "Indian",
    speed: "1×",
    model: "auto-voice",
  });
  const [music, setMusic] = useState({ prompt: "", genre: "Lo-fi", mood: "Uplifting", duration: "30s", model: "auto-music" });
  const [playing, setPlaying] = useState(null);
  const [error, setError] = useState("");

  const voiceRun = useRun(VOICE_STEPS);
  const musicRun = useRun(MUSIC_STEPS);
  const supported = speechSupported();
  const audio = media.filter((m) => m.kind === "voice" || m.kind === "music");

  useEffect(() => () => stopSpeaking(), []);

  const accents = LANGUAGES[voice.language]?.accents ?? ["Standard"];
  const langCode = LANGUAGES[voice.language]?.codes?.[voice.accent] ?? "en-IN";

  async function preview(id, text) {
    if (playing === id) {
      stopSpeaking();
      setPlaying(null);
      return;
    }
    const profile = VOICES.find((v) => v.id === voice.voice);
    setPlaying(id);
    await speak(text, { rate: (SPEED_RATE[voice.speed] || 1) * (profile?.rate ?? 1), pitch: profile?.pitch ?? 1, lang: langCode });
    setPlaying(null);
  }

  async function generateVoice() {
    if (voice.script.trim().length < 10) {
      setError("Write a script of at least ten characters.");
      return;
    }
    setError("");
    const done = await voiceRun.run(() => true);
    if (!done) return;
    const profile = VOICES.find((v) => v.id === voice.voice);
    const record = addItem("media", {
      kind: "voice",
      prompt: voice.script.trim(),
      model: voice.model,
      status: "done",
      settings: { voice: profile.name, language: voice.language, accent: voice.accent, speed: voice.speed },
      outputs: [{ id: "o0", seed: hash(voice.script) }],
    });
    log("create", `Voice-over — ${record.prompt.slice(0, 40)}`);
    touchProject(record.prompt.slice(0, 60), "Voice-over", "create");
    toast({ kind: "success", title: "Voice job finished", body: "No audio file was produced — preview uses your device voice." });
  }

  async function generateMusic() {
    if (music.prompt.trim().length < 5) {
      setError("Describe the track in a few more words.");
      return;
    }
    setError("");
    const done = await musicRun.run(() => true);
    if (!done) return;
    const record = addItem("media", {
      kind: "music",
      prompt: music.prompt.trim(),
      model: music.model,
      status: "done",
      settings: { genre: music.genre, mood: music.mood, duration: music.duration },
      outputs: [{ id: "o0", seed: hash(music.prompt) }],
    });
    log("create", `Music brief — ${record.prompt.slice(0, 40)}`);
    toast({ kind: "success", title: "Music job finished", body: "A brief and arrangement — no audio was rendered." });
  }

  const brief = music.prompt.trim().length >= 5 ? musicBrief(music) : null;
  const busy = voiceRun.busy || musicRun.busy;

  return (
    <>
      <PageHeader
        studio="create"
        title="Music & Voice"
        description="Turn scripts into voice-over direction and describe the music bed that sits under them."
        badge={<DemoBadge label="Device-voice preview" />}
      />

      <div className="mb-5">
        <DemoNote>
          No voice or music model is connected, so no audio file is produced. Scripts can be previewed with your
          device&apos;s own speech engine, which is useful for checking pacing — it is not the selected AI voice.
        </DemoNote>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,400px)_1fr]">
        <Card className="h-fit">
          <Tabs
            className="px-3"
            value={tab}
            onChange={(v) => { setTab(v); setError(""); }}
            tabs={[
              { value: "voice", label: "Text to speech" },
              { value: "music", label: "Music" },
            ]}
          />

          {tab === "voice" ? (
            <div className="space-y-4 px-5 py-4">
              <Field
                label="Script"
                htmlFor="a-script"
                hint={error || `${voice.script.length} / 2,000 characters`}
              >
                <Textarea
                  id="a-script"
                  rows={6}
                  maxLength={2000}
                  value={voice.script}
                  invalid={Boolean(error)}
                  placeholder="Welcome to Catzora Labs. In the next two minutes I'll show you how to plan a month of content."
                  onChange={(e) => setVoice((p) => ({ ...p, script: e.target.value }))}
                />
              </Field>

              <fieldset>
                <legend className="mb-1.5 text-[13px] font-medium text-ink">Voice</legend>
                <div className="grid grid-cols-2 gap-2">
                  {VOICES.map((option) => (
                    <label
                      key={option.id}
                      className={cx(
                        "cursor-pointer rounded-md border p-2.5 transition-colors",
                        voice.voice === option.id ? "border-create/40 bg-create-soft" : "border-line hover:bg-sunken"
                      )}
                    >
                      <input
                        type="radio"
                        name="voice"
                        className="sr-only"
                        checked={voice.voice === option.id}
                        onChange={() => setVoice((p) => ({ ...p, voice: option.id }))}
                      />
                      <span className="block text-[13px] font-medium text-ink">{option.name}</span>
                      <span className="block text-[11.5px] leading-snug text-muted">{option.description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Language" htmlFor="a-lang">
                  <Select
                    id="a-lang"
                    value={voice.language}
                    options={Object.keys(LANGUAGES)}
                    onChange={(e) => {
                      const language = e.target.value;
                      setVoice((p) => ({ ...p, language, accent: LANGUAGES[language].accents[0] }));
                    }}
                  />
                </Field>
                <Field label="Accent" htmlFor="a-accent">
                  <Select id="a-accent" value={voice.accent} options={accents} onChange={(e) => setVoice((p) => ({ ...p, accent: e.target.value }))} />
                </Field>
              </div>

              <Field label="Speed">
                <SegmentedControl size="sm" label="Speed" value={voice.speed} options={Object.keys(SPEED_RATE)} onChange={(v) => setVoice((p) => ({ ...p, speed: v }))} />
              </Field>

              <Field label="Model" htmlFor="a-vmodel">
                <Select id="a-vmodel" value={voice.model} options={VOICE_MODELS} onChange={(e) => setVoice((p) => ({ ...p, model: e.target.value }))} />
              </Field>

              {supported && voice.script.trim() ? (
                <Button
                  variant="ghost"
                  icon={playing === "draft" ? Pause : Volume2}
                  onClick={() => preview("draft", voice.script)}
                >
                  {playing === "draft" ? "Stop preview" : "Preview with device voice"}
                </Button>
              ) : null}

              <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={voiceRun.busy} onClick={generateVoice}>
                {voiceRun.busy ? "Rendering…" : "Generate voice-over"}
              </Button>

              {voiceRun.busy ? <StepProgress steps={VOICE_STEPS} current={voiceRun.step} /> : null}
            </div>
          ) : (
            <div className="space-y-4 px-5 py-4">
              <Field label="Describe the track" htmlFor="a-mprompt" hint={error || undefined}>
                <Textarea
                  id="a-mprompt"
                  value={music.prompt}
                  invalid={Boolean(error)}
                  placeholder="Light background music for a product demo — soft piano, subtle claps"
                  onChange={(e) => setMusic((p) => ({ ...p, prompt: e.target.value }))}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Genre" htmlFor="a-genre">
                  <Select
                    id="a-genre"
                    value={music.genre}
                    options={["Lo-fi", "Corporate", "Cinematic", "Pop", "Indian classical fusion", "Electronic"]}
                    onChange={(e) => setMusic((p) => ({ ...p, genre: e.target.value }))}
                  />
                </Field>
                <Field label="Mood" htmlFor="a-mood">
                  <Select
                    id="a-mood"
                    value={music.mood}
                    options={["Uplifting", "Calm", "Energetic", "Dramatic", "Playful"]}
                    onChange={(e) => setMusic((p) => ({ ...p, mood: e.target.value }))}
                  />
                </Field>
              </div>

              <Field label="Duration">
                <SegmentedControl size="sm" label="Duration" value={music.duration} options={["15s", "30s", "60s"]} onChange={(v) => setMusic((p) => ({ ...p, duration: v }))} />
              </Field>

              <Field label="Model" htmlFor="a-mmodel">
                <Select id="a-mmodel" value={music.model} options={MUSIC_MODELS} onChange={(e) => setMusic((p) => ({ ...p, model: e.target.value }))} />
              </Field>

              <Button variant="primary" className="w-full justify-center" icon={Sparkles} loading={musicRun.busy} onClick={generateMusic}>
                {musicRun.busy ? "Rendering…" : "Generate music"}
              </Button>

              {musicRun.busy ? <StepProgress steps={MUSIC_STEPS} current={musicRun.step} /> : null}
            </div>
          )}
        </Card>

        <div className="min-w-0 space-y-5">
          {tab === "music" && brief && !busy ? (
            <Card>
              <CardHeader title="Arrangement" description={`${brief.bpm} BPM · ${brief.key} · ${brief.duration}`} />
              <DataTable
                minWidth={460}
                getRowKey={(row) => row.part}
                columns={[
                  { key: "part", header: "Section", width: 110, render: (r) => <span className="font-medium text-ink">{r.part}</span> },
                  { key: "bars", header: "Bars", width: 90 },
                  { key: "note", header: "Direction" },
                ]}
                rows={brief.structure}
              />
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Audio history" description={`${audio.length} item${audio.length === 1 ? "" : "s"}`} />
            {audio.length === 0 ? (
              <EmptyState
                icon={AudioLines}
                title="Nothing generated yet"
                description="Voice-overs and music briefs are listed here with the settings that produced them."
              />
            ) : (
              <ul className="divide-y divide-line">
                {audio.map((item) => {
                  const seed = item.outputs[0]?.seed ?? hash(item.id);
                  const isVoice = item.kind === "voice";
                  return (
                    <li key={item.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge tone="create">
                              {isVoice ? <Volume2 className="h-3 w-3" aria-hidden /> : <Music className="h-3 w-3" aria-hidden />}
                              {isVoice ? "Voice" : "Music"}
                            </Badge>
                            <span className="text-[11.5px] text-faint">
                              {modelLabel(isVoice ? VOICE_MODELS : MUSIC_MODELS, item.model)} · {relativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-[13px] text-ink">{item.prompt}</p>
                          <p className="mt-0.5 text-[11.5px] text-faint">{Object.values(item.settings).join(" · ")}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          icon={Trash2}
                          aria-label="Delete audio item"
                          onClick={() => removeItem("media", item.id)}
                        />
                      </div>

                      <div className="mt-3 flex items-center gap-3 rounded-md bg-sunken px-3 py-2">
                        <Waveform seed={seed} active={playing === item.id} />
                        <span className="shrink-0 text-[11px] text-faint">No audio file</span>
                      </div>

                      <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                        {isVoice && supported ? (
                          <Button size="sm" variant="ghost" icon={playing === item.id ? Pause : Volume2} onClick={() => preview(item.id, item.prompt)}>
                            {playing === item.id ? "Stop" : "Device-voice preview"}
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" icon={Download} disabled title="Available once an audio model is connected">
                          Download
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
