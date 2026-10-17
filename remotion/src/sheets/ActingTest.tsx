/**
 * A 10-second acting test for the owner's approval: the cast moving, reacting and talking on a
 * simple set. It exercises walking, waving, a prop, a big reaction, talking, a mascot entrance
 * and a group finish.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { blinkAt, chatter, expressionAt, posed, settle } from "../cast/acting";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import { POSES } from "../cast/poses";
import { armTo, type Pose, STAND, STRIDE, walkLegs } from "../cast/rig";
import { Sikka } from "../cast/Sikka";

const GROUND = 1000;
const S = 1.2;

const walking = (dist: number, turn: number): Pose => ({ ...STAND, ...walkLegs(dist / STRIDE), turn });
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };

const Set: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e7d2" /><stop offset="1" stopColor="#efd9bb" /></linearGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fc9f0" /><stop offset="1" stopColor="#d9eefb" /></linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#wall)" />
    <rect x={0} y={GROUND - 40} width={1920} height={140} fill="#c99a6b" />
    {Array.from({ length: 13 }, (_, i) => <rect key={i} x={i * 160} y={GROUND - 40} width={4} height={140} fill="#b5855a" />)}
    <rect x={0} y={GROUND - 48} width={1920} height={12} fill="#e9d2b3" />
    <g transform="translate(1260,160)">
      <rect width={420} height={330} rx={14} fill="#ffffff" />
      <rect x={16} y={16} width={388} height={298} rx={8} fill="url(#sky)" />
      {[[30, 150], [90, 210], [160, 120], [230, 180], [300, 140], [360, 200]].map(([x, h], i) => (
        <rect key={i} x={16 + x!} y={314 - h!} width={52} height={h} fill="#7aa6c7" opacity={0.75} />
      ))}
      <rect x={206} y={16} width={8} height={298} fill="#ffffff" />
    </g>
    <g transform="translate(240,250)">
      <rect width={210} height={150} rx={8} fill="#2bb3a3" opacity={0.9} />
      <path d="M20,120 L70,70 L110,100 L150,45 L190,80" stroke="#ffd34d" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform={`translate(110,${GROUND - 40})`}>
      <path d="M-40,0 L-30,-90 L30,-90 L40,0Z" fill="#c2563a" />
      {[-0.6, -0.2, 0.2, 0.6].map((a, i) => <ellipse key={i} cx={Math.sin(a) * 60} cy={-130 - Math.cos(a) * 40} rx={22} ry={60} fill="#3f9b5b" transform={`rotate(${a * 50} ${Math.sin(a) * 60} ${-130 - Math.cos(a) * 40})`} />)}
    </g>
  </svg>
);

const Phone = (x: number, y: number) => (
  <g transform={`translate(${x - 18},${y - 52})`}>
    <rect width={36} height={64} rx={7} fill="#1e2230" />
    <rect x={4} y={6} width={28} height={50} rx={4} fill="#8fe3d6" />
  </g>
);

export const ActingTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Rohan: walks in, waves, checks his phone, is shocked, listens, celebrates
  const rWalk = ease(t / 2.2) * 760;
  const rX = -160 + rWalk;
  const shockJump = t > 3.9 && t < 4.5 ? Math.sin(((t - 3.9) / 0.6) * Math.PI) * 50 : 0;
  const rohanPose = t < 2.2 ? walking(rWalk, 0.85) : posed(t, [
    { at: 2.2, pose: STAND },
    { at: 2.4, pose: POSES.wave },
    { at: 3.3, pose: POSES.phone },
    { at: 4.0, pose: { ...POSES.shrug, bob: -shockJump } },
    { at: 5.2, pose: { ...POSES.stand, turn: 0.5 } },
    { at: 6.6, pose: { ...POSES.think, turn: 0.4 } },
    { at: 8.0, pose: POSES.celebrate },
    { at: 9.1, pose: { ...POSES.thumbsUp, turn: 0 } },
  ]);
  const rohanFace = expressionAt(t, [[0, "happy"], [2.4, "laugh"], [3.3, "neutral"], [3.95, "shock"], [5.2, "confused"], [6.6, "thinking"], [8.0, "laugh"], [9.1, "proud"]]);

  // Priya: walks in from the right, explains while pointing back at the chart, talking
  const pWalk = ease((t - 4.6) / 1.4) * 760;
  const pX = 2100 - pWalk;
  const pointBack: Pose = { ...STAND, turn: -0.45, armR: armTo("R", { ...STAND, turn: -0.45 }, -230, -380), handR: "point" };
  const priyaPose = t < 6.0 ? walking(pWalk, -0.85) : posed(t, [
    { at: 6.0, pose: { ...STAND, turn: -0.45 } },
    { at: 6.15, pose: pointBack },
    { at: 8.0, pose: POSES.celebrate },
    { at: 9.1, pose: { ...POSES.hips, turn: -0.1 } },
  ]);
  const priyaFace = expressionAt(t, [[0, "smirk"], [8.0, "laugh"], [9.1, "proud"]]);

  // Sikka drops in between them, bounces, spins and cheers
  const drop = clamp((t - 7.0) / 0.7);
  const sikkaY = t < 7.0 ? -200 : 640 - (1 - settle(drop)) * 760;
  const sikkaSquash = t > 7.55 && t < 7.85 ? Math.sin(((t - 7.55) / 0.3) * Math.PI) * 0.35 : 0;

  // Sharma Uncle leans in from the right edge and approves
  const uX = 1980 - ease((t - 8.3) / 0.8) * 230;
  const unclePose = { ...POSES.stand, turn: -0.5, lean: -0.06, headTilt: Math.sin(Math.max(0, t - 9.0) * 9) * 0.06 };

  return (
    <AbsoluteFill>
      <Set />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {t > 8.2 && <Character id="sharma" look={CAST.sharma!.look} pose={unclePose} expression={t > 8.9 ? "proud" : "neutral"} blink={blinkAt(t, 3)} x={uX} y={GROUND} scale={S} gaze={[-0.6, 0]} />}
        <Character id="rohan" look={CAST.rohan!.look} pose={rohanPose} expression={rohanFace} blink={blinkAt(t, 1)}
          gaze={t > 5.2 && t < 8 ? [0.7, 0] : [0, 0]} x={rX} y={GROUND} scale={S}
          holdL={t > 3.3 && t < 4.6 ? Phone : undefined} viseme={chatter(t, 2.5, 3.1, 1)} />
        {t > 4.6 && <Character id="priya" look={CAST.priya!.look} pose={priyaPose} expression={priyaFace} blink={blinkAt(t, 2)}
          gaze={[-0.7, 0]} x={pX} y={GROUND} scale={S} viseme={chatter(t, 6.2, 7.9, 2)} />}
        {t > 7.0 && <Sikka x={960} y={sikkaY} size={150} squash={sikkaSquash} spin={t > 7.9 && t < 8.6 ? (t - 7.9) * 9 : 0}
          expression={t > 8.0 ? "laugh" : "shock"} armsUp={t > 8.0} blink={blinkAt(t, 4)} />}
      </svg>
    </AbsoluteFill>
  );
};
