// Wing (flat): a wind-tunnel drawing of the airliner's wing section on the night sheet. Streamlines flow
// past it (dashes moving), the lift arrow grows or shrinks, the angle of attack is drawn as an arc against
// the oncoming air, and past the stall angle the flow over the top tears off in swirls. Modes (params.mode):
// flow, aoa, stall, slow, recover, ice, icefind, pull, startle. A "general principle" drawing: no figures.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, ANTON, ArrowSvg, ChapterCard, DIM, FlatTag, GREEN, ICE, INK, MONO, moments, ramp, RED, Sheet, Stamp, TypeText } from "./ui";

type Params = { mode?: string; chapter?: string };
const CX = 900, CY = 540, CH = 820; // the wing's middle and chord (px)

/** The section's outline: upper and lower surfaces, cambered, about 14% thick, around (0,0) at the quarter chord. */
function foil(): [number, number][] {
  const up: [number, number][] = [], lo: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const u = 1 - Math.cos((i / 40) * Math.PI * 0.5) ** 1; // denser at the nose
    const x = u;
    const th = 0.14 * 5 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    const cam = x < 0.4 ? 0.04 / 0.16 * (0.8 * x - x * x) : 0.04 / 0.36 * (0.2 + 0.8 * x - x * x);
    up.push([(x - 0.25) * CH, -(cam + th) * CH]);
    lo.push([(x - 0.25) * CH, -(cam - th) * CH]);
  }
  return [...up, ...lo.reverse()];
}
const FOIL = foil();

const Wing: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "flow";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  // angle of attack (degrees), how torn the flow is (0..1), the lift (0..1), ice, the stall line's angle
  let aoa = 4, torn = 0, lift = 0.6, ice = 0, stallLine = 16, dark = 0;
  if (mode === "flow") { lift = 0.15 + 0.6 * ramp(t, e("lift"), 16); }
  if (mode === "aoa") { aoa = 3 + 6 * ramp(t, e("Tilt"), 20); lift = 0.55 + 0.35 * ramp(t, e("more"), 16); }
  if (mode === "stall") { aoa = 9 + 9 * ramp(t, e("angle"), 24); torn = ramp(t, e("breaks"), 20); lift = 0.9 - 0.65 * ramp(t, e("collapses"), 14); }
  if (mode === "slow") { aoa = 4 + 9 * ramp(t, e("bigger"), 30) + 2 * ramp(t, e("edge"), 30); lift = 0.7; }
  if (mode === "recover") { aoa = 18 - 13 * ramp(t, e("down"), 24); torn = 1 - ramp(t, e("grips"), 24); lift = 0.3 + 0.5 * ramp(t, e("grips"), 20); }
  if (mode === "ice") { aoa = 9; ice = ramp(t, e("Ice"), 30); stallLine = 16 - 4 * ramp(t, e("sooner"), 24); lift = 0.7; dark = ramp(t, e("night"), 30); }
  if (mode === "icefind") { aoa = 7; ice = 1 - 0.75 * ramp(t, e("barely"), 24); lift = 0.75; }
  if (mode === "pull") { aoa = 12 + 8 * ramp(t, e("Pulling"), 14); torn = ramp(t, e("over"), 14); lift = 0.85 - 0.6 * ramp(t, e("over"), 14); }
  if (mode === "startle") { aoa = 15 + Math.sin(t * 0.5) * 2 * ramp(t, e("confusion"), 10); torn = 0.6; lift = 0.4; }
  const jolt = mode === "startle" && t >= e("startle") ? Math.sin(t * 4) * 14 * (1 - ramp(t, e("startle") + 4, 20)) : 0;
  const tornColor = torn > 0.3 ? RED : ICE;
  // the camera
  const push = mode === "flow" ? ramp(t, e("curved"), 18) : mode === "aoa" ? ramp(t, e("angle"), 18) : mode === "stall" ? ramp(t, e("swirls"), 18) : mode === "slow" ? ramp(t, e("edge"), 18)
    : mode === "recover" ? ramp(t, e("down"), 18) : mode === "ice" ? ramp(t, e("Ice"), 18) : mode === "icefind" ? ramp(t, e("barely"), 18) : mode === "pull" ? ramp(t, e("opposite"), 18) : ramp(t, e("automatic"), 18);
  const pull = mode === "ice" ? ramp(t, e("matter"), 18) : mode === "icefind" ? ramp(t, e("numbers"), 18) : mode === "pull" ? ramp(t, e("over"), 18) : mode === "startle" ? ramp(t, e("confusion"), 18) : 0;
  const zoom = 1.02 + 0.2 * push - 0.14 * pull + 0.02 * (t / end);
  const fx = mode === "ice" || mode === "icefind" ? CX - CH * 0.25 : mode === "stall" || mode === "pull" ? CX + 120 : CX;
  const cx = 960 + (fx - 960) * push * 0.5, cy = CY - 20 * push;
  // streamlines: y offsets, bent around the section, torn above it when stalled
  const rad = (aoa * Math.PI) / 180;
  const lines = Array.from({ length: 13 }, (_, i) => 220 + i * 52);
  const pathFor = (y0: number, k: number) => {
    const pts: string[] = [];
    const above = y0 < CY;
    for (let x = 0; x <= 1920; x += 24) {
      const d = (x - CX) / (CH * 0.7);
      const bump = Math.exp(-d * d) * (above ? -1 : 1) * 70 * Math.exp(-Math.abs(y0 - CY) / 180);
      const wash = x > CX ? -Math.tan(rad) * (x - CX) * 0.35 * Math.exp(-Math.abs(y0 - CY) / 260) * -1 : 0;
      const sep = above && torn > 0 && x > CX - 120 && Math.abs(y0 - CY) < 220 ? Math.sin(x * 0.03 + t * 0.4 + y0) * 26 * torn - 60 * torn * Math.min(1, (x - CX + 120) / 400) : 0;
      pts.push(`${pts.length ? "L" : "M"} ${x} ${y0 + bump + wash * (1 - torn * 0.5) + sep + (k * 0)}`);
    }
    return pts.join(" ");
  };
  const flowK = mode === "flow" ? ramp(t, e("flows"), 16) : 1;
  return (
    <Sheet t={t} zoom={zoom} cx={cx} cy={cy} html={<>
      <FlatTag t={t} tag="principle" at={0} />
      {P.chapter && <ChapterCard t={t} text={P.chapter} />}
    </>}>
      <g transform={`translate(${jolt} 0)`}>
        {dark > 0 && <rect x={-200} y={-200} width={2400} height={1500} fill="#05080c" opacity={0.55 * dark} />}
        {/* the oncoming air */}
        {lines.map((y0, i) => {
          const above = y0 < CY && Math.abs(y0 - CY) < 220;
          const col = above && torn > 0.3 ? tornColor : mode === "recover" && t >= e("grips") ? GREEN : ICE;
          return <path key={i} d={pathFor(y0, 0)} stroke={col} strokeWidth={4} fill="none" strokeDasharray="34 26" strokeDashoffset={-t * 9} opacity={0.75 * flowK} />;
        })}
        {/* swirls behind the top when the flow has torn off */}
        {torn > 0.05 && Array.from({ length: 7 }, (_, i) => {
          const life = ((t * 0.7 + i * 23) % 60) / 60;
          const x = CX + 80 + life * 900, y = CY - 120 - (i % 3) * 50 + Math.sin(life * 6 + i) * 20;
          return <g key={i} opacity={torn * (1 - life)}><path d={`M ${x} ${y} m -30 0 a 30 30 0 1 1 30 30 a 18 18 0 1 1 -16 -18`} stroke={RED} strokeWidth={5} fill="none" transform={`rotate(${t * 6 + i * 40} ${x} ${y})`} /></g>;
        })}
        {/* the section */}
        <g transform={`translate(${CX} ${CY}) rotate(${-aoa})`}>
          <path d={FOIL.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ") + " Z"} fill="#6c7782" stroke={INK} strokeWidth={6} />
          {mode === "flow" && <path d={FOIL.slice(0, 41).map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ")} stroke="#38d7ff" strokeWidth={10} fill="none" strokeDasharray={2400} strokeDashoffset={2400 * (1 - ramp(t, e("curved"), 20))} />}
          {ice > 0 && <path d={`M ${-CH * 0.25 + 4} ${-30} q ${-40 * ice} ${30} ${0} ${70} l ${18} ${-6} q ${-20 * ice} ${-26} ${-2} ${-58} z`} fill="#eaf7ff" stroke="#ffffff" strokeWidth={3} opacity={Math.min(1, ice * 1.5)} />}
          {ice > 0 && Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-CH * 0.25 - 14 * ice - (i % 3) * 8 * ice} cy={-28 + i * 9} r={6 * ice} fill="#ffffff" opacity={ice} />)}
          {/* the chord line, for the angle */}
          {(mode === "aoa" || mode === "slow" || mode === "pull" || mode === "ice" || mode === "startle") && <line x1={-CH * 0.45} y1={0} x2={CH * 0.95} y2={0} stroke={AMBER} strokeWidth={4} strokeDasharray="16 12" />}
        </g>
        {/* the oncoming-air line, the angle arc and the stall line */}
        {(mode === "aoa" || mode === "slow" || mode === "pull" || mode === "ice" || mode === "startle") && <g>
          <line x1={CX - CH * 0.45} y1={CY} x2={CX + CH * 0.95} y2={CY} stroke={DIM} strokeWidth={4} strokeDasharray="10 10" />
          <path d={`M ${CX + 500} ${CY} A 500 500 0 0 0 ${CX + 500 * Math.cos(rad)} ${CY - 500 * Math.sin(rad)}`} stroke={AMBER} strokeWidth={8} fill="none" opacity={mode === "aoa" ? ramp(t, e("angle"), 10) : 1} />
          {mode === "aoa" && <TypeText x={CX + 540} y={CY - 70} t={t} at={e("attack")} text="ANGLE OF ATTACK" size={40} color={AMBER} />}
        </g>}
        {(mode === "slow" || mode === "ice" || mode === "pull" || mode === "startle") && <g opacity={mode === "slow" ? ramp(t, e("edge"), 10) : 1}>
          <line x1={CX} y1={CY} x2={CX + 640 * Math.cos((stallLine * Math.PI) / 180)} y2={CY - 640 * Math.sin((stallLine * Math.PI) / 180)} stroke={RED} strokeWidth={7} />
          <text x={CX + 420 * Math.cos((stallLine * Math.PI) / 180)} y={CY - 420 * Math.sin((stallLine * Math.PI) / 180) - 24} fontFamily={MONO} fontWeight={700} fontSize={34} fill={RED}>STALL ANGLE</text>
        </g>}
        {/* lift */}
        <ArrowSvg x1={CX} y1={CY - 40} x2={CX} y2={CY - 40 - 330 * lift} k={mode === "flow" ? ramp(t, e("lift"), 12) : 1} color={lift < 0.45 ? RED : GREEN} w={18} />
        <TypeText x={CX + 30} y={CY - 60 - 330 * lift} t={t} at={mode === "flow" ? e("lift") : 0} text="LIFT" size={40} color={lift < 0.45 ? RED : GREEN} />
        {/* the speed dial (slow): needle only, no numbers */}
        {mode === "slow" && <g transform="translate(1500 250)">
          <circle cx={0} cy={0} r={120} fill="#0b0f14" stroke="#8b96a1" strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => { const a = (-120 + i * 30) * Math.PI / 180; return <line key={i} x1={Math.sin(a) * 96} y1={-Math.cos(a) * 96} x2={Math.sin(a) * 112} y2={-Math.cos(a) * 112} stroke={INK} strokeWidth={5} />; })}
          {(() => { const a = (90 - 180 * ramp(t, e("slow"), Math.max(30, e("bleeds") - e("slow") + 30))) * Math.PI / 180; return <line x1={0} y1={0} x2={Math.sin(a) * 92} y2={-Math.cos(a) * 92} stroke={AMBER} strokeWidth={9} strokeLinecap="round" />; })()}
          <text x={0} y={170} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={DIM}>AIRSPEED</text>
        </g>}
        {/* the recovery: thrust and a training card */}
        {mode === "recover" && <g>
          <ArrowSvg x1={CX - 700} y1={CY + 40} x2={CX - 700 + 360 * ramp(t, e("power"), 16)} y2={CY + 40} k={ramp(t, e("power"), 8)} color={GREEN} w={18} />
          <TypeText x={CX - 700} y={CY + 110} t={t} at={e("power")} text="POWER UP" size={36} color={GREEN} />
          <g transform="translate(1380 150)" opacity={ramp(t, e("trained"), 10)}>
            <rect x={0} y={0} width={400} height={210} rx={10} fill="#f4f1e8" stroke="#111" strokeWidth={4} />
            <text x={20} y={50} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#111">STALL WARNING:</text>
            <text x={20} y={110} fontFamily={MONO} fontWeight={700} fontSize={36} fill="#1a7a3a">{"· NOSE DOWN"}</text>
            <text x={20} y={164} fontFamily={MONO} fontWeight={700} fontSize={36} fill="#1a7a3a">{"· POWER UP"}</text>
          </g>
        </g>}
        {/* the pull against the training */}
        {(mode === "pull" || mode === "startle") && <g transform="translate(1380 140)">
          <rect x={0} y={0} width={420} height={130} rx={10} fill="rgba(8,12,18,0.88)" stroke={mode === "pull" && t >= e("opposite") ? RED : GREEN} strokeWidth={5} />
          <text x={24} y={52} fontFamily={MONO} fontWeight={700} fontSize={32} fill={INK}>{mode === "pull" ? "TRAINED: PUSH" : "SHOULD BE"}</text>
          <text x={24} y={108} fontFamily={ANTON} fontSize={52} fill={mode === "pull" && t >= e("opposite") ? RED : GREEN}>{mode === "pull" ? (t >= e("opposite") ? "DONE: PULL" : "NOSE DOWN") : "AUTOMATIC"}</text>
        </g>}
        {mode === "startle" && t >= e("confusion") && Array.from({ length: 5 }, (_, i) => {
          const a = t * 0.08 + (i * Math.PI * 2) / 5;
          return <ArrowSvg key={i} x1={CX + Math.cos(a) * 520} y1={CY + Math.sin(a) * 300} x2={CX + Math.cos(a + 0.5) * 520} y2={CY + Math.sin(a + 0.5) * 300} k={ramp(t, e("confusion"), 10)} color={AMBER} w={9} />;
        })}
        {mode === "startle" && <TypeText x={CX - 640} y={220} t={t} at={e("startle")} text="STARTLE · CONFUSION" size={44} color={AMBER} />}
        {mode === "icefind" && t >= e("numbers") && <g transform={`translate(1360 ${180 + 30 * (1 - ramp(t, e("numbers"), 12))})`} opacity={ramp(t, e("numbers"), 12)}>
          <rect x={0} y={0} width={120} height={360} fill="#1a2027" stroke="#8b96a1" strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={92} y={210 + i * 20} width={24} height={20} fill={i % 2 ? "#0b0b0b" : RED} />)}
          <path d="M 120 250 l 30 -18 l 0 36 z" fill="#38d7ff" />
          <TypeText x={180} y={180} t={t} at={e("numbers") + 6} text="THE SPEEDS" size={38} color={AMBER} />
        </g>}
        {mode === "icefind" && <TypeText x={CX - 640} y={210} t={t} at={e("barely")} text="ICE: MINIMAL EFFECT" size={44} color={ICE} />}
      </g>
      {mode === "stall" && <Stamp x={1460} y={260} t={t} at={e("stall")} text="STALL" size={80} />}
      {mode === "ice" && <Stamp x={1500} y={280} t={t} at={e("matter")} text="?" size={110} color={AMBER} rot={6} />}
      {mode === "ice" && <TypeText x={CX - 700} y={220} t={t} at={e("Ice")} text="ICE ON THE LEADING EDGE" size={40} color={ICE} />}
    </Sheet>
  );
};

export default Wing;
