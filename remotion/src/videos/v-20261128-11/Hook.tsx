// Hook: "Britain, Chile and Argentina all claim the same piece of Antarctica, and none of them can have it." The
// Antarctic Peninsula on the polar map from frame 0, ANTARCTICA writing on; on each country's name its striped
// slice sweeps over the peninsula and its flag plants; on "same" the overlap flashes and the camera pushes in; on
// "none" frost creeps over all three and on "have" the flags freeze still.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, SourceLine, Stage, View, motion } from "../../flat/kit";
import { PlantedFlag } from "../../flat/polar";
import { AntMap, CLAIMS, Floes, Frost, Name, PEN, PEN_FLAGS, SEA, Slices, between } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const br = m.at("britain", 2), ch = m.at("chile", 14), ar = m.at("argentina", 26), sa = m.at("same", 55), an = m.at("antarctica", 70), no = m.at("none", 95), hv = m.at("have", 120);
  const close = { center: [-62, -69.5] as [number, number], scale: 3000 };
  const cam = between(between(PEN, close, m.lerp([sa, sa + 22], [0, 1])), PEN, m.lerp([an, an + 30], [0, 0.6]));
  const glow = m.pulse(sa + 6, 12);
  const frost = m.lerp([no, no + 24], [0, 1]);
  const wt = Math.min(m.t, hv);
  const ks: Record<string, number> = { uk: m.lerp([br, br + 16], [0, 1]), chile: m.lerp([ch, ch + 16], [0, 1]), arg: m.lerp([ar, ar + 16], [0, 1]) };
  const starts: Record<string, number> = { uk: br, chile: ch, arg: ar };
  return (
    <>
      <Stage p={p} bg={SEA} vignette={0.35}>
        <View zoom={1.02 + m.wave(90, 0.01)} cy={1000}>
          <AntMap cam={cam}>
            <Floes t={m.t} n={70} lat={-63} />
            <Slices s={{ uk: { k: ks.uk, stripes: true, glow, frost }, chile: { k: ks.chile, stripes: true, glow, frost }, arg: { k: ks.arg, stripes: true, glow, frost } }} />
            <Frost k={frost} t={m.t} />
            <Name at={[-48, -76]} text="ANTARCTICA" size={64 + 8 * m.pulse(an + 6, 10)} type={1} />
            {PEN_FLAGS.map((f) => <PlantedFlag key={f.id} at={f.at} name={CLAIMS[f.id]!.flag!} k={m.pop(starts[f.id]! + 4)} s={0.9} t={wt * 1.4} />)}
          </AntMap>
        </View>
        <Flash k={m.pulse(sa + 4, 6) * 0.25} />
      </Stage>
      <SourceLine p={p} />
    </>
  );
};
export default Hook;
