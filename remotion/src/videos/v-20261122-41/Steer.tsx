// Steer: "A rudder steers by throwing the propeller's water to one side. So what does a stuck one do?"
// A plan view of the stern from above (a general-principle diagram): the hull outline and the rudder marked
// ("rudder"); the rudder angles over ("steers"); water streams from the propeller in arrows ("propeller's");
// the stream bends to one side, a force arrow pushes the stern the other way and the bow arrow turns ("side");
// the rudder locks over in amber and the arrows keep pushing ("stuck").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { Arrow, MonoLabel } from "../../disaster/index";
import { AMBER, CREAM, Flat, RED } from "./World";

const INK = "#cfd8e6";

const Steer: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const steers = m.at("throws", 10), prop = m.at("propeller's", 24), side = m.at("side", 44), stuck = m.at("stuck", 80);
  const draw = m.lerp([0, 14], [0, 1]);
  const ang = m.lerp([steers, steers + 12], [0, 32]);
  const locked = t >= stuck;
  const turn = m.lerp([side, side + 30], [0, 1]);
  const flow = (i: number) => ((t * 6 + i * 70) % 420);
  // the stern at the bottom, the bow at the top of the frame
  const cx = 540, sternY = 1000, bowY = 420, beam = 300;
  const rx = cx, ry = sternY + 40;
  const a = (ang * Math.PI) / 180;
  const tipX = rx + Math.sin(a) * 150, tipY = ry + Math.cos(a) * 150;
  return (
    <Flat t={t} tag="general principle">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={m.lerp([0, m.end], [1.0, 1.08])} cx={540} cy={m.lerp([0, m.end], [820, 840])}>
          <g transform={`rotate(${8 * turn} ${cx} ${(sternY + bowY) / 2})`}>
            {/* the hull in plan */}
            <path d={`M${cx - beam / 2},${sternY} L${cx - beam / 2},${bowY + 220} Q${cx - beam / 2},${bowY} ${cx},${bowY - 40} Q${cx + beam / 2},${bowY} ${cx + beam / 2},${bowY + 220} L${cx + beam / 2},${sternY} Z`}
              fill="rgba(30,40,52,0.85)" stroke={INK} strokeWidth={7} strokeDasharray={3200} strokeDashoffset={3200 * (1 - draw)} />
            <MonoLabel t={t} at={0} x={cx} y={bowY + 230} text="TANKER" size={50} color={CREAM} anchor="middle" />
            {/* the propeller */}
            <rect x={cx - 60} y={sternY - 8} width={120} height={22} rx={8} fill={INK} />
            {/* the rudder blade, hinged at its leading edge */}
            <line x1={rx} y1={ry} x2={tipX} y2={tipY} stroke={locked ? AMBER : CREAM} strokeWidth={26} strokeLinecap="round" />
            <circle cx={rx} cy={ry} r={14} fill={INK} />
            {/* the bow arrow */}
            <Arrow x1={cx} y1={bowY - 60} x2={cx + 200 * turn} y2={bowY - 160 + 40 * turn} k={turn > 0.02 ? 1 : 0} color={AMBER} w={12} />
          </g>
          {/* the propeller's water: arrows streaming aft, bent to one side by the blade */}
          {t >= prop ? Array.from({ length: 6 }, (_, i) => {
            const u = flow(i) / 420;
            const y0 = ry + 40 + u * 220;
            const bend = Math.sin(a) * u * 260 * m.lerp([prop, side], [0.3, 1]);
            return <Arrow key={i} x1={rx + bend * 0.6 + (i % 3 - 1) * 26} y1={y0 - 70} x2={rx + bend + (i % 3 - 1) * 26} y2={y0} k={1} color="#8fd0ff" w={9} />;
          }) : null}
          <MonoLabel t={t} at={prop} x={830} y={1130} text="WATER" size={48} color="#8fd0ff" anchor="middle" />
          {/* the push on the stern, the other way */}
          <Arrow x1={cx + 20} y1={sternY - 60} x2={cx - 230} y2={sternY - 60} k={m.lerp([side, side + 12], [0, 1])} color={RED} w={16} />
          <MonoLabel t={t} at={side} x={cx - 240} y={sternY - 110} text="PUSH" size={50} color={RED} />
          <MonoLabel t={t} at={steers} x={rx - 120} y={ry + 70} anchor="end" text="RUDDER" size={50} color={locked ? AMBER : CREAM} />
          {locked ? <MonoLabel t={t} at={stuck} x={cx} y={bowY + 360} text="STUCK HARD OVER" size={52} color={AMBER} anchor="middle" /> : null}
        </View>
      </svg>
    </Flat>
  );
};
export default Steer;
