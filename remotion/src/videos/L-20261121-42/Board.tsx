// Board (flat, the investigators' cause board on a dark wall under a lamp): cards pinned with red string.
// `params.shot`:
//  promise  five empty links; "STEEL?" and "WORKMANSHIP?" struck out (the NBS: no significant role); the links light; the middle one rings
//  four     four links (weak joint, phone call, detailer, review) shrink to pins; a thread to a walkway; a poster
//  recap    three cards light in turn; an empty space fills with the dance poster
//  score    the ending scorecard: each link stamped with what the report and the sources say; the question
// Stamps use the report's own words: the NBS found two contributing factors (the original connection and
// the rod change); the detailer and the review are "as reported" by ASCE.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { DisasterLookProvider, Texture } from "../../disaster/index";
import { Phone, ramp, sm, Stamp } from "./elev";
import { evs } from "./ui";

type Params = { shot?: string };
type E = Record<string, number>;
const MONO = "'Courier Prime', 'Courier New', monospace";

const Card: React.FC<{ x: number; y: number; w?: number; h?: number; title: string; sub?: string; k: number; lit?: number; rot?: number; strike?: number; tint?: string }> = ({ x, y, w = 340, h = 200, title, sub, k, lit = 0, rot = 0, strike = 0, tint = "#efe9dc" }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y - (1 - k) * 60}) rotate(${rot})`} opacity={k}>
      {lit > 0 && <rect x={-16} y={-16} width={w + 32} height={h + 32} rx={10} fill="#ffd84a" opacity={0.25 * lit} />}
      <rect x={6} y={10} width={w} height={h} fill="#000" opacity={0.4} />
      <rect width={w} height={h} fill={tint} />
      <circle cx={w / 2} cy={14} r={11} fill="#c0392b" />
      <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill="#1b2533">{title}</text>
      {sub && <text x={w / 2} y={h / 2 + 52} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill="#4a5666">{sub}</text>}
      {strike > 0 && <line x1={20} y1={h / 2 - 8} x2={20 + (w - 40) * strike} y2={h / 2 - 8} stroke="#c0392b" strokeWidth={10} />}
    </g>
  );
};

/** The rest of the investigators' wall: red string between pins, photos of the atrium, sticky notes, a
 * plan of the walkways, newspaper clippings. Drawn under the shot's own cards. */
const WallThings: React.FC = () => (
  <g>
    {([[130, 110, 380, 230], [1470, 100, 330, 220], [140, 760, 320, 170], [1500, 760, 300, 170]] as [number, number, number, number][]).map(([x, y, w, h], i) => (
      <g key={i} transform={`rotate(${i % 2 ? 3 : -3} ${x + w / 2} ${y + h / 2})`}>
        <rect x={x} y={y} width={w} height={h} fill="#f1ede2" />
        <rect x={x + 14} y={y + 14} width={w - 28} height={h - 48} fill={i % 2 ? "#3b4552" : "#556070"} />
        {Array.from({ length: 5 }, (_, k) => <line key={k} x1={x + 24} y1={y + 30 + k * ((h - 70) / 5)} x2={x + w - 24} y2={y + 30 + k * ((h - 70) / 5)} stroke="#c9d3df" strokeWidth={5} opacity={0.6} />)}
        {Array.from({ length: 3 }, (_, k) => <line key={`v${k}`} x1={x + 40 + k * (w - 80) / 2} y1={y + 24} x2={x + 40 + k * (w - 80) / 2} y2={y + h - 44} stroke="#9aa6b4" strokeWidth={3} />)}
        <circle cx={x + w / 2} cy={y + 8} r={10} fill="#c0392b" />
      </g>
    ))}
    {[[600, 120, "#ffe680"], [1220, 140, "#9fe0c0"], [640, 860, "#ffb3a7"], [1250, 870, "#ffe680"], [1000, 90, "#cfe0f4"]].map(([x, y, c], i) => (
      <g key={`s${i}`} transform={`rotate(${(i % 3) * 4 - 4} ${x} ${y})`}><rect x={x as number} y={y as number} width={150} height={130} fill={c as string} />{[0, 1, 2].map((k) => <line key={k} x1={(x as number) + 16} y1={(y as number) + 40 + k * 30} x2={(x as number) + 130 - k * 20} y2={(y as number) + 40 + k * 30} stroke="#555" strokeWidth={4} opacity={0.5} />)}</g>
    ))}
    <path d="M 320 120 L 670 130 L 1070 100 L 1290 150 L 1630 110" fill="none" stroke="#c0392b" strokeWidth={4} opacity={0.8} />
    <path d="M 300 850 L 710 870 L 1320 880 L 1650 850" fill="none" stroke="#c0392b" strokeWidth={4} opacity={0.8} />
  </g>
);

const Wall: React.FC<{ t: number; zoom: number; cx: number; cy: number; children: React.ReactNode; html?: React.ReactNode }> = ({ t, zoom, cx, cy, children, html }) => (
  <DisasterLookProvider value="night-grid">
    <AbsoluteFill style={{ background: "#1a1d22" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="bl" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor="#ffe2b8" stopOpacity="0.2" /><stop offset="1" stopColor="#000" stopOpacity="0.4" /></radialGradient>
        </defs>
        <g transform={`translate(960 540) scale(${Math.min(1.3, zoom * (1.012 + 0.012 * Math.sin(t / 70)))}) translate(${-cx - 18 * Math.sin(t / 55)} ${-cy - 10 * Math.sin(t / 80 + 1)})`}>
          <rect x={80} y={60} width={1760} height={900} fill="#6b4f36" />
          <rect x={100} y={80} width={1720} height={860} fill="#8a6a4a" />
          <WallThings />
          {Array.from({ length: 0 }, (_, i) => <circle key={i} cx={100 + ((i * 263.7) % 1720)} cy={80 + ((i * 137.3) % 860)} r={2 + (i % 4)} fill={i % 4 ? "#4a3424" : "#b08a62"} opacity={0.55} />)}
          {children}
        </g>
        <rect width={1920} height={1080} fill="url(#bl)" />
      </svg>
      {html}
      <Texture t={t} />
    </AbsoluteFill>
  </DisasterLookProvider>
);

const LINKS = ["WEAK JOINT", "ROD CHANGE", "DETAILER", "REVIEW", "SEAL"];

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const shot = (p.beat.params as Params).shot ?? "promise";
  let names: string[];
  let body: (e: E) => React.ReactNode;
  let cam: (e: E) => [number, number, number];
  if (shot === "promise") {
    names = ["why", "steel", "workmanship", "chain", "decisions", "phone"];
    cam = (e) => [1 + 0.25 * ramp(t, e.phone!, 20), 960, 600 - 40 * ramp(t, e.phone!, 20)];
    body = (e) => (
      <g>
        <Card x={260} y={140} title="STEEL?" k={ramp(t, e.steel! - 4, 8)} strike={ramp(t, e.steel! + 6, 8)} rot={-4} />
        <Card x={1320} y={140} title="WORKMANSHIP?" k={ramp(t, e.workmanship! - 4, 8)} strike={ramp(t, e.workmanship! + 6, 8)} rot={3} />
        {LINKS.map((_, i) => {
          const x = 230 + i * 300, y = 640;
          const k = ramp(t, e.why! + i * 3, 8);
          const lit = ramp(t, e.chain! + i * 4, 6);
          return (
            <g key={i} opacity={k}>
              {i < 4 && <line x1={x + 120} y1={y} x2={x + 300 - 120} y2={y} stroke="#c0392b" strokeWidth={6} />}
              <rect x={x - 110} y={y - 70} width={220} height={140} rx={70} fill="none" stroke={lit > 0 ? "#ffd84a" : "#d8d2c2"} strokeWidth={14} opacity={0.6 + 0.4 * lit} />
              {t >= e.decisions! + i * 3 && <circle cx={x} cy={y - 70} r={14} fill="#c0392b" />}
            </g>
          );
        })}
        {t >= e.phone! && <Phone x={830} y={660} t={t} k={1} ring={e.phone} s={0.9} />}
      </g>
    );
  } else if (shot === "four" || shot === "recap") {
    names = shot === "four" ? ["four", "small", "hanging", "party"] : ["weak", "doubled", "calculated", "missing", "crowd"];
    cam = (e) => [1 + 0.15 * ramp(t, shot === "four" ? e.party! : e.crowd!, 20), 960, 520];
    const cards = shot === "four"
      ? [["WEAK JOINT", "below code"], ["ROD CHANGE", "by phone"], ["DETAILER", "no calculation"], ["REVIEW", "not calculated"]]
      : [["WEAK JOINT", "below code"], ["ROD CHANGE", "load doubled"], ["REVIEW", "not calculated"]];
    body = (e) => {
      const at = shot === "four" ? [e.four!, e.four! + 6, e.four! + 12, e.four! + 18] : [e.weak!, e.doubled!, e.calculated!];
      const shrink = 0;
      const posterAt = shot === "four" ? e.party! : e.crowd!;
      return (
        <g>
          {cards.map(([a, b], i) => (
            <g key={i} transform={`translate(${200 + i * 400 + 170} 300) scale(${1 - 0.35 * shrink}) translate(${-170} 0)`}>
              <Card x={0} y={0} title={a!} sub={b} k={ramp(t, at[i]! - 4, 8)} lit={ramp(t, at[i]!, 6) * (1 - ramp(t, shot === "four" ? e.small! : at[i]! + 30, 10))} rot={(i % 2 ? 2 : -2)} />
            </g>
          ))}
          {shot === "four" && t >= e.hanging! && (
            <g>
              <line x1={960} y1={520} x2={960} y2={520 + 200 * ramp(t, e.hanging!, 12)} stroke="#c0392b" strokeWidth={5} />
              <g opacity={ramp(t, e.hanging! + 8, 8)} transform="translate(760 740)"><rect width={400} height={30} fill="#d8d2c2" /><line x1={0} y1={0} x2={400} y2={0} stroke="#1b2533" strokeWidth={6} /><text x={200} y={90} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill="#f4f8ff">THE WALKWAYS</text></g>
            </g>
          )}
          {shot === "recap" && t >= e.missing! && t < e.crowd! && <rect x={1420} y={600} width={340} height={260} fill="none" stroke="#d8d2c2" strokeWidth={6} strokeDasharray="20 14" />}
          {t >= posterAt && (
            <g transform={`translate(${shot === "four" ? 1440 : 1420} ${shot === "four" ? 620 : 600}) rotate(4) scale(${0.6 + 0.4 * sm((t - posterAt) / 8)})`}>
              <rect width={340} height={260} fill="#c0392b" /><rect x={14} y={14} width={312} height={232} fill="none" stroke="#ffd84a" strokeWidth={4} />
              <text x={170} y={110} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={64} fill="#ffd84a">DANCE</text>
              <text x={170} y={180} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill="#fff">IN THE ATRIUM</text>
            </g>
          )}
        </g>
      );
    };
  } else {
    names = ["link", "original", "phone", "detailer", "seal"];
    cam = (e) => [1 + 0.08 * ramp(t, e.seal!, 20), 960, 520];
    const rows: [string, string, string, string][] = [
      ["ORIGINAL JOINT", "below the building code", "FACTOR · NBS", "#ffb23e"],
      ["ROD CHANGE", "agreed by phone, as reported", "FACTOR · NBS", "#ff3b30"],
      ["DETAILER", "no calculation, as reported", "AS REPORTED", "#c9d6e8"],
      ["REVIEW AND SEAL", "spot checks only, as reported", "AS REPORTED", "#c9d6e8"],
    ];
    body = (e) => {
      const at = [e.original!, e.phone!, e.detailer!, e.seal!];
      return (
        <g>
          <g opacity={ramp(t, e.link! - 6, 8)}><rect x={600} y={110} width={720} height={84} rx={8} fill="#14171c" /><text x={960} y={170} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={50} letterSpacing={6} fill="#f4f8ff">THE CAUSE CHAIN</text></g>
          {rows.map(([a, b, v, c], i) => (
            <g key={a} opacity={ramp(t, (i === 0 ? e.link! : at[i - 1]!) + 2, 8)} transform={`translate(260 ${230 + i * 170})`}>
              <rect x={6} y={8} width={1400} height={140} fill="#000" opacity={0.35} />
              <rect width={1400} height={140} fill="#efe9dc" />
              <text x={40} y={66} fontFamily={MONO} fontWeight={700} fontSize={44} fill="#1b2533">{a}</text>
              <text x={40} y={116} fontFamily={MONO} fontWeight={700} fontSize={32} fill="#4a5666">{b}</text>
              <Stamp x={1150} y={72} t={t} at={at[i]!} text={v} color={c === "#c9d6e8" ? "#5a6676" : c} size={44} rot={-6} />
            </g>
          ))}
          {t >= e.seal! + 10 && <rect x={560} y={940} width={800 * ramp(t, e.seal! + 10, 14)} height={10} fill="#ffd84a" />}
        </g>
      );
    };
  }
  const e = evs(m, names);
  const [zoom, cx, cy] = cam(e);
  return <Wall t={t} zoom={zoom} cx={cx} cy={cy}>{body(e)}</Wall>;
};

export default Board;
