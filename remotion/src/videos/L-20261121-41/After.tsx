// After (2D blueprint): what changed. Two engineering licences slide onto the sheet on "engineers" and are
// stamped REVOKED on "licences"; the engineers' society's policy card slides in on "Society" with its year in
// yellow; "engineer of record" types on "record"; a line draws from the rule to a connection detail on
// "responsible", and the detail ticks green on "connection".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { MonoLabel, useDisasterLook } from "../../disaster/index";
import { DrawLine, Nut, ramp, Sheet, Stamp } from "./elev";

type Params = { fig?: { year?: string } };

const Licence: React.FC<{ x: number; y: number; k: number; rot: number }> = ({ x, y, k, rot }) => {
  const L = useDisasterLook();
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x - (1 - k) * 500} ${y}) rotate(${rot})`} opacity={k}>
      <rect x={-260} y={-150} width={520} height={300} rx={10} fill="#f4f1e6" stroke={L.line} strokeWidth={3} />
      <rect x={-230} y={-120} width={120} height={150} fill="#c9cfd8" />
      <text x={-90} y={-80} fontFamily={L.fonts.mono} fontWeight={700} fontSize={40} fill="#1d2b4a">PROFESSIONAL</text>
      <text x={-90} y={-44} fontFamily={L.fonts.mono} fontWeight={700} fontSize={40} fill="#1d2b4a">ENGINEER</text>
      <text x={-90} y={0} fontFamily={L.fonts.mono} fontSize={32} fill="#4a5568">STATE OF MISSOURI</text>
      <line x1={-230} y1={90} x2={230} y2={90} stroke="#9aa3ad" strokeWidth={3} />
    </g>
  );
};

const Inner: React.FC<{ t: number; ev: Record<string, number>; year: string }> = ({ t, ev, year }) => {
  const L = useDisasterLook();
  const card = ramp(t, ev.society!, 14);
  const tick = ramp(t, ev.connection!, 10);
  return (
    <g>
      <Licence x={430} y={330} k={ramp(t, 0, 10)} rot={-4} />
      <Licence x={470} y={720} k={ramp(t, 6, 10)} rot={3} />
      <Stamp x={470} y={350} t={t} at={ev.licences!} text="REVOKED" color={L.fail} size={76} rot={-14} />
      <Stamp x={500} y={740} t={t} at={ev.licences! + 6} text="REVOKED" color={L.fail} size={76} rot={-8} />
      {card > 0 && (
        <g opacity={card} transform={`translate(${(1 - card) * 300} 0)`}>
          <rect x={980} y={150} width={820} height={520} rx={12} fill={L.panel} stroke={L.label} strokeWidth={4} />
          <MonoLabel x={1020} y={230} t={t} at={ev.society} text="engineers' society" size={44} color={L.ink} />
          <text x={1020} y={330} fontFamily={L.fonts.value} fontSize={86} fill={L.label}>{year}</text>
          <MonoLabel x={1020} y={440} t={t} at={ev.record} text="the engineer of record" size={44} color={L.ink} />
          <MonoLabel x={1020} y={520} t={t} at={ev.responsible} text="is responsible for" size={44} color={L.ink} />
          <MonoLabel x={1020} y={600} t={t} at={ev.responsible! + 12} text="every connection" size={48} color={L.label} />
        </g>
      )}
      <DrawLine x1={1390} y1={680} x2={1390} y2={820} k={ramp(t, ev.responsible!, 14)} color={L.label} w={5} dash="14 10" />
      {t >= ev.responsible! + 6 && (
        <g>
          <rect x={1250} y={830} width={280} height={60} fill={L.solid} stroke={L.line} strokeWidth={4} />
          <line x1={1390} y1={820} x2={1390} y2={940} stroke={L.label} strokeWidth={9} />
          <Nut x={1390} y={894} k={ramp(t, ev.responsible! + 6, 8)} />
          {tick > 0 && (
            <g opacity={tick}>
              <circle cx={1610} cy={870} r={50} fill="none" stroke="#5fe08a" strokeWidth={8} />
              <path d={`M 1585 870 L 1603 890 L 1640 845`} fill="none" stroke="#5fe08a" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

const After: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const ev = { engineers: m.at("engineers", 4), licences: m.at("licences", 30), society: m.at("society", 70), record: m.at("every", 110), responsible: m.at("connection", 130), connection: m.at("job", 160) };
  const t = m.t;
  const right = ramp(t, ev.society, 30);
  return (
    <Sheet t={t} zoom={1 + 0.03 * (t / Math.max(1, m.end)) + 0 * right} cx={960} cy={540}>
      <Inner t={t} ev={ev} year={year} />
    </Sheet>
  );
};

export default After;
