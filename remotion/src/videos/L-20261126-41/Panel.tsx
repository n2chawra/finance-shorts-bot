// Panel (flat): the captain's primary flight display, drawn big on the night sheet: the airspeed tape with the
// red-and-black low-speed band (where the stick shaker fires), the cyan speed bug, the speed box, the attitude
// ball, the autopilot light, the flight clock and the recorder trace. Modes (params.mode): band, brief, gap, cue,
// nose, shaker, clock. Every figure comes from params.fig; the tape's tick marks carry no numbers.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { MissionClock } from "../../disaster/index";
import { AMBER, ANTON, ChapterCard, clamp, DIM, figOf, FlatTag, ICE, INK, MONO, moments, numOf, ramp, RED, Sheet, Stamp, TypeText } from "./ui";

type Params = { mode?: string; chapter?: string };
const CY = 520, TX = 360, TW = 260, TOP = 170, BOT = 870, PX = 7; // tape: x, width, top, bottom, pixels a knot

const Panel: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "band";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  // the tape's scroll (in knots, relative), the band's top (knots below the centre), the bug's place
  let scroll = t * 0.05;
  let bandTop = -46, bugAt = 1e9, shake = 0, redDigits = false;
  const speed = figOf(p, "speed");
  if (mode === "band") { bandTop = -46 + numOf(p, "up") * ramp(t, e("higher"), 22); }
  if (mode === "brief") { bandTop = -31; bugAt = -24 + 4 * ramp(t, e("landing"), 16); }
  if (mode === "gap") { bandTop = -20; bugAt = -20 - numOf(p, "gap"); const s = ramp(t, e("slow"), Math.max(20, end - e("slow")), ); bugAt += 28 * s; bandTop += 28 * s; scroll = -t * 0.4; }
  if (mode === "cue") { const k = ramp(t, e("band"), Math.max(30, end - e("band") - 10)); bandTop = -46 + 44 * k; scroll = -t * 0.5; }
  if (mode === "nose") { bandTop = -3; scroll = -t * 0.2; redDigits = t >= e("red"); }
  if (mode === "shaker") { bandTop = 4; scroll = -t * 0.15; redDigits = true; shake = t >= e("shaker") ? Math.sin(t * 3.1) * 7 : 0; }
  if (mode === "clock") { bandTop = 8; scroll = -t * 0.6; redDigits = true; }
  if (mode === "alert") { bandTop = -24; scroll = t * 0.05; }
  const bandY = CY - bandTop * PX;
  const pitchDeg = mode === "nose" ? 3 + 6 * ramp(t, e("nose"), 40) : mode === "shaker" ? 9 : mode === "clock" ? 6 - 30 * ramp(t, e("shaker"), end * 0.6) : 2;
  const bankDeg = mode === "clock" ? 60 * Math.sin(ramp(t, e("shaker"), end * 0.5) * Math.PI * 1.5) : 0;
  const apOn = mode === "shaker" ? t < e("autopilot") : mode === "clock" ? false : true;
  // the camera
  const zIn = mode === "band" ? ramp(t, e("band"), 20) : mode === "brief" ? ramp(t, e("briefed"), 20) : mode === "gap" ? ramp(t, e("above"), 20) : mode === "cue" ? ramp(t, e("band"), 20)
    : mode === "nose" ? ramp(t, e("red"), 20) : mode === "alert" ? ramp(t, e("amber"), 20) : mode === "shaker" ? ramp(t, e("shaker"), 16) : ramp(t, e("end"), 20);
  const zOut = mode === "alert" ? ramp(t, e("hear"), 20) : mode === "brief" ? ramp(t, e("ice"), 20) : mode === "nose" ? ramp(t, e("Neither"), 20) : mode === "shaker" ? ramp(t, e("horn"), 20) : mode === "clock" ? ramp(t, e("minute"), 20) : 0;
  const zoom = 1.02 + 0.22 * zIn - 0.18 * zOut + 0.02 * (t / end);
  const cx = mode === "shaker" || mode === "clock" || mode === "alert" ? 960 : 960 - 110 * zIn * (1 - zOut), cy = 540;
  // the flight clock (seconds of the day, from the figures)
  const hh = numOf(p, "hh"), mm = numOf(p, "mm"), ss = numOf(p, "ss"), se = numOf(p, "end");
  const base = hh * 3600 + mm * 60;
  const clockSec = mode === "clock" ? base + ss + (se - ss) * ramp(t, e("shaker"), Math.max(10, e("end") - e("shaker")), ) : base + ss;
  const flat = mode === "clock" && t >= e("end");
  const fade = mode === "clock" ? 0.75 * ramp(t, e("recording"), 16) : 0;
  return (
    <Sheet t={t} zoom={zoom} cx={cx} cy={cy} html={<>
      <FlatTag t={t} tag="as reported" at={0} sub="the captain's display, redrawn from the NTSB report" />
      {P.chapter && <ChapterCard t={t} text={P.chapter} />}
    </>}>
      <g transform={`translate(${shake} ${shake * 0.4})`}>
        {/* the screen in its bezel */}
        <rect x={250} y={110} width={1420} height={820} rx={34} fill="#0b0f14" stroke="#59636d" strokeWidth={10} />
        <rect x={276} y={136} width={1368} height={768} rx={18} fill="#05080c" />
        {/* the attitude ball */}
        <defs><clipPath id="cg-adi"><rect x={700} y={180} width={560} height={680} rx={30} /></clipPath></defs>
        <g clipPath="url(#cg-adi)">
          <g transform={`rotate(${-bankDeg} 980 ${CY}) translate(0 ${pitchDeg * 14})`}>
            <rect x={300} y={-400} width={1360} height={CY + 400} fill="#2f79c4" />
            <rect x={300} y={CY} width={1360} height={900} fill="#7a4d2a" />
            <line x1={300} y1={CY} x2={1660} y2={CY} stroke="#ffffff" strokeWidth={5} />
            {[-20, -10, 10, 20].map((d) => <line key={d} x1={980 - (Math.abs(d) === 10 ? 80 : 130)} y1={CY - d * 14} x2={980 + (Math.abs(d) === 10 ? 80 : 130)} y2={CY - d * 14} stroke="#ffffff" strokeWidth={4} />)}
          </g>
          <path d={`M 840 ${CY} L 930 ${CY} L 950 ${CY + 24} M 1120 ${CY} L 1030 ${CY} L 1010 ${CY + 24}`} stroke="#ffd400" strokeWidth={12} fill="none" strokeLinecap="round" />
          <rect x={972} y={CY - 8} width={16} height={16} fill="#ffd400" />
          {(mode === "nose") && <g opacity={ramp(t, e("nose"), 10)}><path d={`M 1180 ${CY - pitchDeg * 14 + 10} l 30 -40 l 30 40 z`} fill={AMBER} /><TypeText x={1150} y={CY - pitchDeg * 14 + 60} t={t} at={e("nose")} text="NOSE UP" size={34} color={AMBER} /></g>}
        </g>
        {/* the airspeed tape */}
        <rect x={TX} y={TOP} width={TW} height={BOT - TOP} fill="#1a2027" stroke="#8b96a1" strokeWidth={4} />
        <defs><clipPath id="cg-tape"><rect x={TX} y={TOP} width={TW} height={BOT - TOP} /></clipPath></defs>
        <g clipPath="url(#cg-tape)">
          {Array.from({ length: 40 }, (_, i) => {
            const k = i - 20;
            const y = CY + (k * 5 + (scroll % 5)) * PX;
            return <line key={i} x1={TX + TW - (k % 2 === 0 ? 70 : 40)} y1={y} x2={TX + TW} y2={y} stroke="#e8edf2" strokeWidth={k % 2 === 0 ? 5 : 3} />;
          })}
          {/* the low-speed band: red and black bars from the band's top down */}
          {Array.from({ length: 30 }, (_, i) => <rect key={i} x={TX + TW - 34} y={bandY + i * 28} width={30} height={28} fill={i % 2 ? "#0b0b0b" : RED} />)}
          <rect x={TX + TW - 34} y={bandY} width={30} height={BOT - bandY} fill="none" stroke={RED} strokeWidth={3} />
          {/* the speed bug */}
          {bugAt < 1e8 && <path d={`M ${TX + TW} ${CY - bugAt * PX} l 36 -22 l 0 44 z`} fill="#38d7ff" />}
        </g>
        {/* the speed box */}
        <path d={`M ${TX - 20} ${CY - 54} L ${TX + 170} ${CY - 54} L ${TX + 200} ${CY} L ${TX + 170} ${CY + 54} L ${TX - 20} ${CY + 54} Z`} fill="#05080c" stroke={redDigits ? RED : "#e8edf2"} strokeWidth={5} />
        {speed && t >= (mode === "cue" ? e("falling") : mode === "shaker" ? e("knots") - 10 : 0) && (
          <text x={TX + 85} y={CY + 30} textAnchor="middle" fontFamily={ANTON} fontSize={84} fill={redDigits ? RED : INK}>{speed}</text>
        )}
        <text x={TX + TW / 2} y={TOP - 18} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={DIM}>AIRSPEED · KT</text>
        {/* the autopilot light and the stall flag */}
        <g transform="translate(1300 200)">
          <rect x={0} y={0} width={150} height={70} rx={8} fill={apOn ? "#0f3d22" : "#1c1c1c"} stroke={apOn ? "#5fd38a" : "#555"} strokeWidth={4} />
          <text x={75} y={48} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill={apOn ? "#5fd38a" : "#555"}>AP</text>
        </g>
        {(mode === "shaker" || mode === "clock") && t >= e("shaker") && (Math.floor(t / 5) % 2 === 0 || mode === "clock") && (
          <g><rect x={1290} y={300} width={300} height={96} rx={8} fill={RED} /><text x={1440} y={370} textAnchor="middle" fontFamily={ANTON} fontSize={72} fill="#ffffff">STALL</text></g>
        )}
        {mode === "shaker" && t >= e("horn") && <g opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 0.4))}><path d="M 1310 470 l 40 0 l 50 -40 l 0 120 l -50 -40 l -40 0 z" fill={AMBER} /><TypeText x={1420} y={515} t={t} at={e("horn")} text="AP OFF" size={40} color={AMBER} /></g>}
        {/* the flight clock */}
        {(mode === "shaker" || mode === "clock") && <MissionClock x={1290} y={mode === "clock" ? 420 : 590} size={380} seconds={clockSec} label="EST · CVR" t={t} />}
      </g>
      {/* mode overlays */}
      {mode === "band" && <g>
        <g opacity={ramp(t, e("band"), 10)}><line x1={TX + TW + 10} y1={bandY + 20} x2={TX + TW + 120} y2={bandY - 60} stroke={RED} strokeWidth={4} /><TypeText x={TX + TW + 130} y={bandY - 60} t={t} at={e("band")} text="SHAKER FIRES HERE" size={36} color={RED} /></g>
        <g opacity={ramp(t, e("switch"), 10)}><rect x={1260} y={300} width={380} height={70} rx={8} fill="#2b2410" stroke={AMBER} strokeWidth={4} /><text x={1450} y={348} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={AMBER}>REF SPEEDS: INCR</text></g>
        {t >= e("higher") && <g opacity={ramp(t, e("higher"), 10)}><path d={`M ${TX - 60} ${CY + 46 * PX} L ${TX - 60} ${bandY}`} stroke={AMBER} strokeWidth={6} /><text x={TX - 80} y={bandY + 60} textAnchor="end" fontFamily={ANTON} fontSize={64} fill={AMBER}>{`+${countText(figOf(p, "up"), ramp(t, e("higher"), 20))}`}</text></g>}
      </g>}
      {mode === "brief" && <g>
        <g opacity={ramp(t, e("on"), 10)}><rect x={1260} y={300} width={380} height={70} rx={8} fill="#2b2410" stroke={AMBER} strokeWidth={4} /><text x={1450} y={348} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={AMBER}>REF SPEEDS: INCR</text></g>
        {t >= e("briefed") && <g transform={`translate(1280 ${430 + 30 * (1 - ramp(t, e("briefed"), 12))})`} opacity={ramp(t, e("briefed"), 12)}>
          <rect x={0} y={0} width={340} height={230} rx={10} fill="#f4f1e8" stroke="#111" strokeWidth={4} />
          <text x={22} y={56} fontFamily={MONO} fontWeight={700} fontSize={32} fill="#333">LANDING SPEED</text>
          <text x={22} y={150} fontFamily={ANTON} fontSize={96} fill="#111">{`${figOf(p, "vref")} KT`}</text>
        </g>}
        {t >= e("wing") && <g transform="translate(1520 640)" opacity={ramp(t, e("wing"), 8)}><path d="M 0 0 L 90 0 Q 80 -24 30 -22 Z" fill="none" stroke={ICE} strokeWidth={6} /></g>}
        {t >= e("plan") && t < e("landing") + 10 && <text x={TX + TW + 70} y={CY + 200} fontFamily={ANTON} fontSize={90} fill={AMBER} opacity={Math.floor(t / 6) % 2 ? 1 : 0.4}>?</text>}
        <Stamp x={1450} y={760} t={t} at={e("ice")} text="NO ICE" size={58} />
      </g>}
      {mode === "gap" && t >= e("above") && <g opacity={ramp(t, e("above"), 10) * (1 - ramp(t, e("through"), 10) * 0.5)}>
        <path d={`M ${TX + TW + 60} ${CY - bugAt * PX} L ${TX + TW + 60} ${bandY}`} stroke={AMBER} strokeWidth={6} />
        <text x={TX + TW + 84} y={(bandY + CY - bugAt * PX) / 2 + 24} fontFamily={ANTON} fontSize={72} fill={AMBER}>{`+${countText(figOf(p, "gap"), ramp(t, e("above"), 18))} KT`}</text>
        <TypeText x={TX + TW + 84} y={(bandY + CY - bugAt * PX) / 2 + 74} t={t} at={e("above") + 6} text="WARNING ABOVE THE BUG" size={32} color={INK} />
      </g>}
      {mode === "gap" && <Stamp x={1440} y={760} t={t} at={e("through")} text="INTO THE WARNING" size={50} />}
      {mode === "cue" && t >= e("seconds") - 6 && <g transform="translate(1290 430)" opacity={ramp(t, e("seconds") - 6, 10)}>
        <rect x={0} y={0} width={330} height={170} rx={10} fill="#0b0f14" stroke={AMBER} strokeWidth={5} />
        <text x={20} y={46} fontFamily={MONO} fontWeight={700} fontSize={30} fill={AMBER}>BAND IN VIEW</text>
        <text x={20} y={140} fontFamily={ANTON} fontSize={86} fill={INK}>{`${countText(figOf(p, "secs"), ramp(t, e("seconds") - 6, 24))} S`}</text>
      </g>}
      {mode === "cue" && <g opacity={ramp(t, e("band"), 10)}><ArrowUp x={TX + TW + 70} y={bandY + 80} k={ramp(t, e("band"), 10)} /></g>}
      {mode === "nose" && t >= e("Neither") && <g opacity={ramp(t, e("Neither"), 12) * (1 - 0.6 * ramp(t, e("Neither") + 30, 20))}>
        {[0, 1].map((i) => <g key={i} transform={`translate(${1320 + i * 170} 620)`}><path d="M 0 0 h 130 a 20 20 0 0 1 20 20 v 60 a 20 20 0 0 1 -20 20 h -80 l -30 30 l 0 -30 h -20 a 20 20 0 0 1 -20 -20 v -60 a 20 20 0 0 1 20 -20 z" fill="none" stroke={DIM} strokeWidth={5} /></g>)}
      </g>}
      {mode === "clock" && <g>
        <path d={Array.from({ length: 120 }, (_, i) => { const x = 300 + i * 11; const live = !flat || x < 300 + 1320 * clamp((e("end") - 0) / Math.max(1, t)); const a = live ? Math.sin(i * 1.7 + t * 0.6) * 26 * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.37))) : 0; return `${i ? "L" : "M"} ${x} ${960 + a}`; }).join(" ")} stroke={flat ? RED : ICE} strokeWidth={4} fill="none" opacity={0.9} />
        {t >= e("minute") && <g opacity={ramp(t, e("minute"), 10)}>
          <path d="M 1290 860 L 1290 830 L 1630 830 L 1630 860" stroke={AMBER} strokeWidth={6} fill="none" />
          <TypeText x={1460} y={810} t={t} at={e("minute")} text="UNDER HALF A MINUTE" size={34} color={AMBER} anchor="middle" />
        </g>}
      </g>}
      {mode === "alert" && <g>
        {t >= e("amber") && <rect x={TX + TW - 34} y={bandY - 140 * ramp(t, e("amber"), 16)} width={30} height={140 * ramp(t, e("amber"), 16)} fill={AMBER} />}
        <g opacity={ramp(t, e("harder"), 10)}><TypeText x={TX + TW + 60} y={bandY + 50} t={t} at={e("harder")} text="RED: SHAKER" size={34} color={RED} /></g>
        {t >= e("amber") && <TypeText x={TX + TW + 60} y={bandY - 70} t={t} at={e("amber")} text="AMBER: SLOW DOWN WARNING" size={34} color={AMBER} />}
        {t >= e("alarm") && <g transform="translate(1340 560)" opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 0.4))}><path d="M 0 0 l 40 0 l 50 -40 l 0 120 l -50 -40 l -40 0 z" fill={AMBER} />{[0, 1, 2].map((i) => t >= e("hear") && <path key={i} d={`M ${110 + i * 30} -30 q 30 50 0 100`} stroke={AMBER} strokeWidth={6} fill="none" opacity={ramp(t, e("hear") + i * 5, 8)} />)}<TypeText x={0} y={130} t={t} at={e("alarm")} text="LOW SPEED ALARM" size={34} color={AMBER} /></g>}
      </g>}
      {fade > 0 && <rect x={-200} y={-200} width={2400} height={1500} fill="#000" opacity={fade * (mode === "clock" && t >= e("minute") ? 0.5 : 1)} />}
    </Sheet>
  );
};

const ArrowUp: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y - 40 * k})`}><path d="M 0 0 l 0 -80 m -26 26 l 26 -26 l 26 26" stroke={RED} strokeWidth={10} fill="none" strokeLinecap="round" /></g>
);

export default Panel;
