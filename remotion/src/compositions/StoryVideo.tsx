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
import { isScene, SCENE_NAMES, type SceneName } from "../contract/scenes";
import { onStoryClock } from "../contract/clock";
import { Timeline, type Beat } from "../contract/timeline";
import { LayoutProbe } from "../fx/probe";
import { cameraTransform, TRANSITION_FRAMES, transitionStyle, Vignette } from "../fx/camera";
import type { SceneProps } from "../scenes/kit";
import { ChapterScene, ChecklistScene, EndScene, StageScene } from "../scenes/stage";
import { BigNumberScene, CalendarScene, ChartScene, HeadlineScene, MonsterScene, RevealScene, SnowballScene, SplitScene, StatementScene, TowersScene } from "../scenes/data";
import { EquationScene, KineticScene, PropScene, ScreenScene } from "../scenes/world";
import { Grain } from "../design/texture";
import { Sikka } from "../cast/Sikka";

export const SCENES: Record<SceneName, React.FC<SceneProps>> = {
  stage: StageScene, chapter: ChapterScene, checklist: ChecklistScene, end: EndScene, headline: HeadlineScene,
  bignumber: BigNumberScene, reveal: RevealScene, statement: StatementScene, monster: MonsterScene,
  snowball: SnowballScene, calendar: CalendarScene, split: SplitScene, chart: ChartScene, towers: TowersScene,
  prop: PropScene, screen: ScreenScene, equation: EquationScene, kinetic: KineticScene,
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

export type StoryProps = { timeline: Timeline; probe?: boolean };   // probe: log text boxes (fx/probe.tsx)

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

export const StoryVideo: React.FC<StoryProps> = ({ timeline, probe }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beats = timeline.beats;
  let i = beats.findIndex((b) => frame >= b.from && frame < b.from + b.frames);
  if (i < 0) i = beats.length - 1;
  const cur = beats[i]!;
  const local = (frame - cur.from) * timeline.tempo;      // transitions run on the story clock too
  const overlap = i > 0 && cur.transition !== "cut" && local < TRANSITION_FRAMES;
  return (
    <AbsoluteFill style={{ background: timeline.palette.bg }}>
      {overlap && <BeatView beat={beats[i - 1]!} tl={timeline} frame={frame} fps={fps} />}
      <AbsoluteFill style={overlap ? transitionStyle(cur.transition, local) : undefined}>
        <BeatView beat={cur} tl={timeline} frame={frame} fps={fps} />
      </AbsoluteFill>
      <Vignette />
      <Grain />
      {cur.scene !== "end" && <LogoBug w={timeline.width} h={timeline.height} />}
      {probe && <LayoutProbe frame={frame} />}
    </AbsoluteFill>
  );
};
