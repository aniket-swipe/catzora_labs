import { useCallback, useRef, useState } from "react";
import { sleep } from "../../lib/format.js";

/**
 * Drives the "working…" step trace that every generator page shows.
 *
 * `run(produce)` walks the step list on a timer, then calls `produce()` and
 * returns its value. The delay exists because an instant result reads as a
 * canned response; the trace makes the stages legible.
 */
export function useRun(steps, { delay = 380 } = {}) {
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const running = useRef(false);

  const run = useCallback(
    async (produce) => {
      if (running.current) return undefined;
      running.current = true;
      setBusy(true);
      try {
        for (let i = 0; i < steps.length; i += 1) {
          setStep(i);
          await sleep(delay);
        }
        return await produce();
      } finally {
        running.current = false;
        setBusy(false);
        setStep(0);
      }
    },
    [steps, delay]
  );

  return { busy, step, run };
}
