// "So a ship from China reaches Europe the short way: across the Indian Ocean, up the Red Sea and through the
// canal." A container ship leaves Shanghai on "China" (its pin and name write on), a pin drops on Rotterdam
// on "Europe"; the route draws itself behind the ship across the Indian Ocean on "Indian", the camera
// follows it up the Red Sea on "Red" and it slips through the canal into the Mediterranean on "canal".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapPin, MapRoute } from "../../flat/map";
import { Place, ROTTERDAM, SHANGHAI, VIA_SUEZ, World, rider } from "./props";

const Shortcut: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const china = m.at("china", 6), europe = m.at("europe", 30), indian = m.at("indian", 50), red = m.at("red", 80), canal = m.at("canal", 110);
  // the voyage: Shanghai to the Indian Ocean, up the Red Sea, through the canal
  const k = m.lerp([china, indian + 10], [0.02, 0.32]) + m.lerp([indian + 10, red], [0, 0.2]) + m.lerp([red, canal + 20], [0, 0.26]);
  const follow = m.lerp([red - 6, red + 16], [0, 1]);
  const scale = 470 + 900 * follow;
  const center: [number, number] = [62 - 22 * follow, 12 + 12 * follow];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <World center={center} scale={scale}>
          <MapRoute via={VIA_SUEZ} k={k} color="#ffffff" width={8} mover={rider(52)} />
          <MapPin at={SHANGHAI} k={m.pop(china, 12)} r={26} color="#d9483b" />
          <Place at={SHANGHAI} name="SHANGHAI" k={m.lerp([china, china + 12], [0, 1])} left />
          <MapPin at={ROTTERDAM} k={m.pop(europe, 12)} r={26} color="#3b7dd8" />
          <Place at={ROTTERDAM} name="ROTTERDAM" k={m.lerp([europe, europe + 12], [0, 1])} />
        </World>
      </View>
    </Stage>
  );
};

export default Shortcut;
