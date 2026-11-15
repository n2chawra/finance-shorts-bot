// Build: "Experts cleaned it, and it was sold as Leonardo's own work."
// A restorer's studio: the restorer swings a magnifier lamp over the painting on "Experts", a swab wipes the brown
// away and the face appears on "cleaned" as the camera closes in, the lamp flares on the clean face on "sold", and a
// gold LEONARDO DA VINCI plate clicks on under it on "work".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, Limb, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Painting, Plate } from "./props";

const Studio: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const exp = m.at("experts", 2), cleaned = m.at("cleaned", 16), sold = m.at("sold", 34), work = m.at("work", 48);
  const close = m.lerp([cleaned - 4, cleaned + 10], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([work - 4, work + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.5 * close - 0.45 * back, cx = 560 + 0 * close, cy = 900 - 200 * close + 180 * back;
  const paint = m.lerp([cleaned - 2, sold], [0.62, 0]);
  const swing = m.lerp([exp - 2, exp + 12], [0, 1], Easing.out(Easing.back(1.4)));
  const swabY = 330 + 500 * (1 - paint / 0.62);
  return (
    <Stage p={p} bg="#1e2a2e" vignette={0.45}>
      <View zoom={zoom} cx={cx + m.wave(80, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#a8987e" />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-300 + i * 300} y={-400} width={150} height={1800} fill="#9a8a70" />)}
        <rect x={-400} y={1320} width={1880} height={900} fill="#8a7a6a" />
        {/* the easel */}
        <line x1={460} y1={1320} x2={520} y2={460} stroke="#6b4a2e" strokeWidth={22} />
        <line x1={680} y1={1320} x2={620} y2={460} stroke="#6b4a2e" strokeWidth={22} />
        <Painting x={350} y={330} w={420} paint={paint} glow={m.pop(sold, 12)} />
        <Plate x={330} y={940} w={460} text="LEONARDO DA VINCI" k={m.t < work - 2 ? 0 : m.pop(work - 2, 9)} />
        {/* the swab */}
        {m.t >= cleaned - 2 && m.t < sold + 4 ? (
          <g transform={`translate(${560 + Math.sin(m.t / 2.2) * 120} ${swabY})`}>
            <Limb a={[0, 0]} b={[140, 120]} w={10} color="#f4f1e8" />
            <Ball x={0} y={0} r={20} fill="#f4f1e8" sw={4} />
          </g>
        ) : null}
        {/* the magnifier lamp on its arm */}
        <g transform={`rotate(${-40 + 40 * swing} 1020 300)`}>
          <Limb a={[1020, 300]} b={[800, 420]} w={16} color="#3a4a5a" />
          <circle cx={760} cy={440} r={70} fill="#cfe6f2" opacity={0.6} stroke={INK} strokeWidth={8} />
        </g>
        <Glow x={560} y={560} r={420} color="#fff4d0" o={0.25 + 0.35 * m.pop(sold, 12)} />
        {/* the restorer */}
        <Char x={800} y={1500} s={200} outfit="shirt" top="#f4f1e8" hair="bun" hairColor="#5a3a2a" skin="#e2a679" glasses face={m.t >= sold ? "happy" : "neutral"}
          armL={[120, 150 + 10 * Math.sin(m.t / 2.2)]} armR={[20, 10]} look={[-0.9, -0.2]} />
        <Block x={-400} y={1420} w={1880} h={30} fill="#6a5a4a" sw={0} shadow={false} />
      </View>
    </Stage>
  );
};

export default Studio;
