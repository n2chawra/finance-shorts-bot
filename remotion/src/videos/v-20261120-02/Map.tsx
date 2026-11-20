// Promise: "And that worker isn't in America. It's a part-time crew member in Poland."
// The crew break room: a world map pinned on the wall over the lockers. A red pin lifts off America on "isn't", a
// cross stamps over America on "America", a crew member clocks in and a CREW SHIFT card pops out of the time clock on
// "crew", and the pin drops on Poland on "Poland" while its border traces and its flag fills it.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Limb, SourceLine, Stage, Tag, View, motion } from "../../flat/kit";
import { MapPin, WorldMap, useAt } from "../../flat/map";
import { Crew, RED } from "./props";

const US: [number, number] = [-98, 39];
const PL: [number, number] = [19.4, 52];

const Marks: React.FC<{ lift: number; cross: number; drop: number }> = ({ lift, cross, drop }) => {
  const at = useAt();
  const [ux, uy] = at(US) ?? [0, 0];
  return (
    <g>
      {lift < 1 ? <g transform={`translate(0 ${-200 * lift})`} opacity={1 - lift}><MapPin at={US} k={1} color={RED} r={26} /></g> : null}
      {cross > 0 ? (
        <g opacity={cross} transform={`translate(${ux} ${uy}) scale(${0.6 + 0.4 * cross})`}>
          <Limb a={[-90, -90]} b={[90, 90]} w={26} color={RED} />
          <Limb a={[90, -90]} b={[-90, 90]} w={26} color={RED} />
        </g>
      ) : null}
      {drop > 0 ? <MapPin at={PL} k={drop} color={RED} r={30} /> : null}
    </g>
  );
};

const MapShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const isnt = m.at("isnt", 8), america = m.at("america", 20), crew = m.at("crew", 50), poland = m.at("poland", 70);
  const lift = m.lerp([isnt - 2, isnt + 10], [0, 1]);
  const cross = m.lerp([america - 1, america + 6], [0, 1], Easing.out(Easing.back(2)));
  const card = m.pop(crew - 1, 10);
  const drop = m.lerp([poland - 4, poland + 6], [0, 1], Easing.bounce);
  const trace = m.lerp([poland, poland + 26], [0, 1]);
  const push = m.lerp([poland - 6, poland + 16], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#3e4a5c" vignette={0.36}>
        <View zoom={1.0 + 0.22 * push} cx={540 + 230 * push + m.wave(70, 6)} cy={820 - 150 * push + m.wave(60, 5)}>
          <rect x={-500} y={-500} width={2080} height={3000} fill="#4f6a7a" />
          <rect x={-500} y={1180} width={2080} height={1400} fill="#7c6a58" />
          {/* lockers */}
          {[0, 1, 2, 3, 4, 5].map((i) => <Block key={i} x={-120 + i * 190} y={1000} w={170} h={420} r={6} fill={i % 2 ? "#8fa3b8" : "#a5b8cc"} />)}
          {/* the map on the wall, in a frame */}
          <Block x={30} y={300} w={1020} h={640} r={10} fill="#6b4a2c" />
          <g transform="translate(60 330)">
            <WorldMap w={960} h={580} fit={["United States of America", "Poland", "Brazil", "India"]} pad={30}
              colors={{
                "United States of America": { fill: "#b9b2a6", k: cross },
                Poland: { fill: "#dc143c", k: trace, trace, flag: "Poland" },
              }}>
              <Marks lift={lift} cross={cross} drop={drop} />
            </WorldMap>
          </g>
          {/* the time clock and the crew member clocking in */}
          <Block x={720} y={980} w={180} h={220} r={14} fill="#e7e1d6" />
          <circle cx={810} cy={1060} r={56} fill="#ffffff" stroke="#1d1a2b" strokeWidth={6} />
          <Limb a={[810, 1060]} b={[810 + 40 * Math.sin(m.t / 8), 1060 - 40 * Math.cos(m.t / 8)]} w={8} color="#1d1a2b" sw={2} />
          <Crew x={560} y={1560 + m.wave(50, 3)} s={260} face={card > 0.5 ? "happy" : "neutral"} look={[0.8, -0.3]} armR={[70 + 40 * card, 60]} />
          {card > 0 ? <g opacity={Math.min(1, card)} transform={`translate(0 ${-90 * card})`}><Tag x={560} y={1210} w={360} h={110} text="CREW SHIFT" size={52} bg="#ffc72c" k={1} rot={-5} /></g> : null}
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default MapShot;
