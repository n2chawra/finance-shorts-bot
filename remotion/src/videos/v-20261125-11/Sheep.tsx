// "To the south and east is sheep country: flock after flock, grazing on open grass." The camera slides to the
// south-east inside the fence; SHEEP COUNTRY writes on, flocks pop up across the green one after another, then
// put their heads down to graze among swaying tufts of grass.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Fence, Map, Sheep as Ewe, Sides, mix, mixLL, type LL, SeaMarks } from "./props";
import { WIDE } from "./Hook";

const FLOCKS: LL[] = [[146.2, -31.6], [143.6, -33.6], [148.6, -30.2], [145.2, -34.6], [149.6, -32.6], [142.4, -31.4], [147.4, -28.6], [144.2, -30.0]];
const TUFTS: LL[] = [[145.0, -32.6], [147.6, -33.4], [143.0, -32.4], [148.8, -29.4], [146.0, -29.6], [144.6, -35.6], [150.2, -31.0]];

const Field: React.FC<{ k: number[]; graze: number; t: number }> = ({ k, graze, t }) => {
  const at = useAt();
  return (
    <g>
      {TUFTS.map((g, i) => {
        const xy = at(g);
        if (!xy) return null;
        const sw = Math.sin(t / 12 + i) * 8;
        return <path key={`g${i}`} d={`M${xy[0] - 18},${xy[1]} q${sw},-40 ${-4 + sw},-52 M${xy[0]},${xy[1]} q${sw},-50 ${sw},-62 M${xy[0] + 18},${xy[1]} q${sw},-40 ${6 + sw},-50`} stroke="#4e7d2a" strokeWidth={7} fill="none" strokeLinecap="round" />;
      })}
      {FLOCKS.map((f, i) => {
        const xy = at(f);
        const q = k[i] ?? 0;
        if (!xy || q <= 0) return null;
        return (
          <g key={i}>
            <Ewe x={xy[0] - 40} y={xy[1]} s={120} k={q} graze={graze * (0.6 + 0.4 * Math.sin(t / 10 + i))} />
            <Ewe x={xy[0] + 46} y={xy[1] + 26} s={104} k={q} graze={graze} flip />
          </g>
        );
      })}
    </g>
  );
};

const Sheep: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const so = m.at("south", 2), sh = m.at("sheep", 26), fl = m.at("flock", 46), af = m.at("after", 58), gr = m.at("grazing", 72), gs = m.at("grass", 92);
  const go = m.lerp([so, so + 26], [0, 1]);
  const close = m.lerp([fl, fl + 24], [0, 1]);
  const ks = [m.pop(fl), m.pop(fl + 5), m.pop(af), m.pop(af + 4), m.pop(af + 8), m.pop(af + 12), m.pop(af + 16), m.pop(af + 20)];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <Map center={mixLL(mixLL(WIDE.center, [146.2, -31.6], go), [146.0, -31.9], close)} scale={mix(WIDE.scale, 3400, go) + 1300 * close + 120 * m.lerp([gs, m.end], [0, 1])}>
          <Sides dingo={0.6} sheep={1} />
          <SeaMarks t={m.t} />
          <Fence w={10} />
          <MapLabel at={[146.6, -28.0]} text="SHEEP COUNTRY" size={60} type={m.lerp([sh, sh + 22], [0, 1])} />
          <Field k={ks} graze={m.lerp([gr, gr + 12], [0, 1])} t={m.t} />
        </Map>
      </View>
    </Stage>
  );
};
export default Sheep;
