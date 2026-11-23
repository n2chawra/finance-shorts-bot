// Props for the airline-fare Short (v-20261123-01): a jet (no airline's livery or logo: the figures are the whole
// industry's, IATA), a split-flap departures board, a boarding pass, an airline seat, a fuel truck, coins, Rohan.
import React from "react";
import { Ball, Block, Glow, INK, STROKE, Txt, type Motion } from "../../flat/kit";
import { Char, type FaceKind } from "../../flat/cast";

export const SKY_DAWN = "#f6b98a";

/** Rohan, our viewer with a ticket. */
export const Rohan: React.FC<{ x: number; y: number; s: number; m: Motion; face?: FaceKind; armL?: [number, number]; armR?: [number, number]; look?: [number, number]; sit?: boolean; back?: boolean; holdR?: (h: [number, number]) => React.ReactNode; holdL?: (h: [number, number]) => React.ReactNode }> = ({ x, y, s, m, face = "neutral", armL, armR, look, sit, back, holdR, holdL }) => (
  <Char x={x} y={y + m.wave(62, 3)} s={s} who="rohan" face={face} armL={armL} armR={armR} look={look} sit={sit} back={back} holdR={holdR} holdL={holdL} />
);

/** A generic white airliner seen from the side, nose to the right. (x, y) = the middle of the fuselage; w = length. */
export const Jet: React.FC<{ x: number; y: number; w: number; tilt?: number; flip?: boolean; windows?: boolean }> = ({ x, y, w, tilt = 0, flip = false, windows = true }) => {
  const h = w * 0.13;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${flip ? -1 : 1} 1)`}>
      {/* far wing */}
      <path d={`M ${-w * 0.05} ${-h * 0.2} L ${-w * 0.22} ${-h * 1.6} L ${-w * 0.12} ${-h * 1.6} L ${w * 0.12} ${-h * 0.2} Z`} fill="#c9d3e0" stroke={INK} strokeWidth={STROKE * 0.8} strokeLinejoin="round" />
      {/* tail fin */}
      <path d={`M ${-w * 0.42} ${-h * 0.3} L ${-w * 0.5} ${-h * 2.1} L ${-w * 0.4} ${-h * 2.1} L ${-w * 0.28} ${-h * 0.4} Z`} fill="#3d6fd1" stroke={INK} strokeWidth={STROKE * 0.8} strokeLinejoin="round" />
      {/* body */}
      <path d={`M ${-w * 0.5} ${-h * 0.35} Q ${-w * 0.5} ${-h * 0.5} ${-w * 0.42} ${-h * 0.5} L ${w * 0.36} ${-h * 0.5} Q ${w * 0.5} ${-h * 0.45} ${w * 0.5} 0 Q ${w * 0.5} ${h * 0.5} ${w * 0.36} ${h * 0.5} L ${-w * 0.38} ${h * 0.5} Q ${-w * 0.48} ${h * 0.4} ${-w * 0.5} ${-h * 0.35} Z`}
        fill="#f4f6fa" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={`M ${-w * 0.42} ${h * 0.18} L ${w * 0.48} ${h * 0.18}`} stroke="#3d6fd1" strokeWidth={h * 0.16} />
      {/* cockpit */}
      <path d={`M ${w * 0.4} ${-h * 0.32} L ${w * 0.47} ${-h * 0.2} L ${w * 0.4} ${-h * 0.15} Z`} fill="#26324a" />
      {windows ? Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={-w * 0.32 + i * w * 0.043} y={-h * 0.22} width={w * 0.018} height={h * 0.2} rx={w * 0.008} fill="#26324a" />
      )) : null}
      {/* near wing and engine */}
      <path d={`M ${-w * 0.08} ${h * 0.1} L ${-w * 0.26} ${h * 1.7} L ${-w * 0.14} ${h * 1.7} L ${w * 0.14} ${h * 0.1} Z`} fill="#dde4ee" stroke={INK} strokeWidth={STROKE * 0.8} strokeLinejoin="round" />
      <Block x={-w * 0.07} y={h * 0.55} w={w * 0.16} h={h * 0.5} r={h * 0.25} fill="#b9c3d2" />
    </g>
  );
};

/** A split-flap departures board. `rows` are short destination words (fine print), `flip` 0..1 runs the flaps.
 * The big counter line carries `value` under `label`. Top-left at (x, y). */
export const DepBoard: React.FC<{ x: number; y: number; w: number; h: number; m: Motion; flip: number; label: string; value: string; rows: string[] }> = ({ x, y, w, h, m, flip, label, value, rows }) => (
  <g>
    <Glow x={x + w / 2} y={y + h / 2} r={w * 0.7} color="#ffd36b" o={0.18} />
    <Block x={x} y={y} w={w} h={h} fill="#151a26" r={14} shadow={false} />
    <Txt x={x + w / 2} y={y + 58} size={50} fill="#ffd36b" weight={800}>DEPARTURES</Txt>
    {rows.map((r, i) => {
      const k = Math.max(0, Math.min(1, flip * rows.length - i));
      const ry = y + 120 + i * 62;
      return (
        <g key={i}>
          <rect x={x + 30} y={ry} width={w - 60} height={52} rx={6} fill="#232a3a" />
          <rect x={x + 30} y={ry + 26 - 26 * Math.abs(Math.cos(k * Math.PI))} width={w - 60} height={2} fill="#0b0e15" />
          <Txt x={x + 54} y={ry + 27} size={32} fill={k > 0.5 ? "#f2f2f2" : "#6f7890"} anchor="start" deco>{r}</Txt>
          <Txt x={x + w - 54} y={ry + 27} size={30} fill={k > 0.5 ? "#7dff9e" : "#6f7890"} anchor="end" deco>{k > 0.5 ? "BOARDING" : "------"}</Txt>
        </g>
      );
    })}
    <rect x={x + 30} y={y + h - 190} width={w - 60} height={160} rx={10} fill="#0b0e15" stroke="#ffd36b" strokeWidth={4} />
    <Txt x={x + w / 2} y={y + h - 150} size={44} fill="#ffd36b" weight={700}>{label}</Txt>
    <Txt x={x + w / 2} y={y + h - 80} size={78} fill="#ffffff" glow="#ffd36b">{value}</Txt>
    <circle cx={x + w - 40} cy={y + 40} r={9} fill={m.t % 30 < 15 ? "#ff5a5a" : "#5a2020"} />
  </g>
);

/** A boarding pass, centre (x, y), width w. */
export const Pass: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = 0 }) => {
  const h = w * 0.42;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <rect x={x - w / 2 + 6} y={y - h / 2 + 8} width={w} height={h} rx={14} fill="#000" opacity={0.25} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h * 0.28} rx={14} fill="#3d6fd1" />
      <Txt x={x - w * 0.28} y={y - h * 0.36} size={h * 0.15} fill="#ffffff" deco>BOARDING PASS</Txt>
      <line x1={x + w * 0.22} y1={y - h / 2 + 6} x2={x + w * 0.22} y2={y + h / 2 - 6} stroke="#9aa3b5" strokeWidth={4} strokeDasharray="10 8" />
      {[0, 1, 2].map((i) => <rect key={i} x={x - w * 0.42} y={y - h * 0.08 + i * h * 0.16} width={w * (0.5 - i * 0.1)} height={h * 0.08} rx={4} fill="#c4cad6" />)}
      {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={x + w * 0.27 + i * w * 0.022} y={y - h * 0.05} width={i % 2 ? w * 0.008 : w * 0.014} height={h * 0.4} fill={INK} />)}
    </g>
  );
};

/** An airline seat seen three-quarter from the front: centre of the cushion at (x, y), scale s (1 = about 300 px tall). */
export const Seat: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#3d6fd1" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Block x={-110} y={-300} w={220} h={290} r={40} fill={color} />
    <Block x={-80} y={-330} w={160} h={70} r={24} fill="#e9eef6" />
    <Block x={-130} y={-30} w={260} h={80} r={22} fill={color} shadow="bottom" />
    <Block x={-150} y={-110} w={40} h={130} r={12} fill="#2a2f3e" />
    <Block x={110} y={-110} w={40} h={130} r={12} fill="#2a2f3e" />
    <rect x={-90} y={50} width={24} height={110} fill="#5b6275" stroke={INK} strokeWidth={5} />
    <rect x={66} y={50} width={24} height={110} fill="#5b6275" stroke={INK} strokeWidth={5} />
  </g>
);

/** A fuel truck, facing left, the hose end at (x - 40, y - 200). Bottom of the wheels at y. */
export const FuelTruck: React.FC<{ x: number; y: number; m: Motion; pump: number }> = ({ x, y, m, pump }) => (
  <g>
    <Block x={x} y={y - 260} w={420} h={170} r={40} fill="#e4e8ef" />
    <Txt x={x + 210} y={y - 175} size={52} fill="#c8102e">FUEL</Txt>
    <Block x={x - 150} y={y - 230} w={160} h={140} r={18} fill="#c8102e" />
    <rect x={x - 130} y={y - 210} width={90} height={60} rx={8} fill="#26324a" />
    <Ball x={x - 60} y={y - 40} r={44} fill="#2a2f3e" />
    <Ball x={x + 120} y={y - 40} r={44} fill="#2a2f3e" />
    <Ball x={x + 330} y={y - 40} r={44} fill="#2a2f3e" />
    <path d={`M ${x + 20} ${y - 120} C ${x - 120} ${y - 120} ${x - 160} ${y - 300 + m.wave(20, 4 * pump)} ${x - 260} ${y - 380}`} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
    <path d={`M ${x + 20} ${y - 120} C ${x - 120} ${y - 120} ${x - 160} ${y - 300 + m.wave(20, 4 * pump)} ${x - 260} ${y - 380}`} fill="none" stroke="#3a3f50" strokeWidth={14} strokeLinecap="round" />
  </g>
);

/** Coins flying from a to b as k goes 0..1, n of them, arcing. */
export const CoinFlight: React.FC<{ a: [number, number]; b: [number, number]; k: number; n?: number; r?: number; arc?: number }> = ({ a, b, k, n = 5, r = 26, arc = 160 }) => {
  if (k <= 0 || k >= 1.4) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const q = Math.max(0, Math.min(1, k * 1.4 - i * 0.08));
        if (q <= 0 || q >= 1) return null;
        const x = a[0] + (b[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * q - Math.sin(q * Math.PI) * arc;
        return <g key={i}><circle cx={x} cy={y} r={r} fill="#f5c542" stroke={INK} strokeWidth={4} /><circle cx={x} cy={y} r={r * 0.6} fill="none" stroke="#ffe08a" strokeWidth={4} /></g>;
      })}
    </g>
  );
};

/** A paper receipt with a figure, top-centre at (x, y); `k` 0..1 prints it out. `tear` 0..1 rips it in half. */
export const Receipt: React.FC<{ x: number; y: number; w: number; k: number; label: string; value: string; tear?: number }> = ({ x, y, w, k, label, value, tear = 0 }) => {
  const h = 300 * Math.max(0, Math.min(1, k));
  if (h <= 1) return null;
  const half = (side: -1 | 1) => (
    <g transform={`translate(${side * tear * 90} ${side === 1 ? tear * 260 : 0}) rotate(${side * tear * 18} ${x} ${y + h / 2})`} opacity={side === 1 ? 1 - tear * 0.7 : 1}>
      <clipPath id={`rc-${side}-${Math.round(x)}`}><rect x={side === -1 ? x - w / 2 - 20 : x} y={y - 20} width={w / 2 + 20} height={h + 60} /></clipPath>
      <g clipPath={`url(#rc-${side}-${Math.round(x)})`}>
        <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2} ${y + h} ${Array.from({ length: 10 }).map((_, i) => `L ${x + w / 2 - (i + 0.5) * w / 10} ${y + h + (i % 2 ? 0 : 14)}`).join(" ")} L ${x - w / 2} ${y + h} Z`}
          fill="#fbfaf4" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        {h > 120 ? <Txt x={x} y={y + 60} size={44} fill="#5a5f70" weight={700}>{label}</Txt> : null}
        {h > 200 ? <Txt x={x} y={y + 170} size={96} fill={INK}>{value}</Txt> : null}
      </g>
    </g>
  );
  return <g>{half(-1)}{half(1)}</g>;
};
export default { Rohan, Jet, DepBoard, Pass, Seat, FuelTruck, CoinFlight, Receipt };
