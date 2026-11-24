// Flaw: "The flaw was its sides. Solid steel plates, like a wall, so the wind could not pass through the deck."
// A general-principle cross-section on archive paper: the deck cut through, roadway on top ("flaw"); both sides
// light amber ("sides"); the solid plate girder draws on with its label ("plates"); a brick-wall hatch flashes over
// each plate ("wall"); wind streamlines arrive from the left and pile against the plate ("wind"); they are forced
// over and under the deck, swirls peeling off behind it ("through").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { MonoLabel } from "../../disaster/index";
import { AMBER, CREAM, Flat, GraphPaper, k01, RED, sm } from "./World";

const INK = "#e6d6b0";

const Flaw: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const sides = m.at("solid", 20), plates = m.at("plates", 45), wall = m.at("wall", 70), wind = m.at("wind", 90), through = m.at("through", 120);
  const draw = k01((t - plates) / 14);
  const amber = k01((t - sides) / 10);
  const flash = Math.max(0, 1 - Math.abs(t - wall - 8) / 14);
  const flow = k01((t - wind) / 12);
  const div = sm((t - through) / 18);
  const zoom = 1 + 0.15 * sm((t - plates) / 20) - 0.1 * sm((t - wind) / 20);
  // the section: roadway from x 300 to 780 at y 860; plates 300/780 from y 860 to 1080
  const L = 300, R = 780, top = 860, bot = 1080;
  const plateCol = amber > 0 ? AMBER : INK;
  const lines = Array.from({ length: 7 }, (_, i) => 720 + i * 75);
  return (
    <Flat t={t} tag="general principle">
      <GraphPaper />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={zoom} cx={540} cy={960}>
          {/* wind streamlines: straight from the left, then bent over and under the deck once it can't pass */}
          {lines.map((y, i) => {
            const mid = (top + bot) / 2;
            const hitting = y > top - 30 && y < bot + 30;
            const bend = hitting ? (y < mid ? top - 70 - (mid - y) * 0.3 : bot + 70 + (y - mid) * 0.3) : y;
            const yy = y + (bend - y) * div;
            const x1 = -100 + 900 * flow;
            const d = hitting
              ? `M -100 ${y} L ${L - 60} ${y} Q ${L - 10} ${y} ${L + 40} ${yy} L ${R + 80} ${yy} Q ${R + 180} ${yy} ${1180} ${y}`
              : `M -100 ${y} L 1180 ${y}`;
            return (
              <path key={i} d={d} fill="none" stroke={hitting ? "#bfe3dc" : "#9cc6bf"} strokeWidth={6} strokeDasharray="34 22"
                strokeDashoffset={-t * 6} opacity={flow} clipPath={undefined} style={{ strokeLinecap: "round" }}
                pathLength={1000} strokeOpacity={x1 > 0 ? 0.9 : 0.4} />
            );
          })}
          {/* swirls peeling off behind the deck */}
          {div > 0 ? [0, 1, 2].map((k) => {
            const x = R + 90 + ((t * 4 + k * 110) % 330);
            const y = (k % 2 ? top + 40 : bot - 40);
            return <circle key={k} cx={x} cy={y} r={26 + 10 * k} fill="none" stroke="#bfe3dc" strokeWidth={6} strokeDasharray="60 30"
              transform={`rotate(${t * 9 * (k % 2 ? -1 : 1)} ${x} ${y})`} opacity={div} />;
          }) : null}
          <g transform="translate(540 970) scale(1.7) translate(-540 -970)">
          {/* the deck: roadway slab, the two plate girders */}
          <rect x={L - 20} y={top - 30} width={R - L + 40} height={30} fill="#4a4640" stroke={INK} strokeWidth={5} />
          <line x1={L + 40} y1={top - 34} x2={R - 40} y2={top - 34} stroke={CREAM} strokeWidth={3} strokeDasharray="20 16" />
          {[L, R].map((x) => (
            <g key={x}>
              <rect x={x - 14} y={top} width={28} height={bot - top} fill={draw > 0 ? plateCol : "#8c8576"} stroke={INK} strokeWidth={4} />
              <rect x={x - 34} y={top} width={68} height={12} fill={plateCol} />
              <rect x={x - 34} y={bot - 12} width={68} height={12} fill={plateCol} />
              {flash > 0 ? (
                <g opacity={flash}>
                  {[0, 1, 2, 3, 4, 5].map((r) => <line key={r} x1={x - 40} y1={top + 18 + r * 36} x2={x + 40} y2={top + 18 + r * 36} stroke={RED} strokeWidth={5} />)}
                  {[0, 1, 2, 3, 4, 5].map((r) => <line key={`v${r}`} x1={x + (r % 2 ? -10 : 12)} y1={top + 18 + r * 36} x2={x + (r % 2 ? -10 : 12)} y2={top + 54 + r * 36} stroke={RED} strokeWidth={5} />)}
                </g>
              ) : null}
            </g>
          ))}
          </g>
          <MonoLabel t={t} at={0} x={540} y={600} text="DECK, CUT THROUGH" size={50} color={CREAM} anchor="middle" />
          <MonoLabel t={t} at={plates} x={540} y={1250} text="SOLID PLATE GIRDER" size={52} color={AMBER} anchor="middle" />
          {t >= wall ? <MonoLabel t={t} at={wall} x={540} y={1320} text="= A WALL" size={52} color={RED} anchor="middle" /> : null}
          {t >= wind ? <MonoLabel t={t} at={wind} x={60} y={680} text="WIND" size={56} color="#bfe3dc" /> : null}
        </View>
      </svg>
    </Flat>
  );
};
export default Flaw;
