// "Koenigsberg was renamed Kaliningrad, its Germans were sent west, and Soviet families moved in." The city sign: a red
// strike through KOENIGSBERG, KALININGRAD stamped on; a line of small people with bundles walks off west under an
// arrow; families with suitcases arrive from the east; windows light up in the city.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapRoute } from "../../flat/map";
import { Castle, Dial, KALININGRAD, Map, On, Piece, SOVIET, Signpost, Walker } from "./props";

const Renamed: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const re = m.at("renamed", 4), ka = m.at("kaliningrad", 18), ge = m.at("germans", 36), we = m.at("west", 52), fa = m.at("families", 70), mo = m.at("moved", 84);
  const wide = m.lerp([ge - 4, ge + 18], [0, 1]);
  const out = m.lerp([ge, m.end], [0, 1]), inn = m.lerp([fa - 6, m.end], [0, 1]);
  const lit = m.lerp([mo, mo + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[20.5, 54.3 - 0.1 * wide]} scale={17000 - 6000 * wide} colors={{ Russia: { fill: "#e8d4a2", k: 0 } }}>
          <Piece k={0.85} fill={SOVIET} trace={1} />
          <On at={KALININGRAD} draw={(x, y) => (
            <g>
              <Castle x={x} y={y} s={110} />
              {lit > 0 ? [[-90, -60], [70, -40], [-30, 30], [110, 20], [-140, 10]].map(([dx, dy], i) => <Glow key={i} x={x + dx!} y={y + dy!} r={34} color="#ffe08a" o={0.9 * Math.min(1, lit * 3 - i * 0.4)} />) : null}
            </g>
          )} />
          <On at={[KALININGRAD[0] + 0.05, KALININGRAD[1] - 0.25]} draw={(x, y) => (
            <g>
              <Signpost x={x} y={y} w={520} text="KOENIGSBERG" size={54} strike={m.lerp([re, re + 12], [0, 1])} k={m.t < ka ? 1 : 0} />
              <Signpost x={x} y={y} w={520} text="KALININGRAD" size={54} bg="#f2b134" k={m.pop(ka, 10)} />
            </g>
          )} />
          {Array.from({ length: 6 }).map((_, i) => (
            <On key={`o${i}`} at={[KALININGRAD[0] - 0.15 - i * 0.12 - 1.1 * out, KALININGRAD[1] - 0.45 + (i % 2) * 0.05]} draw={(x, y) => (out > 0 ? <Walker x={x} y={y} s={70} color="#6b7f9a" step={m.t / 3 + i} bag /> : null)} />
          ))}
          <MapRoute via={[[20.2, 54.2], [19.4, 54.15], [18.6, 54.1]]} k={m.lerp([we, we + 14], [0, 1])} color="#ffffff" width={12} />
          {Array.from({ length: 6 }).map((_, i) => (
            <On key={`i${i}`} at={[KALININGRAD[0] + 1.9 + i * 0.13 - 1.6 * inn, KALININGRAD[1] - 0.05 - (i % 2) * 0.06]} draw={(x, y) => (inn > 0 ? <Walker x={x} y={y} s={70} color={i % 2 ? "#b8282a" : "#c98a3a"} step={m.t / 3 + i} bag /> : null)} />
          ))}
        </Map>
      </View>
      <Dial pos={1} />
    </Stage>
  );
};
export default Renamed;
