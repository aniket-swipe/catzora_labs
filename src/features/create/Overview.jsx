import { Link } from "react-router-dom";
import { AudioLines, FileText, Image as ImageIcon, Video } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState } from "../../components/ui/index.js";
import { PlaceholderArt } from "./Artwork.jsx";
import { DesignCanvas } from "./DesignCanvas.jsx";
import { useStore } from "../../store/AppStore.jsx";
import { relativeTime } from "../../lib/format.js";

const KIND_ICON = { image: ImageIcon, video: Video, voice: AudioLines, music: AudioLines };
const KIND_HREF = { image: "/app/create/image", video: "/app/create/video", voice: "/app/create/audio", music: "/app/create/audio" };

/** The Create studio's dashboard — what has been produced here recently. */
export function CreateOverview() {
  const { media, designs, decks, drafts } = useStore();
  const images = media.filter((m) => m.kind === "image");
  const createDrafts = drafts.filter((d) => d.studio === "create");

  return (
    <div className="mb-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardHeader title="Recent output" description={`${media.length} generations in this workspace`} />
        {media.length === 0 ? (
          <EmptyState compact icon={ImageIcon} title="Nothing generated yet" description="Anything you produce in Create is collected here." />
        ) : (
          <>
            {images.length ? (
              <div className="grid grid-cols-4 gap-2 px-5 pt-4">
                {images
                  .flatMap((item) => item.outputs.map((o) => ({ ...o, parent: item })))
                  .slice(0, 4)
                  .map((output) => (
                    <PlaceholderArt key={output.id + output.parent.id} seed={output.seed} ratio="1:1" label="" />
                  ))}
              </div>
            ) : null}
            <ul className="divide-y divide-line">
              {media.slice(0, 5).map((item) => {
                const Icon = KIND_ICON[item.kind] || ImageIcon;
                return (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <Icon className="h-4 w-4 shrink-0 text-create" aria-hidden />
                    <Link to={KIND_HREF[item.kind]} className="min-w-0 flex-1 truncate text-[13px] text-ink hover:text-accent">
                      {item.prompt}
                    </Link>
                    <span className="shrink-0 text-[11.5px] text-faint">{relativeTime(item.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Saved designs" description={`${designs.length} in the gallery`} />
          {designs.length === 0 ? (
            <EmptyState compact icon={ImageIcon} title="Gallery is empty" description="Save a canvas in Design Studio to keep it here." />
          ) : (
            <div className="grid grid-cols-2 gap-3 p-5">
              {designs.slice(0, 2).map((design) => (
                <Link key={design.id} to="/app/create/design" className="overflow-hidden rounded-md border border-line transition-shadow hover:shadow-lift">
                  <DesignCanvas design={design} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Drafts and decks" description={`${createDrafts.length} drafts · ${decks.length} decks`} />
          {createDrafts.length + decks.length === 0 ? (
            <EmptyState compact icon={FileText} title="Nothing saved" description="Saved drafts and decks appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {decks.slice(0, 2).map((deck) => (
                <li key={deck.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Link to="/app/create/presentations" className="min-w-0 flex-1 truncate text-[13px] text-ink hover:text-accent">
                    {deck.topic}
                  </Link>
                  <Badge tone="create">{deck.slides.length} slides</Badge>
                </li>
              ))}
              {createDrafts.slice(0, 3).map((draft) => (
                <li key={draft.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Link to="/app/projects" className="min-w-0 flex-1 truncate text-[13px] text-ink hover:text-accent">
                    {draft.title}
                  </Link>
                  <span className="shrink-0 text-[11.5px] text-faint">{draft.tool}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
