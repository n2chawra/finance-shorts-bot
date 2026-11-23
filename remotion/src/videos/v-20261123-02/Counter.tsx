// Promise: "That pays her {fact2}. Her boss, Brian Niccol, got {ly_total} the year before."
// The same café counter, one continuous camera move from the hook (match): her pay slip slides down onto the counter on
// "pays", the camera drifts up to the boss's poster on "Her", the poster of Brian Niccol lights up and grows on
// "Niccol", a giant cheque slams down over the counter on "got", dwarfing her slip, and THE YEAR BEFORE stamps on it
// on "before".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { Barista, CafeSet, Cheque, Poster, Slip } from "./props";

type Params = { fig?: { slip?: string; paid?: string } };

const Counter: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const pays = m.at("pays", 0), her = m.at("her", 24), nic = m.at("niccol", 34), got = m.at("paid", 50), before = m.at("before", m.end - 14);
  const slide = m.lerp([pays, pays + 12], [0, 1]);
  const bounce = m.pulse(m.at("lands", pays + 10) + 3, 5);
  const grow = m.pop(nic, 10);
  const chq = m.pop(got, 9);
  const tag = m.pop(before, 9);
  // continues the hook's last framing (zoom 1.0 around y 860) and moves on from there
  const zoom = m.t < her ? 1.0 : m.t < got ? m.lerp([her, her + 14], [1.0, 1.12]) : m.lerp([got, got + 10], [1.12, 1.2]);
  const cy = m.t < her ? 860 : m.t < got ? m.lerp([her, her + 14], [860, 700]) : m.lerp([got, got + 10], [700, 820]);
  return (
    <Stage p={p} bg="#efe6d6" vignette={0.3}>
      <View zoom={zoom} cx={540 + m.wave(110, 4)} cy={cy}>
        <CafeSet m={m} sign={1} />
        <g transform={`translate(340 575) scale(${1 + 0.25 * grow}) translate(-340 -575)`}><Poster x={190} y={380} w={300} glow={grow} /></g>
        <Barista x={640} y={1330} s={170} m={m} face={m.t >= got ? "worried" : "happy"} look={[-0.6, -0.4]} armL={[m.t >= m.at("that", 0) && m.t < got ? 70 : 20, m.t >= m.at("that", 0) && m.t < got ? 100 : 10]} armR={[20, 10]} />
        <Slip x={720} y={760 + 330 * slide - 30 * bounce} w={300 + 40 * bounce} amount={f.slip ?? ""} rot={6 - 10 * slide} k={1} />
        {chq > 0 ? <g transform={`translate(0 ${(1 - chq) * -300})`}><Cheque x={560} y={870} w={700} amount={f.paid ?? ""} rot={-3} /></g> : null}
        <Tag x={300} y={1010} w={500} h={80} text="LAST YEAR" k={tag} rot={-4} size={46} />
      </View>
    </Stage>
  );
};

export default Counter;
