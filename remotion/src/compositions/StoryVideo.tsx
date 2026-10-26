/**
 * Plays a timeline: each beat's scene, under a camera that keeps moving, joined by transitions
 * that overlap the outgoing beat. Silent — Python mixes the audio and muxes it afterwards.
 *
 * Pace: the timeline's frames are real frames, and `tempo` says how much faster than its story
 * clock the video plays. Scenes are written on the story clock (a pop takes 0.4 s, a walk 1.1 s),
 * so each beat is handed to its scene converted to story time, and everything — animations,
 * camera, transitions, lip-sync — speeds up together, like watching at that playback speed.
 */
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";
import { isScene, SCENE_NAMES, type SceneName } from "../contract/scenes";
import { onStoryClock } from "../contract/clock";
import { Timeline, type Beat } from "../contract/timeline";
import { LayoutProbe } from "../fx/probe";
import { captionGroups, captionTokens, Captions } from "../fx/captions";
import { FONT } from "../design/fonts";
import { cameraTransform, exitStyle, transitionFrames, transitionStyle, Vignette } from "../fx/camera";
import type { SceneProps } from "../scenes/kit";
import { ChapterScene, ChecklistScene, EndScene, StageScene } from "../scenes/stage";
import { BigNumberScene, CalendarScene, ChartScene, HeadlineScene, MonsterScene, RevealScene, SnowballScene, SplitScene, StatementScene, TowersScene } from "../scenes/data";
import { EquationScene, KineticScene, PropScene, ScreenScene, SourceScene } from "../scenes/world";
import { BillScene, ForkScene, RoadScene } from "../scenes/journey";
import { ShotScene } from "../studio/shot";
import { HOOKS, VIDEOS } from "../videos/hooks";
import { BuildScene } from "../studio/build";
import { CaseScene, FrameworkScene, JourneyScene, StatsScene, TypeScene } from "../studio/docu";
import { StoryHud } from "../studio/hud";
import { Grain } from "../design/texture";
import { Sikka } from "../cast/Sikka";

/** A video's own hook (videos/<id>/Hook.tsx), or a plain shot with the same params if there is none. */
const HookScene: React.FC<SceneProps> = (p) => {
  const Custom = HOOKS[p.tl.id];
  return Custom ? <Custom {...p} /> : <ShotScene {...p} />;
};

/** A video's own coded beat (videos/<id>/<params.component>.tsx: the turn, the payoff...), or the
 * build scene / a plain shot with the same params if the file is missing or failed its check. */
const CustomScene: React.FC<SceneProps> = (p) => {
  const name = typeof p.beat.params.component === "string" ? p.beat.params.component : "";
  const Custom = VIDEOS[p.tl.id]?.components[name];
  if (Custom) return <Custom {...p} />;
  return Array.isArray(p.beat.params.items) ? <BuildScene {...p} /> : <ShotScene {...p} />;
};

export const SCENES: Record<SceneName, React.FC<SceneProps>> = {
  stage: StageScene, chapter: ChapterScene, checklist: ChecklistScene, end: EndScene, headline: HeadlineScene,
  bignumber: BigNumberScene, reveal: RevealScene, statement: StatementScene, monster: MonsterScene,
  snowball: SnowballScene, calendar: CalendarScene, split: SplitScene, chart: ChartScene, towers: TowersScene,
  prop: PropScene, screen: ScreenScene, equation: EquationScene, kinetic: KineticScene, source: SourceScene, bill: BillScene, road: RoadScene, fork: ForkScene, shot: ShotScene, hook: HookScene,
  build: BuildScene, custom: CustomScene,
  framework: FrameworkScene, type: TypeScene, journey: JourneyScene, stats: StatsScene, case: CaseScene,
};

/** The channel's mark in the top-left corner of every frame: Sikka, small, never text. */
const LogoBug: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const size = h > w ? 74 : 58, m = h > w ? 44 : 36;
  return (
    <svg width={size + m * 2} height={size + m * 2} style={{ position: "absolute", left: 0, top: 0, opacity: 0.85 }} data-probe="skip">
      <circle cx={m + size / 2} cy={m + size / 2} r={size / 2 + 6} fill="rgba(0,0,0,0.25)" />
      <Sikka x={m + size / 2} y={m + size / 2} size={size} expression="happy" />
    </svg>
  );
};

/** A Short without an end card (it loops back to its hook) still says this, small, in its last moments. */
const DisclaimerLine: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const v = tl.height > tl.width;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: v ? tl.height * 0.09 : tl.height * 0.06, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: v ? 44 : 30, color: "#fff", background: "rgba(0,0,0,0.62)",
        padding: v ? "10px 28px" : "6px 20px", borderRadius: 999 }}>{tl.disclaimer}</div>
    </div>
  );
};

// probe: log text boxes (fx/probe.tsx); atFrame: draw this one frame (a cover), without captions,
// logo or disclaimer, on the timeline's own clock (a Still has no fps of its own)
export type StoryProps = { timeline: Timeline; probe?: boolean; atFrame?: number };

export const calculateStoryMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => {
  const tl = Timeline.parse(props.timeline);
  for (const b of tl.beats) if (!isScene(b.scene)) throw new Error(`beat ${b.id}: no scene called ${b.scene}; scenes are ${SCENE_NAMES.join(", ")}`);
  return { durationInFrames: tl.durationInFrames, width: tl.width, height: tl.height, fps: tl.fps, props: { timeline: tl, probe: props.probe } };
};

const BeatView: React.FC<{ beat: Beat; tl: Timeline; frame: number; fps: number }> = ({ beat, tl, frame, fps }) => {
  const Scene = SCENES[beat.scene as SceneName];
  const story = onStoryClock(beat, tl.tempo);
  const local = (frame - beat.from) * tl.tempo;          // story frames since the beat began
  const punchEvent = story.camera.startsWith("punch:") ? story.camera.slice(6) : null;
  const kind = punchEvent ? "drift" : story.camera;
  const punch = punchEvent && punchEvent in story.events ? story.events[punchEvent]! / fps : null;
  const transform = cameraTransform(kind, Math.min(1, local / story.frames), local / fps, story.id, punch);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform }}>
        <Scene beat={story} tl={tl} frame={local} fps={fps} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const StoryVideo: React.FC<StoryProps> = ({ timeline, probe, atFrame }) => {
  const now = useCurrentFrame();
  const config = useVideoConfig();
  const cover = atFrame !== undefined;
  const frame = cover ? atFrame : now;
  const fps = cover ? timeline.fps : config.fps;
  const beats = timeline.beats;
  let i = beats.findIndex((b) => frame >= b.from && frame < b.from + b.frames);
  if (i < 0) i = beats.length - 1;
  const cur = beats[i]!;
  const local = (frame - cur.from) * timeline.tempo;      // transitions run on the story clock too
  const overlap = i > 0 && cur.transition !== "cut" && local < transitionFrames(cur.transition);
  const groups = useMemo(() => captionGroups(captionTokens(timeline)), [timeline]);
  const hasEnd = beats.some((b) => b.scene === "end");
  return (
    <AbsoluteFill style={{ background: timeline.palette.bg }}>
      {overlap && (
        <AbsoluteFill style={exitStyle(cur.transition, local)}>
          <BeatView beat={beats[i - 1]!} tl={timeline} frame={frame} fps={fps} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={overlap ? transitionStyle(cur.transition, local) : undefined}>
        <BeatView beat={cur} tl={timeline} frame={frame} fps={fps} />
      </AbsoluteFill>
      {!cover && <StoryHud tl={timeline} index={i} beat={cur} frame={frame} fps={fps} />}
      <Vignette />
      <Grain />
      {!cover && cur.scene !== "end" && <LogoBug w={timeline.width} h={timeline.height} />}
      {!cover && timeline.captions && <Captions tl={timeline} frame={frame} groups={groups} scene={cur.scene} />}
      {!cover && !hasEnd && frame >= timeline.durationInFrames - Math.round(fps * 1.4) && <DisclaimerLine tl={timeline} />}
      {probe && <LayoutProbe frame={frame} />}
    </AbsoluteFill>
  );
};
