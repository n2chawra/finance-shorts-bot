// Payoff: "और लाइन उतरती है मेक्सिको में। मेक्सिको सिटी, {fact3} डिग्री नॉर्थ, लगभग मुंबई की सीध में!" The line reaches
// Mexico's coast; Mexico fills with its flag on "मेक्सिको"; on "सिटी" a pin drops on Mexico City and the big latitude
// sign stamps on (low hit) as the camera closes in; on "लगभग" the camera pulls far back, and on "मुंबई" the whole line
// from Mumbai to Mexico City blazes with both pins pulsing.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Land, LatLine, LatSign, MEXICO_CITY, MH, MUMBAI, MX_LON, OnMap, Pill, Pin, WorldView, frame, lerpF , SeaDefs } from "./props";

type Params = { fig?: { lat?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const lat = (p.beat.params as Params).fig?.lat ?? "";
  const li = m.at("line", 2), mx = m.at("mexico", 22), ci = m.at("city", 40), dg = m.at("dg", 56), th = m.at("theek", 70), mu = m.at("mumbai", 84);
  const near = lerpF(frame(-102.5, 21.5, 2300, 200), frame(-99.6, 19.8, 4800, 170), m.lerp([ci - 2, ci + 16], [0, 1]));
  const f = lerpF(near, frame(163, 21, 220, 200), m.lerp([th - 2, th + 22], [0, 1]));
  const k = m.lerp([li, ci], [0.72, 1]);
  const blaze = m.lerp([mu - 4, mu + 10], [0, 1]);
  return (
    <Stage p={p} bg="#2f6f9a" vignette={0.3} defs={<SeaDefs t={m.t} />}>
      <View zoom={1.03 + m.wave(80, 0.01) + 0.03 * m.pulse(ci + 3, 6)}>
        <WorldView f={f} india={{ Maharashtra: MH }}>
          <Land name="Mexico" fill="#006847" flag="Mexico" k={m.lerp([mx - 2, mx + 10], [0, 1])} lift={0.3 + 0.3 * m.pulse(mx + 6, 10)} trace={m.lerp([mx, mx + 26], [0, 1])} />
          {/* the line from Mumbai: its last stretch draws on to the city, then all of it blazes */}
          <LatLine a={72.88} b={MX_LON} k={m.t < th ? k : 1} t={m.t} glow={blaze + 0.5 * m.pulse(dg + 4, 10)} width={m.t < th ? 10 : 7} head={m.t < th} />
          <OnMap ll={MEXICO_CITY}>{(x, y) => (
            <g>
              <Pin x={x} y={y} k={m.pop(ci - 4, 12)} t={m.t} r={m.t < th ? 30 : 22} />
              {m.t < th + 20 ? <LatSign x={x - 30} y={y - 60} k={m.pop(ci, 12) * m.lerp([th, th + 8], [1, 0])} lat={lat} big t={m.t} glow={m.pulse(dg + 6, 10)} /> : null}
              <Pill x={x} y={y} text="मेक्सिको सिटी" k={m.pop(ci + 4, 12)} size={m.t < th ? 54 : 46} dy={m.t < th ? 170 : -110} />
            </g>
          )}</OnMap>
          <OnMap ll={MUMBAI}>{(x, y) => (
            <g>
              <Pin x={x} y={y} k={m.pop(th + 10, 12)} t={m.t} r={22 + 6 * m.pulse(mu + 6, 10)} />
              <Pill x={x} y={y} text="मुंबई" k={m.pop(mu, 12)} size={46} dy={-110} />
            </g>
          )}</OnMap>
        </WorldView>
      </View>
    </Stage>
  );
};
export default Payoff;
