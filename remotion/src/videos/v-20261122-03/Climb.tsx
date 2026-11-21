// Climb: "Bitcoin soared, crashed and soared again. So what were those coins worth later?"
// A city at night with one skyscraper: a gold line starts at its foot on "Bitcoin", shoots up the tower on "soared",
// plunges down several floors with the windows flashing red on "crashed", shoots past the roof on "again", and a giant
// bitcoin coin rises over the skyline like a moon on "later".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, View, motion } from "../../flat/kit";
import { BtcCoin, Laszlo } from "./props";

const Climb: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const btc = m.at("bitcoin", 2), soared = m.at("soared", 12), crashed = m.at("crashed", 26), again = m.at("again", 40), later = m.at("later", m.end - 14);
  // the line's tip height (0 = foot, 1 = roof), and how far along x it has gone
  const h = m.t < crashed ? m.lerp([soared, crashed], [0.02, 0.55]) : m.t < again ? m.lerp([crashed, crashed + 10], [0.55, 0.25]) : m.lerp([again, again + 20], [0.25, 1.15]);
  const prog = m.lerp([btc, again + 20], [0, 1]);
  const red = m.t >= crashed && m.t < again ? 1 : 0;
  const moon = m.lerp([later, later + 20], [0, 1]);
  const pts: [number, number][] = [];
  const steps = 60;
  for (let i = 0; i <= steps * prog; i++) {
    const k = i / steps;
    const tt = btc + k * (again + 20 - btc);
    const hh = tt < crashed ? 0.02 + (0.53 * (tt - soared)) / Math.max(1, crashed - soared) : tt < crashed + 10 ? 0.55 - 0.3 * ((tt - crashed) / 10) : 0.25 + 0.9 * Math.min(1, (tt - again) / 20);
    pts.push([300 + k * 480, 1300 - Math.max(0.02, Math.min(1.15, hh)) * 1000]);
  }
  const zoom = m.t < again ? m.lerp([0, again], [1.0, 1.08]) : m.lerp([again, later + 20], [1.08, 0.96]);
  const cy = m.t < again ? m.lerp([0, again], [900, 860]) : m.lerp([again, later + 20], [860, 700]);
  return (
    <Stage p={p} bg="#0b0f2e" vignette={0.45}>
      <View zoom={zoom} cx={540 + m.wave(120, 5)} cy={cy}>
        <rect x={-800} y={-900} width={2680} height={3500} fill="#0b0f2e" />
        {moon > 0 ? <g opacity={moon}><Glow x={830} y={330 - moon * 120} r={260} color="#f7931a" o={0.5} /><BtcCoin x={830} y={330 - moon * 120} r={120} /></g> : null}
        {[-400, -150, 900, 1150].map((x, i) => (
          <Block key={x} x={x} y={600 + (i % 2) * 200} w={220} h={1000} fill={["#232b5e", "#2e3878"][i % 2]!} shadow={false} />
        ))}
        {/* the skyscraper */}
        <Block x={250} y={250} w={580} h={1060} fill="#2e3878" />
        {Array.from({ length: 13 }).map((_, r) => [0, 1, 2, 3, 4].map((c) => (
          <rect key={`${r}-${c}`} x={285 + c * 108} y={290 + r * 78} width={70} height={44} rx={4}
            fill={red && (1300 - (290 + r * 78)) / 1000 > h ? "#ff4a4a" : (r + c) % 3 ? "#ffd98a" : "#3b4588"} opacity={0.8} />
        )))}
        <rect x={-800} y={1300} width={2680} height={1300} fill="#1a1d33" />
        <Laszlo x={150} y={1480} s={230} m={m} face={red ? "shock" : "happy"} look={[0.6, -0.9]} armR={[red ? 160 : 120, 20]} />
        {pts.length > 1 ? (
          <g>
            <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke="#1d1a2b" strokeWidth={30} strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke={red ? "#ff4a4a" : "#ffc43d"} strokeWidth={18} strokeLinejoin="round" strokeLinecap="round" />
            <Glow x={pts[pts.length - 1]![0]} y={pts[pts.length - 1]![1]} r={90} color={red ? "#ff4a4a" : "#ffc43d"} o={0.8} />
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Climb;
