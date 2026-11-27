// "Finish the road or keep the jungle: which would you pick? That's why the road from Alaska to Argentina stops in
// Panama." Over the gap a dashed road draws across, then trees grow over it, a question mark swings between them;
// the camera pulls back to the whole Americas, a light runs down the road from Alaska to Argentina and the break in
// Panama flashes as the frame settles on the hook's map.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { AMap, GapMark, Highway, QMark, Road, SEA_GAP, SEA_WIDE, TURBO, Tree, WIDE, Waves, YAVIZA, between, type LL } from "./props";
import { Forest } from "./Jungle";

const Over: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  if (k <= 0) return null;
  const pts: LL[] = [[-77.55, 8.12], [-77.4, 8.08], [-77.25, 8.05], [-77.1, 8.06], [-76.95, 8.08]];
  return (
    <g>
      {pts.map((ll, i) => {
        const xy = at(ll);
        return xy ? <Tree key={i} x={xy[0]} y={xy[1] + 30} s={90} k={Math.min(1, Math.max(0, k * 2 - i * 0.2))} /> : null;
      })}
    </g>
  );
};

const Swing: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const a = at(YAVIZA), b = at(TURBO);
  if (!a || !b) return null;
  const x = (a[0] + b[0]) / 2 + Math.sin(t / 8) * 80;
  return <QMark x={x} y={Math.min(a[1], b[1]) - 220} size={140} k={k} t={t} />;
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fi = m.at("finish", 2), ke = m.at("keep", 20), pi = m.at("pick", 40), wh = m.at("why", 60), al = m.at("alaska", 80), pa = m.at("panama", 104);
  const gap = { center: [-77.2, 7.95] as LL, scale: 17000 };
  const back = m.lerp([wh, pa + 10], [0, 1], (x) => 1 - Math.pow(1 - x, 3));
  const cam = between(gap, WIDE, back);
  const big = back < 0.6;
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + 0.02 * (1 - back) + m.wave(90, 0.006)}>
        <AMap center={cam.center} scale={cam.scale} colors={{ Panama: { fill: "#e2bd7a", k: 1 - back * 0.6, flag: "Panama" }, Colombia: { fill: "#e8cf86", k: 1 - back * 0.6, flag: "Colombia" } }}>
          <Waves pts={big ? SEA_GAP : SEA_WIDE} t={m.t} />
          {big ? <Forest k={1} s={56} /> : null}
          <Highway w={big ? 14 : 10} run={m.lerp([al, al + 40], [0, 1])} />
          <GapMark w={big ? 12 : 9} pulse={Math.max(m.pulse(pa, 16), 0.5 + 0.5 * Math.sin(m.t / 5))} />
          {big ? <Road pts={[YAVIZA, [-77.3, 8.02], TURBO]} w={12} k={m.lerp([fi, fi + 20], [0, 1])} dashed o={0.9} /> : null}
          {big ? <Over k={m.lerp([ke, ke + 20], [0, 1])} /> : null}
          {big ? <Swing k={m.pop(pi)} t={m.t} /> : null}
        </AMap>
      </View>
    </Stage>
  );
};
export default Loop;
