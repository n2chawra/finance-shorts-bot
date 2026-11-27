// Wall (flat, the safety board's finding as a cross-section of the carbon wall on a scope screen): five stacked
// carbon layers draw on ("investigators"), a scan line sweeps ("wall"), one patch turns amber and LIKELY DAMAGED
// stamps on ("damaged"), a gap opens between two layers ("layers"), spreads and turns red ("coming"), and the
// layers peel at the edge while the sea's arrows push into the gap ("apart").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, GREEN, ICE, moments, ramp, RED, Screen, TypeText, ANTON } from "./ui";

const X0 = 140, X1 = 900, Y0 = 600, LH = 118;        // the wall section: five layers from y0 down

const Wall: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const draw = ramp(t, e("investigators") - 4, 20);
  const scan = t >= e("wall") ? ((t - e("wall")) / 40) % 1.2 : -1;
  const patch = ramp(t, e("damaged"), 10);
  const gap = ramp(t, e("layers"), 14);
  const spread = ramp(t, e("coming"), 24);
  const peel = ramp(t, e("apart"), 20);
  const gx0 = 470 - (200 + 180 * spread) * gap, gx1 = 560 + (220 + 200 * spread) * gap;
  const open = 34 * gap + 20 * spread;
  // camera: medium on the wall, close on the patch, then a pan to the peeling edge (same size)
  const zc = ramp(t, e("damaged"), 16);
  const zoom = 1 + 0.14 * zc + 0.01 * (t / Math.max(30, m.end));
  const cx = 540 + 30 * peel, cy = 820 + 40 * zc;
  return (
    <Screen t={t} zoom={zoom} cx={cx} cy={cy} tag="reported" tagSub="NTSB: likely damaged after an earlier dive">
      <TypeText x={X0} y={420} t={t} at={e("investigators")} text="SAFETY BOARD FINDING" size={52} color={AMBER} />
      <TypeText x={X0} y={530} t={t} at={e("investigators") + 6} text="OUTSIDE · THE SEA" size={46} color={ICE} />
      <TypeText x={X0} y={Y0 + 5 * LH + open + 90} t={t} at={e("investigators") + 10} text="INSIDE · THE CABIN" size={46} color={ICE} />
      {Array.from({ length: 5 }, (_, i) => {
        const below = i >= 2 ? open : 0;
        const y = Y0 + i * LH + below;
        const lift = i === 1 ? -peel * 40 : 0;
        return (
          <g key={i} opacity={Math.max(0, Math.min(1, draw * 5 - i))}>
            <path d={`M ${X0} ${y} L ${X1 - (i === 1 ? 60 * peel : 0)} ${y + lift} L ${X1} ${y + LH - 6 + lift * 0.4} L ${X0} ${y + LH - 6} Z`} fill={i % 2 ? "#1c2228" : "#22282f"} stroke={GREEN} strokeWidth={3} />
            {Array.from({ length: 14 }, (_, j) => <line key={j} x1={X0 + 30 + j * 60} y1={y + 18} x2={X0 + 50 + j * 60} y2={y + LH - 24} stroke="#3a434c" strokeWidth={5} />)}
          </g>
        );
      })}
      {/* the delamination gap between layers two and three */}
      {gap > 0 && <rect x={gx0} y={Y0 + 2 * LH - 6} width={gx1 - gx0} height={open + 6} fill={spread > 0.3 ? RED : AMBER} opacity={0.75 + 0.2 * Math.sin(t * 0.5)} />}
      {/* the damaged patch */}
      {patch > 0 && <rect x={420} y={Y0 + LH} width={200} height={LH * 2} fill={AMBER} opacity={0.35 * patch} stroke={AMBER} strokeWidth={6} />}
      {patch > 0 && (
        <g transform={`translate(560 ${Y0 - 120}) rotate(-6) scale(${1.6 - 0.6 * patch})`} opacity={patch}>
          <rect x={-260} y={-62} width={520} height={104} rx={10} fill="rgba(2,10,6,0.9)" stroke={RED} strokeWidth={7} />
          <text x={0} y={22} textAnchor="middle" fontFamily={ANTON} fontSize={72} fill={RED}>LIKELY DAMAGED</text>
        </g>
      )}
      {/* the scan line */}
      {scan >= 0 && scan <= 1 && <rect x={X0 + (X1 - X0) * scan} y={Y0 - 20} width={10} height={5 * LH + open + 40} fill={GREEN} opacity={0.7} />}
      {/* the sea pushing into the gap */}
      {Array.from({ length: 3 }, (_, i) => {
        const k = ramp(t, e("apart") + i * 5, 12);
        if (k <= 0) return null;
        const x = X1 + 40 - 30 * k, y = Y0 + 2 * LH + open / 2 - 50 + i * 50;
        return (
          <g key={i} opacity={k}>
            <line x1={x + 90} y1={y} x2={x} y2={y} stroke={ICE} strokeWidth={10} strokeLinecap="round" />
            <path d={`M ${x - 20} ${y} L ${x + 8} ${y - 16} L ${x + 8} ${y + 16} Z`} fill={ICE} />
          </g>
        );
      })}
    </Screen>
  );
};

export default Wall;
