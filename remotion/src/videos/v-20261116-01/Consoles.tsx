// Build: "Rockstar released it again for the next consoles, and once more for the ones after."
// A TV cabinet: close on the old console with the game box popping out of it on "Rockstar"; the box arcs
// across into a newer console that slides in on "released"/"consoles" (the TV lights up with the game's sunny
// coast), a third, newest console rises on "once", and on "after" the box jumps into it as the camera pulls back
// on all three in a row.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Console, GameBox, Palm } from "./props";

const Consoles: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const rock = m.at("rockstar", 2), rel = m.at("released", 14), cons = m.at("consoles", 30), once = m.at("once", 50), after = m.at("after", 70);
  const slide = m.pop(rel, 12);
  const rise = m.pop(once - 2, 11);
  const out = m.lerp([rock, rock + 8], [0, 1]);
  const j1 = m.lerp([rel, rel + 14], [0, 1], Easing.inOut(Easing.quad));
  const j2 = m.lerp([after - 2, after + 12], [0, 1], Easing.inOut(Easing.quad));
  const X = [230, 520, 790];
  const bx = X[0]! + (X[1]! - X[0]!) * j1 + (X[2]! - X[1]!) * j2;
  const by = 900 - 140 * out - Math.sin(j1 * Math.PI) * 240 - Math.sin(j2 * Math.PI) * 240 + 60 * j2;
  const mid = m.lerp([cons - 2, cons + 12], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([after - 2, after + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.75 - 0.4 * mid - 0.4 * wide;
  const cx = 280 + 140 * mid + 120 * wide, cy = 1000 - 20 * mid - 40 * wide;
  const tv = 1;
  return (
    <Stage p={p} bg="#2b2350" vignette={0.42}>
      <View zoom={zoom} cx={cx + m.wave(70, 5)} cy={cy + m.wave(90, 4)}>
        <rect x={-300} y={-300} width={1680} height={1700} fill="#5a4a8a" />
        <rect x={-300} y={1260} width={1680} height={900} fill="#3d3060" />
        {/* the TV on the wall */}
        <rect x={180} y={320} width={720} height={420} rx={18} fill="#111" stroke={INK} strokeWidth={STROKE} />
        <rect x={204} y={344} width={672} height={372} fill={tv > 0.5 ? "#ff9a5c" : "#1a2340"} />
        {tv > 0.5 ? (
          <g>
            <rect x={204} y={540} width={672} height={176} fill="#3fb6c9" />
            <circle cx={680} cy={470} r={60} fill="#ffe08a" />
            <Palm x={300} y={716} h={240} sway={m.wave(40, 8)} />
            <Palm x={780} y={716} h={200} sway={m.wave(46, 8, 1)} />
          </g>
        ) : null}
        <Glow x={540} y={530} r={520} color={tv > 0.5 ? "#ffb35c" : "#4a6dff"} o={0.25 + 0.2 * tv} />
        {/* the gamer, carrying the box from console to console */}
        <Char x={X[1]! + 10} y={1200} s={150} hair="cap" hat="#2bb673" top="#ff8a3d" skin="#b9774a" face={m.t >= once ? "grin" : "happy"} look={[0, -0.8]} armR={[160, 175]} armL={[150, 170]} />
                {/* the cabinet */}
        <Block x={20} y={1120} w={1040} h={240} fill="#8a5a36" shadow="bottom" />
        <rect x={10} y={1104} width={1060} height={24} fill="#a8724a" stroke={INK} strokeWidth={4} />
        <Console x={X[0]!} y={1104} gen={0} on={j1 < 0.5 ? 1 : 0} />
        <g transform={`translate(${(1 - slide) * 700} 0)`}><Console x={X[1]!} y={1104} gen={1} on={j1 > 0.9 && j2 < 0.5 ? 1 : 0} /></g>
        <g transform={`translate(0 ${(1 - rise) * 500})`} opacity={rise > 0.02 ? 1 : 0}><Console x={X[2]!} y={1104} gen={2} s={0.85} on={j2 > 0.9 ? 1 : 0} /></g>
        <Tag x={X[0]! - 90} y={1170} w={180} h={80} text="OLD" bg="#c9b99a" k={m.pop(rock, 10)} />
        <Tag x={X[1]! - 100} y={1170} w={210} h={80} text="NEXT" bg="#3fb6c9" k={m.pop(cons, 10)} />
        <Tag x={X[2]! - 120} y={1170} w={250} h={80} text="NEWEST" bg="#ffcf4a" k={m.pop(after + 12, 10)} />
<GameBox x={bx - 70} y={by} w={140} rot={m.wave(30, 4)} />
      </View>
    </Stage>
  );
};

export default Consoles;
