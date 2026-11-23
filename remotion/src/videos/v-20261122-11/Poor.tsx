// Poor: "Workers who couldn't stayed east, in cheap terraced streets under the soot." On "Workers" a line of mill
// workers stands on the east; on "couldn't" they turn out empty pockets; on "east" the camera slides east into the
// smoke; on "cheap" rows of tiny houses pack in; on "terraced" the rows join end to end; on "soot" soot falls and
// the east goes grey.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { CityPlan, Walker } from "./props";

const Poor: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wo = m.at("workers", 4), co = m.at("couldn't", 18), ea = m.at("east", 30), ch = m.at("cheap", 44), te = m.at("terraced", 56), so = m.at("soot", 76), br = m.at("breathing", 90);
  const slide = m.lerp([ea, ea + 18], [0, 1]);
  const push = m.lerp([te, te + 12], [0, 1]);
  const out = m.pop(co, 10);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36 + 0.15 * m.lerp([so, so + 10], [0, 1])}>
      <View zoom={1.2 + 0.08 * push - 0.06 * m.lerp([so, so + 12], [0, 1]) + m.wave(80, 0.008)} cx={790 + 30 * slide} cy={900}>
        <CityPlan t={m.t} west={1} east={0.4 + 0.6 * m.lerp([so, so + 12], [0, 1])} villas={1} chim={1} smoke={0.35} cloud={1 + 0.0 * br} wind={0.6} labels={1} only="east"
          terraces={0.1 + 0.5 * m.lerp([ch, ch + 14], [0, 1]) + 0.4 * m.lerp([te, te + 12], [0, 1])} soot={m.lerp([so, so + 12], [0, 1])}>
          <g opacity={Math.min(1, m.pop(wo, 12) * 2)}>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <Walker x={700 + i * 90 + m.pulse(br + 4 + i * 3, 4) * 6} y={1310 + m.pulse(br + 4 + i * 3, 4) * 8} s={56} top={["#6b5a4a", "#4a5a6b", "#7a4a3a"][i]!} face={m.t >= br ? "worried" : out > 0.5 ? "sad" : "neutral"} t={m.t + i * 7}
                  armL={[20 + 50 * out, 20]} armR={[20 + 50 * out, 20]} />
                {out > 0 ? <g opacity={out}><rect x={700 + i * 90 - 50} y={1210} width={18} height={16} fill="#f4efe4" stroke={INK} strokeWidth={3} /><rect x={700 + i * 90 + 32} y={1210} width={18} height={16} fill="#f4efe4" stroke={INK} strokeWidth={3} /></g> : null}
              </g>
            ))}
          </g>
        </CityPlan>
      </View>
    </Stage>
  );
};
export default Poor;
