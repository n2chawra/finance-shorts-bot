// Cutaway (flat, portrait, blueprint look): a side cutaway of the airliner's nose at night, the flight deck drawn in
// section. The windshield onto snow and the horizon, the panel with the airspeed screen (the beat's figure) and three
// PUSHER lamps, the captain seated (a role, never a name) with his hands on the yoke, the control column pivoting at
// the floor, the shaker motor on the column and the stick pusher's actuator under the floor, its rod linked to the
// column. Modes (params.mode): hook (the column slides forward on its own), fight (it lunges forward, the hands drag it
// back, three times), loop (quiet, before the warning). Figures come only from params.fig.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { rnd } from "../../three/index";
import { AMBER, ANTON, ArrowSvg, Chip, figOf, GREEN, Grid, ICE, INK, MONO, moments, ramp, RED, StampHtml, TypeText } from "./ui";

type Params = { mode?: string };

const PX = 600, PY = 1090; // the column's pivot on the floor

const Cutaway: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "hook";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => (ev[n] !== undefined ? ev[n]! : 1e9);
  const speed = figOf(p, "speed");

  // the column's angle (degrees, + = forward) and the pusher's pushes
  let ang = 0, pushes: number[] = [], pulls: number[] = [];
  if (mode === "hook") {
    ang = 16 * ramp(t, e("push"), 10);
    pushes = [e("push")];
  } else if (mode === "fight") {
    const a = -6, b = e("dragged"), c = e("twice"), d = c + 16, f = e("each");
    pushes = [a, c, d];
    pulls = [b, c + 9, Math.max(d + 9, f)];
    ang = 0;
    for (let i = 0; i < 3; i++) ang += 18 * ramp(t, pushes[i]! - (i === 0 ? 12 : 0), 6) - 18 * ramp(t, pulls[i]!, 7);
    ang = Math.max(-14, ang - 14 * ramp(t, pulls[2]!, 10));
  } else {
    ang = 1.5 * Math.sin(t / 12);
    pushes = [];
  }
  const lit = pushes.filter((x) => t >= x).length;
  const pushing = pushes.some((x, i) => t >= x && t < (pulls[i] ?? x + 30));
  const rodK = Math.max(0, ang) / 18;
  const strain = mode === "fight" ? (t >= e("against") ? 0.6 + 0.4 * Math.sin(t / 2) : 0.3) : mode === "hook" ? ramp(t, e("plane"), 10) : ramp(t, e("channel"), 10);
  const noseDown = mode === "hook" ? 60 * ramp(t, e("down"), 20) : mode === "fight" ? 50 * rodK : 0;
  const shake = mode === "fight" && pushing ? Math.sin(t * 3.1) * 4 : 0;

  // the camera (zoom ≤ 1.3)
  const keys: [number, number, number, number][] = mode === "hook"
    ? [[0, 1.06, 540, 900], [e("push"), 1.24, 680, 990]]
    : mode === "fight"
      ? [[0, 1.24, 620, 940], [e("dragged"), 1.26, 610, 900], [e("twice"), 1.08, 560, 900], [e("each"), 1.24, 620, 940]]
      : [[0, 1.0, 540, 900], [e("story"), 1.12, 540, 920], [e("channel"), 1.26, 560, 960]];
  let zoom = keys[0]![1], cx = keys[0]![2], cy = keys[0]![3];
  for (let i = 1; i < keys.length; i++) {
    const k = ramp(t, keys[i]![0], 16);
    zoom += (keys[i]![1] - zoom) * k; cx += (keys[i]![2] - cx) * k; cy += (keys[i]![3] - cy) * k;
  }
  zoom += 0.01 * Math.sin(t / 40);

  const a = (ang * Math.PI) / 180;
  const yokeX = PX + Math.sin(a) * 330, yokeY = PY - Math.cos(a) * 330;
  const rodEnd = { x: PX - Math.sin(a) * 90, y: PY + Math.cos(a) * 90 };
  const line = "#ffffff", fill = "rgba(255,255,255,0.08)";
  const horizon = 560 + noseDown;

  const html = (
    <>
      {mode === "hook" && <Chip t={t} at={-60} text={`FEB ${figOf(p, "day")}, ${figOf(p, "year")} · NEAR BUFFALO`} top={300} size={44} />}
      {mode === "hook" && <Chip t={t} at={e("Colgan")} text="COLGAN AIR · FLIGHT DECK" top={385} size={44} color={AMBER} border={AMBER} />}
      {mode === "fight" && <Chip t={t} at={e("captain")} text="CAPTAIN" top={300} size={52} color={AMBER} border={AMBER} />}
      {mode === "fight" && t >= e("each") && <StampHtml t={t} at={e("each")} text="OVERRIDDEN" x={300} y={420} size={86} />}
      {mode === "loop" && <Chip t={t} at={e("Machine")} text="MACHINE" top={300} size={56} color={GREEN} border={GREEN} />}
      {mode === "loop" && <Chip t={t} at={e("pilot")} text="OR PILOT?" top={400} size={56} color={AMBER} border={AMBER} />}
      {mode === "loop" && <Chip t={t} at={e("channel")} text="FULL STORY ON THE CHANNEL" top={500} size={44} />}
    </>
  );

  return (
    <Grid t={t} zoom={zoom} cx={cx} cy={cy} html={html} tag="reconstruction">
      <defs>
        <clipPath id="ct-wind"><path d="M 150 470 L 470 330 L 520 640 L 210 700 Z" /></clipPath>
      </defs>
      {/* the fuselage's nose in section */}
      <path d="M 1300 300 L 520 300 Q 260 310 120 520 Q 40 660 60 900 Q 80 1130 220 1260 L 1300 1260" fill={fill} stroke={line} strokeWidth={7} />
      <path d="M 1300 1140 L 260 1140" stroke={line} strokeWidth={5} strokeDasharray="22 14" />
      {/* outside the windshield: night, the horizon (rises when the nose goes down), snow */}
      <g clipPath="url(#ct-wind)">
        <rect x={100} y={300} width={500} height={450} fill="#0b2a63" />
        <rect x={100} y={horizon} width={500} height={400} fill="#071c45" />
        <line x1={100} y1={horizon} x2={600} y2={horizon} stroke={ICE} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => <circle key={`l${i}`} cx={160 + i * 32} cy={horizon + 20 + (i % 3) * 14} r={4} fill="#ffe6a8" opacity={0.8} />)}
        {Array.from({ length: 40 }, (_, i) => {
          const life = (t * (0.04 + 0.02 * rnd("cs", i)) + rnd("cl", i)) % 1;
          const x = 560 - life * 480, y = 340 + rnd("cy", i) * 380 + life * 40;
          return <line key={i} x1={x} y1={y} x2={x + 30} y2={y - 6} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.3 + 0.6 * life} />;
        })}
      </g>
      <path d="M 150 470 L 470 330 L 520 640 L 210 700 Z" fill="none" stroke={line} strokeWidth={9} />
      {/* the floor and the space under it */}
      <rect x={180} y={PY} width={1120} height={18} fill={line} />
      <rect x={200} y={PY + 18} width={1100} height={120} fill="rgba(0,0,0,0.12)" />
      {/* the panel with the airspeed screen and the three PUSHER lamps */}
      <path d="M 330 700 L 560 680 L 560 880 L 380 900 Z" fill="#0d3b8f" stroke={line} strokeWidth={6} />
      <rect x={385} y={715} width={150} height={92} rx={6} fill="#04122e" stroke={pushing || mode === "fight" ? RED : AMBER} strokeWidth={5} />
      <text x={460} y={781} textAnchor="middle" fontFamily={ANTON} fontSize={62} fill={pushing ? RED : AMBER}>{countText(speed, 1)}</text>
      <text x={470} y={860} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={46} fill={INK}>KT</text>
      {/* the seat and the captain, side-on */}
      <path d="M 860 1090 L 860 900 Q 860 860 900 860 L 960 860 L 960 640 Q 960 600 1000 600 L 1030 600 Q 1060 600 1060 640 L 1060 1090 Z" fill="rgba(255,255,255,0.14)" stroke={line} strokeWidth={6} />
      <g transform={`translate(${shake} 0)`}>
        <ellipse cx={905} cy={600} rx={62} ry={72} fill="#2d64c8" stroke={line} strokeWidth={6} />
        <path d="M 850 590 Q 905 500 960 590" stroke={line} strokeWidth={12} fill="none" />
        <rect x={845} y={580} width={24} height={44} rx={8} fill={line} />
        <path d="M 900 680 Q 840 700 840 860 L 960 860 L 960 700 Q 940 680 900 680 Z" fill="#2d64c8" stroke={line} strokeWidth={6} />
        <path d="M 840 860 L 700 880 L 700 1080" stroke="#2d64c8" strokeWidth={56} fill="none" strokeLinecap="round" />
        <path d="M 840 860 L 700 880 L 700 1080" stroke={line} strokeWidth={4} fill="none" />
        {/* the arm to the yoke */}
        <path d={`M 880 730 Q ${(880 + yokeX) / 2 + 30} ${(730 + yokeY) / 2 + 60} ${yokeX + 26} ${yokeY + 8}`} stroke="#2d64c8" strokeWidth={40} fill="none" strokeLinecap="round" />
        <path d={`M 880 730 Q ${(880 + yokeX) / 2 + 30} ${(730 + yokeY) / 2 + 60} ${yokeX + 26} ${yokeY + 8}`} stroke={line} strokeWidth={4} fill="none" />
        <circle cx={yokeX + 26} cy={yokeY + 8} r={24} fill="#f2d2b6" stroke={line} strokeWidth={4} />
      </g>
      {/* the control column and its yoke */}
      <line x1={PX} y1={PY} x2={yokeX} y2={yokeY} stroke={line} strokeWidth={30} strokeLinecap="round" />
      <line x1={PX} y1={PY} x2={yokeX} y2={yokeY} stroke="#0f3a8a" strokeWidth={16} strokeLinecap="round" />
      <path d={`M ${yokeX - 10} ${yokeY - 60} L ${yokeX + 10} ${yokeY + 60}`} stroke={line} strokeWidth={22} strokeLinecap="round" />
      <circle cx={PX} cy={PY} r={20} fill={line} />
      {/* the shaker motor on the column */}
      <rect x={PX + Math.sin(a) * 170 - 28} y={PY - Math.cos(a) * 170 - 22} width={56} height={44} rx={8} fill={AMBER} stroke={line} strokeWidth={4} transform={`rotate(${ang} ${PX + Math.sin(a) * 170} ${PY - Math.cos(a) * 170})`} />
      {/* the stick pusher's actuator under the floor, its rod to the column's lower arm */}
      <line x1={PX} y1={PY} x2={rodEnd.x} y2={rodEnd.y} stroke={line} strokeWidth={18} strokeLinecap="round" />
      <rect x={640} y={PY + 36} width={260} height={64} rx={14} fill={strain > 0 ? (mode === "fight" ? `rgba(255,59,48,${0.5 + 0.4 * strain})` : `rgba(255,165,49,${0.4 + 0.5 * strain})`) : "rgba(255,255,255,0.18)"} stroke={line} strokeWidth={6} />
      <line x1={640} y1={PY + 68} x2={rodEnd.x + 4} y2={rodEnd.y + 2} stroke={line} strokeWidth={12} />
      <TypeText x={770} y={PY + 150} t={t} at={mode === "hook" ? e("plane") : mode === "loop" ? e("Machine") : e("against")} text="STICK PUSHER" size={44} anchor="middle" color={mode === "fight" ? RED : AMBER} />
      {/* the three PUSHER lamps over the glareshield */}
      {[0, 1, 2].map((i) => (
        <g key={`p${i}`}>
          <rect x={560 + i * 100} y={445} width={86} height={64} rx={10} fill={i < lit ? GREEN : "rgba(255,255,255,0.12)"} stroke={line} strokeWidth={4} />
        </g>
      ))}
      <TypeText x={560} y={425} t={t} at={-30} text="PUSHER LAMPS" size={44} color={ICE} />
      {/* the trained push and the pull against it */}
      {(mode === "hook" ? t >= e("down") : pushing) && <ArrowSvg x1={yokeX + 140} y1={yokeY - 110} x2={yokeX - 60} y2={yokeY - 110} k={ramp(t, mode === "hook" ? e("down") : pushes[Math.max(0, lit - 1)]!, 8)} color={GREEN} w={16} />}
      {mode === "fight" && pulls.some((x) => t >= x && t < x + 14) && <ArrowSvg x1={yokeX - 40} y1={yokeY + 120} x2={yokeX + 200} y2={yokeY + 120} k={1} color={RED} w={18} />}
      {mode === "fight" && <rect x={-400} y={-400} width={2000} height={2800} fill={`rgba(255,59,48,${0.16 * Math.max(0, ...pulls.map((x) => 1 - Math.abs(t - x) / 6))})`} />}
    </Grid>
  );
};
export default Cutaway;
