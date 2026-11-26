// A flat drawing of the airliner for the thumbnails: the turboprop seen from the front three-quarter and below,
// banked: slim white fuselage, the high wing across the top with two engine nacelles and propeller discs, the
// T-tail; `red` paints the wing's top red (the stall). Also a snowy night town seen from above with lit
// windows, and the glow of a fire far off among the houses.
import React from "react";

export const BigPlane: React.FC<{ x: number; y: number; L: number; bank?: number; pitch?: number; red?: number }> = ({ x, y, L, bank = -30, pitch = 0, red = 0 }) => {
  const r = L * 0.075;
  const wingC = red > 0 ? `rgb(${Math.round(240)}, ${Math.round(220 - 170 * red)}, ${Math.round(210 - 170 * red)})` : "#e9edf1";
  return (
    <g transform={`translate(${x} ${y}) rotate(${bank}) skewY(${pitch})`}>
      {/* far wing (behind) */}
      <path d={`M ${-L * 0.05} ${-r * 0.9} L ${L * 0.06} ${-r * 0.9} L ${L * 0.02} ${-L * 0.42} L ${-L * 0.05} ${-L * 0.42} Z`} fill={wingC} stroke="#0e1216" strokeWidth={L * 0.006} />
      <rect x={L * 0.02} y={-L * 0.2} width={L * 0.12} height={r * 0.9} rx={r * 0.4} fill="#dfe4e9" stroke="#0e1216" strokeWidth={L * 0.005} />
      <ellipse cx={L * 0.15} cy={-L * 0.2 + r * 0.45} rx={L * 0.012} ry={L * 0.09} fill="#c9d3dc" opacity={0.55} />
      {/* fuselage */}
      <path d={`M ${L * 0.5} 0 Q ${L * 0.5} ${-r} ${L * 0.38} ${-r} L ${-L * 0.36} ${-r} Q ${-L * 0.48} ${-r * 0.9} ${-L * 0.5} ${-r * 0.4} L ${-L * 0.5} ${r * 0.1} Q ${-L * 0.42} ${r} ${-L * 0.3} ${r} L ${L * 0.38} ${r} Q ${L * 0.5} ${r} ${L * 0.5} 0 Z`} fill="#f1f3f5" stroke="#0e1216" strokeWidth={L * 0.007} />
      <rect x={-L * 0.32} y={-r * 0.1} width={L * 0.68} height={r * 0.22} fill="#2b4f7a" />
      {Array.from({ length: 18 }, (_, i) => <rect key={i} x={-L * 0.28 + i * L * 0.034} y={-r * 0.55} width={L * 0.016} height={r * 0.32} rx={L * 0.004} fill="#ffd58a" />)}
      <path d={`M ${L * 0.42} ${-r * 0.85} L ${L * 0.48} ${-r * 0.4} L ${L * 0.41} ${-r * 0.4} Z`} fill="#16202b" />
      {/* T-tail */}
      <path d={`M ${-L * 0.36} ${-r} L ${-L * 0.47} ${-L * 0.2} L ${-L * 0.52} ${-L * 0.2} L ${-L * 0.5} ${-r * 0.6} Z`} fill="#24446b" stroke="#0e1216" strokeWidth={L * 0.005} />
      <rect x={-L * 0.56} y={-L * 0.215} width={L * 0.14} height={L * 0.02} fill="#24446b" />
      {/* near wing (in front) and its engine */}
      <path d={`M ${-L * 0.05} ${-r * 0.7} L ${L * 0.07} ${-r * 0.7} L ${L * 0.03} ${L * 0.46} L ${-L * 0.04} ${L * 0.46} Z`} fill={wingC} stroke="#0e1216" strokeWidth={L * 0.006} />
      <rect x={L * 0.03} y={L * 0.15} width={L * 0.14} height={r} rx={r * 0.45} fill="#e3e8ec" stroke="#0e1216" strokeWidth={L * 0.005} />
      <ellipse cx={L * 0.18} cy={L * 0.15 + r * 0.5} rx={L * 0.014} ry={L * 0.1} fill="#c9d3dc" opacity={0.6} />
      <circle cx={L * 0.49} cy={r * 0.3} r={L * 0.008} fill="#fff4d6" />
    </g>
  );
};

/** A snowy town at night from above: rows of roofs with snow, lit windows, street lamps, a glow far off. */
export const NightTown: React.FC<{ w: number; h: number; horizon?: number; glow?: [number, number] }> = ({ w, h, horizon = 0.45, glow }) => {
  const rows = 9;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#0b1018" />
      <rect x={0} y={h * horizon} width={w} height={h * (1 - horizon)} fill="#1d252e" />
      {Array.from({ length: rows }, (_, j) => {
        const y = h * horizon + (h * (1 - horizon)) * ((j + 0.6) / rows) ** 1.4;
        const s = 0.25 + 1.1 * ((j + 1) / rows) ** 1.5;
        const n = Math.ceil(w / (110 * s)) + 1;
        return Array.from({ length: n }, (_, i) => {
          const x = i * 110 * s + (j % 2) * 55 * s - 40;
          return (
            <g key={`${j}-${i}`}>
              <path d={`M ${x} ${y} l ${40 * s} ${-26 * s} l ${40 * s} ${26 * s} z`} fill="#dfe6ec" />
              <rect x={x + 6 * s} y={y} width={68 * s} height={30 * s} fill="#3a4450" />
              {(i * 7 + j * 3) % 4 !== 0 && <rect x={x + 16 * s} y={y + 8 * s} width={14 * s} height={10 * s} fill="#ffc46b" />}
              {(i * 5 + j) % 3 === 0 && <rect x={x + 46 * s} y={y + 8 * s} width={14 * s} height={10 * s} fill="#ffc46b" />}
            </g>
          );
        });
      })}
      {glow && <g>
        <circle cx={glow[0]} cy={glow[1]} r={h * 0.22} fill="url(#pd-glow)" />
        <defs><radialGradient id="pd-glow"><stop offset="0" stopColor="#ffb35a" stopOpacity="0.95" /><stop offset="0.35" stopColor="#ff7a2a" stopOpacity="0.55" /><stop offset="1" stopColor="#ff7a2a" stopOpacity="0" /></radialGradient></defs>
      </g>}
      {Array.from({ length: 80 }, (_, i) => <line key={i} x1={(i * 263) % w} y1={(i * 149) % h} x2={(i * 263) % w - 6} y2={(i * 149) % h + 14} stroke="#ffffff" strokeWidth={3} opacity={0.5} />)}
    </g>
  );
};
export default BigPlane;
