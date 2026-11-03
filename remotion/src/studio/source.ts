/**
 * Where a video's sources are printed (owner, 2026-11-03, on v-20261103-01: "The source should be
 * shown once only throughout the video. No need to show again and again."). The "Data: … · month"
 * line (a hard rule for sourced facts) appears on exactly one beat: the first board beat that says a
 * sourced figure, or, when no board beat does, the first beat of any scene that does. A video's own
 * Hook/Turn/Payoff components print it only when `showsSource(p)` says so.
 */
import type { SceneProps } from "../scenes/kit";

type Tl = SceneProps["tl"];
type Bt = SceneProps["beat"];

const factFigures = (tl: Tl) => Object.entries(tl.figures ?? {}).filter(([k]) => /^fact\d+$/.test(k)).map(([, x]) => x).filter(Boolean);

/** Whether a beat speaks one of the video's sourced figures. */
export const saysFact = (tl: Tl, beat: Bt) => { const f = factFigures(tl); return f.some((x) => (beat.say ?? "").includes(x)); };

/** The `from` frame of the one beat that prints the source line (-1: none does). */
export function sourceBeat(tl: Tl): number {
  if (!tl.sources) return -1;
  const said = tl.beats.filter((b) => saysFact(tl, b));
  const b = said.find((x) => x.scene === "board") ?? said[0];
  return b ? b.from : -1;
}

/** Whether this beat is the one that prints the source line. */
export const showsSource = (p: Pick<SceneProps, "tl" | "beat">) => sourceBeat(p.tl) >= 0 && sourceBeat(p.tl) === p.beat.from;
