// "Drivers can't cross it. They load their cars onto a ship and sail around the gap." On the Caribbean coast of
// Panama and Colombia: cars queue at the end of the road at Yaviza, a red cross stamps over the gap, a car rolls onto
// a car ship at a port on Panama's Caribbean coast (a pin drops on it), more cars stack on its deck, its funnel puffs, and it sails out along the coast
// while a dotted sea route draws round the gap to Colombia.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapPin, MapRoute, useAt } from "../../flat/map";
import { AMap, Car, GapMark, NORTH_ROAD, RED, Road, SOUTH_ROAD, Ship, TURBO, Waves, YAVIZA, along, between, type LL } from "./props";

const PORT: LL = [-79.88, 9.36];
const SEA_ROUTE: LL[] = [[-79.88, 9.42], [-79.2, 9.75], [-78.2, 9.75], [-77.2, 9.55], [-76.3, 9.85], [-75.55, 10.38]];
const SEA_PTS: LL[] = [[-80.3, 10.4], [-79.0, 10.5], [-77.8, 10.3], [-76.8, 10.5], [-80.6, 7.4], [-79.4, 7.2], [-78.6, 6.6], [-76.5, 11.0], [-78.4, 11.0]];

const Queue: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(YAVIZA);
  if (!xy || k <= 0) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const q = Math.min(1, Math.max(0, k * 3 - i));
        return q > 0 ? <g key={i} opacity={q}><Car x={xy[0] - 30 - i * 62} y={xy[1] - 6 - i * 20} s={58} bump={Math.sin(t / 4 + i) * 0.3} color={["#e8453c", "#f2b134", "#4f8fd0"][i]} /></g> : null;
      })}
    </g>
  );
};

const Cross: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at(YAVIZA), b = at(TURBO);
  if (!a || !b || k <= 0) return null;
  const x = (a[0] + b[0]) / 2, y = (a[1] + b[1]) / 2, s = 70 * (1 + (1 - Math.min(1, k)) * 1.2);
  return (
    <g opacity={Math.min(1, k * 2)}>
      <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} stroke={INK} strokeWidth={34} strokeLinecap="round" />
      <line x1={x - s} y1={y + s} x2={x + s} y2={y - s} stroke={INK} strokeWidth={34} strokeLinecap="round" />
      <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} stroke={RED} strokeWidth={22} strokeLinecap="round" />
      <line x1={x - s} y1={y + s} x2={x + s} y2={y - s} stroke={RED} strokeWidth={22} strokeLinecap="round" />
    </g>
  );
};

const AtPort: React.FC<{ roll: number; cars: number; sail: number; puff: number }> = ({ roll, cars, sail, puff }) => {
  const at = useAt();
  const port = at(PORT);
  if (!port) return null;
  if (sail > 0) return null;
  const carX = port[0] - 160 + 150 * Math.min(1, roll);
  return (
    <g>
      <Ship x={port[0] + 40} y={port[1] - 40} s={190} cars={cars} puff={puff} />
      {roll > 0 && roll < 1 ? <Car x={carX} y={port[1] - 60} s={44} /> : null}
    </g>
  );
};

const ShipBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dr = m.at("drivers", 2), cr = m.at("cross", 14), lo = m.at("put", 34), ca = m.at("cars", 50), sh = m.at("ship", 66), sa = m.at("sail", 76), ar = m.at("around", 92), cb = m.at("caribbean", 50), co = m.at("colombia", 104);
  const med = { center: [-78.6, 9.0] as LL, scale: 8600 };
  const wide = { center: [-77.7, 9.3] as LL, scale: 6400 };
  const cam = between(med, wide, m.lerp([sa, sa + 26], [0, 1]));
  const sailK = m.lerp([sa, m.end], [0, 0.92]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <AMap center={cam.center} scale={cam.scale} colors={{ Panama: { fill: "#e2bd7a", k: 1, flag: "Panama" }, Colombia: { fill: "#e8cf86", k: 1, trace: m.lerp([co, co + 24], [0, 1]) } }}>
          <Waves pts={SEA_PTS} t={m.t} />
          <Road pts={NORTH_ROAD} w={12} />
          <MapPin at={PORT} k={m.pop(cb)} />
          <Road pts={SOUTH_ROAD} w={12} k={0.06} />
          <GapMark w={10} pulse={0.5 + 0.5 * Math.sin(m.t / 5)} />
          <Queue k={m.lerp([dr, dr + 16], [0, 1])} t={m.t} />
          <Cross k={m.pop(cr)} />
          <AtPort roll={m.lerp([lo, lo + 14], [0, 1])} cars={1 + 3 * m.lerp([ca, ca + 14], [0, 1])} sail={sailK} puff={m.lerp([sh, sh + 16], [0, 1])} />
          <MapRoute via={SEA_ROUTE} k={m.lerp([ar - 10, ar + 26], [0, 1])} color="#fff4d0" width={8} dash />
          {sailK > 0 ? <Sailing k={sailK} /> : null}
        </AMap>
      </View>
    </Stage>
  );
};

const Sailing: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(along(SEA_ROUTE, k).at);
  return xy ? <Ship x={xy[0]} y={xy[1] - 30} s={150} cars={4} /> : null;
};
export default ShipBeat;
