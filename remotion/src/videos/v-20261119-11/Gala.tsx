// Promise: "Together they own {fact1}, and Forbes counts only {fact2} of them."
// A gold ballroom on the night of the Forbes list: guests in top hats raise their glasses under the giant scoreboard
// on "Together", the total slams onto it with confetti on "own", the FORBES LIST row flips on at "Forbes", and the
// billionaire count rolls up on "only".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Display, Glow, Limb, SourceLine, Stage, View, countText, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { count?: string; total?: string } };

const Gala: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const tog = m.at("together", 2), own = m.at("own", 12), and = m.at("and", 40), list = m.at("forbes", 50), bill = m.at("only", 60);
  const on = m.lerp([list - 2, list + 8], [0, 1]);
  const count = countText(fig.count ?? "", m.lerp([bill - 4, bill + 18], [0, 1]));
  const slam = m.pop(own - 1, 9);
  const raise = m.lerp([tog - 3, tog + 8], [0, 1], Easing.out(Easing.back(1.5)));
  const r = rng("confetti");
  const conf = Array.from({ length: 40 }).map(() => [r() * 1080, r(), r()] as const);
  const push = m.lerp([own - 4, own + 10], [0, 1], Easing.inOut(Easing.cubic)) * (1 - 0.6 * m.lerp([list - 4, list + 10], [0, 1], Easing.inOut(Easing.cubic)));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#3a2412" vignette={0.42}>
        <View zoom={1 + 0.22 * push} cx={540 + m.wave(60, 10)} cy={880 - 120 * push + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#5a3418" />
          {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-300 + i * 200} y={-200} width={70} height={1400} fill="#6e4220" />)}
          {/* chandelier */}
          <Limb a={[540, -200]} b={[540, 250]} w={8} color="#c9952a" />
          <Glow x={540} y={290} r={260} color="#ffe08a" o={0.6 + 0.1 * m.wave(20)} />
          {[-120, -60, 0, 60, 120].map((d, i) => <Ball key={i} x={540 + d} y={290 + Math.abs(d) * 0.3} r={22} fill="#ffe9a8" sw={4} />)}
          {/* the scoreboard */}
          <Block x={150} y={380} w={780} h={560} r={24} fill="#1d1a2b" />
          <Display x={190} y={420} w={700} h={220} label="WHAT THEY OWN, TOGETHER" value={slam > 0 ? fig.total ?? "" : ""} color="#4dff9a" k={Math.max(0.35, slam)} />
          <Display x={190} y={680} w={700} h={220} label="BILLIONAIRES ON THE FORBES LIST" value={on > 0 ? count : ""} color="#ffd34a" k={Math.max(0.35, on)} />
          {/* the stage and the guests */}
          <rect x={-400} y={1000} width={1880} height={900} fill="#2e1a0c" />
          <Block x={-60} y={1000} w={1200} h={40} fill="#c9952a" shadow={false} />
          {[180, 420, 660, 900].map((x, i) => (
            <Char key={i} x={x} y={1360 + m.wave(50, 3, i)} s={120} outfit="suit" hat="#1d1a2b" top={["#2b2b3a", "#3a2b4a", "#1f3a4a", "#3a3a2b"][i]}
              face={m.t >= own ? "grin" : "smirk"} armR={[30 + 120 * raise + 25 * m.pulse(and + 3, 6), 40 + 80 * raise]} armL={[25, 15]}
              holdR={(h) => <path d={`M ${h[0] - 14} ${h[1] - 50} L ${h[0] + 14} ${h[1] - 50} L ${h[0] + 4} ${h[1] - 18} L ${h[0] + 4} ${h[1]} L ${h[0] - 4} ${h[1]} L ${h[0] - 4} ${h[1] - 18} Z`} fill="#ffe9a8" stroke="#1d1a2b" strokeWidth={4} />} />
          ))}
          {slam > 0 ? conf.map(([x, a, b], i) => {
            const y = 300 + ((m.t - own) * (8 + a * 8) + b * 200);
            return <rect key={i} x={x} y={y} width={18} height={30} fill={["#ffd34a", "#e9473b", "#4dff9a", "#5ab4ff"][i % 4]} transform={`rotate(${(m.t * 8 + i * 40) % 360} ${x} ${y})`} />;
          }) : null}
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Gala;
