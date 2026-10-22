/** The hiring pipeline, in order. Rejected is terminal and sits at the end. */
export const PIPELINE_STAGES = ["Applied", "Screening", "Shortlisted", "Interview", "On Hold", "Offer", "Hired", "Rejected"];

export const STAGE_TONES = {
  Applied: "neutral",
  Screening: "accent",
  Shortlisted: "grow",
  Interview: "hire",
  "On Hold": "warning",
  Offer: "accent",
  Hired: "success",
  Rejected: "danger",
};

/** Stages that count as "still in play" for dashboards. */
export const ACTIVE_STAGES = ["Applied", "Screening", "Shortlisted", "Interview", "On Hold", "Offer"];

/** The next stage forward, skipping On Hold and never moving past Hired. */
export function nextStage(stage) {
  const flow = ["Applied", "Screening", "Shortlisted", "Interview", "Offer", "Hired"];
  const i = flow.indexOf(stage);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
}

/**
 * Overlap between a candidate's listed skills and a job's required skills.
 * Deliberately simple and explainable: it is a sorting aid, not a judgement.
 */
export function skillMatch(candidate, job) {
  const required = job?.skills ?? [];
  if (!required.length) return { pct: 0, matched: [], missing: [] };
  const have = new Set((candidate.skills || []).map((s) => s.toLowerCase()));
  const matched = required.filter((s) => have.has(s.toLowerCase()));
  return {
    pct: Math.round((matched.length / required.length) * 100),
    matched,
    missing: required.filter((s) => !have.has(s.toLowerCase())),
  };
}
