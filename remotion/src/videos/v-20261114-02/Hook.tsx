// Hook: "Costco's whole profit last year was $9.2B."
// The warehouse floor at opening, under the COSTCO sign: a forklift sets down a pallet of cash on "Costco's"
// and backs away on "whole"; the PROFIT tag swings in with the figure on "profit" as the camera pushes in,
// and on "last" the camera eases out as Rohan walks in to look.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, SourceLine, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { CashPallet, Warehouse } from "./props";

type Params = { fig?: { profit?: string } };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const F = (p.beat.params as Params).fig ?? {};
  const costco = m.at("costco", 2), whole = m.at("whole", 14), profit = m.at("profit", 24), last = m.at("last", 70), was = m.at("was", 84);
  const set = m.lerp([0, costco + 8], [-70, 0], Easing.out(Easing.back(1.4)));
  const away = m.lerp([whole - 4, whole + 24], [0, -460], Easing.in(Easing.quad));
  const push = m.lerp([profit - 2, profit + 12], [0, 1], Easing.inOut(Easing.cubic));
  const ease = m.lerp([last - 2, last + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.12 + 0.3 * push - 0.32 * ease, cx = 400 - 80 * push + 160 * ease, cy = 880 - 120 * push + 120 * ease;
  const tag = 1;
  const swing = m.pop(profit - 4, 8);
  const walk = m.lerp([last - 6, last + 20], [1300, 860], Easing.out(Easing.quad));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#c9ccd6" vignette={0.35}>
        <View zoom={zoom} cx={cx} cy={cy}>
          <Warehouse floor={1250} />
          <g transform={`translate(${away} 0)`}>
            <Limb a={[40, 1240]} b={[40, 640]} w={18} color="#3a3f4f" sw={4} />
            <Block x={-260} y={1050} w={260} h={170} r={16} fill="#ffc43d" />
            <Block x={-210} y={930} w={150} h={130} r={10} fill="#ffe08a" shadow={false} />
            <Limb a={[40, 1220 + set]} b={[150, 1220 + set]} w={14} color="#3a3f4f" sw={4} />
          </g>
          <g transform={`translate(0 ${set + m.pulse(costco + 8, 4) * 8})`}>
            <CashPallet x={120} y={1250} w={380} h={560} />
          </g>
          <g transform={`rotate(${m.wave(40, 3) + Math.sin(swing * Math.PI) * -14} 310 400)`}>
            <line x1={310} y1={400} x2={310} y2={500} stroke={INK} strokeWidth={5} />
            <Tag x={130} y={500} w={360} h={150} text={F.profit ?? ""} size={84} k={tag} bg={(m.t > profit - 2 && m.t < profit + 6) || (m.t > was && m.t < was + 6) ? "#fff3a0" : "#ffc43d"} />
            {tag > 0.2 ? <Txt x={310} y={465} size={44} fill={INK}>PROFIT</Txt> : null}
          </g>
          <Char x={walk} y={1520} s={190} who="rohan" hair="side" outfit="shirt" face={m.t > was ? "shock" : "neutral"} look={[-1, -0.4]}
            armL={m.t > was ? [130, 150] : [15 + m.wave(10, 20), 10]} armR={m.t > was ? [130, 150] : [15 - m.wave(10, 20), 10]} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
