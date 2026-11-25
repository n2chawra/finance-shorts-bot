// Hook: "तेलंगाना की नई गाड़ियों पर टी एस की जगह टी जी क्यों लिखा जाता है?" Telangana already lit on India's map at
// frame 0; it traces round its border, a TS plate drops onto it, a TG plate slides in beside it and a big question
// mark stamps between them as the camera pushes in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { F, MapView, Plate, TEL, lerpFrame } from "./props";

const Over: React.FC<{ ts: number; tg: number; q: number; pulse: number }> = ({ ts, tg, q, pulse }) => {
  const at = useAt();
  const c = at([79.0, 17.9]);
  if (!c) return null;
  return (
    <g>
      <Plate at={[78.3, 18.6]} text="TS" k={ts} size={1.25} glow={pulse} dy={-40} />
      {tg > 0 ? (
        <g transform={`translate(${(1 - tg) * 420} 0)`}>
          <Plate at={[79.9, 17.2]} text="TG" k={Math.min(1, tg * 1.4)} size={1.25} dy={60} />
        </g>
      ) : null}
      {q > 0 ? (
        <g transform={`translate(${c[0] + 40} ${c[1] - 330}) scale(${0.6 + 0.4 * q + 0.15 * Math.sin(q * Math.PI)})`} opacity={Math.min(1, q * 2)}>
          <circle r={92} fill="#ffffff" stroke={INK} strokeWidth={8} />
          <Txt x={0} y={4} size={130} fill="#e8453c" weight={900}>?</Txt>
        </g>
      ) : null}
    </g>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const te = m.at("telangana", 2), ga = m.at("gaadi", 14), ts = m.at("ts", 30), ja = m.at("jagah", 40), ky = m.at("kyon", 62);
  const push = m.lerp([ja - 4, m.end], [0, 1]);
  const frame = lerpFrame(F.telWide, F.tel, 0.35 + 0.65 * push);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(ky + 2, 6)}>
        <MapView frame={frame} dim={0.5}
          states={{ [TEL]: { fill: "#ffc43d", trace: m.lerp([te, te + 26], [0, 1]), lift: 0.4 + 0.3 * m.pulse(ga + 4, 10) } }}>
          <Over ts={m.pop(ga, 10)} tg={m.lerp([ja, ja + 14], [0, 1])} q={m.pop(ky, 10)} pulse={m.pulse(ts + 2, 10)} />
        </MapView>
      </View>
    </Stage>
  );
};

export default Hook;
