// "Then at Yaviza, a small town in the jungle of eastern Panama, the tarmac simply ends." The car drives the last
// stretch of road through eastern Panama, the camera following; a pin drops on Yaviza and its name writes on, little
// houses pop up, trees sprout round the town, Panama fills with its flag, the road glows under the car and an END OF
// ROAD sign drops in as the car stops with a jolt.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion, rng } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { AMap, Board, House, NORTH_ROAD, OnRoad, Road, SEA_GAP, Tree, Waves, YAVIZA, along, between, fracNear, type LL } from "./props";

const R = rng("yaviza-27-11");
const TREES: LL[] = Array.from({ length: 22 }, () => [YAVIZA[0] - 0.35 + R() * 0.7, YAVIZA[1] - 0.25 + R() * 0.45] as LL)
  .filter((t) => Math.hypot(t[0] - YAVIZA[0], t[1] - YAVIZA[1]) > 0.24 && !(t[1] > YAVIZA[1] + 0.05 && Math.abs(t[0] - YAVIZA[0]) < 0.3));
const HOUSES: LL[] = [[-77.72, 8.18], [-77.66, 8.19], [-77.71, 8.13], [-77.65, 8.14]];

const Town: React.FC<{ houses: number; trees: number; sign: number }> = ({ houses, trees, sign }) => {
  const at = useAt();
  const y = at(YAVIZA);
  return (
    <g>
      {TREES.map((t, i) => {
        const xy = at(t);
        return xy ? <Tree key={i} x={xy[0]} y={xy[1]} s={70} k={Math.min(1, Math.max(0, trees * 1.6 - i * 0.03))} /> : null;
      })}
      {HOUSES.map((h, i) => {
        const xy = at(h);
        return xy ? <House key={i} x={xy[0]} y={xy[1]} s={56} k={Math.min(1, Math.max(0, houses * 2 - i * 0.25))} /> : null;
      })}
      {y ? <Board x={y[0] + 150} y={y[1] - 40} w={420} title="END OF ROAD" k={sign} tone="#f7d27a" /> : null}
    </g>
  );
};

const Yaviza: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const th = m.at("then", 2), ya = m.at("yaviza", 10), to = m.at("town", 30), ju = m.at("jungle", 50), pa = m.at("panama", 70), ta = m.at("tarmac", 84), en = m.at("ends", 100);
  const k0 = fracNear(NORTH_ROAD, [-79.1, 9.15]);
  const k = Math.min(0.992, m.lerp([th, en], [k0, 0.992], (x) => 1 - (1 - x) * (1 - x)));
  const car = along(NORTH_ROAD, k).at;
  const follow = { center: [car[0] + 0.25, car[1] - 0.05] as LL, scale: 11000 };
  const close = { center: [YAVIZA[0] + 0.12, YAVIZA[1] + 0.02] as LL, scale: 22000 };
  const cam = between(follow, close, m.lerp([en - 6, en + 20], [0, 1]));
  const jolt = m.pulse(en, 8);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)} cx={540 + 14 * jolt}>
        <AMap center={cam.center} scale={cam.scale} colors={{ Panama: { fill: "#e2bd7a", k: m.lerp([pa, pa + 12], [0, 1]), trace: m.lerp([pa, pa + 24], [0, 1]), flag: "Panama" } }}>
          <Waves pts={SEA_GAP} t={m.t} />
          <Road pts={NORTH_ROAD} w={14} flash={m.lerp([ta, ta + 10], [0, 1]) * (1 - m.lerp([en, en + 20], [0, 0.7]))} />
          <Town houses={m.lerp([to, to + 16], [0, 1])} trees={m.lerp([ju, ju + 20], [0, 1])} sign={m.pop(en)} />
          <MapPin at={YAVIZA} k={m.pop(ya)} />
          <MapLabel at={[YAVIZA[0] - 0.02, YAVIZA[1] + 0.12]} text="YAVIZA" size={58} type={m.lerp([ya, ya + 14], [0, 1])} />
          <OnRoad pts={NORTH_ROAD} k={k} t={m.t * (1 - m.lerp([en, en + 4], [0, 1]))} s={130} />
        </AMap>
      </View>
    </Stage>
  );
};
export default Yaviza;
