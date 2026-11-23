// Payoff: "Her whole year? He earns it before breakfast on day one. His year equals {fact3} of hers."
// A stadium at sunrise: her year's pay slip floats over a breakfast table on "whole", Brian Niccol grabs it before his
// toast pops on "breakfast", the sun clears the stadium rim on "one", the camera pulls back as the stands fill row by
// row with baristas in green aprons and the scoreboard counts up to the figure on "equals", and it flashes on "hers".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, Stage, View, countText, motion } from "../../flat/kit";
import { GREEN, Niccol, Slip } from "./props";

type Params = { fig?: { ratio?: string; slip?: string } };

const Stadium: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const whole = m.at("whole", 0), bf = m.at("breakfast", 20), one = m.at("one", 34), eq = m.at("equals", 50), hers = m.at("hers", m.end - 14);
  const slipK = m.pop(whole, 10);
  const grab = m.lerp([bf, bf + 10], [0, 1]);
  const toast = m.lerp([bf + 6, bf + 14], [0, 1]);
  const sun = m.lerp([one, one + 20], [0, 1]);
  const fill = m.lerp([whole, eq], [0.3, 1]);
  const count = m.lerp([one, eq + 6], [0.05, 1]);
  const flash = m.pulse(hers + 2, 6);
  const zoom = m.t < bf ? 1.2 : m.t < one ? m.lerp([bf, bf + 10], [1.2, 1.26]) : m.lerp([one, eq], [1.26, 1.0]);
  const cy = m.t < one ? 1080 : m.lerp([one, eq], [1080, 800]);
  const rows = 6, cols = 11;
  return (
    <Stage p={p} bg="#ffb36b" vignette={0.3}>
      <View zoom={zoom} cx={540 + m.wave(120, 4)} cy={cy}>
        <defs><linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f7fc8" /><stop offset="1" stopColor="#ffcf8a" /></linearGradient></defs>
        <rect x={-500} y={-500} width={2080} height={1500} fill="url(#st-sky)" />
        <Glow x={540} y={560 - sun * 200} r={300} color="#fff1b8" o={0.4 + 0.5 * sun} />
        <circle cx={540} cy={560 - sun * 200} r={90} fill="#fff1c9" />
        {/* the stands */}
        <path d="M -400 560 Q 540 470 1480 560 L 1480 1000 L -400 1000 Z" fill="#5b6275" stroke="#1d1a2b" strokeWidth={6} />
        {[-200, 1280].map((x, i) => <g key={i}><rect x={x - 10} y={240} width={20} height={340} fill="#2a2f3e" /><Block x={x - 70} y={200} w={140} h={60} r={8} fill="#f4efe2" /><Glow x={x} y={230} r={160} color="#fff4c2" o={0.6} /></g>)}
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => {
            const i = r * cols + c;
            const k = fill * rows * cols - i;
            if (k <= 0) return null;
            const x = -300 + c * 160 + (r % 2) * 80, y = 610 + r * 64;
            return <g key={i}><rect x={x - 26} y={y + 20} width={52} height={40} rx={8} fill={GREEN} stroke="#1d1a2b" strokeWidth={3} /><circle cx={x} cy={y} r={24} fill="#c58c5c" stroke="#1d1a2b" strokeWidth={3} /><circle cx={x} cy={y - 18} r={12} fill="#2a1a10" /></g>;
          }),
        )}
        <Display x={200} y={200} w={680} h={230} label="BARISTA YEARS IN HIS ONE" value={count > 0 ? countText(f.ratio ?? "", count) : "..."} color="#ffd36b" />
        {flash > 0 ? <rect x={190} y={190} width={700} height={250} rx={14} fill="#ffd36b" opacity={0.4 * flash} /> : null}
        {/* the breakfast table in front */}
        <rect x={-400} y={1000} width={1880} height={1500} fill="#5aa55a" />
        <Block x={180} y={1200} w={720} h={50} r={10} fill="#f4efe2" shadow="bottom" />
        <Block x={620} y={1100} w={160} h={100} r={14} fill="#c9ced8" />
        <rect x={650 + 0} y={1090 - toast * 70} width={40} height={60} rx={8} fill="#d9a05b" />
        <rect x={710} y={1090 - toast * 70} width={40} height={60} rx={8} fill="#d9a05b" />
        <Niccol x={320} y={1500} s={150} m={m} armR={[60 + 80 * grab, 60]} armL={[20, 10]} />
        <Slip x={440 - 40 * grab} y={1000 - 60 * grab} w={260} amount={f.slip ?? ""} rot={-6} k={m.t < eq ? slipK : 0} />
      </View>
    </Stage>
  );
};

export default Stadium;
