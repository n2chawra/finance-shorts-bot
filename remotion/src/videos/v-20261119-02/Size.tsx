// "And it's no small corner: Greenland is the biggest island on Earth. Lay Denmark on top of it, and Denmark
// covers just one sliver." Greenland paints in white from the south on "corner" and rises off the map on
// "biggest"; a ruler draws along it on "island"; a BIGGEST ISLAND sign stamps onto the ice on "Earth"; on
// "Lay" Denmark's own shape lifts off Europe and slides over at true scale on "top", pulsing in its corner.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { Lift, MapLabel, useAt } from "../../flat/map";
import { Atlantic, RED, SNOW, Sign } from "./props";

const Ruler: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at([-44, 60.2]), b = at([-33, 83.2]);
  if (!a || !b || k <= 0) return null;
  const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k;
  return (
    <g>
      <Limb a={a} b={[x, y]} w={14} color="#ffd36b" sw={4} />
      {Array.from({ length: Math.floor(k * 10) }).map((_, i) => {
        const u = (i + 1) / 10;
        const px = a[0] + (b[0] - a[0]) * u, py = a[1] + (b[1] - a[1]) * u;
        return <Ball key={i} x={px} y={py} r={6} fill={INK} shadow={false} sw={0} />;
      })}
    </g>
  );
};

const SignOn: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([-42, 67]);
  return xy ? <Sign x={xy[0]} y={xy[1] + 40} w={560} text="BIGGEST ISLAND" sub="ON EARTH" k={k} size={62} /> : null;
};

// Denmark laid on Greenland at the map's local scale there: Mercator draws a place at latitude L 1/cos(L)
// times bigger, so the true-scale shape is enlarged by the same factor to compare like with like.
const DK_HOME: [number, number] = [10, 56];
const DK_TO: [number, number] = [-28, 73];
const DkLift: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const here: [number, number] = [DK_HOME[0] + (DK_TO[0] - DK_HOME[0]) * k, DK_HOME[1] + (DK_TO[1] - DK_HOME[1]) * k];
  const xy = at(here);
  if (!xy) return null;
  const f = 1 / Math.cos((here[1] * Math.PI) / 180);
  return (
    <g transform={`translate(${xy[0]} ${xy[1]}) scale(${f}) translate(${-xy[0]} ${-xy[1]})`}>
      <Lift name="Denmark" to={DK_TO} k={k} fill={RED} />
    </g>
  );
};

const Size: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const corner = m.at("corner", 6), big = m.at("biggest", 24), isl = m.at("island", 34), earth = m.at("earth", 44), lay = m.at("lay", 60), top = m.at("top", 74), cov = m.at("covers", 90), sliver = m.at("sliver", 100);
  const push = m.lerp([lay - 4, lay + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + 0.06 * push + m.wave(90, 0.008)}>
        <Atlantic center={[-40 + 6 * m.lerp([lay, top + 20], [0, 1]), 71.5]} scale={860}
          colors={{ Greenland: { fill: SNOW, paint: Math.max(0.001, m.lerp([0, corner + 20], [0.15, 1])), from: [-44, 60], lift: m.lerp([big, big + 12], [0, 1]) }, Denmark: { fill: RED } }}>
          <Ruler k={m.lerp([isl, isl + 18], [0, 1])} />
          <SignOn k={m.pop(earth, 12)} />
          <DkLift k={m.lerp([lay, top + 14], [0, 1])} />
          <MapLabel at={[-28, 71.2]} text="DENMARK" size={52 * (1 + 0.15 * m.pulse(sliver, 10))} type={m.lerp([cov, cov + 10], [0, 1])} />
        </Atlantic>
      </View>
    </Stage>
  );
};

export default Size;
