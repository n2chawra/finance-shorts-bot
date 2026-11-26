// Hook: "भारत का समुद्र तट अचानक इतना लंबा कैसे हो गया?" All of India at frame 0 with surf rolling in on its coast; a
// bright blue line races along the coast from Gujarat round the tip to Bengal, the camera pushes onto the south on
// "लंबा" and a question mark stamps in the Bay of Bengal on "कैसे".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CoastLine, CoastSurf, SeaRipples } from "../../flat/india";
import { F, MapView, OnMap, Question, lerpFrame } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const bh = m.at("bharat", 0), sa = m.at("samudra", 8), ac = m.at("achanak", 18), la = m.at("lamba", 30), ka = m.at("kaise", 40);
  const frame = lerpFrame(F.india, F.south, m.lerp([la, la + 24], [0, 0.55]));
  const sweep = m.lerp([0, la], [0.4, 1]);
  return (
    <Stage p={p} bg="#123049" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(ka + 2, 6)}>
        <MapView frame={frame} dim={0.5 - 0.1 * m.lerp([bh, bh + 10], [0, 1])}>
          <SeaRipples t={m.t} k={1} />
          <CoastSurf t={m.t} k={0.6 + 0.4 * m.lerp([sa, sa + 10], [0, 1])} />
          <CoastLine k={sweep} pivot={[79, 21]} width={10 + 5 * m.pulse(ac + 4, 8)} />
          <OnMap at={[87.0, 14.5]}>{(x, y) => <Question x={Math.min(840, x)} y={Math.min(1150, y)} k={m.pop(ka, 10)} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Hook;
