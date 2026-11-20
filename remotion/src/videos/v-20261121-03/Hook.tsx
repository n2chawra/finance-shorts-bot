// Hook: "Tristan da Cunha is the most remote island anyone lives on. Who chose to settle here?" From frame 0 the
// world map is already drifting and the camera diving toward the South Atlantic, Tristan's name writing on; on
// "island" the island draws in big, on "lives" a pin drops, on "Who" a question mark bounces up, on "settle"
// tiny roofs pop on its north shore and the camera closes in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapPin, WorldMap, useAt } from "../../flat/map";
import { House, Isle, Patterns, QMark, SEA, TRISTAN } from "./props";

const Extras: React.FC<{ t: number; pin: number; q: number; roofs: number[] }> = ({ t, pin, q, roofs }) => {
  const xy = useAt()(TRISTAN);
  if (!xy) return null;
  return (
    <g>
      {roofs.map((k, i) => <House key={i} x={xy[0] - 60 + i * 34} y={xy[1] - 20 - (i % 2) * 14} s={34} k={k} />)}
      <QMark x={xy[0] + 200} y={xy[1] - 120} k={q} t={t} size={190} />
      <MapPin at={TRISTAN} k={pin} r={30} />
    </g>
  );
};

/** The hook's map; the loop ends on it at dive 0 (the first frame). */
export const HookMap: React.FC<{ t: number; dive: number; name: number; isle: number; pin: number; q: number; roofs: number[] }> = ({ t, dive, name, isle, pin, q, roofs }) => {
  const scale = 420 * Math.pow(2700 / 420, dive);
  const center: [number, number] = [-20 + 7.7 * dive + Math.sin(t / 60) * 1.5 * (1 - dive), -18 - 19.1 * dive];
  return (
    <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.6} sea={SEA}>
      <Patterns />
      <Isle at={TRISTAN} r={30 + 48 * isle} t={t} name="TRISTAN DA CUNHA" nameK={name} size={66} />
      <Extras t={t} pin={pin} q={q} roofs={roofs} />
    </WorldMap>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const isl = m.at("island", 40), lv = m.at("lives", 52), who = m.at("who", 66), st = m.at("settle", 80);
  const close = m.lerp([st - 4, st + 18], [0, 1]);
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1 + 0.22 * close + m.wave(80, 0.01)} cy={960 - 80 * close}>
        <HookMap t={m.t}
          dive={m.lerp([0, isl + 8], [0.12, 1])}
          name={1}
          isle={m.lerp([isl - 6, isl + 12], [0, 1])}
          pin={m.pop(lv, 11)}
          q={m.pop(who, 10)}
          roofs={[0, 1, 2, 3].map((i) => m.pop(st + i * 4, 12))} />
      </View>
    </Stage>
  );
};

export default Hook;
