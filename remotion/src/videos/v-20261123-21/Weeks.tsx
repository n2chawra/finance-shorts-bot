// Weeks: "Its engineers had just {fact1} weeks to build one, to show America's phone regulators."
// A seventies workbench at night (whip in): the soldering iron glows and boards slide across the bench
// ("engineers"); the wall calendar's pages tear off one by one ("just"); the weeks figure slams onto the
// calendar ("weeks", close); the handset's parts snap together on the bench ("build"); pull back: a
// briefcase and a meeting badge beside the finished prototype ("show", wide; "regulators" label).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, Bench, Board, Calendar, Handset, Insides, k01 } from "./Models";

type Params = { fig?: { weeks?: string } };
const S = 0.06; // the handset at bench scale

const Weeks: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const eng = m.at("engineers", 4);
  const just = m.at("just", 14);
  const weeks = m.at("weeks", 26);
  const build = m.at("build", 40);
  const show = m.at("show", 54);
  const reg = m.at("regulators", 66);
  const end = Math.max(m.end, reg + 20);
  const fig = (p.beat.params as Params).fig ?? {};
  const made = k01(f, build, 14);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 1.15, -0.3], dir: [0.15, 0.2, 1], from: 3.6, to: 3.2, dur: Math.max(8, weeks), fov: 42 },
    { at: weeks, move: "push", look: [-0.45, 1.5, -0.7], dir: [0.1, 0.05, 1], to: 2.4, dur: Math.max(8, show - weeks) },
    { at: show, move: "pullback", look: [0, 1.25, -0.3], dir: [0.3, 0.25, 1], to: 4.4, dur: Math.max(12, end - show) },
  ]);
  const slide = k01(f, eng, 18);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={4} fog={{ color: "#05070f", near: 5, far: 14 }}>
        <Camera3D keys={keys} seed="v2321-weeks" />
        <Bench f={f} />
        <Calendar position={[-0.55, 1.7, -0.72]} f={f} tearFrom={just} tearTo={weeks + 4} pages={6} />
        <FigLabel3D fig={fig.weeks ?? ""} caption="weeks" at={[-0.55, 1.72, -0.6]} start={weeks} count={0} px={150} />
        {/* boards sliding across the bench */}
        <group position={[0.9 - 0.6 * slide, 0.81, 0.15]}><Board size={[0.3, 0.2]} seed="bench-a" traces={10} parts={6} /></group>
        <group position={[-0.5 + 0.3 * slide, 0.81, 0.25]} rotation-y={0.4}><Board size={[0.25, 0.18]} seed="bench-b" traces={8} parts={5} dark /></group>
        {/* the prototype: its parts, then the shell closes round them */}
        <group position={[0.1, 0.8, 0]} rotation-y={-0.35} scale={S}>
          {made < 1 && <Insides apart={1 - made} />}
          <Handset shell={made} lit={made} keys={made} />
        </group>
        {/* briefcase and badge for the meeting */}
        <group position={[0.75 + 0.6 * (1 - k01(f, show, 12)), 0.8, 0.05]}>
          <Block size={[0.5, 0.36, 0.12]} radius={0.02} preset="white" color="#5b3a22" position={[0, 0.18, 0]} />
          <Block size={[0.16, 0.04, 0.03]} radius={0.01} preset="brushed" position={[0, 0.38, 0]} />
        </group>
        <Label3D at={[0.75, 1.2, 0.05]} offset={[0.1, 0.35, 0]} text="Meeting with" sub="the phone regulators" start={reg} px={52} color={TECH.white} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Weeks;
