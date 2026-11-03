/**
 * The hook score: how many viewers are still watching a few seconds in. YouTube Analytics gives each
 * video's audience retention curve as 100 points (elapsedVideoTimeRatio 0.01..1.00 →
 * audienceWatchRatio, the share of the starting audience watching at that moment; rewatches can push
 * it above 1). The hook moment is 3 s into a Short (the swipe decision) and 30 s into a long video
 * (the promise). Pure, so it is tested directly.
 */
export type Curve = [number, number][];     // [elapsed share 0..1, watch ratio]

export const HOOK_SECONDS = { short: 3, long: 30 } as const;

/** The watch ratio at `seconds` into a `durationSec` video, interpolated; null when the curve is empty. */
export function holdAt(curve: Curve, durationSec: number, seconds: number): number | null {
  if (!curve.length || durationSec <= 0) return null;
  const pts = [...curve].sort((a, b) => a[0] - b[0]);
  const x = Math.min(1, seconds / durationSec);
  if (x <= pts[0]![0]) return round(pts[0]![1]);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!, [x1, y1] = pts[i]!;
    if (x <= x1) return round(y0 + (y1 - y0) * ((x - x0) / (x1 - x0 || 1)));
  }
  return round(pts[pts.length - 1]![1]);
}

/** The hook score for a video of this format and length. */
export function hookHold(curve: Curve, durationSec: number, format: "short" | "long"): number | null {
  return holdAt(curve, durationSec, HOOK_SECONDS[format]);
}

const round = (v: number) => Math.round(v * 1000) / 1000;

/** A beat of the video as drawn: where it starts and what is said in it (from videos/<id>/timeline.json). */
export type SpokenBeat = { id: string; scene: string; from: number; frames: number; words: { t: string; s: number }[]; voiceStart: number };
export type Drop = { at: number; drop: number; from: number; to: number; beat: string; scene: string; line: string; near: string };

/** The beats of a timeline.json, reduced to what drop points need (pure). */
export function spokenBeats(timeline: { beats?: unknown[] }): SpokenBeat[] {
  return (timeline.beats ?? []).flatMap((raw) => {
    const b = raw as { id?: string; scene?: string; from?: number; frames?: number; voice?: { start?: number; captions?: { t: string; s: number }[] } };
    if (typeof b.from !== "number" || typeof b.frames !== "number") return [];
    return [{ id: String(b.id ?? ""), scene: String(b.scene ?? ""), from: b.from, frames: b.frames, words: b.voice?.captions ?? [], voiceStart: b.voice?.start ?? 0 }];
  });
}

/**
 * The steepest places viewers left, matched to what was on screen and being said then. A drop is the
 * fall of the curve over a ~2-second window; the `count` largest that don't overlap are named with
 * their beat, its spoken line and the words around that moment. Pure, so it is tested directly.
 */
export function dropPoints(curve: Curve, durationSec: number, beats: SpokenBeat[], fps = 30, count = 3): Drop[] {
  if (curve.length < 5 || durationSec <= 0) return [];
  const pts = [...curve].sort((a, b) => a[0] - b[0]);
  const step = (pts[pts.length - 1]![0] - pts[0]![0]) / (pts.length - 1) || 0.01;
  const span = Math.max(1, Math.round(2 / durationSec / step));      // points in ~2 s
  const cand: { i: number; d: number }[] = [];
  for (let i = span; i < pts.length; i++) cand.push({ i, d: pts[i - span]![1] - pts[i]![1] });
  cand.sort((a, b) => b.d - a.d);
  const picked: { i: number; d: number }[] = [];
  for (const c of cand) {
    if (picked.length >= count || c.d < 0.02) break;
    if (picked.some((p) => Math.abs(p.i - c.i) < span * 2)) continue;
    picked.push(c);
  }
  return picked.sort((a, b) => a.i - b.i).map(({ i, d }) => {
    const x0 = pts[i - span]![0], x1 = pts[i]![0];
    const at = ((x0 + x1) / 2) * durationSec;
    const frame = at * fps;
    const beat = beats.find((b) => frame >= b.from && frame < b.from + b.frames) ?? beats.at(-1);
    const words = beat?.words ?? [];
    const local = at - (beat ? beat.from / fps + beat.voiceStart / fps : 0);
    const k = words.findIndex((w) => w.s >= local);
    const centre = k < 0 ? words.length - 1 : k;
    return {
      at: round(at), drop: round(d), from: round(pts[i - span]![1]), to: round(pts[i]![1]),
      beat: beat?.id ?? "", scene: beat?.scene ?? "", line: words.map((w) => w.t).join(" "),
      near: words.slice(Math.max(0, centre - 3), centre + 4).map((w) => w.t).join(" "),
    };
  });
}

/** Share of the starting audience still there at the end (last point of the curve). */
export function endHold(curve: Curve): number | null {
  if (!curve.length) return null;
  return round([...curve].sort((a, b) => a[0] - b[0]).at(-1)![1]);
}
