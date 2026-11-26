// Law (flat): what changed after the crash, on the night sheet. Places: the steps of the US Capitol (the
// families, the law signed), a pilot's logbook on a desk (the hours the rule asks for; the two pilots' own
// hours against it), a flight simulator hall (stall training then and after, the rest rules). Modes
// (params.mode): families, act, hours, sim, stall, catch, meaning. Every figure comes from params.fig.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { AMBER, ANTON, ArrowSvg, ChapterCard, DIM, figOf, FlatTag, GREEN, ICE, INK, MONO, moments, numOf, Person, ramp, RED, Sheet, Stamp, TypeText } from "./ui";

type Params = { mode?: string; chapter?: string };

/** The Capitol: wings, columns, the drum and the dome, the statue on top; windows lit. */
const Capitol: React.FC<{ x: number; y: number; s?: number; lit?: number }> = ({ x, y, s = 1, lit = 0.6 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-620} y={-120} width={1240} height={120} fill="#c9cfd5" stroke="#5d6670" strokeWidth={4} />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-600 + i * 41} y={-100} width={18} height={30} fill="#ffd58a" opacity={lit * (i % 4 === 0 ? 0.4 : 1)} />)}
    <path d="M -220 -120 L 0 -190 L 220 -120 Z" fill="#dde2e7" stroke="#5d6670" strokeWidth={4} />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-200 + i * 50} y={-120} width={16} height={120} fill="#eef1f4" />)}
    <rect x={-170} y={-300} width={340} height={110} fill="#dde2e7" stroke="#5d6670" strokeWidth={4} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-160 + i * 28} y={-292} width={10} height={94} fill="#eef1f4" />)}
    <path d="M -150 -300 Q -150 -500 0 -520 Q 150 -500 150 -300 Z" fill="#eef1f4" stroke="#5d6670" strokeWidth={4} />
    {[-90, -30, 30, 90].map((dx) => <path key={dx} d={`M ${dx} -300 Q ${dx * 0.7} -440 0 -518`} stroke="#9aa3ad" strokeWidth={3} fill="none" />)}
    <rect x={-22} y={-580} width={44} height={60} fill="#dde2e7" stroke="#5d6670" strokeWidth={3} />
    <circle cx={0} cy={-596} r={14} fill="#9aa3ad" />
  </g>
);

/** A pilot's logbook, open, its hours counter rolling up; `dim` greys it. */
const Logbook: React.FC<{ x: number; y: number; label: string; value: string; k: number; dim?: number; color?: string; w?: number }> = ({ x, y, label, value, k, dim = 0, color = AMBER, w = 640 }) => (
  <g transform={`translate(${x} ${y})`} opacity={1 - 0.6 * dim}>
    <rect x={0} y={0} width={w} height={400} rx={12} fill="#1f3b5c" stroke="#0e1216" strokeWidth={6} />
    <rect x={16} y={14} width={w / 2 - 22} height={372} rx={6} fill="#f4f1e8" />
    <rect x={w / 2 + 6} y={14} width={w / 2 - 22} height={372} rx={6} fill="#f4f1e8" />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={30} y1={60 + i * 36} x2={w / 2 - 20} y2={60 + i * 36} stroke="#b9c2cc" strokeWidth={2} />)}
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={w / 2 + 20} y1={60 + i * 36} x2={w - 30} y2={60 + i * 36} stroke="#b9c2cc" strokeWidth={2} />)}
    <text x={30} y={54} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#1f3b5c">{label}</text>
    <text x={w / 2 + 20} y={210} fontFamily={MONO} fontWeight={700} fontSize={28} fill="#555">FLIGHT HOURS</text>
    <text x={w / 2 + 20} y={300} fontFamily={ANTON} fontSize={86} fill={color === AMBER ? "#b5651d" : color}>{countText(value, k)}</text>
  </g>
);

/** The simulator: a cockpit box on six legs in a dark hall, tilting nose up by `tilt` degrees. */
const Simulator: React.FC<{ x: number; y: number; tilt: number; t: number }> = ({ x, y, tilt, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-420} y={250} width={840} height={20} fill="#3a4652" />
    {[-260, -120, 0, 120, 260].map((dx, i) => <line key={i} x1={dx} y1={250} x2={dx * 0.5} y2={60 + Math.sin((tilt * Math.PI) / 180) * dx * -0.5} stroke="#8b96a1" strokeWidth={14} />)}
    <g transform={`rotate(${-tilt} 0 40)`}>
      <path d="M -300 -120 Q -300 -190 -200 -190 L 200 -190 Q 360 -170 360 -40 L 360 60 L -300 60 Z" fill="#e8edf2" stroke="#0e1216" strokeWidth={6} />
      <rect x={-290} y={-40} width={120} height={90} rx={6} fill="#c9cfd5" stroke="#0e1216" strokeWidth={4} />
      <path d="M -170 60 L -120 190 L -60 190" stroke="#8b96a1" strokeWidth={10} fill="none" />
      <path d="M 200 -150 L 300 -110 L 300 -50 L 200 -50 Z" fill="#16202b" />
      <rect x={-260} y={-120} width={380} height={30} fill="#3a6a9a" />
      <circle cx={-200} cy={20} r={10} fill={Math.floor(t / 10) % 2 ? "#ff3b30" : "#552222"} />
    </g>
  </g>
);

/** A training card with a tick (green) or a blank (red). */
const Card: React.FC<{ x: number; y: number; text: string; k: number; ok: boolean; on: number }> = ({ x, y, text, k, ok, on }) => (k <= 0 ? null : (
  <g transform={`translate(${x} ${y + (1 - k) * 30})`} opacity={k}>
    <rect x={0} y={0} width={420} height={96} rx={10} fill="rgba(8,12,18,0.9)" stroke={on > 0 ? (ok ? GREEN : RED) : DIM} strokeWidth={5} />
    <text x={24} y={62} fontFamily={MONO} fontWeight={700} fontSize={36} fill={INK}>{text}</text>
    <rect x={340} y={20} width={56} height={56} rx={8} fill="none" stroke={on > 0 ? (ok ? GREEN : RED) : DIM} strokeWidth={5} />
    {on > 0 && ok && <path d="M 352 48 l 14 14 l 22 -28" stroke={GREEN} strokeWidth={8} fill="none" opacity={on} />}
    {on > 0 && !ok && <path d="M 354 34 l 28 28 m 0 -28 l -28 28" stroke={RED} strokeWidth={8} opacity={on} />}
  </g>
));

const Law: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "act";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  const fig = (n: string) => figOf(p, n);
  const html = <>
    <FlatTag t={t} tag={mode === "families" || mode === "act" ? "as reported" : "general principle"} at={0} />
    {P.chapter && <ChapterCard t={t} text={P.chapter} />}
  </>;
  if (mode === "families" || mode === "act") {
    const dome = mode === "families" ? ramp(t, e("Washington"), 24) : 1;
    const z = mode === "act" ? ramp(t, e("signed"), 18) * (1 - ramp(t, e("Act"), 18) * 0.6) : ramp(t, e("regulators"), 18) * (1 - ramp(t, e("Washington"), 20));
    return (
      <Sheet t={t} zoom={1.02 + 0.12 * z + 0.02 * (t / end)} cx={960 + (mode === "act" ? 150 : -120) * z} cy={540 + (mode === "act" ? 80 : 60) * z} html={html} grid={false}>
        <rect x={-200} y={-200} width={2400} height={1500} fill="#101826" />
        <rect x={-200} y={600} width={2400} height={700} fill="#1b2430" />
        <g opacity={dome}><Capitol x={960} y={620} s={1} lit={mode === "act" ? 0.5 + 0.5 * ramp(t, e("Congress"), 20) : 0.4} /></g>
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={360 + i * 100} y={620 + (i % 3) * 18} width={80} height={14} fill="#c9cfd5" opacity={0.5} />)}
        {mode === "families" && Array.from({ length: 9 }, (_, i) => {
          const k = ramp(t, e("families") + i * 3, 10);
          return (
            <g key={i}>
              <Person x={300 + i * 150} y={860} s={1.6} color={["#8aa2b8", "#c9b79c", "#9fb59a", "#b0928a"][i % 4]} k={k} arm={70} />
              {k > 0 && <rect x={300 + i * 150 + 4} y={860 - 230} width={60} height={74} rx={4} fill="#f4f1e8" stroke="#333" strokeWidth={3} opacity={k} />}
            </g>
          );
        })}
        {mode === "families" && <g transform="translate(1600 200)" opacity={ramp(t, e("wait"), 10)}><circle cx={0} cy={0} r={70} fill="#f4f1e8" stroke="#333" strokeWidth={6} /><line x1={0} y1={0} x2={0} y2={-50} stroke="#111" strokeWidth={6} transform={`rotate(${t * 6})`} /><line x1={0} y1={0} x2={34} y2={0} stroke="#111" strokeWidth={8} transform={`rotate(${t * 0.5})`} /></g>}
        {mode === "families" && <g transform="translate(140 200)" opacity={ramp(t, e("regulators"), 10)}>{Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 6} y={-i * 14} width={220} height={150} fill="#f4f1e8" stroke="#555" strokeWidth={3} />)}</g>}
        {mode === "act" && <g transform="translate(1100 760)" opacity={ramp(t, e("Congress") - 6, 10)}>
          <rect x={0} y={0} width={680} height={60} fill="#5a3a24" />
          <g transform="translate(110 -230) rotate(-3)" opacity={ramp(t, e("Congress"), 10)}>
            <rect x={0} y={0} width={460} height={240} fill="#f4f1e8" stroke="#333" strokeWidth={4} />
            <TypeText x={24} y={52} t={t} at={e("Congress")} text="AIRLINE SAFETY AND" size={32} color="#111" />
            <TypeText x={24} y={92} t={t} at={e("Congress") + 10} text="FAA EXTENSION ACT" size={32} color="#111" />
            <path d={`M 40 200 q 40 -40 80 0 t 80 0 t 80 0`} stroke="#1f3b5c" strokeWidth={5} fill="none" strokeDasharray={400} strokeDashoffset={400 * (1 - ramp(t, e("signed"), 24))} />
            <g transform={`translate(${40 + 240 * ramp(t, e("signed"), 24)} ${170}) rotate(-35)`}><rect x={0} y={-6} width={110} height={12} rx={6} fill="#111" /></g>
          </g>
          <Stamp x={340} y={-260} t={t} at={e("Act")} text="SIGNED" color={GREEN} size={50} />
        </g>}
        {mode === "act" && <g transform="translate(200 160)" opacity={ramp(t, e("summer"), 10)}><rect x={0} y={0} width={360} height={150} rx={10} fill="rgba(8,12,18,0.9)" stroke={AMBER} strokeWidth={4} /><text x={24} y={46} fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>SIGNED · AUGUST</text><text x={24} y={124} fontFamily={ANTON} fontSize={72} fill={AMBER}>{fig("year")}</text></g>}
      </Sheet>
    );
  }
  if (mode === "sim" || mode === "stall") {
    const tilt = mode === "stall" ? 14 * ramp(t, e("train"), 20) : 6 * Math.sin(t * 0.05);
    const z = mode === "sim" ? ramp(t, e("warning"), 18) * (1 - 0.3 * ramp(t, e("happened"), 16)) : ramp(t, e("stalls"), 18) * (1 - ramp(t, e("rest"), 18));
    return (
      <Sheet t={t} zoom={1.02 + 0.18 * z + 0.02 * (t / end)} cx={960 + 120 * z} cy={520} html={html}>
        <rect x={-200} y={760} width={2400} height={600} fill="#141a20" />
        {[300, 960, 1620].map((x, i) => <g key={i}><line x1={x} y1={-200} x2={x} y2={60} stroke="#3a4652" strokeWidth={6} /><path d={`M ${x - 60} 60 L ${x + 60} 60 L ${x + 120} 140 L ${x - 120} 140 Z`} fill="#2a3138" /><path d={`M ${x - 120} 140 L ${x + 120} 140 L ${x + 300} 760 L ${x - 300} 760 Z`} fill="#ffe9c0" opacity={0.05} /></g>)}
        <Simulator x={620} y={500} tilt={tilt} t={t} />
        {mode === "sim" && <>
          <Card x={1260} y={230} text="STALL WARNING" k={ramp(t, e("warning") - 10, 10)} ok on={ramp(t, e("warning"), 8)} />
          <Card x={1260} y={350} text="FLY OUT OF IT" k={ramp(t, e("out") - 10, 10)} ok on={ramp(t, e("out"), 8)} />
          <Card x={1260} y={470} text="FULL STALL" k={ramp(t, e("happened") - 10, 10)} ok={false} on={ramp(t, e("happened"), 8)} />
          <TypeText x={1260} y={190} t={t} at={e("training")} text="AIRLINE TRAINING, THEN" size={34} color={DIM} />
        </>}
        {mode === "stall" && <>
          <Card x={1260} y={230} text="FULL STALL" k={ramp(t, e("train"), 10)} ok on={ramp(t, e("stalls"), 8)} />
          <g transform="translate(1260 360)" opacity={ramp(t, e("simulators"), 10)}><rect x={0} y={0} width={420} height={130} rx={10} fill="rgba(8,12,18,0.9)" stroke={AMBER} strokeWidth={4} /><text x={24} y={44} fontFamily={MONO} fontWeight={700} fontSize={28} fill={INK}>REQUIRED BY</text><text x={24} y={112} fontFamily={ANTON} fontSize={62} fill={AMBER}>{fig("year")}</text></g>
          <g transform="translate(1260 540)" opacity={ramp(t, e("rest"), 10)}>
            <rect x={0} y={60} width={250} height={70} rx={14} fill="#3a6a9a" /><rect x={0} y={40} width={80} height={40} rx={12} fill="#e8edf2" /><rect x={0} y={120} width={14} height={40} fill="#3a6a9a" /><rect x={236} y={120} width={14} height={40} fill="#3a6a9a" />
            <circle cx={360} cy={90} r={66} fill="#f4f1e8" stroke="#333" strokeWidth={5} />
            <path d={`M 360 90 L 360 34 A 56 56 0 ${ramp(t, e("breaks"), 30) > 0.5 ? 1 : 0} 1 ${360 + 56 * Math.sin(Math.PI * 2 * (0.15 + 0.55 * ramp(t, e("breaks"), 30)))} ${90 - 56 * Math.cos(Math.PI * 2 * (0.15 + 0.55 * ramp(t, e("breaks"), 30)))} Z`} fill={GREEN} opacity={0.7} />
            <TypeText x={0} y={20} t={t} at={e("rest")} text="REST RULES" size={32} color={ICE} />
          </g>
        </>}
      </Sheet>
    );
  }
  // the desk with the logbooks
  const min = fig("min") || fig("hours");
  if (mode === "hours") {
    const z = ramp(t, e("certificate"), 18);
    return (
      <Sheet t={t} zoom={1.02 + 0.16 * z + 0.02 * (t / end)} cx={960 + 160 * z} cy={480} html={html}>
        <rect x={-200} y={760} width={2400} height={600} fill="#4a3424" />
        <Logbook x={330} y={260} label="PILOT LOGBOOK" value={fig("hours")} k={ramp(t, e("rule") + 10, Math.max(30, e("hours") - e("rule")))} w={700} />
        <g opacity={ramp(t, e("officer"), 10)} transform="translate(420 230)"><path d="M 0 30 Q 90 -30 180 30 L 170 50 L 10 50 Z" fill="#1d2a3a" /><rect x={50} y={8} width={80} height={14} fill="#d8b04a" /></g>
        <g transform={`translate(${1100 + 120 * (1 - ramp(t, e("certificate"), 14))} 300)`} opacity={ramp(t, e("certificate"), 14)}>
          <rect x={0} y={0} width={560} height={300} rx={12} fill="#f4f1e8" stroke="#1f3b5c" strokeWidth={6} />
          <text x={28} y={60} fontFamily={MONO} fontWeight={700} fontSize={32} fill="#1f3b5c">AIRLINE TRANSPORT</text>
          <text x={28} y={102} fontFamily={MONO} fontWeight={700} fontSize={32} fill="#1f3b5c">PILOT CERTIFICATE</text>
          <rect x={28} y={140} width={130} height={130} fill="#c9cfd5" /><Person x={93} y={262} s={1.1} color="#1f3b5c" />
          <text x={180} y={200} fontFamily={MONO} fontWeight={700} fontSize={26} fill="#555">RULE OF</text>
          <text x={180} y={256} fontFamily={ANTON} fontSize={52} fill="#b5651d">{fig("year")}</text>
        </g>
      </Sheet>
    );
  }
  // catch: the two pilots' own logbooks, open on the desk, their counters rolling, against the new minimum
  const z = ramp(t, e("captain"), 18) * (1 - ramp(t, e("minimum"), 18));
  const lineK = ramp(t, e("minimum"), 14);
  return (
    <Sheet t={t} zoom={1.02 + 0.1 * z + 0.02 * (t / end)} cx={960} cy={520} html={html}>
      <rect x={-200} y={760} width={2400} height={600} fill="#4a3424" />
      <TypeText x={150} y={170} t={t} at={0} text="THE CREW'S OWN LOGBOOKS" size={44} color={INK} />
      <g opacity={ramp(t, e("stopped"), 12)}>
        <Logbook x={130} y={300} label="CAPTAIN" value={fig("cap")} k={ramp(t, e("captain"), 30)} w={760} />
        <Logbook x={1030} y={300} label="FIRST OFFICER" value={fig("fo")} k={ramp(t, e("officer"), 30)} w={760} />
      </g>
      {[0, 1].map((i) => t >= e("Both") && <rect key={i} x={130 + i * 900 - 10} y={290} width={780} height={420} rx={16} fill="none" stroke={GREEN} strokeWidth={8} opacity={ramp(t, e("Both"), 10)} />)}
      {lineK > 0 && <g transform="translate(560 740)" opacity={lineK}>
        <rect x={0} y={0} width={800} height={100} rx={12} fill="rgba(8,12,18,0.92)" stroke={RED} strokeWidth={6} />
        <text x={400} y={66} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={42} fill={RED}>{`NEW MINIMUM · ${min}`}</text>
      </g>}
      <Stamp x={1560} y={220} t={t} at={e("minimum") + 10} text="BOTH ABOVE IT" size={50} color={AMBER} />
    </Sheet>
  );
};

export default Law;
