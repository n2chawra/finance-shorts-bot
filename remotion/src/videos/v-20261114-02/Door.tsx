// Build: "The real money waits at the door. Every member pays for the card, every single year."
// The membership desk at the entrance: the doors slide open on "real", the queue shows on "door", Rohan pays
// and a card pops out of the printer on "member", cards fly down the line on "card", and on "year" the camera
// pushes in on the wall calendar as its page flips and RENEW stamps on it.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { BLUE, BigCard, Note, RED } from "./props";

const Door: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const real = m.at("real", 4), door = m.at("door", 30), member = m.at("member", 50), card = m.at("card", 70), year = m.at("year", 100);
  const open = m.lerp([real - 2, real + 16], [0, 1], Easing.inOut(Easing.cubic));
  const mid = m.lerp([member - 4, member + 12], [0, 1], Easing.inOut(Easing.cubic));
  const cl = m.lerp([year - 6, year + 4], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1 + 0.25 * mid + 0.3 * cl + m.lerp([0, m.end], [0, 0.03]);
  const cx = 540 + 160 * cl, cy = 980 - 60 * mid - 220 * cl + 60 * mid * cl;
  const flip = m.lerp([year - 4, year + 6], [0, 1]);
  const queue = [760, 870, 980, 1090, 1200];
  const skins = ["#e0b48a", "#8d5a3b", "#c98652", "#f1c9a0", "#6b4226"];
  const tops = ["#2bb673", "#7b5cff", "#ffc43d", "#3d6fd1", "#e8432f"];
  return (
    <Stage p={p} bg="#c9ccd6" vignette={0.32}>
      <View zoom={zoom} cx={cx} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={1600} fill="#e8e6df" />
        <rect x={-500} y={1100} width={2080} height={1200} fill="#9b9ea8" />
        <line x1={-500} y1={1100} x2={1580} y2={1100} stroke={INK} strokeWidth={STROKE} />
        {/* the entrance doors */}
        <Block x={360} y={480} w={360} h={620} fill="#2a2f3d" shadow={false} />
        <Glow x={540} y={800} r={420 * open + 1} color="#fff6d8" o={0.7 * open} />
        <rect x={380} y={500} width={320} height={600} fill="#fff6d8" opacity={open} />
        <Block x={380 - 160 * open} y={500} w={160} h={600} fill="#9fdcff" shadow={false} sw={5} opacity={0.85} />
        <Block x={540 + 160 * open} y={500} w={160} h={600} fill="#9fdcff" shadow={false} sw={5} opacity={0.85} />
        <Block x={300} y={400} w={480} h={80} r={10} fill={RED} />
        <Txt x={540} y={440} size={54} fill="#ffffff" deco>ENTRANCE</Txt>
        {/* the wall calendar */}
        <Block x={790} y={300} w={150} h={210} r={10} fill="#ffffff" />
        <rect x={790} y={300} width={150} height={56} fill={RED} stroke={INK} strokeWidth={4} />
        <Txt x={865} y={328} size={30} fill="#ffffff" deco>{flip > 0.5 ? "NEW YEAR" : "THIS YEAR"}</Txt>
        <g transform={`translate(865 356) scale(1 ${Math.abs(1 - 2 * flip)}) translate(-865 -356)`}>
          <rect x={800} y={360} width={130} height={140} fill="#f4f1e8" stroke={INK} strokeWidth={3} />
          {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={812 + c * 40} y={372 + r * 32} width={28} height={20} fill="#c9ccd6" />))}
        </g>
        <Tag x={770} y={400} w={190} h={64} text="RENEW" rot={-10} size={42} bg={BLUE} fg="#ffffff" k={m.pop(year + 4, 9)} />
        {/* the desk */}
        <Block x={60} y={240} w={250} h={90} r={10} fill={BLUE} />
        <Txt x={185} y={285} size={44} fill="#ffffff" deco>MEMBERS</Txt>
        <Char x={200} y={1000} s={200} skin="#c98652" top={RED} hair="cap" hat={BLUE} outfit="shirt" face="happy" look={[1, 0]}
          armR={m.t > member ? [90, 100] : [30, 30]} />
        <Block x={-100} y={930} w={760} h={330} fill="#5b6278" shadow="bottom" />
        <Block x={-100} y={910} w={760} h={30} fill="#e8e6df" shadow={false} />
        <Block x={330} y={830} w={150} h={90} r={8} fill="#2a2f3d" />
        {/* the new card out of the printer */}
        {m.t > member ? (
          <g transform={`translate(${m.lerp([member, member + 14], [0, 140])} ${m.lerp([member, member + 8], [0, -90]) - m.pop(member, 10) * 10})`}>
            <BigCard x={340} y={760} w={130} h={84} name={false} />
          </g>
        ) : null}
        {/* the queue */}
        {queue.map((x, i) => (
          <Char key={i} x={x} y={1420 + (i % 2) * 20 + m.wave(50, 3, i)} s={160 - i * 6} skin={skins[i]!} top={tops[i]!} hair={i % 2 ? "bun" : "spiky"}
            face={m.t > card ? "happy" : "neutral"} look={[-1, 0]} armL={(m.t > card + i * 3 && m.t < year - 2) || m.t > year + 2 + i * 2 ? [120, 150] : [15, 10]} />
        ))}
        {/* the line pays again on "year": notes fly to the desk */}
        {m.t > year ? queue.map((x, i) => {
          const k = m.lerp([year + i * 2, year + 12 + i * 2], [0, 1], Easing.out(Easing.quad));
          return k > 0 && k < 1 ? <Note key={`n${i}`} x={x + (420 - x) * k} y={1000 - 260 * Math.sin(k * Math.PI)} rot={k * 300} w={90} /> : null;
        }) : null}
        {/* cards flying down the line */}
        {m.t > card ? queue.map((x, i) => {
          const k = m.lerp([card + i * 3, card + 14 + i * 3], [0, 1], Easing.out(Easing.quad));
          return k > 0 ? <g key={i}><BigCard x={480 + (x - 520) * k} y={880 - 300 * Math.sin(k * Math.PI) + 160 * k} w={90} h={58} name={false} rot={k * 360} /></g> : null;
        }) : null}
        <Char x={520} y={1520} s={210} who="rohan" hair="side" outfit="shirt" back={false} face={m.t > member ? "grin" : "neutral"} look={[-1, -0.3]}
          armR={m.t > member - 6 && m.t < member + 14 ? [-100, -90] : [15, 10]}
          holdR={m.t > member - 6 && m.t < member + 14 ? (h) => <Note x={h[0]} y={h[1]} w={90} /> : undefined} />
      </View>
    </Stage>
  );
};

export default Door;
