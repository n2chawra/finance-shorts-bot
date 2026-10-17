/**
 * The cast on one page, for the owner's approval: each character front-on and acting, Sikka, and
 * one character's full range of expressions.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import { EXPRESSIONS, type Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import { Sikka } from "../cast/Sikka";
import { FONT } from "../design/fonts";

const BG = "#0e2036";

const Figure: React.FC<{ id: string; pose: PoseName; expression: Expression; turn?: number; label: string; sub: string }> = ({ id, pose, expression, turn = 0, label, sub }) => {
  const member = CAST[id]!;
  return (
    <div style={{ width: 250, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={250} height={560} viewBox="-150 -560 300 600" overflow="visible">
        <Character id={`${id}-${pose}`} look={member.look} pose={{ ...POSES[pose], turn }} expression={expression} x={0} y={0} gaze={[turn * 0.6, 0]} />
      </svg>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: "#f0f8ff" }}>{label}</div>
      <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 18, color: "#94b0cd" }}>{sub}</div>
    </div>
  );
};

const Bust: React.FC<{ id: string; expression: Expression }> = ({ id, expression }) => (
  <div style={{ width: 150, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <svg width={150} height={150} viewBox="-115 -545 230 230">
      <Character id={`bust-${expression}`} look={CAST[id]!.look} pose={POSES.stand} expression={expression} x={0} y={0} shadow={false} />
    </svg>
    <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 18, color: "#94b0cd" }}>{expression}</div>
  </div>
);

export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #1a3a5c, ${BG})`, padding: "28px 40px" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: "#f0f8ff" }}>Meet the cast</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
      <Figure id="rohan" pose="stand" expression="happy" label="Rohan, 27" sub="the hero · techie" />
      <Figure id="rohan" pose="wave" expression="laugh" turn={0.45} label="Rohan" sub="¾ view, waving" />
      <Figure id="priya" pose="stand" expression="smirk" label="Priya, 26" sub="the planner" />
      <Figure id="priya" pose="point" expression="happy" turn={0.4} label="Priya" sub="explaining" />
      <Figure id="sharma" pose="stand" expression="proud" label="Sharma Uncle, 63" sub="retired banker" />
      <Figure id="sharma" pose="think" expression="thinking" turn={-0.35} label="Sharma Uncle" sub="thinking" />
      <div style={{ width: 200, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width={200} height={300} viewBox="-100 -150 200 300"><Sikka x={0} y={-10} size={150} expression="happy" armsUp /></svg>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: "#f0f8ff" }}>Sikka</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 18, color: "#94b0cd" }}>the money itself</div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
      {EXPRESSIONS.map((e) => <Bust key={e} id="rohan" expression={e} />)}
    </div>
  </AbsoluteFill>
);
