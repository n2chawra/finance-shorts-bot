// Payoff: "So to earn his one year, the crew member would work {fact3} years."
// A road of calendar pages running to the horizon. The crew member starts walking with a fry basket on "earn", pages
// flip under each step on "crew", the camera pulls back on "work" to show the road running past castles to the horizon,
// and the milestone sign counts up and stamps the years on "years".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Display, SourceLine, Stage, View, countText, motion } from "../../flat/kit";
import { Castle, Crew, GOLD } from "./props";

type Params = { fig?: { years?: string } };

const Road: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const years = (p.beat.params as Params).fig?.years ?? "";
  const earn = m.at("earn", 6), crew = m.at("crew", 22), work = m.at("work", 40), yrs = m.at("years", 80);
  const walk = m.lerp([earn, m.end], [0, 1], (x) => x);
  const flip = m.t >= crew ? Math.floor((m.t - crew) / 5) : -1;
  const pull = m.lerp([work - 4, work + 14], [0, 1], Easing.inOut(Easing.cubic));
  const count = m.lerp([work, yrs + 4], [0, 1]);
  const push = m.lerp([yrs - 2, yrs + 12], [0, 1], Easing.inOut(Easing.cubic));
  const hz = 640;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#f0a868" vignette={0.32}>
        <View zoom={1.18 - 0.18 * pull + 0.25 * push} cx={540 + m.wave(70, 6)} cy={1000 - 200 * pull - 120 * push}>
          <rect x={-500} y={-600} width={2080} height={1300} fill="#f6c27a" />
          <circle cx={540} cy={hz - 40} r={130} fill="#ffe3a0" />
          <rect x={-500} y={hz} width={2080} height={2200} fill="#7fb36a" />
          <Castle x={140} y={hz + 10} s={0.6} />
          <Castle x={930} y={hz + 6} s={0.45} />
          <Castle x={-180} y={hz + 40} s={0.9} />
          {/* the road of calendar pages */}
          <path d={`M 510 ${hz} L 570 ${hz} L 1180 2100 L -100 2100 Z`} fill="#d9cdb8" stroke="#1d1a2b" strokeWidth={6} />
          {Array.from({ length: 14 }).map((_, i) => {
            const k = i / 14, y = hz + Math.pow(k, 1.8) * 1460, half = 30 + Math.pow(k, 1.8) * 610, h = 8 + Math.pow(k, 1.8) * 90;
            const lit = flip >= 0 && (13 - i) <= flip % 14;
            return (
              <g key={i}>
                <rect x={540 - half * 0.8} y={y} width={half * 1.6} height={h * 0.8} rx={4} fill={lit ? "#ffffff" : "#efe6d6"} stroke="#1d1a2b" strokeWidth={3} />
                <rect x={540 - half * 0.8} y={y} width={half * 1.6} height={h * 0.2} fill="#d62d20" />
              </g>
            );
          })}
          {/* the milestone sign */}
          <Display x={500} y={720} w={400} h={260} label="YEARS OF WORK" value={count > 0 ? countText(years, count) : ""} color={GOLD} />
          <Crew x={260 + 60 * walk} y={1330 - 160 * walk + Math.abs(m.wave(10, 8))} s={230 - 50 * walk} face="worried" look={[0.4, -0.5]}
            armR={[40 + m.wave(10, 20), 30]} armL={[40 - m.wave(10, 20), 30]} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Road;
