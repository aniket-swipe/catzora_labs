import { cx } from "../../lib/cx.js";
import { hash } from "../../lib/art.js";

// Explicit list so Tailwind's scanner sees every class.
const TONES = [
  "bg-create-soft text-create",
  "bg-grow-soft text-grow",
  "bg-hire-soft text-hire",
  "bg-automate-soft text-automate",
  "bg-support-soft text-support",
  "bg-accent-soft text-accent",
];

const SIZES = { sm: "h-7 w-7 text-[10.5px]", md: "h-9 w-9 text-[12px]", lg: "h-12 w-12 text-sm" };

export function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, size = "md", className }) {
  return (
    <span
      className={cx(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold",
        TONES[hash(name || "") % TONES.length],
        SIZES[size],
        className
      )}
      aria-hidden
      title={name}
    >
      {initials(name)}
    </span>
  );
}
