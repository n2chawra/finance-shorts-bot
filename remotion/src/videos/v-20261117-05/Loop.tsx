// Loop: "Gambia or Lesotho: which border is stranger? And if a friend ever asks you," Africa from space:
// Gambia glows red in the west on "Gambia", Lesotho glows red inside South Africa on "Lesotho", a question
// mark bounces between them on "stranger"; on "friend" the camera swoops back to West Africa, and by
// "asks" the picture is the hook's first frame again (the same map, plain colours, the boat at the mouth).
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, WorldMap, useAt } from "../../flat/map";
import { WestAfrica } from "./Hook";

const Hop: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const a = at([-15.3, 13.4]), b = at([28.2, -29.6]);
  if (!a || !b || k <= 0) return null;
  const u = (Math.sin(t / 8) + 1) / 2;
  const x = 540 + (b[0] - a[0]) * (u - 0.5) * 0.5, y = (a[1] + b[1]) / 2 - Math.abs(Math.sin(t / 4)) * 120;
  return <Txt x={x} y={y} size={150 * k} fill="#ffc43d" stroke="#1d1a2b">?</Txt>;
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const gam = m.at("gambia", 4), les = m.at("lesotho", 24), str = m.at("stranger", 50), friend = m.at("friend", 80);
  if (m.t < friend) {
    return (
      <Stage p={p} bg="#2b4f63" vignette={0.5}>
        <View zoom={m.lerp([0, friend], [1.0, 1.08])} cx={540} cy={960}>
          <WorldMap w={1080} h={1920} fit={["Morocco", "Senegal", "Somalia", "South Africa", "Egypt"]} pad={130} look="vintage" political={0.6}
            colors={{ Gambia: { fill: "#e8453c", paint: m.lerp([gam, gam + 10], [0, 1]) }, Lesotho: { fill: "#e8453c", paint: m.lerp([les, les + 12], [0, 1]), lift: m.lerp([les + 6, les + 16], [0, 1]) },
              Senegal: { fill: "#6cbf6a", draw: m.lerp([gam, gam + 16], [0, 1]) }, "South Africa": { fill: "#6cbf6a", draw: m.lerp([les, les + 20], [0, 1]) } }}>
            <MapPin at={[-15.3, 13.45]} r={30} k={m.pop(gam, 12)} />
            <MapLabel at={[1.5, 14.2]} text="GAMBIA" size={50} type={m.lerp([gam, gam + 12], [0, 1])} />
            <MapPin at={[28.2, -29.6]} r={30} k={m.pop(les, 12)} />
            <MapLabel at={[28, -24.5]} text="LESOTHO" size={50} type={m.lerp([les, les + 12], [0, 1])} />
            <Hop k={m.pop(str, 10)} t={m.t} />
          </WorldMap>
        </View>
      </Stage>
    );
  }
  const k = m.lerp([friend, friend + 16], [0, 1]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#5f9fae" vignette={0.35}>
        <View zoom={m.lerp([friend, friend + 16], [1.3, 1.0])} cx={540} cy={960}>
          <WestAfrica t={m.t} outline={1} red={1 - 0.2 * k} label={1} green={1 - 0.55 * k} worm={0} river={1 - 0.6 * k} boat={0.04} />
        </View>
        <Flash k={m.pulse(friend, 6)} />
      </Stage>
    </AbsoluteFill>
  );
};

export default Loop;
