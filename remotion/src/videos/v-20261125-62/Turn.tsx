// Turn: "इसका जवाब वो देश है, जिसे भारत तीन तरफ़ से घेरे हुए है।" The camera swings east on "इसका"; on "जवाब" the
// borders traced so far glow white; on "देश" a blank country between West Bengal and the north-east pulses with a
// question mark as the camera pushes in; on "तीन" three arrows from India point at it, west, north and east; on "घेरे"
// India's states round it light up.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour, type StateFx } from "../../flat/india";
import { ALL, Arrow, F, MapView, N, OnMap, Question, lerpFrame } from "./props";

const RING = ["West Bengal", "Meghalaya", "Assam", "Tripura", "Mizoram"];
const TONES = ["#ffc43d", "#e66aa0", "#3d8bd9", "#b467c9", "#f08a3c"];

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ik = m.at("par", 2), ja = m.at("lambi", 10), de = m.at("desh", 22), te = m.at("teen", 40), gh = m.at("ghere", 58);
  const frame = lerpFrame(lerpFrame(F.nepal, F.east, m.lerp([ik, ik + 20], [0, 1])), F.bd, m.lerp([de, de + 20], [0, 1]));
  const states: Record<string, StateFx> = {};
  RING.forEach((s, i) => { if (m.t >= gh + i * 3) states[s] = { fill: TONES[i]!, paint: m.lerp([gh + i * 3, gh + i * 3 + 12], [0, 1]) }; });
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(de + 3, 7)}>
        <MapView frame={frame} states={states} dim={0.5}>
          {ALL.filter((n) => n !== "Bangladesh").map((n) => <Neighbour key={n} name={n} fill={N[n]!.fill} flag={["Nepal", "Bhutan", "Myanmar"].includes(n) ? n : undefined} k={["Nepal", "Bhutan", "Myanmar"].includes(n) ? 1 : 0.4} />)}
          {["Nepal", "Bhutan", "Myanmar"].map((n) => <BorderLine key={n} name={n} k={1} color="#ffffff" width={8 + 4 * m.pulse(ja + 6, 10)} />)}
          <Neighbour name="Bangladesh" fill="#f1e6cf" k={m.lerp([de, de + 8], [0.3, 1])} lift={0.3 + 0.5 * m.pulse(de + 8, 12)} />
          <OnMap at={[90.2, 23.9]}>{(x, y) => (
            <g>
              <Question x={x} y={y} k={m.pop(de + 4, 10)} r={80} />
              <Arrow x1={x - 360} y1={y} x2={x - 110} y2={y} k={m.lerp([te, te + 10], [0, 1])} />
              <Arrow x1={x} y1={y - 380} x2={x} y2={y - 110} k={m.lerp([te + 4, te + 14], [0, 1])} />
              <Arrow x1={Math.min(x + 360, 900)} y1={y} x2={x + 110} y2={y} k={m.lerp([te + 8, te + 18], [0, 1])} />
            </g>
          )}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};

export default Turn;
