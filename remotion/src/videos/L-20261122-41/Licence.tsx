// Licence (flat/doc): what changed. Modes (params.mode): revoke (two Missouri professional-engineer licences
// slide onto the hearing table and are stamped REVOKED; the charges type beneath), policy (the engineers'
// society's policy document slides in, its title and year stamp on), eor (its key line highlights and
// "connections" is underlined in red).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { MonoLabel, useDisasterLook } from "../../disaster/index";
import { ramp, Sheet, Stamp } from "./elev";
import { figOf, moments } from "./ui";

type Params = { mode?: string };

const Card: React.FC<{ x: number; y: number; k: number; rot: number }> = ({ x, y, k, rot }) => {
  const L = useDisasterLook();
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x - (1 - k) * 500} ${y}) rotate(${rot})`} opacity={k}>
      <rect x={-300} y={-170} width={600} height={340} rx={12} fill="#f1efe6" stroke={L.line} strokeWidth={3} />
      <rect x={-270} y={-140} width={130} height={170} fill="#c9cfd8" />
      <text x={-115} y={-95} fontFamily={L.fonts.mono} fontWeight={700} fontSize={44} fill="#1d2b2a">PROFESSIONAL</text>
      <text x={-115} y={-50} fontFamily={L.fonts.mono} fontWeight={700} fontSize={44} fill="#1d2b2a">ENGINEER</text>
      <text x={-115} y={0} fontFamily={L.fonts.mono} fontSize={34} fill="#4a5568">STATE OF MISSOURI</text>
      <line x1={-270} y1={100} x2={270} y2={100} stroke="#9aa3ad" strokeWidth={3} />
    </g>
  );
};

const Inner: React.FC<{ t: number; e: (n: string) => number; mode: string; year: string }> = ({ t, e, mode, year }) => {
  const L = useDisasterLook();
  if (mode === "revoke") {
    return (
      <g>
        <rect x={0} y={760} width={1920} height={320} fill="#1a140e" />
        <Card x={620} y={420} k={ramp(t, e("engineers"), 12)} rot={-4} />
        <Card x={1300} y={440} k={ramp(t, e("engineers") + 6, 12)} rot={3} />
        <Stamp x={640} y={430} t={t} at={e("revoked")} text="REVOKED" color={L.fail} size={96} rot={-14} />
        <Stamp x={1320} y={450} t={t} at={e("revoked") + 6} text="REVOKED" color={L.fail} size={96} rot={-8} />
        <MonoLabel x={960} y={720} t={t} at={e("negligence")} text="GROSS NEGLIGENCE · MISCONDUCT" size={52} anchor="middle" color={L.ink} box />
      </g>
    );
  }
  const card = mode === "policy" ? 0.35 + 0.65 * ramp(t, e("society"), 16) : 1;
  const hi = mode === "eor" ? ramp(t, e("engineer"), 24) : 0;
  const under = mode === "eor" ? ramp(t, e("connections"), 14) : 0;
  return (
    <g opacity={card} transform={`translate(${(1 - card) * 400} 0)`}>
      <rect x={380} y={90} width={1160} height={900} rx={10} fill="#f1efe6" />
      <text x={440} y={190} fontFamily={L.fonts.mono} fontWeight={700} fontSize={40} fill="#1d2b2a">AMERICAN SOCIETY OF CIVIL ENGINEERS</text>
      <text x={440} y={270} fontFamily={L.fonts.title} fontWeight={700} fontSize={52} fill="#1d2b2a">Authority and Responsibility for</text>
      <text x={440} y={335} fontFamily={L.fonts.title} fontWeight={700} fontSize={52} fill="#1d2b2a">Design of Steel Structures</text>
      <text x={1460} y={190} textAnchor="end" fontFamily={L.fonts.value} fontSize={70} fill="#b3261e" opacity={mode === "policy" ? ramp(t, e("policy"), 8) : 1}>{year}</text>
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={440} y={420 + i * 46} width={1000 - (i % 2) * 180} height={14} fill="#c9c6bb" />)}
      <rect x={430} y={622} width={1040 * hi} height={160} fill="#ffe14d" opacity={0.7} />
      <text x={440} y={680} fontFamily={L.fonts.body} fontSize={48} fill="#1d2b2a">The engineer of record is responsible</text>
      <text x={440} y={745} fontFamily={L.fonts.body} fontSize={48} fill="#1d2b2a">for all steel design, connections included.</text>
      <line x1={985} y1={760} x2={985 + 300 * under} y2={760} stroke="#d0251b" strokeWidth={7} strokeLinecap="round" />
      {Array.from({ length: 3 }, (_, i) => <rect key={i} x={440} y={830 + i * 46} width={940 - (i % 2) * 220} height={14} fill="#c9c6bb" />)}
      <text x={440} y={975} fontFamily={L.fonts.mono} fontSize={32} fill="#6b6b6b">ASCE Board of Direction policy (paraphrased)</text>
    </g>
  );
};

const Licence: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "revoke";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const close = mode === "eor" ? ramp(t, e("connections"), 30) : 0;
  return (
    <Sheet t={t} marks={Object.values(ev)} zoom={1.02 + 0.2 * close + 0.03 * (t / Math.max(1, m.end))} cx={960 + 100 * close} cy={540 + 160 * close}>
      <Inner t={t} e={e} mode={mode} year={figOf(p, "year")} />
    </Sheet>
  );
};

export default Licence;
