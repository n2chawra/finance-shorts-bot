// Loop: "आपके शहर की सीध में कौन-सा देश है? कमेंट कीजिए। अब फिर से देखिए," All of India; pins drop on Delhi, Kolkata,
// Chennai and Bengaluru on "आपके", short lines run east from each on "शहर", a question mark pops at the east on "देश",
// a comment bubble on "कमेंट"; on "फिर" the others fade and Mumbai's pin stays, and on "देखिए" Maharashtra paints in, the
// picture the hook opens on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { HOOK_FRAME } from "./Hook";
import { Bubble, IndiaView, LatLine, MH, MUMBAI, OnMap, Pin, Pill, Question, frame, lerpF } from "./props";

const CITIES: { ll: [number, number]; hi: string }[] = [
  { ll: [77.21, 28.61], hi: "दिल्ली" },
  { ll: [88.36, 22.57], hi: "कोलकाता" },
  { ll: [80.27, 13.08], hi: "चेन्नई" },
  { ll: [77.59, 12.97], hi: "बेंगलुरु" },
];

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const aa = m.at("aapke", 2), sh = m.at("shahar", 10), de = m.at("desh", 24), co = m.at("comment", 34), ph = m.at("phir", 50), dk = m.at("dekhiye", 58);
  const f = lerpF(frame(HOOK_FRAME.center[0] + 1.5, HOOK_FRAME.center[1] + 1.5 * 0, HOOK_FRAME.scale * 1.05, 0), HOOK_FRAME, m.lerp([ph - 6, m.end], [0, 1]));
  const fade = m.lerp([ph, ph + 12], [1, 0]);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <IndiaView f={f} states={{ Maharashtra: { fill: MH, paint: m.lerp([dk - 4, dk + 12], [0, 1]), lift: 0.25 } }}>
          {CITIES.map((c, i) => (
            <g key={c.hi} opacity={fade}>
              <LatLine a={c.ll[0]} b={c.ll[0] + 6} k={m.lerp([sh + i * 3, sh + i * 3 + 18], [0, 1])} t={m.t} lat={c.ll[1]} width={6} head={false} />
              <OnMap ll={c.ll}>{(x, y) => (
                <g>
                  <Pin x={x} y={y} k={m.pop(aa + i * 4, 12)} t={m.t + i * 9} r={22} color="#3b82f6" />
                  <Pill x={x} y={y} text={c.hi} k={m.pop(aa + i * 4 + 4, 12)} size={44} dy={i === 2 ? 95 : -95} />
                </g>
              )}</OnMap>
            </g>
          ))}
          <OnMap ll={MUMBAI}>{(x, y) => <Pin x={x} y={y} k={1} t={m.t} r={26 + 6 * m.pulse(ph + 6, 10)} />}</OnMap>
          <OnMap ll={[93, 24]}>{(x, y) => <Question x={Math.min(x, 830)} y={y - 120} k={m.pop(de, 10) * fade} r={80} />}</OnMap>
        </IndiaView>
      </View>
      <Bubble x={470} y={330} k={m.pop(co, 12) * fade} text="आपका शहर?" />
    </Stage>
  );
};
export default Loop;
