/**
 * A licensed stock clip (staged by generator/media into public/media/<slug>/) trimmed to the beat,
 * under a slow camera move, in the channel's grade, with optional grain, vignette and cinema bars.
 *
 * Timing: the clip plays at real speed from `trim` seconds, whatever the video's tempo (the story clock
 * only speeds up our own animation). It is driven through <Freeze> with the beat's own real frame, so
 * it is in sync in the video, in a transition overlap and in a cover still alike, and it holds its last
 * frame when the beat outlasts the clip (`len`, the clip's length from the fetcher's log).
 * Always muted: the sound is mixed in Python (renderer/timeline/build.py), never taken from a clip.
 */
import React, { useId } from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile } from "remotion";
import { moveTransform, type MoveKind } from "./move";
import { DocVignette, FilmGrain, Letterbox, useGrade, type GradeName } from "./theme";

export type FootageProps = {
  src: string;                 // a path under remotion/public: "media/<slug>/<file>.mp4"
  t: number;                   // the beat's frame on the story clock (motion(p).t)
  end: number;                 // the beat's length on the story clock (motion(p).end)
  tempo: number;               // timeline tempo (story frames per real frame)
  w: number; h: number;
  trim?: number;               // seconds into the clip where the beat starts
  rate?: number;               // playback rate (0.5 = slow motion)
  len?: number;                // the clip's length in seconds (hold the last frame past it)
  move?: MoveKind; amount?: number; focus?: [number, number];
  grade?: GradeName;
  grain?: number;              // 0..1 film grain strength (0 = none)
  vignette?: number;           // 0..1
  letterbox?: boolean;
  blur?: number;               // px: a background plate behind headlines or a chart
  dim?: number;                // 0..1 black over the clip
  aspect?: number;             // the clip's width / height: a 4:3 or vertical clip sits on a blurred, enlarged copy of itself
};

export const Footage: React.FC<FootageProps> = ({
  src, t, end, tempo, w, h, trim = 0, rate = 1, len, move = "push", amount = 0.05, focus = [0.5, 0.5],
  grade = "doc", grain = 0.2, vignette = 0.45, letterbox = false, blur = 0, dim = 0, aspect,
}) => {
  const id = `docgrade-${useId().replace(/:/g, "")}`;
  const { defs, filter } = useGrade(grade, id);
  const fps = 30;
  const real = Math.max(0, Math.round(t / Math.max(0.01, tempo)));
  // the last frame we may ask for: the clip's end, in timeline frames at this rate
  const last = len ? Math.max(0, Math.floor(((len - trim) * fps) / rate) - 2) : Infinity;
  const { transform, origin } = moveTransform(move, end > 0 ? t / end : 0, amount, focus);
  const pillar = aspect !== undefined && Math.abs(Math.log(aspect / (w / h))) > 0.15;
  const css = [filter !== "none" ? filter : "", blur ? `blur(${blur}px)` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {defs}
      {pillar ? (
        // the same clip, enlarged and blurred, fills the sides (the archive look; no black bars)
        <AbsoluteFill style={{ transform: "scale(1.15)" }}>
          <Freeze frame={Math.min(real, last)}>
            <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(trim * fps)} playbackRate={rate}
              style={{ width: w, height: h, objectFit: "cover", filter: `${css ?? ""} blur(${24 * Math.min(w, h) / 1080}px) brightness(0.5)` }} />
          </Freeze>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ transform, transformOrigin: origin }}>
        <Freeze frame={Math.min(real, last)}>
          <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(trim * fps)} playbackRate={rate}
            style={{ width: w, height: h, objectFit: pillar ? "contain" : "cover", filter: css }} />
        </Freeze>
      </AbsoluteFill>
      {dim > 0 ? <AbsoluteFill style={{ background: `rgba(4,6,12,${dim})` }} /> : null}
      {grain > 0 ? <FilmGrain t={t} o={grain} /> : null}
      {vignette > 0 ? <DocVignette o={vignette} /> : null}
      {letterbox ? <Letterbox w={w} h={h} /> : null}
    </AbsoluteFill>
  );
};
