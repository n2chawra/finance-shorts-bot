/**
 * A/B experiment flags. The improver registers an experiment in config/experiments.json; Python
 * decides each video's variant and writes it into the timeline. A scene changes its look only
 * behind `flag(tl, "<id>")`, so half the videos keep the old behaviour and the evaluator can compare.
 *
 * Kit pieces deep inside a beat (a map's fill, a prop) have no timeline in hand: StoryVideo provides the
 * video's variants as a context and `useFlag("<id>")` reads it (off outside a video, e.g. in test sheets).
 */
import { createContext, useContext } from "react";
import type { Timeline } from "./timeline";

export function flag(tl: Pick<Timeline, "experiments">, id: string): boolean {
  return tl.experiments?.[id] === "on";
}

export const ExperimentsContext = createContext<Record<string, "on" | "off">>({});

/** A flag read from the video's context: for kit pieces that can't take the timeline as a prop. */
export function useFlag(id: string): boolean {
  return useContext(ExperimentsContext)[id] === "on";
}
