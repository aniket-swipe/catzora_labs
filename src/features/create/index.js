import { AudioLines, Image, Palette, PenLine, Presentation, Sparkles, Video } from "lucide-react";
import { pageItem } from "../studio-utils.js";
import { CreateOverview } from "./Overview.jsx";
import { WritingPage } from "./Writing.jsx";
import { ImageStudioPage } from "./ImageStudio.jsx";
import { VideoStudioPage } from "./VideoStudio.jsx";
import { DesignStudioPage } from "./DesignStudio.jsx";
import { PresentationsPage } from "./Presentations.jsx";
import { AudioStudioPage } from "./AudioStudio.jsx";

/**
 * Create studio — six tools, each a working page rather than a form that
 * prints a report. Routes, sidebar entries, hub cards and ⌘K entries are all
 * generated from this list.
 */
export const createStudio = {
  key: "create",
  label: "Create",
  title: "Create",
  tagline: "Content Studio",
  description:
    "Write, design and produce — copy, images, video, designs, decks and audio — from a brief, with the direction a team can act on.",
  icon: Sparkles,
  base: "/app/create",
  overview: CreateOverview,
  items: [
    pageItem({
      slug: "writing",
      icon: PenLine,
      navLabel: "AI Writing",
      navDescription: "Ads, emails, long-form",
      title: "AI Writing",
      description: "Three angles on the same brief — editable, comparable, exportable.",
      component: WritingPage,
    }),
    pageItem({
      slug: "image",
      icon: Image,
      navLabel: "Image Studio",
      navDescription: "Prompts, styles, variations",
      title: "Image Studio",
      description: "Prompt, negative prompt and art direction, with variations and a PNG export.",
      component: ImageStudioPage,
    }),
    pageItem({
      slug: "video",
      icon: Video,
      navLabel: "Video Studio",
      navDescription: "Jobs, shots, storyboards",
      title: "Video Studio",
      description: "Text- or image-to-video jobs with a live queue and a shot list.",
      component: VideoStudioPage,
    }),
    pageItem({
      slug: "design",
      icon: Palette,
      navLabel: "Design Studio",
      navDescription: "Thumbnails, banners, ads",
      title: "Design Studio",
      description: "A live canvas sized for the placement, exported as a real PNG.",
      component: DesignStudioPage,
    }),
    pageItem({
      slug: "presentations",
      icon: Presentation,
      navLabel: "Presentations",
      navDescription: "Outline, slides, .pptx",
      title: "Presentations",
      description: "Editable outline, slide preview and a real PowerPoint export.",
      component: PresentationsPage,
    }),
    pageItem({
      slug: "audio",
      icon: AudioLines,
      navLabel: "Music & Voice",
      navDescription: "Voice-over and music beds",
      title: "Music & Voice",
      description: "Voice-over direction you can hear, and an arrangement for the music under it.",
      component: AudioStudioPage,
    }),
  ],
  stats: (store) => [
    { label: "Generations", value: store.media.length, sub: "Images, video, audio" },
    { label: "Designs saved", value: store.designs.length, sub: "In the gallery" },
    { label: "Decks", value: store.decks.length, sub: "Saved outlines" },
    { label: "Drafts", value: store.drafts.filter((d) => d.studio === "create").length, sub: "Written here" },
  ],
};
