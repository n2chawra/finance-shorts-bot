// Loop: "आपके स्टेट से कौन-सा देश लगता है? कमेंट कीजिए। और बताइए," From Bangladesh the camera pulls back to all of
// India on "आपके", every neighbour in its colour and every border bright; a comment bubble pops on "कौन-सा" and bounces
// on "कमेंट"; on "बताइए" the other neighbours fade and China and Pakistan stay filled with their flags, as the hook opens.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour } from "../../flat/india";
import { ALL, Bubble, F, MapView, N, lerpFrame } from "./props";

const FLAGGED = ["Nepal", "Bhutan", "Myanmar", "Bangladesh"];

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ap = m.at("aapke", 2), ka = m.at("kaun", 14), cm = m.at("comment", 30), ba = m.at("bataiye", 46);
  const pull = m.lerp([ap, ap + 26], [0, 1]);
  const back = m.lerp([ba - 2, Math.max(ba + 8, m.end - 2)], [0, 1]);
  const frame = lerpFrame(F.bd, F.india, pull);
  const others = 1 - back;
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.02 * m.pulse(cm + 2, 7)}>
        <MapView frame={frame} dim={0.5}>
          {ALL.filter((n) => n !== "China" && n !== "Pakistan").map((n) => (
            <Neighbour key={n} name={n} fill={N[n]!.fill} flag={FLAGGED.includes(n) ? n : undefined} k={0.4 + 0.6 * others * (FLAGGED.includes(n) ? 1 : 0)} />
          ))}
          <Neighbour name="China" fill={N.China!.fill} flag="China" flagK={0.85 * back} k={0.4 + 0.6 * pull} lift={0.2 * back} />
          <Neighbour name="Pakistan" fill={N.Pakistan!.fill} flag="Pakistan" flagK={0.85 * back} k={0.4 + 0.6 * pull} lift={0.2 * back} />
          {ALL.map((n) => <BorderLine key={n} name={n} k={pull * others} color="#ffffff" width={8} />)}
        </MapView>
      </View>
      <Bubble x={500} y={330} w={680} h={150} k={m.pop(ka, 10) * (1 + 0.12 * m.pulse(cm + 1, 8))} text="आपके स्टेट का पड़ोसी?" size={54} o={1 - m.lerp([ba, ba + 10], [0, 1])} />
    </Stage>
  );
};

export default Loop;
