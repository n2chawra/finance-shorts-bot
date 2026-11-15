// Promise: "Now 413M of his shares are pledged for loans, up from 346M. Why borrow at all?"
// The bank's vault corridor: this year's tall stack gets its tag on "Now" and a padlock on "pledged", the calendar
// tears back a year on "up" and last year's shorter stack gets its tag, the camera moves along them on "Why", and on
// "borrow" it closes on the banker peering over his glasses at them.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Banker, CertStack, Padlock } from "./props";

type Params = { fig?: { before?: string; now?: string } };

const Stacks: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const before = (p.beat.params as Params).fig?.before ?? "";
  const now = (p.beat.params as Params).fig?.now ?? "";
  const nw = m.at("now", 2), pledged = m.at("pledged", 30), year = m.at("up", 50), bef = year, why = m.at("why", 90), borrow = m.at("borrow", 110);
  const grow = 1;
  const mid = m.lerp([why - 4, why + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([borrow - 4, borrow + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 0.98 + 0.2 * mid + 0.45 * close;
  const cx = 540 - 150 * mid + 370 * close, cy = 900 - 60 * mid + 120 * close;
  const torn = m.lerp([year - 2, year + 14], [0, 1]);
  return (
    <Stage p={p} bg="#2b2a24" vignette={0.5}>
      <View zoom={zoom} cx={cx + m.wave(80, 5)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#6e6656" />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-400 + i * 260} y={-400} width={30} height={1800} fill="#5c5546" stroke={INK} strokeWidth={3} />)}
        <rect x={-400} y={1360} width={1880} height={900} fill="#3d382e" />
        <line x1={-400} y1={1362} x2={1480} y2={1362} stroke={INK} strokeWidth={STROKE} />
        {/* the calendar */}
        <rect x={80} y={240} width={240} height={260} rx={10} fill="#f4f1e8" stroke={INK} strokeWidth={STROKE} />
        <rect x={80} y={240} width={240} height={64} fill="#c74634" stroke={INK} strokeWidth={4} />
        <Txt x={200} y={410} size={torn < 0.5 ? 60 : 36} fill={INK} deco={torn >= 0.5}>{torn < 0.5 ? "NOW" : "A YEAR AGO"}</Txt>
        {torn > 0 && torn < 1 ? <rect x={80 + torn * 200} y={304 + torn * 700} width={240} height={196} fill="#f4f1e8" stroke={INK} strokeWidth={3} transform={`rotate(${torn * 80} ${200 + torn * 200} ${400 + torn * 700})`} /> : null}
        <Glow x={540} y={300} r={500} color="#ffe6a0" o={0.35} />
        {/* last year's stack, then this year's */}
        <CertStack x={170} y={1360} w={260} n={30} />
        <Tag x={150} y={620} w={300} h={90} text={before} bg="#ffd23f" k={m.pop(bef - 2, 10)} />
        <CertStack x={560} y={1360} w={260} n={30 + 6 * grow} />
        <Tag x={540} y={500 - 130 * grow} w={300} h={90} text={now} bg="#4dd88a" k={m.pop(nw, 10)} />
        <Padlock x={690} y={1000 - (1 - m.pop(pledged, 10)) * 400} s={1.1} shut={m.t < pledged ? 0 : 1} />
        {/* the banker, peering */}
        <Banker x={930} y={1500} s={210} face={m.t >= borrow ? "shock" : "neutral"} look={[-0.9, -0.3]} armL={[60, 140]} armR={[20, 10]} />
        <Block x={-400} y={1440} w={1880} h={30} fill="#8a7a5a" sw={0} shadow={false} />
      </View>
    </Stage>
  );
};

export default Stacks;
