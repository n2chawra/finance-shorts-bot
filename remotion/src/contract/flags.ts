/**
 * A/B experiment flags. The improver registers an experiment in config/experiments.json; Python
 * decides each video's variant and writes it into the timeline. A scene changes its look only
 * behind `flag(tl, "<id>")`, so half the videos keep the old behaviour and the evaluator can compare.
 */
import type { Timeline } from "./timeline";

export function flag(tl: Pick<Timeline, "experiments">, id: string): boolean {
  return tl.experiments?.[id] === "on";
}
