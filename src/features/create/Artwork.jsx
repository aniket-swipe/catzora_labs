import { forwardRef } from "react";
import { hash, paletteFor, ratioBox } from "../../lib/art.js";
import { cx } from "../../lib/cx.js";

/**
 * A deterministic placeholder for generated media.
 *
 * No image model is connected, so this stands in for a render. The same seed
 * always draws the same shapes, which keeps galleries and history stable
 * across reloads — and it is labelled, so it is never mistaken for output.
 */
export const PlaceholderArt = forwardRef(function PlaceholderArt(
  { seed, ratio = "1:1", label = "Placeholder", className, children },
  ref
) {
  const [bg, mid, accent] = paletteFor(String(seed));
  const box = ratioBox(ratio);
  const n = (channel) => ((hash(`${seed}:${channel}`) % 1000) / 1000);

  return (
    <div className={cx("relative overflow-hidden rounded-md border border-line", className)}>
      <svg
        ref={ref}
        viewBox={`0 0 ${box.w} ${box.h}`}
        preserveAspectRatio="none"
        className="block h-auto w-full"
        style={{ aspectRatio: `${box.w} / ${box.h}` }}
        role="img"
        aria-label={`${label} artwork`}
      >
        <rect width={box.w} height={box.h} fill={bg} />
        <circle cx={box.w * (0.2 + n(1) * 0.6)} cy={box.h * (0.2 + n(2) * 0.5)} r={box.w * (0.22 + n(3) * 0.16)} fill={mid} />
        <circle cx={box.w * (0.3 + n(4) * 0.6)} cy={box.h * (0.45 + n(5) * 0.4)} r={box.w * (0.12 + n(6) * 0.12)} fill={accent} opacity="0.8" />
        <rect
          x={box.w * 0.08}
          y={box.h * (0.68 + n(7) * 0.18)}
          width={box.w * (0.3 + n(8) * 0.4)}
          height={Math.max(4, box.h * 0.012)}
          rx={box.h * 0.006}
          fill={accent}
          opacity="0.35"
        />
      </svg>
      {children}
      <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-surface/90 px-1.5 py-0.5 text-[10px] font-medium text-muted">
        {label}
      </span>
    </div>
  );
});

/** Static waveform drawn from a seed — a visual for an audio item, not a signal. */
export function Waveform({ seed, bars = 48, active, className }) {
  return (
    <div className={cx("flex h-10 flex-1 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={cx("w-[3px] shrink-0 rounded-full", active ? "bg-create" : "bg-line")}
          style={{ height: `${18 + (hash(`${seed}:${i}`) % 70)}%` }}
        />
      ))}
    </div>
  );
}
