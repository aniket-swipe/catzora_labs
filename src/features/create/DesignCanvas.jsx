import { forwardRef } from "react";
import { DESIGN_PRESETS } from "./constants.js";

const FONT = 'Inter, "Segoe UI", system-ui, -apple-system, Helvetica, Arial, sans-serif';

/** Greedy wrap by estimated character width — SVG has no text flow of its own. */
function wrap(text, perLine, maxLines = 4) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > perLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

/**
 * The live Design Studio canvas.
 *
 * Rendered as SVG at the preset's real pixel size so the PNG export is exactly
 * what is on screen — the ref is handed to svgToPngBlob by the page.
 */
export const DesignCanvas = forwardRef(function DesignCanvas({ design }, ref) {
  const { w, h } = DESIGN_PRESETS[design.preset] || DESIGN_PRESETS["YouTube thumbnail"];
  const portrait = h > w;
  const min = Math.min(w, h);

  const headlineSize = design.preset === "Website banner" ? min * 0.13 : min * (portrait ? 0.085 : 0.1);
  const pad = min * 0.08;
  const columnWidth = design.template === "Split" && !portrait ? w * 0.5 - pad * 2 : w - pad * 2;
  const perLine = Math.max(10, Math.floor(columnWidth / (headlineSize * 0.52)));
  const lines = wrap(design.headline || "Your headline", perLine);

  const minimalDark = design.template === "Minimal" && design.dark;
  const bg = design.template === "Minimal" ? (design.dark ? "#0F172A" : "#F8FAFC") : design.color;
  const fg = design.template === "Minimal" ? (design.dark ? "#F8FAFC" : "#0F172A") : "#FFFFFF";
  const blockTop = portrait ? h * 0.38 : h * 0.3;

  const ctaHeight = headlineSize * 0.62;
  const ctaWidth = (design.cta?.length || 0) * headlineSize * 0.21 + headlineSize * 0.9;
  const ctaY = blockTop + lines.length * headlineSize * 1.12 + headlineSize * 0.9;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`${design.preset} design: ${design.headline}`}
    >
      <rect width={w} height={h} fill={bg} />

      {design.template === "Bold" ? (
        <>
          <circle cx={w * 0.92} cy={h * 0.12} r={min * 0.42} fill="#fff" opacity="0.1" />
          <circle cx={w * 0.82} cy={h * 0.95} r={min * 0.25} fill="#fff" opacity="0.08" />
        </>
      ) : null}

      {design.template === "Split" ? (
        portrait ? (
          <>
            <rect y={h * 0.62} width={w} height={h * 0.38} fill="#fff" opacity="0.12" />
            <circle cx={w * 0.5} cy={h * 0.8} r={min * 0.18} fill="#fff" opacity="0.25" />
          </>
        ) : (
          <>
            <rect x={w * 0.55} width={w * 0.45} height={h} fill="#fff" opacity="0.12" />
            <circle cx={w * 0.77} cy={h * 0.5} r={Math.min(w * 0.16, h * 0.34)} fill="#fff" opacity="0.25" />
            <rect x={w * 0.68} y={h * 0.4} width={w * 0.18} height={h * 0.2} rx={12} fill="#fff" opacity="0.35" />
          </>
        )
      ) : null}

      {design.template === "Minimal" ? (
        <rect x={pad} y={blockTop - headlineSize * 1.4} width={min * 0.12} height={min * 0.012} rx={4} fill={design.color} />
      ) : null}

      <g fontFamily={FONT} fill={fg}>
        {lines.map((line, i) => (
          <text
            key={i}
            x={pad}
            y={blockTop + i * headlineSize * 1.12}
            fontSize={headlineSize}
            fontWeight="700"
            letterSpacing={-headlineSize * 0.02}
          >
            {line}
          </text>
        ))}
        {design.sub ? (
          <text
            x={pad}
            y={blockTop + lines.length * headlineSize * 1.12 + headlineSize * 0.35}
            fontSize={headlineSize * 0.36}
            opacity="0.85"
          >
            {design.sub.slice(0, 80)}
          </text>
        ) : null}
      </g>

      {design.cta ? (
        <g fontFamily={FONT}>
          <rect x={pad} y={ctaY} width={ctaWidth} height={ctaHeight} rx={ctaHeight / 2} fill={minimalDark || design.template === "Minimal" ? design.color : "#FFFFFF"} />
          <text
            x={pad + ctaWidth / 2}
            y={ctaY + ctaHeight * 0.64}
            textAnchor="middle"
            fontSize={headlineSize * 0.28}
            fontWeight="600"
            fill={design.template === "Minimal" ? "#FFFFFF" : design.color}
          >
            {design.cta}
          </text>
        </g>
      ) : null}
    </svg>
  );
});
