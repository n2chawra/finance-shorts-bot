// "It runs almost {fact1} inland, yet at its widest it is only about {fact2} across." The country from
// above: a surveyor walks a long tape up the river from the coast on "runs", its tag lands at the far end
// on "inland"; the camera drops close on "widest", where a short tape snaps across the strip on "across".
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapRoute, WorldMap, useAt } from "../../flat/map";
import { At, RIVER } from "./props";

type Params = { fig?: { long?: string; wide?: string } };

/** The short tape across the strip, from the north border to the south one near the widest point. */
const Across: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at([-15.42, 13.82]), b = at([-15.42, 13.12]);
  if (!a || !b || k <= 0) return null;
  const y2 = a[1] + (b[1] - a[1]) * k;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={a[0]} y2={y2} stroke="#ffc43d" strokeWidth={16} strokeLinecap="round" />
      <line x1={a[0]} y1={a[1]} x2={a[0]} y2={y2} stroke="#1d1a2b" strokeWidth={2} strokeDasharray="6 10" />
    </g>
  );
};

const Tape: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const runs = m.at("runs", 6), inland = m.at("inland", 50), widest = m.at("widest", 80), across = m.at("across", 110);
  const walk = m.lerp([runs, inland], [0.02, 1]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#5f9fae" vignette={0.3}>
        <View zoom={m.lerp([widest, widest + 18], [1.0, 1.3])} cx={m.lerp([widest, widest + 18], [540, 470])} cy={m.lerp([widest, widest + 18], [960, 930])}>
          <WorldMap w={1080} h={1920} fit={["Gambia"]} pad={60} kind="flat" look="vintage" political={0.6} detail="50m" only={["Gambia", "Senegal", "Guinea-Bissau", "Guinea Bissau", "Mali"]}
            colors={{ Gambia: { fill: "#e8453c" }, Senegal: { fill: "#6cbf6a" } }}>
            <MapRoute via={RIVER} k={1} color="#2f7fb8" width={14} dash={false} />
            <MapRoute via={RIVER} k={walk} color="#ffc43d" width={12} dash={false}
              mover={(x, y) => <Char x={x} y={y - 4 + Math.abs(m.wave(10, 6))} s={120} skin="#8a5a3c" top="#ffffff" pants="#6b4423" outfit="shirt" hair="cap" hairColor="#e0352b"
                face="happy" armR={[60 + m.wave(10, 25), 10]} armL={[60 - m.wave(10, 25), 10]} />} />
            <Across k={m.lerp([widest, widest + 14], [0, 1]) * (1 + 0.04 * m.pulse(across, 6))} />
            <At at={[-14.4, 14.3]}>{(x, y) => <Tag x={x - 420} y={y - 170} w={340} h={110} text={fig.long ?? ""} k={m.pop(inland, 12)} rot={-3} />}</At>
            <At at={[-15.42, 12.9]}>{(x, y) => <Tag x={x - 130} y={y} w={260} h={96} text={fig.wide ?? ""} k={m.pop(widest + 4, 12)} rot={2} bg="#ffffff" />}</At>
          </WorldMap>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Tape;
