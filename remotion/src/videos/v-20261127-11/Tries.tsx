// "Road builders have drawn plans to close it for decades. So why is the gap still open?" Close at the end of the
// road at Yaviza: two builders stand at the jungle's edge, a plan unrolls with a dashed road on it, the dashed road
// draws across the gap on the map, more plans pile up and each gets crossed out, a question mark pops over the gap,
// the camera pulls back and the gap pulses.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { useAt } from "../../flat/map";
import { AMap, GapMark, NORTH_ROAD, QMark, RED, Road, SEA_GAP, TURBO, Waves, YAVIZA, between, type LL } from "./props";
import { Forest } from "./Jungle";

const Plan: React.FC<{ x: number; y: number; k: number; crossed: number; rot?: number }> = ({ x, y, k, crossed, rot = 0 }) => {
  if (k <= 0) return null;
  const w = 300 * Math.min(1, k), h = 200;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <Block x={x - 150} y={y - h / 2} w={Math.max(20, w)} h={h} fill="#e8f0f6" r={6} />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={x - 150} y1={y - 80 + i * 40} x2={x - 150 + w} y2={y - 80 + i * 40} stroke="#9fc0d8" strokeWidth={2} />)}
      <path d={`M${x - 130},${y + 40} q${w * 0.3},-80 ${Math.max(0, w - 40)},-60`} stroke="#3a6ea5" strokeWidth={10} strokeDasharray="20 14" fill="none" />
      {crossed > 0 ? (
        <g opacity={Math.min(1, crossed)}>
          <line x1={x - 130} y1={y - 80} x2={x + 130} y2={y + 80} stroke={RED} strokeWidth={16} strokeLinecap="round" />
          <line x1={x - 130} y1={y + 80} x2={x + 130} y2={y - 80} stroke={RED} strokeWidth={16} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};

const Builders: React.FC<{ k: number; t: number; look: number }> = ({ k, t, look }) => {
  const xy = useAt()(YAVIZA);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Char x={xy[0] - 170} y={xy[1] + 40 + Math.sin(t / 20) * 2} s={70} who="rohan" face={look > 0.5 ? "worried" : "neutral"} armR={[60, 40]} />
      <Char x={xy[0] - 60} y={xy[1] + 60} s={70} who="priya" face={look > 0.5 ? "worried" : "happy"} armL={[-40, -60]} />
      {[xy[0] - 170, xy[0] - 60].map((x, i) => <ellipse key={i} cx={x} cy={xy[1] + (i ? 60 : 40) - 70 * 2.55} rx={46} ry={20} fill="#f2c230" stroke={INK} strokeWidth={3} />)}
    </g>
  );
};

const GapQ: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const a = at(YAVIZA), b = at(TURBO);
  if (!a || !b) return null;
  return <QMark x={(a[0] + b[0]) / 2} y={Math.min(a[1], b[1]) - 170} size={150} k={k} t={t} />;
};

const Tries: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const bu = m.at("builders", 2), pl = m.at("plans", 14), cl = m.at("close", 26), de = m.at("decades", 40), wh = m.at("why", 60), st = m.at("still", 70), op = m.at("open", 82);
  const close = { center: [-77.45, 8.05] as LL, scale: 24000 };
  const med = { center: [-77.2, 7.95] as LL, scale: 17000 };
  const cam = between(close, med, m.lerp([st, st + 24], [0, 1]));
  const fade = 1 - m.lerp([wh, wh + 10], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <AMap center={cam.center} scale={cam.scale} colors={{ Panama: { fill: "#e2bd7a", k: 1, flag: "Panama" }, Colombia: { fill: "#e8cf86", k: 1, flag: "Colombia" } }}>
          <Waves pts={SEA_GAP} t={m.t} />
          <Forest k={1} s={56} />
          <Road pts={NORTH_ROAD} w={14} />
          <Road pts={[TURBO, [-76.68, 7.8], [-76.65, 7.5], [-76.5, 7.1]]} w={14} />
          <Road pts={[YAVIZA, [-77.3, 8.02], TURBO]} w={12} k={m.lerp([cl, cl + 24], [0, 1]) * fade} dashed o={0.9} />
          <GapMark w={12} k={m.lerp([wh, wh + 10], [0, 1])} pulse={m.pulse(op, 20)} />
          <Builders k={m.lerp([bu, bu + 10], [0, 1])} t={m.t} look={m.lerp([de, de + 10], [0, 1])} />
          <GapQ k={m.pop(wh)} t={m.t} />
        </AMap>
      </View>
      <g opacity={fade}>
        <Plan x={540} y={420} k={m.lerp([pl, pl + 12], [0, 1])} crossed={m.lerp([de + 4, de + 12], [0, 1])} />
        <Plan x={380} y={500} k={m.lerp([de, de + 8], [0, 1])} crossed={m.lerp([de + 10, de + 18], [0, 1])} rot={-8} />
        <Plan x={700} y={520} k={m.lerp([de + 6, de + 14], [0, 1])} crossed={m.lerp([de + 16, de + 24], [0, 1])} rot={7} />
      </g>
    </Stage>
  );
};
export default Tries;
