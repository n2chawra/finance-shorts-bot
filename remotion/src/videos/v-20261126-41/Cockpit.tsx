// Cockpit (flat, portrait): the airliner's flight deck at night seen from behind the two pilots (roles only, never
// names). The windshield onto snow streaking past and the horizon (it drops when the nose rises), the glareshield
// with the two STALL lights, the captain's flight screen with the airspeed box (the beat's figure) and the attitude
// ball, the two control columns with their yokes (they rattle when the stick shaker fires; the captain's comes back
// toward us on the pull). Modes (params.mode): hook, pull, loop. Figures come only from params.fig.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { rnd } from "../../three/index";
import { HonestyTag } from "../../disaster/index";
import { AbsoluteFill } from "remotion";
import { AMBER, ANTON, ArrowSvg, Chip, figOf, GREEN, H, ICE, INK, MONO, moments, ramp, RED, StampHtml, W } from "./ui";

type Params = { mode?: string };

const Yoke: React.FC<{ x: number; y: number; jx: number; rot: number; back: number }> = ({ x, y, jx, rot, back }) => {
  const s = 1 + 0.18 * back, yy = y + 120 * back;
  return (
    <g transform={`translate(${x + jx} ${yy}) rotate(${rot}) scale(${s})`}>
      <rect x={-34} y={30} width={68} height={700} rx={14} fill="#2b323a" stroke="#0d1115" strokeWidth={6} />
      <path d="M -150 -40 L -150 40 Q -150 70 -110 70 L 110 70 Q 150 70 150 40 L 150 -40 L 104 -40 L 104 22 L -104 22 L -104 -40 Z" fill="#3a424b" stroke="#0d1115" strokeWidth={7} />
      <rect x={-60} y={4} width={120} height={50} rx={10} fill="#1d2329" />
      <circle cx={-127} cy={-30} r={10} fill="#c43a2e" />
      <rect x={-20} y={14} width={40} height={14} rx={4} fill="#5a646e" />
    </g>
  );
};

const Cockpit: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "hook";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => (ev[n] !== undefined ? ev[n]! : 1e9);
  const speed = figOf(p, "speed");

  // when the stick shaker rattles the columns
  const shakeFrom = mode === "hook" ? e("shook") : mode === "pull" ? -100 : e("shook");
  const shaking = t >= shakeFrom;
  const jit = shaking ? Math.sin(t * 2.9) * 7 + Math.sin(t * 5.3) * 3 : 0;
  const jrot = shaking ? Math.sin(t * 3.7) * 1.6 : 0;
  const back = mode === "pull" ? ramp(t, e("pulled"), 7) : 0;
  // the nose rises after the pull: the horizon drops out of the windshield
  const noseUp = mode === "pull" ? 230 * ramp(t, e("back"), 26) : 0;
  const bank = mode === "pull" ? -9 * ramp(t, e("back"), 30) : 0;
  const stallOn = shaking && Math.floor(t / 5) % 2 === 0;
  const red = shaking;
  // the camera: wide/medium/close on the words, a slow drift in between (zoom ≤ 1.3)
  const keys: [number, number, number, number][] = mode === "hook"
    ? [[0, 1.08, 540, 900], [e("column"), 1.12, 520, 1040], [e("shook"), 1.28, 460, 1000], [e("knots"), 1.24, 470, 860]]
    : mode === "pull"
      ? [[0, 1.24, 460, 1080], [e("captain"), 1.28, 470, 1110], [e("back"), 1.0, 540, 960]]
      : [[0, 1.0, 540, 960], [e("story"), 1.1, 520, 900], [e("started"), 1.08, 540, 900]];
  let zoom = keys[0]![1], cx = keys[0]![2], cy = keys[0]![3];
  for (let i = 1; i < keys.length; i++) {
    const k = ramp(t, keys[i]![0], 16);
    zoom += (keys[i]![1] - zoom) * k; cx += (keys[i]![2] - cx) * k; cy += (keys[i]![3] - cy) * k;
  }
  zoom += 0.012 * Math.sin(t / 40);
  const horizon = 470 + noseUp;
  const lightsK = mode === "hook" ? 0.5 : mode === "loop" ? 1 : 0.4;

  return (
    <AbsoluteFill style={{ background: "#0a0e13" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="cp-panes"><path d="M 80 230 L 528 186 L 528 650 L 52 668 Z M 552 186 L 1000 230 L 1028 668 L 552 650 Z" /></clipPath>
          <clipPath id="cp-pfd"><rect x={300} y={800} width={260} height={300} rx={10} /></clipPath>
          <linearGradient id="cp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2836" /><stop offset="1" stopColor="#3d4b58" /></linearGradient>
        </defs>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${Math.min(1.3, zoom)}) translate(${-cx} ${-cy})`}>
          {/* the windshield: night cloud, the ground's lights below the horizon, snow streaking past */}
          <g clipPath="url(#cp-panes)">
            <rect x={0} y={100} width={1080} height={700} fill="url(#cp-sky)" />
            <g transform={`rotate(${bank} 540 ${horizon})`}>
              <rect x={-300} y={horizon} width={1700} height={900} fill="#151b22" />
              {Array.from({ length: 70 }, (_, i) => {
                const gx = -200 + rnd("gx", i) * 1500, gy = horizon + 14 + rnd("gy", i) ** 2 * 260 + ((t * 0.4 + i * 7) % 40);
                return <circle key={i} cx={gx} cy={gy} r={2 + rnd("gr", i) * 3} fill={rnd("gc", i) > 0.7 ? "#fff2cf" : "#ffc46b"} opacity={0.55} />;
              })}
              {/* the runway's approach lights ahead, Buffalo */}
              {lightsK > 0 && Array.from({ length: 9 }, (_, i) => [-1, 1].map((sd) => (
                <circle key={`${i}${sd}`} cx={540 + sd * (14 + i * 22)} cy={horizon + 16 + i * 14} r={3 + i * 0.6} fill="#fff6dc" opacity={lightsK} />
              )))}
              {lightsK > 0 && Array.from({ length: 6 }, (_, i) => <circle key={`a${i}`} cx={540} cy={horizon + 30 + i * 22} r={4} fill="#ffffff" opacity={lightsK * (Math.floor(t / 3) % 6 === i ? 1 : 0.25)} />)}
            </g>
            <rect x={0} y={100} width={1080} height={700} fill="rgba(160,175,190,0.12)" />
            {Array.from({ length: 90 }, (_, i) => {
              const a = rnd("sa", i) * Math.PI * 2, life = ((t * (0.035 + 0.02 * rnd("sv", i)) + rnd("sl", i)) % 1);
              const r0 = 30 + life * 700, r1 = r0 + 18 + life * 60;
              return <line key={i} x1={540 + Math.cos(a) * r0} y1={420 + Math.sin(a) * r0 * 0.6} x2={540 + Math.cos(a) * r1} y2={420 + Math.sin(a) * r1 * 0.6} stroke="#f2f6fa" strokeWidth={2 + life * 4} strokeLinecap="round" opacity={0.25 + 0.6 * life} />;
            })}
          </g>
          <path d="M 80 230 L 528 186 L 528 650 L 52 668 Z M 552 186 L 1000 230 L 1028 668 L 552 650 Z" fill="none" stroke="#1b2128" strokeWidth={26} strokeLinejoin="round" />
          <rect x={-200} y={-200} width={1480} height={400} fill="#0d1116" />
          <path d="M -200 180 L 80 230 L 52 668 L -200 700 Z M 1280 180 L 1000 230 L 1028 668 L 1280 700 Z" fill="#11161c" />
          {/* the glareshield and the two STALL lights */}
          <path d="M -200 660 Q 540 600 1280 660 L 1280 780 L -200 780 Z" fill="#1c2229" stroke="#0a0d11" strokeWidth={6} />
          {[150, 640].map((x, i) => (
            <g key={i}>
              <rect x={x} y={680} width={230} height={76} rx={10} fill={stallOn ? RED : "#3a1714"} stroke="#0a0d11" strokeWidth={5} />
              <text x={x + 115} y={735} textAnchor="middle" fontFamily={ANTON} fontSize={50} letterSpacing={4} fill={stallOn ? "#ffffff" : "#6d3a35"}>STALL</text>
            </g>
          ))}
          {/* the instrument panel */}
          <rect x={-200} y={780} width={1480} height={380} fill="#161b21" />
          <rect x={90} y={796} width={480} height={312} rx={12} fill="#05080b" stroke="#2c343c" strokeWidth={6} />
          {/* the attitude ball (sky over ground, moved by the nose and the bank) */}
          <g clipPath="url(#cp-pfd)">
            <g transform={`rotate(${-bank * 2} 430 950)`}>
              <rect x={150} y={600 + noseUp * 0.6} width={560} height={350} fill="#2f7fd0" />
              <rect x={150} y={950 + noseUp * 0.6} width={560} height={400} fill="#8a5a2b" />
              <line x1={150} y1={950 + noseUp * 0.6} x2={710} y2={950 + noseUp * 0.6} stroke="#ffffff" strokeWidth={4} />
            </g>
            <path d="M 360 950 L 410 950 L 430 970 L 450 950 L 500 950" stroke="#ffd400" strokeWidth={9} fill="none" />
          </g>
          {/* the airspeed tape: the red-and-black low-speed band climbing toward the box */}
          <rect x={104} y={810} width={180} height={284} fill="#2a2f35" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={240} y={826 + i * 36 + ((t * (red ? 1.6 : 0.4)) % 36)} width={40} height={5} fill="#d6dde3" />)}
          {Array.from({ length: 6 }, (_, i) => <rect key={`b${i}`} x={262} y={1094 - (red ? 150 : 70) - i * 24} width={18} height={12} fill={i % 2 ? "#111" : RED} />)}
          <rect x={98} y={906} width={176} height={98} rx={6} fill="#000" stroke={red ? RED : AMBER} strokeWidth={6} />
          <text x={186} y={980} textAnchor="middle" fontFamily={ANTON} fontSize={72} fill={red ? RED : AMBER}>{countText(speed, 1)}</text>
          <text x={186} y={1086} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={46} fill={INK}>KNOTS</text>
          {/* the other screens (decor) */}
          <rect x={600} y={796} width={380} height={312} rx={12} fill="#05080b" stroke="#2c343c" strokeWidth={6} />
          {[0, 1].map((i) => <g key={i}><circle cx={700 + i * 180} cy={900} r={58} fill="none" stroke="#3d4a56" strokeWidth={8} /><path d={`M ${700 + i * 180} 900 l ${44 * Math.cos(-0.6 + 0.05 * Math.sin(t / 9 + i))} ${44 * Math.sin(-0.6 + 0.05 * Math.sin(t / 9 + i))}`} stroke={GREEN} strokeWidth={8} /></g>)}
          <rect x={640} y={1000} width={300} height={70} rx={6} fill="#0d1a12" />
          {/* the two control columns and yokes */}
          <Yoke x={330} y={1230} jx={jit} rot={jrot} back={back} />
          <Yoke x={830} y={1230} jx={-jit} rot={-jrot} back={0} />
          {/* the pilots, from behind: headset, shoulders, an arm to the yoke */}
          {[{ x: 120, s: 1 }, { x: 1010, s: -1 }].map((pl, i) => (
            <g key={i} transform={`translate(${pl.x} ${1330 + (i === 0 ? 40 * back : 0)}) scale(${pl.s} 1)`}>
              <path d="M -170 420 Q -170 120 0 110 Q 170 120 170 420 Z" fill="#e9edf1" stroke="#0d1115" strokeWidth={6} />
              <rect x={-26} y={70} width={52} height={50} fill="#c9a183" />
              <ellipse cx={0} cy={10} rx={78} ry={90} fill="#3b2f27" stroke="#0d1115" strokeWidth={6} />
              <path d="M -86 0 Q 0 -110 86 0" stroke="#1a1f25" strokeWidth={16} fill="none" />
              <rect x={-100} y={-14} width={30} height={56} rx={12} fill="#1a1f25" />
              <rect x={70} y={-14} width={30} height={56} rx={12} fill="#1a1f25" />
              <path d={`M 130 170 Q 190 ${i === 0 ? 40 + 120 * back : 40} 200 ${i === 0 ? -80 + 120 * back : -80}`} stroke="#e9edf1" strokeWidth={50} strokeLinecap="round" fill="none" />
              <circle cx={200} cy={i === 0 ? -86 + 120 * back : -86} r={30} fill="#c9a183" />
            </g>
          ))}
          {/* the trained answer and what the hands did */}
          {mode === "pull" && <ArrowSvg x1={330} y1={1180} x2={330} y2={1000} k={ramp(t, 0, 10)} color={GREEN} w={18} />}
          {mode === "pull" && t >= e("pulled") && <path d="M 270 1020 L 390 1160 M 390 1020 L 270 1160" stroke={RED} strokeWidth={16} strokeLinecap="round" opacity={ramp(t, e("pulled"), 5)} />}
        </g>
      </svg>
      {/* chips over the frame */}
      {mode === "hook" && <Chip t={t} at={-60} text={`FEB ${figOf(p, "day")}, ${figOf(p, "year")} · NEAR BUFFALO`} top={300} size={46} />}
      {mode === "hook" && <Chip t={t} at={e("Colgan")} text="COLGAN AIR · FLIGHT DECK" top={385} size={46} color={AMBER} border={AMBER} />}
      {mode === "hook" && t >= e("knots") && <StampHtml t={t} at={e("knots")} text="STICK SHAKER" x={460} y={500} size={74} />}
      {mode === "pull" && <Chip t={t} at={2} text="TRAINED: PUSH" top={1010} left={520} size={48} color={GREEN} border={GREEN} />}
      {mode === "pull" && t >= e("pulled") && <div style={{ position: "absolute", left: 512, top: 1043, width: 400, height: 8, background: RED, opacity: ramp(t, e("pulled"), 5), transform: "rotate(-4deg)" }} />}
      {mode === "pull" && t >= e("pulled") && <StampHtml t={t} at={e("pulled")} text="PULLED" x={540} y={1150} size={90} />}
      {mode === "pull" && t >= e("back") && <Chip t={t} at={e("back")} text="NOSE UP" top={560} left={120} size={52} color={RED} border={RED} />}
      {mode === "pull" && <Chip t={t} at={e("captain")} text="CAPTAIN'S COLUMN" top={300} size={48} color={AMBER} border={AMBER} />}
      {mode === "loop" && <Chip t={t} at={e("Startle")} text="STARTLE" top={300} size={56} color={AMBER} border={AMBER} />}
      {mode === "loop" && <Chip t={t} at={e("training")} text="OR TRAINING?" top={400} size={56} color={AMBER} border={AMBER} />}
      {mode === "loop" && <Chip t={t} at={e("channel")} text="FULL STORY ON THE CHANNEL" top={500} size={44} />}
      <HonestyTag t={t} tag="reconstruction" at={0} />
      {mode === "pull" && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, background: `rgba(255,59,48,${0.18 * Math.max(0, 1 - Math.abs(t - e("pulled")) / 6)})` }} />}
    </AbsoluteFill>
  );
};
export default Cockpit;
