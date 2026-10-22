import { KeyRound, Mail, Newspaper, Search, Share2, TrendingUp } from "lucide-react";
import { pageItem, toolItem } from "../studio-utils.js";
import { growTools } from "./tools.js";
import { GrowOverview } from "./Overview.jsx";
import { SeoAuditPage } from "./SeoAudit.jsx";
import { SocialStudioPage } from "./SocialStudio.jsx";
import { EmailStudioPage } from "./EmailStudio.jsx";
import { BlogStudioPage } from "./BlogStudio.jsx";
import { KeywordsPage } from "./Keywords.jsx";

export const growStudio = {
  key: "grow",
  label: "Grow",
  title: "Grow",
  tagline: "Marketing Studio",
  description:
    "Plan and run marketing: audit the site, schedule social, write outreach, run the blog pipeline — plus keyword, AI-search and competitor intelligence.",
  icon: TrendingUp,
  base: "/app/grow",
  overview: GrowOverview,
  items: [
    pageItem({
      slug: "seo",
      icon: Search,
      navLabel: "SEO Automation",
      navDescription: "Audit, triage, fix",
      title: "SEO Automation",
      description: "Audit a site, triage findings by severity, and work through fixes with the markup to paste.",
      component: SeoAuditPage,
    }),
    pageItem({
      slug: "social",
      icon: Share2,
      navLabel: "Social Media",
      navDescription: "Compose, preview, schedule",
      title: "Social Media",
      description: "Platform-shaped posts with a live preview and an editable scheduling calendar.",
      component: SocialStudioPage,
    }),
    pageItem({
      slug: "email",
      icon: Mail,
      navLabel: "Email Marketing",
      navDescription: "Outreach and sequences",
      title: "Email Marketing",
      description: "Personalised outreach with subject options and a follow-up sequence.",
      component: EmailStudioPage,
    }),
    pageItem({
      slug: "blog",
      icon: Newspaper,
      navLabel: "Blog Automation",
      navDescription: "Ideas, pipeline, calendar",
      title: "Blog Automation",
      description: "Topic ideas, a drag-and-drop pipeline, an editorial calendar, outlines and drafts.",
      component: BlogStudioPage,
    }),
    pageItem({
      slug: "keywords",
      icon: KeyRound,
      navLabel: "Keyword Research",
      navDescription: "Clusters, intent, opportunity",
      title: "Keyword Research",
      description: "Keywords grouped by intent and scored for opportunity — sent straight to the blog pipeline.",
      component: KeywordsPage,
    }),
    ...growTools.map(toolItem),
  ],
  stats: (store) => {
    const latest = store.audits[0];
    const open = latest ? latest.issues.filter((i) => !i.resolved) : [];
    return [
      { label: "Posts scheduled", value: store.socialPosts.filter((p) => p.status === "Scheduled").length, sub: `${store.socialPosts.filter((p) => p.status === "Draft").length} drafts` },
      { label: "Blog pipeline", value: store.blogPosts.filter((p) => p.stage !== "Published").length, sub: `${store.blogPosts.filter((p) => p.stage === "Published").length} published` },
      { label: "Critical SEO issues", value: latest ? open.filter((i) => i.severity === "Critical").length : "—", sub: latest ? "From the last audit" : "No audit yet" },
      { label: "Email drafts", value: store.drafts.filter((d) => d.tool === "Email").length, sub: "Saved" },
    ];
  },
};
