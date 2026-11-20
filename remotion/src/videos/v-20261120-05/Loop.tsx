// "One passport, or {fact1} flags: which world would you pick? Tell me in the comments. And picture it
// again:" A passport pops up on the left over the one-colour world, a fan of flags on the right with the
// figure on a board, a question mark bounces between them and a comment bubble pops up; on "picture" the
// borders draw themselves back, the colours split again and the passport drops in: the hook's first frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, countText, motion } from "../../flat/kit";
import { FlagArt } from "../../flat/flags";
import { Bubble, Passport, QMark, Sign, World } from "./props";
import { HookPic } from "./Hook";

type Params = { fig?: { members?: string } };
const FAN = ["France", "Brazil", "India", "Japan", "Nigeria"];

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const n = (p.beat.params as Params).fig?.members ?? "";
  const pa = m.at("passport", 4), fl = m.at("flags", 25), wo = m.at("world", 50), pi = m.at("pick", 60), co = m.at("comments", 80), pc = m.at("picture", 110);
  const redraw = m.t >= pc;
  const back = m.lerp([pc, m.end - 2], [1, 0]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.32}>
      {!redraw ? (
        <View zoom={1.02 + 0.04 * m.pulse(wo + 4, 8) + m.wave(70, 0.01)}>
          <World center={[5, 16]} scale={300} merge={() => 1} />
          <g transform={`scale(${Math.min(1, m.pop(pa, 12))})`} style={{ transformOrigin: "260px 640px" }}>
            <Passport x={260} y={640} s={180} rot={-8} />
          </g>
          {FAN.map((f, i) => {
            const k = m.pop(fl + i * 2, 12);
            return k > 0 ? <g key={f} transform={`rotate(${(i - 2) * 12} 800 860)`} opacity={Math.min(1, k * 2)}><FlagArt name={f} x={730} y={540 - 40 * k} w={150} h={100} /></g> : null;
          })}
          <Sign x={800} y={1080} w={340} label="FLAGS" value={countText(n, m.lerp([fl, fl + 18], [0, 1]))} k={m.pop(fl, 12)} />
          <QMark x={530} y={640} k={m.pop(pi, 10)} t={m.t} size={200} />
          <Bubble x={540} y={330} k={m.pop(co, 12)} text="PICK ONE?" />
        </View>
      ) : (
        <View zoom={1.02}>
          <HookPic t={m.t} back={back} drop={m.lerp([pc + 4, m.end], [0, 0.8])} pins={0} down={back} sweep={m.lerp([pc, m.end - 2], [200, -190], (x) => x)} eraser={0} />
          <Flash k={m.pulse(pc, 5)} />
        </View>
      )}
    </Stage>
  );
};

export default Loop;
