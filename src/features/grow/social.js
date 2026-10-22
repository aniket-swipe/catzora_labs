import { titleCase } from "../../lib/format.js";

/** Platform limits — real numbers, used to warn before a post is scheduled. */
export const PLATFORM_LIMIT = { LinkedIn: 3000, Instagram: 2200, Facebook: 63206 };

export const PLATFORMS = ["LinkedIn", "Instagram", "Facebook"];

/**
 * Compose a post from a topic.
 *
 * Deterministic per platform — the shape of a LinkedIn post and an Instagram
 * caption genuinely differ, and that difference is the point of the tool.
 */
export function composePost({ platform, format, topic, goal, tone }) {
  const subject = topic.trim();
  const cap = titleCase(subject);

  const bodies = {
    LinkedIn: `Most teams underestimate ${subject.toLowerCase()}.\n\nWe looked at how it gets handled week to week and found three things that consistently make the difference:\n\n1. A clear owner\n2. A repeatable process\n3. A short weekly review\n\nWhich of these does your team struggle with most?`,
    Instagram: `${cap}, simplified ✨\n\nSave this for the next time you're stuck — and send it to someone who needs it.`,
    Facebook: `Quick question for our community: how do you handle ${subject.toLowerCase()}?\n\nWe've put together a few ideas that have worked for people like you. Share yours in the comments.`,
  };

  const hashtags = [
    ...subject
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 3)
      .map((word) => `#${titleCase(word.replace(/[^a-z0-9]/g, ""))}`),
    platform === "LinkedIn" ? "#Leadership" : platform === "Instagram" ? "#Reels" : "#SmallBusiness",
    goal === "Hiring" ? "#Hiring" : "#Growth",
  ].filter((tag) => tag.length > 2);

  const slides =
    format === "Carousel"
      ? [
          `${cap}: 4 things to know`,
          "1. Start from the outcome you want",
          "2. Remove one step you don't need",
          "3. Make it a weekly habit",
          "4. Measure, then adjust",
          "Save this for later",
        ]
      : undefined;

  return { content: bodies[platform] ?? bodies.LinkedIn, hashtags: [...new Set(hashtags)], slides, tone };
}
