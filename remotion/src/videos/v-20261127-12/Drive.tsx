// "Now drive it. How far would that take you? From London, east across Europe, all through Siberia, over the
// bridge, then down through Alaska and Canada to New York." The camera pulls far back over the top of the world (the
// map centred on the far east so the whole road is one line); a car sets off from a pin on London and drives east,
// the camera following it across Europe and Siberia, over the glowing bridge, through Alaska and a Canada filling
// with its flag, to a pin on New York.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { BMap, Car, QMark, Road, along, between, fracAt, type LL } from "./props";

const L0 = 143;
/** London to New York over the strait (longitudes unwrapped eastward past 180) */
const ROUTE: LL[] = [
  [-0.13, 51.5], [13.4, 52.5], [37.6, 55.75], [60.6, 56.8], [82.9, 55.0], [104.3, 52.3], [129.7, 62.0], [150.8, 59.6],
  [166, 63.5], [178, 65.0], [186.5, 65.8], [190.34, 66.06], [191.9, 65.62], [194.6, 64.5], [212.3, 64.8], [225, 60.7],
  [246.5, 53.5], [262.9, 49.9], [280.6, 43.7], [286.0, 40.7],
];
const LONDON = ROUTE[0]!, NY = ROUTE[ROUTE.length - 1]!;
const K_BRIDGE = fracAt(ROUTE, 11), K_ALASKA = fracAt(ROUTE, 13);
const ONLY = ["Russia", "United States of America", "Canada", "United Kingdom", "France", "Germany", "Poland", "Belarus", "Netherlands", "Belgium", "Kazakhstan", "Mongolia", "China", "Ukraine", "Lithuania", "Latvia", "Norway", "Sweden", "Finland", "Japan", "Greenland", "Ireland", "Denmark", "Iceland"];

const Driving: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(along(ROUTE, k).at);
  return xy ? <Car x={xy[0]} y={xy[1] - 4} s={100} bump={Math.sin(t / 3)} /> : null;
};
const Dial: React.FC<{ k: number; t: number }> = ({ k, t }) => <QMark x={540} y={300} size={150} k={k} t={t} />;

const Drive: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dr = m.at("drive", 2), fa = m.at("far", 14), lo = m.at("london", 40), eu = m.at("europe", 54), si = m.at("siberia", 72), br = m.at("bridge", 92), al = m.at("alaska", 110), ca = m.at("canada", 124), yo = m.at("york", 140);
  // the car's share of the road on each word
  const keys: [number, number][] = [[lo, 0], [eu, 0.08], [si, 0.3], [br, K_BRIDGE], [al, K_ALASKA], [ca, 0.78], [yo, 1]];
  let k = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, k0] = keys[i]!, [f1, k1] = keys[i + 1]!;
    if (m.t >= f0) k = k0 + (k1 - k0) * Math.max(0, Math.min(1, (m.t - f0) / Math.max(1, f1 - f0)));
  }
  if (m.t >= yo) k = 1;
  const car = along(ROUTE, k).at;
  const top = { center: [L0, 58] as LL, scale: m.lerp([0, dr + 20], [480, 330]) };
  const follow = { center: [car[0], car[1] - 4] as LL, scale: 700 };
  const near = { center: [car[0], car[1] - 1] as LL, scale: 1300 };
  const a = between(top, follow, m.lerp([lo - 10, lo + 16], [0, 1]));
  const zoomIn = m.lerp([br - 14, br], [0, 1]) * (1 - m.lerp([al, al + 14], [0, 1]));
  const c = between(a, near, zoomIn);
  const end = { center: [256, 50] as LL, scale: 430 };
  const cam = between(c, end, m.lerp([ca, ca + 26], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <BMap center={cam.center} scale={cam.scale} lon0={L0} only={ONLY} colors={{ Canada: { fill: "#e6a39a", k: m.lerp([ca, ca + 12], [0, 1]), trace: m.lerp([ca, ca + 26], [0, 1]), flag: "Canada" } }}>
          <Road pts={ROUTE} k={Math.max(0.002, k)} w={10} />
          <Road pts={ROUTE.slice(10, 13)} w={14} color="#c9cdd4" flash={m.pulse(br, 18)} />
          <MapPin at={LONDON} k={m.pop(lo)} />
          <MapLabel at={[LONDON[0] + 2, LONDON[1] + 4]} text="LONDON" size={50} type={m.lerp([lo, lo + 12], [0, 1])} />
          <MapLabel at={[20, 49]} text="EUROPE" size={52} type={m.lerp([eu, eu + 12], [0, 1])} />
          <MapLabel at={[105, 60]} text="SIBERIA" size={56} type={m.lerp([si, si + 12], [0, 1])} />
          <MapLabel at={[208, 67.5]} text="ALASKA" size={52} type={m.lerp([al, al + 12], [0, 1])} />
          <MapPin at={NY} k={m.pop(yo)} />
          <MapLabel at={[NY[0] - 6, NY[1] - 3]} text="NEW YORK" size={50} type={m.lerp([yo, yo + 12], [0, 1])} />
          <Driving k={k} t={m.t} />
        </BMap>
      </View>
      <Dial k={m.pop(fa) * (1 - m.lerp([lo, lo + 10], [0, 1]))} t={m.t} />
    </Stage>
  );
};
export default Drive;
