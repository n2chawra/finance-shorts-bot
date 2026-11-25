// Section (flat, the engineer's cross-section sheet): the drawings that explain Titan. Modes (params.mode):
// map (the sea chart), column / squeeze (the ocean cut to the wreck), psisea / psideep (one square inch at
// the surface and at the wreck), inside (the hull cutaway with the people at normal air), material (carbon
// against steel), modelone / modeltwo (scale models in the test tank), crack / delam / buckle (the hull wall
// magnified), desk (the sign-off form), layers (the five bonded layers), window (its rating against the dive),
// letter (the experts' letter), class (the blank class certificate), lot (the parking lot in winter), world
// (the world standard). Every figure is read from params.fig.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { FlatTag, ANTON, BLUE, ChapterCard, clamp, DrawLine, figOf, INK, MONO, moments, Person, ramp, RED, Sheet, sm, Stamp, TypeText } from "./ui";

type Params = { mode?: string; chapter?: string };
const SURF = 170, BED = 880;            // the ocean cut: surface and seabed lines

/** Titan in side profile, flat: hull, domes, fairing, tail, rails. (x, y) is the hull's centre. */
const SubProfile: React.FC<{ x: number; y: number; s?: number; color?: string; cut?: boolean; stress?: number }> = ({ x, y, s = 1, color = INK, cut = false, stress = 0 }) => {
  const hullC = stress > 0.5 ? RED : stress > 0.1 ? "#f2a33a" : cut ? "#2a2e35" : "#ffffff";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -150 -50 L -260 -20 L -260 20 L -150 50 Z" fill="#ffffff" stroke={color} strokeWidth={5} />
      <rect x={-150} y={-60} width={220} height={120} fill={hullC} stroke={color} strokeWidth={5} />
      <path d="M 70 -60 A 60 60 0 0 1 70 60" fill="#c9cdd2" stroke={color} strokeWidth={5} />
      <path d="M -150 -60 A 30 60 0 0 0 -150 60" fill="#c9cdd2" stroke={color} strokeWidth={5} />
      <circle cx={118} cy={0} r={12} fill="#9fd8ff" stroke={color} strokeWidth={3} />
      <rect x={-200} y={72} width={300} height={10} fill="#e8b21c" stroke={color} strokeWidth={3} />
    </g>
  );
};

/** The ocean cut: water darkening with depth, surface and seabed lines, a depth axis with figure tags only. */
const OceanCut: React.FC<{ t: number; k: number; dark?: number }> = ({ t, k, dark = 0 }) => (
  <g opacity={k}>
    <defs>
      <linearGradient id="tg-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#bfe1f7" />
        <stop offset={String(0.5 - 0.3 * dark)} stopColor="#3b7fc0" />
        <stop offset="1" stopColor="#06182b" />
      </linearGradient>
    </defs>
    <rect x={330} y={SURF} width={1300 * clamp(k * 1.2)} height={BED - SURF} fill="url(#tg-water)" />
    <path d={`M 330 ${SURF} ${Array.from({ length: 27 }, (_, i) => `Q ${355 + i * 50} ${SURF - 10 + Math.sin(t * 0.1 + i) * 3} ${380 + i * 50} ${SURF}`).join(" ")}`} fill="none" stroke={INK} strokeWidth={4} />
    <path d={`M 330 ${BED} L 1630 ${BED} L 1630 ${BED + 40} L 330 ${BED + 40} Z`} fill="#8a7a68" stroke={INK} strokeWidth={4} />
    <line x1={300} y1={SURF} x2={300} y2={BED} stroke={INK} strokeWidth={4} />
    <TypeText x={345} y={SURF - 24} t={t} at={0} text="SURFACE" size={34} />
  </g>
);

/** The wreck on the seabed line, simplified (bow section). */
const WreckIcon: React.FC<{ x: number; k: number }> = ({ x, k }) => (
  <g opacity={k} transform={`translate(${x} ${BED})`}>
    <path d="M -200 0 L -200 -60 L 120 -70 L 200 -10 L 200 0 Z" fill="#5b3420" stroke={INK} strokeWidth={4} />
    <rect x={-150} y={-100} width={70} height={36} fill="#3a2418" stroke={INK} strokeWidth={3} />
    <line x1={60} y1={-70} x2={90} y2={-140} stroke={INK} strokeWidth={6} />
  </g>
);

/** A depth tag on the left axis: a tick at `y` and the figure with its unit. */
const DepthTag: React.FC<{ y: number; t: number; at: number; value: string; label: string; color?: string }> = ({ y, t, at, value, label, color = INK }) => {
  const k = ramp(t, at, 10);
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      <line x1={280} y1={y} x2={1630} y2={y} stroke={color} strokeWidth={4} strokeDasharray="16 12" />
      <rect x={1270} y={y - 70} width={350} height={124} rx={8} fill="rgba(255,255,255,0.9)" stroke={color} strokeWidth={3} />
      <text x={1600} y={y - 12} textAnchor="end" fontFamily={ANTON} fontSize={58} fill={color}>{countText(value, ramp(t, at, 18))}</text>
      <text x={1600} y={y + 36} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={30} fill={color}>{label}</text>
    </g>
  );
};

/** Pressure arrows pressing in on a box (x, y, w, h). */
const Squeeze: React.FC<{ x: number; y: number; w: number; h: number; k: number; t: number; color?: string }> = ({ x, y, w, h, k, t, color = BLUE }) => {
  if (k <= 0) return null;
  const L = 40 + 60 * k, pulse = 6 * Math.sin(t * 0.3);
  const arr: [number, number, number][] = [];
  for (let i = 0; i < 4; i++) { arr.push([x + (w * (i + 0.5)) / 4, y - L - 20 + pulse, 90], [x + (w * (i + 0.5)) / 4, y + h + L + 20 - pulse, -90]); }
  for (let i = 0; i < 2; i++) { arr.push([x - L - 20 + pulse, y + (h * (i + 0.5)) / 2, 0], [x + w + L + 20 - pulse, y + (h * (i + 0.5)) / 2, 180]); }
  return (
    <g opacity={clamp(k * 2)}>
      {arr.map(([ax, ay, rot], i) => (
        <g key={i} transform={`translate(${ax} ${ay}) rotate(${rot})`}>
          <line x1={-L / 2} y1={0} x2={L / 2} y2={0} stroke={color} strokeWidth={8} />
          <path d={`M ${L / 2} 0 L ${L / 2 - 18} -12 L ${L / 2 - 18} 12 Z`} fill={color} />
        </g>
      ))}
    </g>
  );
};

/** A test tank with a scale model, a depth gauge and the implosion. */
const Tank: React.FC<{ t: number; e: (n: string) => number; value: string; label: string; startAt: number; failAt: number; wrinkleAt?: number; wreck?: string; wreckAt?: number }> = ({ t, e, value, label, startAt, failAt, wrinkleAt, wreck, wreckAt }) => {
  const lower = sm((t - startAt) / 20);
  const crush = sm((t - failAt) / 6);
  const gauge = clamp((t - startAt) / Math.max(10, failAt - startAt));
  return (
    <g>
      <rect x={300} y={240} width={560} height={600} rx={30} fill="#e9f3fb" stroke={INK} strokeWidth={8} />
      <rect x={340} y={300} width={480} height={500} rx={16} fill="#bfe1f7" />
      <rect x={260} y={210} width={640} height={50} rx={10} fill="#c9cdd2" stroke={INK} strokeWidth={6} />
      <line x1={580} y1={260} x2={580} y2={300 + 200 * lower} stroke={INK} strokeWidth={4} />
      <g transform={`translate(580 ${430 + 200 * lower}) scale(${1 - 0.3 * crush} ${1 - 0.75 * crush})`}>
        <rect x={-140} y={-55} width={280} height={110} rx={50} fill={crush > 0 ? RED : "#2a2e35"} stroke={INK} strokeWidth={5} />
        {wrinkleAt !== undefined && t >= wrinkleAt && <path d={`M -100 0 ${Array.from({ length: 8 }, (_, i) => `Q ${-88 + i * 25} ${i % 2 ? -14 : 14} ${-75 + i * 25} 0`).join(" ")}`} fill="none" stroke="#f2a33a" strokeWidth={6} />}
      </g>
      {crush > 0 && crush < 1 && <circle cx={580} cy={630} r={60 + 200 * crush} fill="none" stroke={RED} strokeWidth={8} opacity={1 - crush} />}
      {/* the gauge */}
      <g transform="translate(1260 520)">
        <circle r={230} fill="#ffffff" stroke={INK} strokeWidth={8} />
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={0} y1={-205} x2={0} y2={-180} stroke={i > 7 ? RED : INK} strokeWidth={6} transform={`rotate(${-135 + i * 27})`} />)}
        <line x1={0} y1={0} x2={0} y2={-170} stroke={crush > 0 ? RED : INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${-135 + 270 * 0.85 * gauge})`} />
        <circle r={16} fill={INK} />
        <text x={0} y={110} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={INK}>{label}</text>
      </g>
      {t >= failAt && <text x={1260} y={900} textAnchor="middle" fontFamily={ANTON} fontSize={84} fill={RED}>{countText(value, ramp(t, failAt, 16))}</text>}
      {wreck && wreckAt !== undefined && t >= wreckAt && <TypeText x={1260} y={190} t={t} at={wreckAt} text={`TITANIC LIES AT ${wreck}`} size={36} color={INK} anchor="middle" />}
      <TypeText x={320} y={200} t={t} at={startAt} text="TEST TANK" size={36} />
      <Stamp x={580} y={540} t={t} at={failAt + 4} text="IMPLODED" />
    </g>
  );
};

/** A magnified cut through the hull wall: five layers, glue lines; `gap` opens between two layers in red,
 * `bow` folds a patch inward. */
const Wall: React.FC<{ t: number; drawAt: number; gap?: number; gapAt?: number; bow?: number; crack?: number; layersK?: number }> = ({ t, drawAt, gap = 0, bow = 0, crack = 0, layersK = 1 }) => {
  const k = ramp(t, drawAt, 16);
  const X = 300, Wd = 1320, Y = 330, Ht = 420;
  const lh = Ht / 5;
  return (
    <g opacity={k}>
      {Array.from({ length: 5 }, (_, i) => {
        const show = clamp(layersK * 5 - i);
        const y = Y + i * lh;
        const dip = bow > 0 ? bow * 120 * Math.max(0, 1 - Math.abs((X + Wd / 2) - 960) / 600) : 0;
        return (
          <g key={i} opacity={show}>
            <path d={`M ${X} ${y} L ${X + Wd * 0.4} ${y} Q ${X + Wd / 2} ${y + dip} ${X + Wd * 0.6} ${y} L ${X + Wd} ${y} L ${X + Wd} ${y + lh - 6} L ${X + Wd * 0.6} ${y + lh - 6} Q ${X + Wd / 2} ${y + lh - 6 + dip} ${X + Wd * 0.4} ${y + lh - 6} L ${X} ${y + lh - 6} Z`}
              fill={i % 2 ? "#2a2e35" : "#353a43"} stroke={INK} strokeWidth={3} />
            {Array.from({ length: 22 }, (_, j) => <line key={j} x1={X + 20 + j * 60} y1={y + 12} x2={X + 50 + j * 60} y2={y + lh - 18} stroke="#4a515c" strokeWidth={3} />)}
            {i > 0 && <line x1={X} y1={y - 3} x2={X + Wd} y2={y - 3} stroke="#e8b21c" strokeWidth={4} opacity={0.8} />}
          </g>
        );
      })}
      {gap > 0 && <path d={`M ${X + Wd * 0.3} ${Y + 2 * lh - 3} Q ${X + Wd * 0.5} ${Y + 2 * lh - 3 - 26 * gap} ${X + Wd * (0.3 + 0.45 * gap)} ${Y + 2 * lh - 3}`} fill={RED} stroke={RED} strokeWidth={6} />}
      {crack > 0 && <path d={`M ${X + Wd * 0.45} ${Y} l 30 ${60 * crack} l -24 ${40 * crack} l 36 ${50 * crack}`} fill="none" stroke={RED} strokeWidth={7} />}
      <TypeText x={X} y={Y + Ht + 70} t={t} at={drawAt} text="HULL WALL · INSIDE ↓" size={34} />
      <TypeText x={X} y={Y - 30} t={t} at={drawAt} text="SEA SIDE ↑" size={34} color={BLUE} />
    </g>
  );
};

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; p: SceneProps; end: number }> = ({ t, e, mode, p, end }) => {
  const f = (n: string) => figOf(p, n);
  if (mode === "map") {
    const route = ramp(t, e("miles"), 30);
    return (
      <g>
        <rect x={200} y={140} width={1520} height={760} fill="#d8ecf8" stroke={INK} strokeWidth={6} />
        <path d="M 200 140 L 760 140 L 820 220 L 700 330 L 760 420 L 640 470 L 520 440 L 470 560 L 360 600 L 200 640 Z" fill="#e3e5e8" stroke={INK} strokeWidth={5} opacity={ramp(t, 0, 14)} />
        <circle cx={700} cy={420} r={18} fill={t >= e("Newfoundland") ? RED : INK} />
        <TypeText x={560} y={520} t={t} at={e("Newfoundland") - 6} text="ST. JOHN'S" size={36} />
        <rect x={200} y={140} width={1520} height={760} fill={BLUE} opacity={0.12 * ramp(t, e("Atlantic"), 16)} />
        <TypeText x={980} y={860} t={t} at={e("Atlantic")} text="NORTH ATLANTIC" size={40} color={BLUE} />
        <path d={`M 700 420 Q 1050 560 ${700 + 600 * route} ${420 + 300 * route - 140 * Math.sin(Math.PI * route)}`} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="20 14" />
        <g transform={`translate(1300 720) scale(${0.6 + 0.4 * sm((t - e("wreck")) / 10)})`} opacity={ramp(t, e("wreck"), 8)}>
          <path d="M 0 0 L -30 -60 A 30 30 0 1 1 30 -60 Z" fill={RED} stroke={INK} strokeWidth={4} />
          <circle cx={0} cy={-70} r={12} fill="#fff" />
        </g>
        <TypeText x={1340} y={650} t={t} at={e("wreck")} text="TITANIC WRECK" size={38} color={RED} />
        {route > 0.3 && <g opacity={ramp(t, e("miles") + 14, 10)}>
          <rect x={900} y={300} width={430} height={130} rx={10} fill="#ffffff" stroke={INK} strokeWidth={4} />
          <text x={925} y={350} fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>NAUTICAL MILES</text>
          <text x={925} y={415} fontFamily={ANTON} fontSize={60} fill={INK}>{countText(f("miles"), ramp(t, e("miles") + 14, 20))}</text>
        </g>}
      </g>
    );
  }
  if (mode === "column" || mode === "squeeze") {
    const drop = mode === "squeeze" ? clamp((t - e("trip")) / Math.max(30, end - e("trip"))) : 0;
    const subY = mode === "column" ? SURF + 60 : SURF + 60 + (BED - SURF - 200) * drop;
    return (
      <g>
        <OceanCut t={t} k={ramp(t, mode === "column" ? e("rests") : -20, 18)} dark={mode === "column" ? ramp(t, e("darkness"), 20) : 0.5} />
        <WreckIcon x={1200} k={mode === "column" ? ramp(t, e("floor"), 12) : 1} />
        {mode === "column" && <line x1={300} y1={SURF} x2={300} y2={SURF + (BED - SURF) * ramp(t, e("metres"), 30)} stroke={RED} strokeWidth={10} />}
        {mode === "column" && <DepthTag y={BED} t={t} at={e("metres")} value={f("wreck")} label="METRES" color={RED} />}
        {(mode === "squeeze" || t >= e("back")) && <SubProfile x={760} y={subY} s={0.6} stress={mode === "squeeze" ? ramp(t, e("harder"), 20) : 0} />}
        {mode === "squeeze" && <Squeeze x={760 - 160} y={subY - 40} w={260} h={80} k={ramp(t, e("squeezing"), 20)} t={t} color={t >= e("harder") ? RED : BLUE} />}
        {mode === "squeeze" && (
          <g transform="translate(1480 300)" opacity={ramp(t, e("hours"), 10)}>
            <circle r={90} fill="#ffffff" stroke={INK} strokeWidth={6} />
            <line x1={0} y1={0} x2={0} y2={-70} stroke={INK} strokeWidth={8} transform={`rotate(${t * 4})`} />
            <line x1={0} y1={0} x2={0} y2={-45} stroke={INK} strokeWidth={10} transform={`rotate(${t * 0.4})`} />
          </g>
        )}
      </g>
    );
  }
  if (mode === "psisea" || mode === "psideep") {
    const deep = mode === "psideep";
    const slide = deep ? ramp(t, e("Titanic"), 30) : 0;
    const sqY = SURF + 30 + (BED - SURF - 140) * slide;
    const stack = deep ? ramp(t, e("presses"), 24) : ramp(t, e("air"), 12);
    const needle = deep ? 0.12 + 0.8 * ramp(t, e("inch"), 20) : 0.12 * ramp(t, e("pounds"), 16);
    return (
      <g>
        <OceanCut t={t} k={1} dark={deep ? ramp(t, e("water"), 20) : 0} />
        <g transform={`translate(700 ${sqY})`}>
          <rect x={-50} y={0} width={100} height={100} fill="#ffffff" stroke={deep && t >= e("every") && Math.floor(t / 5) % 2 === 0 ? RED : INK} strokeWidth={deep && t >= e("every") ? 10 : 6} />
          <text x={0} y={140} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={deep ? "#ffffff" : INK}>ONE SQ INCH</text>
          {Array.from({ length: deep ? 9 : 1 }, (_, i) => {
            const k = clamp(stack * (deep ? 9 : 1) - i);
            return <rect key={i} x={-70} y={-40 - i * 44 - (1 - k) * 120} width={140} height={40} rx={6} fill={deep ? (i > 5 ? RED : "#6d747c") : "#6d747c"} stroke={INK} strokeWidth={4} opacity={k} />;
          })}
        </g>
        <g transform="translate(1340 520)">
          <circle r={220} fill="#ffffff" stroke={INK} strokeWidth={8} />
          {Array.from({ length: 11 }, (_, i) => <line key={i} x1={0} y1={-195} x2={0} y2={-170} stroke={i > 7 ? RED : INK} strokeWidth={6} transform={`rotate(${-135 + i * 27})`} />)}
          <line x1={0} y1={0} x2={0} y2={-160} stroke={deep && needle > 0.5 ? RED : INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${-135 + 270 * needle})`} />
          <circle r={16} fill={INK} />
          <text x={0} y={90} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>POUNDS / SQ INCH</text>
          <text x={0} y={170} textAnchor="middle" fontFamily={ANTON} fontSize={72} fill={deep ? RED : INK}>{deep ? (t >= e("inch") ? countText(f("deep"), ramp(t, e("inch"), 24)) : f("sea")) : (t >= e("pounds") ? f("sea") : "")}</text>
        </g>
      </g>
    );
  }
  if (mode === "inside") {
    const k = ramp(t, e("survive"), 16);
    return (
      <g>
        <g transform="translate(960 520)" opacity={k}>
          <rect x={-480} y={-210} width={960} height={420} rx={40} fill="#2a2e35" stroke={INK} strokeWidth={8} />
          <rect x={-480 + 50 * ramp(t, e("hull"), 14)} y={-210 + 50 * ramp(t, e("hull"), 14)} width={960 - 100 * ramp(t, e("hull"), 14)} height={420 - 100 * ramp(t, e("hull"), 14)} rx={30} fill={t >= e("inside") ? "#e8f4ff" : "#ffffff"} stroke={INK} strokeWidth={5} />
          <path d="M 480 -210 A 120 210 0 0 1 480 210" fill="#c9cdd2" stroke={INK} strokeWidth={8} />
          <path d="M -480 -210 A 120 210 0 0 0 -480 210" fill="#c9cdd2" stroke={INK} strokeWidth={8} />
          {[-300, -150, 0, 150, 300].map((x, i) => <Person key={i} x={x} y={140} s={1.3} color="#3e5a78" sit k={ramp(t, e("people") + i * 4, 8)} arm={10} />)}
          <TypeText x={0} y={-80} t={t} at={e("inside")} text="NORMAL AIR PRESSURE" size={40} color={BLUE} anchor="middle" />
        </g>
        <Squeeze x={480} y={310} w={960} h={420} k={ramp(t, e("load"), 20)} t={t} color={RED} />
        <TypeText x={480} y={240} t={t} at={e("hull")} text="PRESSURE HULL" size={38} />
      </g>
    );
  }
  if (mode === "material") {
    const lift = ramp(t, e("light"), 20);
    const tilt = -8 * lift;
    return (
      <g>
        <g transform={`translate(960 560) rotate(${tilt})`}>
          <line x1={-520} y1={0} x2={520} y2={0} stroke={INK} strokeWidth={10} />
          <rect x={-470} y={-110} width={300} height={110} rx={50} fill="#2a2e35" stroke={INK} strokeWidth={5} />
          <rect x={170} y={-110} width={300} height={110} rx={50} fill="#9aa3ad" stroke={INK} strokeWidth={5} />
          <text x={-320} y={-130} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={INK}>CARBON</text>
          <text x={320} y={-130} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={INK}>STEEL</text>
        </g>
        <path d="M 900 760 L 960 580 L 1020 760 Z" fill="#e3e5e8" stroke={INK} strokeWidth={6} />
        <TypeText x={400} y={300} t={t} at={e("light")} text="LIGHTER" size={44} color={BLUE} />
        {t >= e("squeezed") && <Squeeze x={490} y={530 + 60} w={300} h={110} k={ramp(t, e("squeezed"), 14)} t={t} color={BLUE} />}
        {t >= e("stretched") && (
          <g opacity={ramp(t, e("stretched"), 10)}>
            <line x1={400} y1={900} x2={240} y2={900} stroke={RED} strokeWidth={8} /><path d="M 230 900 L 260 885 L 260 915 Z" fill={RED} />
            <line x1={880} y1={900} x2={1040} y2={900} stroke={RED} strokeWidth={8} /><path d="M 1050 900 L 1020 885 L 1020 915 Z" fill={RED} />
            <text x={640} y={915} textAnchor="middle" fontFamily={ANTON} fontSize={60} fill={RED}>?</text>
          </g>
        )}
      </g>
    );
  }
  if (mode === "fulltest") {
    return (
      <g>
        <Tank t={t} e={e} value={f("depth")} label="METRES" startAt={e("proven")} failAt={1e9} />
        {t >= e("simulated") && <text x={1260} y={900} textAnchor="middle" fontFamily={ANTON} fontSize={84} fill={BLUE}>{countText(f("depth"), ramp(t, e("simulated"), 16))}</text>}
        <TypeText x={1260} y={230} t={t} at={e("tested")} text={`FULL HULL · ${f("year")}`} size={38} anchor="middle" />
        <Stamp x={580} y={540} t={t} at={e("work")} text="IN SERVICE" color={BLUE} />
      </g>
    );
  }
  if (mode === "profile") {
    const k1 = ramp(t, e("down"), 30), k2 = ramp(t, e("wreck"), 24), k3 = ramp(t, e("up"), 24);
    const x0 = 480, x1 = 860, x2 = 1240, x3 = 1600, yb = BED - 60;
    return (
      <g>
        <OceanCut t={t} k={1} dark={0.4} />
        <WreckIcon x={1050} k={1} />
        <path d={`M ${x0} ${SURF} L ${x0 + (x1 - x0) * k1} ${SURF + (yb - SURF) * k1}`} stroke={RED} strokeWidth={10} fill="none" />
        {k2 > 0 && <path d={`M ${x1} ${yb} L ${x1 + (x2 - x1) * k2} ${yb}`} stroke="#ffd27a" strokeWidth={10} fill="none" />}
        {k3 > 0 && <path d={`M ${x2} ${yb} L ${x2 + (x3 - x2) * k3} ${yb - (yb - SURF) * k3}`} stroke={BLUE} strokeWidth={10} fill="none" />}
        <TypeText x={x0 + 60} y={SURF + 260} t={t} at={e("down")} text="DOWN" size={40} color="#ffffff" />
        <TypeText x={x1 + 60} y={yb - 30} t={t} at={e("wreck")} text="AT THE WRECK" size={40} color="#ffd27a" />
        <TypeText x={x2 + 120} y={SURF + 260} t={t} at={e("up")} text="UP" size={40} color="#ffffff" />
        <TypeText x={340} y={SURF - 40} t={t} at={e("plan")} text="THE DIVE PLAN" size={40} />
      </g>
    );
  }
  if (mode === "modelone") return <Tank t={t} e={e} value={f("depth")} label="METRES" startAt={e("model")} failAt={e("imploded")} />;
  if (mode === "modeltwo") return <Tank t={t} e={e} value={f("depth")} label="METRES" startAt={e("models")} failAt={e("imploded")} wrinkleAt={e("wrinkled")} wreck={f("wreck")} wreckAt={e("Titanic")} />;
  if (mode === "crack" || mode === "delam" || mode === "buckle") {
    const gap = mode === "crack" ? ramp(t, e("apart"), 20) : mode === "delam" ? ramp(t, e("damaged"), 14) * (0.5 + 0.5 * ramp(t, e("layers"), 30)) : 1;
    return (
      <g>
        <Wall t={t} drawAt={mode === "crack" ? -16 : mode === "delam" ? e("Investigators") : e("weakened")} gap={gap}
          crack={mode === "crack" ? ramp(t, e("crack"), 16) : 0} bow={mode === "buckle" ? ramp(t, e("spot"), 20) + ramp(t, e("buckling"), 14) : 0} />
        {mode === "crack" && (
          <g transform={`translate(${700 + 200 * ramp(t, e("worker"), 30)} 420)`} opacity={ramp(t, e("worker"), 10)}>
            <circle r={150} fill="none" stroke={INK} strokeWidth={14} />
            <line x1={105} y1={105} x2={230} y2={230} stroke={INK} strokeWidth={22} strokeLinecap="round" />
          </g>
        )}
        {mode === "crack" && <TypeText x={300} y={240} t={t} at={e("worker")} text={`FIRST HULL · ${f("year")}`} size={40} />}
        {mode === "delam" && <TypeText x={300} y={240} t={t} at={e("damaged")} text={`AFTER DIVE ${f("dive")}`} size={44} color={RED} />}
        {mode !== "crack" && <TypeText x={1100} y={240} t={t} at={mode === "delam" ? e("layers") : e("spot")} text={mode === "delam" ? "DELAMINATION" : "LOCAL BUCKLING"} size={44} color={RED} />}
        {mode === "buckle" && <Squeeze x={300} y={330} w={1320} h={420} k={ramp(t, e("wall"), 14)} t={t} color={BLUE} />}
        {mode === "buckle" && <Stamp x={1300} y={880} t={t} at={e("failure")} text="BUCKLED" />}
      </g>
    );
  }
  if (mode === "desk") {
    const lamp = t >= e("director") && t < e("go") + 6;
    const chairEmpty = t >= e("go");
    return (
      <g>
        <rect x={300} y={720} width={1320} height={30} fill="#e3e5e8" stroke={INK} strokeWidth={5} />
        <rect x={340} y={750} width={20} height={180} fill={INK} /><rect x={1560} y={750} width={20} height={180} fill={INK} />
        <line x1={0} y1={930} x2={1920} y2={930} stroke={INK} strokeWidth={4} />
        <g opacity={lamp ? 1 : 0.35}>
          <line x1={480} y1={720} x2={520} y2={520} stroke={INK} strokeWidth={10} />
          <path d="M 470 520 L 600 480 L 620 560 Z" fill={INK} />
          {lamp && <path d="M 600 520 L 980 720 L 700 720 Z" fill="#ffe7a8" opacity={0.5} />}
        </g>
        <g transform={`translate(${860 - 900 * ramp(t, e("trip"), 20)} 360)`}>
          <rect x={0} y={0} width={420} height={340} fill="#ffffff" stroke={INK} strokeWidth={5} />
          <text x={30} y={60} fontFamily={MONO} fontWeight={700} fontSize={34} fill={INK}>EXPEDITION</text>
          <text x={30} y={110} fontFamily={MONO} fontWeight={700} fontSize={34} fill={INK}>SIGN-OFF</text>
          <line x1={30} y1={270} x2={390} y2={270} stroke={INK} strokeWidth={4} />
          <text x={30} y={310} fontFamily={MONO} fontSize={30} fill={INK}>ENGINEERING</text>
          {t >= e("sign") && <rect x={40} y={230} width={20} height={34} fill={RED} opacity={Math.floor(t / 8) % 2 ? 1 : 0} />}
        </g>
        <Stamp x={1250} y={420} t={t} at={e("done")} text="HULL DONE" />
        {!chairEmpty ? <Person x={1300} y={930} s={2.6} color="#3e5a78" sit arm={30} /> : <rect x={1250} y={800} width={110} height={20} fill="#6d747c" opacity={ramp(t, e("go"), 10)} />}
        {chairEmpty && <rect x={1340} y={700} width={20} height={230} fill="#6d747c" />}
      </g>
    );
  }
  if (mode === "layers") {
    const n = clamp((t - e("bonded")) / Math.max(20, e("thick") - e("bonded")));
    return (
      <g>
        <g transform="translate(560 540)">
          {Array.from({ length: 5 }, (_, i) => {
            const k = clamp(n * 5 - i);
            const r = 150 + i * 46;
            return <circle key={i} r={r} fill="none" stroke={i % 2 ? "#2a2e35" : "#40464f"} strokeWidth={42 * k} opacity={k} />;
          })}
          {Array.from({ length: 4 }, (_, i) => <circle key={i} r={173 + i * 46} fill="none" stroke="#e8b21c" strokeWidth={4} opacity={clamp(n * 5 - i - 1)} />)}
          <circle r={128} fill="#e8f4ff" stroke={INK} strokeWidth={4} opacity={ramp(t, e("second"), 12)} />
          <text x={0} y={14} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={INK}>INSIDE</text>
        </g>
        <DrawLine x1={960} y1={540} x2={1700} y2={540} k={ramp(t, e("second"), 20)} w={5} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={1060 + i * 120} y={420} width={110} height={240} fill={i % 2 ? "#2a2e35" : "#40464f"} stroke={INK} strokeWidth={3} opacity={clamp(n * 5 - i)} />)}
        <TypeText x={1060} y={380} t={t} at={e("layers")} text="FIVE BONDED LAYERS" size={40} />
        {t >= e("thick") && (
          <g opacity={ramp(t, e("thick"), 10)}>
            <line x1={1060} y1={720} x2={1650} y2={720} stroke={RED} strokeWidth={6} />
            <line x1={1060} y1={700} x2={1060} y2={740} stroke={RED} strokeWidth={6} /><line x1={1650} y1={700} x2={1650} y2={740} stroke={RED} strokeWidth={6} />
            <text x={1355} y={810} textAnchor="middle" fontFamily={ANTON} fontSize={72} fill={RED}>{countText(f("thick"), ramp(t, e("thick"), 16))}</text>
            <text x={1355} y={860} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={INK}>INCHES</text>
          </g>
        )}
      </g>
    );
  }
  if (mode === "window") {
    const rated = ramp(t, e("certified"), 20), dive = ramp(t, e("dive"), 30);
    const ry = SURF + (BED - SURF) * 0.26;
    return (
      <g>
        <OceanCut t={t} k={1} dark={0.3} />
        <WreckIcon x={1300} k={1} />
        <g transform="translate(760 430)" opacity={ramp(t, e("window"), 12)}>
          <path d="M -40 -150 A 160 150 0 0 1 -40 150 Z" fill="#c9cdd2" stroke={INK} strokeWidth={6} />
          <circle cx={60} cy={0} r={48} fill="#9fd8ff" stroke={INK} strokeWidth={6} />
          <g opacity={ramp(t, e("maker"), 10)} transform="translate(60 60)">
            <line x1={0} y1={0} x2={60} y2={90} stroke={INK} strokeWidth={4} />
            <rect x={20} y={90} width={220} height={70} rx={8} fill="#ffffff" stroke={INK} strokeWidth={4} />
            <text x={130} y={135} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>CERTIFIED</text>
          </g>
        </g>
        <DepthTag y={ry} t={t} at={e("certified")} value={f("rated")} label="WINDOW RATED" color={BLUE} />
        <line x1={1100} y1={SURF} x2={1100} y2={SURF + (ry - SURF) * rated} stroke={BLUE} strokeWidth={14} />
        <line x1={1160} y1={SURF} x2={1160} y2={SURF + (BED - SURF) * dive} stroke={RED} strokeWidth={14} />
        <DepthTag y={BED - 2} t={t} at={e("dive") + 20} value={f("wreck")} label="TITAN DIVED TO" color={RED} />
      </g>
    );
  }
  if (mode === "letter") {
    return (
      <g>
        <g transform={`translate(560 ${130 + 20 * (1 - ramp(t, 0, 16))})`}>
          <rect x={0} y={0} width={800} height={760} fill="#ffffff" stroke={INK} strokeWidth={5} />
          <TypeText x={50} y={80} t={t} at={e("letter") - 20} text={`DRAFT LETTER · ${f("year")}`} size={38} />
          <line x1={50} y1={110} x2={750} y2={110} stroke={INK} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={50} y={150 + i * 50} width={(i === 3 ? 400 : 700)} height={18} fill="#c4c8cd" />)}
          <rect x={40} y={340} width={720 * ramp(t, e("warned"), 16)} height={60} fill="#ffe66d" opacity={0.7} />
          <text x={50} y={384} fontFamily={MONO} fontWeight={700} fontSize={36} fill={INK}>"EXPERIMENTAL" APPROACH</text>
          {t >= e("experimental") && <ellipse cx={250} cy={372} rx={210} ry={44} fill="none" stroke={RED} strokeWidth={6} />}
          <text x={50} y={460} fontFamily={MONO} fontWeight={700} fontSize={36} fill={INK}>... CATASTROPHIC</text>
          <line x1={50} y1={474} x2={50 + 400 * ramp(t, e("catastrophe"), 12)} y2={474} stroke={RED} strokeWidth={7} />
          {Array.from({ length: 12 }, (_, i) => {
            const k = clamp((t - e("experts")) / 3 - i);
            return <path key={i} d={`M ${70 + (i % 4) * 180} ${560 + Math.floor(i / 4) * 60} q 20 -30 40 0 t 40 0 t 40 -10`} fill="none" stroke={BLUE} strokeWidth={4} opacity={k} />;
          })}
        </g>
      </g>
    );
  }
  if (mode === "class") {
    const off = ramp(t, e("dropped"), 24);
    return (
      <g transform={`translate(${-1200 * off} 0)`}>
        <rect x={510} y={150} width={900} height={700} fill="#fbfaf5" stroke={INK} strokeWidth={6} opacity={ramp(t, e("certified"), 10)} />
        <rect x={540} y={180} width={840} height={640} fill="none" stroke={INK} strokeWidth={3} />
        <TypeText x={960} y={270} t={t} at={e("certified")} text="CERTIFICATE OF CLASS" size={48} anchor="middle" />
        <TypeText x={960} y={340} t={t} at={e("certified") + 6} text="VESSEL: TITAN" size={36} anchor="middle" />
        <circle cx={1200} cy={650} r={90} fill="none" stroke={INK} strokeWidth={5} strokeDasharray="14 10" opacity={ramp(t, e("society"), 10)} />
        <text x={1200} y={662} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK} opacity={ramp(t, e("society"), 10)}>SEAL</text>
        <g transform="translate(700 650)" opacity={ramp(t, e("ships"), 10)}>
          <path d="M -80 0 L 80 0 L 60 30 L -60 30 Z" fill={INK} /><rect x={-20} y={-40} width={40} height={40} fill={INK} />
        </g>
        <Stamp x={960} y={520} t={t} at={e("No")} text="NOT CLASSED" size={90} />
      </g>
    );
  }
  if (mode === "lot") {
    const snow = ramp(t, e("winter"), 30);
    return (
      <g>
        <rect x={200} y={140} width={1520} height={760} fill="#8d949b" stroke={INK} strokeWidth={6} opacity={ramp(t, e("summer"), 14)} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={260 + i * 170} y1={160} x2={260 + i * 170} y2={160 + 200 * ramp(t, e("parking") + i * 2, 10)} stroke="#ffffff" strokeWidth={8} />)}
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={260 + i * 170} y1={880} x2={260 + i * 170} y2={880 - 200 * ramp(t, e("parking") + i * 2, 10)} stroke="#ffffff" strokeWidth={8} />)}
        <g opacity={ramp(t, e("outside"), 12)}>
          <rect x={360} y={440} width={300} height={140} fill="#a2241d" stroke={INK} strokeWidth={5} />
          <rect x={1280} y={440} width={300} height={140} fill="#1f6fd1" stroke={INK} strokeWidth={5} />
          <g transform="translate(960 510) rotate(-90) scale(0.9)">
            <rect x={-80} y={-260} width={160} height={420} rx={70} fill="#ffffff" stroke={INK} strokeWidth={6} />
            <circle cx={0} cy={-210} r={26} fill="#9fd8ff" stroke={INK} strokeWidth={4} />
          </g>
          <rect x={700} y={430} width={520} height={160} fill="#ffffff" opacity={0.85 * snow} rx={60} />
        </g>
        <g opacity={ramp(t, e("uncovered"), 10)}>
          <rect x={780} y={250} width={360} height={80} rx={10} fill="#ffffff" stroke={RED} strokeWidth={5} />
          <text x={960} y={305} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill={RED}>NO COVER</text>
        </g>
        {snow > 0 && Array.from({ length: 80 }, (_, i) => {
          const x = 200 + ((i * 197) % 1520), y = 140 + (((i * 131) + t * (2 + (i % 3))) % 760);
          return <circle key={i} cx={x} cy={y} r={5 + (i % 3)} fill="#ffffff" opacity={snow} />;
        })}
        <TypeText x={200} y={110} t={t} at={e("summer")} text="ST. JOHN'S · FROM ABOVE" size={36} />
      </g>
    );
  }
  // world
  const flip = ramp(t, e("mandatory"), 14);
  return (
    <g>
      <g transform="translate(760 540)" opacity={ramp(t, e("push"), 14)}>
        <circle r={300} fill="#d8ecf8" stroke={INK} strokeWidth={6} />
        <ellipse rx={300} ry={110} fill="none" stroke={INK} strokeWidth={3} />
        <ellipse rx={120} ry={300} fill="none" stroke={INK} strokeWidth={3} />
        <line x1={-300} y1={0} x2={300} y2={0} stroke={INK} strokeWidth={3} />
      </g>
      <g transform={`translate(1180 ${420 - 200 * (1 - ramp(t, e("standard"), 16))})`} opacity={ramp(t, e("standard"), 10)}>
        <rect x={0} y={0} width={420} height={300} rx={10} fill="#1f6fd1" stroke={INK} strokeWidth={6} />
        <rect x={20} y={20} width={380} height={260} rx={6} fill="none" stroke="#ffffff" strokeWidth={3} />
        <text x={210} y={120} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={36} fill="#ffffff">WORLD STANDARD</text>
        <text x={210} y={170} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill="#ffffff">SUBMERSIBLES</text>
        <g transform={`translate(210 ${260 + 300 * ramp(t, e("optional"), 30)})`} opacity={1 - flip * 0.2}>
          <rect x={-150} y={-30} width={300} height={70} rx={8} fill="#ffffff" stroke={INK} strokeWidth={4} />
          <text x={0} y={18} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill={INK}>OPTIONAL</text>
        </g>
      </g>
      <Stamp x={1390} y={820} t={t} at={e("mandatory")} text="MANDATORY" color={BLUE} size={70} />
    </g>
  );
};

const Section: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "column";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  // the camera: a slow push, and a closer framing from the beat's close word
  const cam = ((p.beat.params as { camera?: { at?: string; size?: string }[] }).camera ?? []);
  const close = cam.find((c) => c.size === "close" || c.size === "extreme");
  const zk = close?.at ? ramp(t, e(close.at), 18) : 0;
  const focus: Record<string, [number, number]> = {
    map: [1200, 600], column: [800, 700], squeeze: [800, 500], psisea: [900, 420], psideep: [1100, 640], inside: [960, 560], material: [700, 600],
    modelone: [960, 560], fulltest: [960, 560], profile: [1200, 700], modeltwo: [960, 560], crack: [960, 520], delam: [960, 520], buckle: [960, 560], desk: [1000, 560], layers: [1250, 600],
    window: [960, 500], letter: [900, 420], class: [960, 520], lot: [960, 520], world: [1100, 600],
  };
  const [fx, fy] = focus[mode] ?? [960, 540];
  const zoom = 1 + 0.03 * (t / end) + 0.22 * zk;
  const cx = 960 + (fx - 960) * zk, cy = 540 + (fy - 540) * zk;
  return (
    <Sheet t={t} zoom={zoom} cx={cx} cy={cy} html={<>
      <FlatTag t={t} tag={mode === "letter" || mode === "desk" || mode === "class" || mode === "lot" ? "as reported" : "principle"} at={0} sub={mode === "letter" || mode === "desk" || mode === "class" || mode === "lot" ? "a reconstruction of what the report describes" : "simplified drawing"} />
      {P.chapter && <ChapterCard t={t} text={P.chapter} dark={false} />}
    </>}>
      <Inner t={t} e={e} mode={mode} p={p} end={end} />
    </Sheet>
  );
};

export default Section;
