/** A date `days` from today (negative = past) at a given hour — used to seed demo data. */
export function daysAgo(days, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(value) {
  const seconds = (Date.now() - new Date(value).getTime()) / 1000;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`;
  if (seconds < 604800) return `${Math.round(seconds / 86400)} d ago`;
  return formatDateTime(value);
}

export function minutesAgoLabel(minutes) {
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 1440)} d ago`;
}

export function titleCase(value) {
  return String(value ?? "").trim().replace(/^./, (c) => c.toUpperCase());
}

/** Best-effort brand name from a domain or free text. */
export function brandName(value) {
  const text = String(value ?? "").trim();
  if (!text) return "Your brand";
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (url.hostname.includes(".")) {
      const root = url.hostname.replace(/^www\./, "").split(".")[0];
      return root.charAt(0).toUpperCase() + root.slice(1);
    }
  } catch {
    /* not a URL — fall through */
  }
  return titleCase(text);
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
