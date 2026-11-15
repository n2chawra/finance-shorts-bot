// Loop: "Will you buy the new one on day one, or keep playing the one that never stopped?"
// Back in the gamer's bedroom at night: a sealed new box drops onto the beanbag on "buy", he picks it up and looks
// at it on "new", turns back to the old tower of copies on "keep", and on "stopped" the camera pushes in to the
// hook's first framing (the gamer with the old box, the counter dark), so the replay runs straight on.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Display, INK, STROKE, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Bedroom, GameBox, Spine } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const copies = (p.beat.params as { fig?: { copies?: string } }).fig?.copies ?? "";
  const buy = m.at("day", 4), nw = m.at("new", 16), keep = m.at("or", 40), stop = m.at("stopped", 64);
  const toHook = m.lerp([keep, m.end], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 0.92 + 0.2 * toHook, cx = 540 + 20 * toHook, cy = 880 + 140 * toHook;
  const drop = m.pop(buy - 2, 10);
  const lift = m.lerp([nw - 2, nw + 10], [0, 1], Easing.out(Easing.cubic));
  const put = m.lerp([keep, keep + 12], [0, 1]);
  const turned = m.t >= keep;
  const base = 1500, sh = 56, tx = 560, tw = 330;
  return (
    <Stage p={p} bg="#2a2258" vignette={0.48}>
      <View zoom={zoom} cx={cx + m.wave(70, 4)} cy={cy}>
        <Bedroom tv={1} />
        {Array.from({ length: 30 }).map((_, i) => <g key={i} transform={`translate(${(i % 3) * 6 - 6} 0)`}><Spine x={tx} y={base - (i + 1) * sh} w={tw} h={sh} tone={i} /></g>)}
        <rect x={-400} y={-600} width={1880} height={660} fill="#2a2258" />
        <rect x={-400} y={40} width={1880} height={30} fill="#4a3d8a" stroke={INK} strokeWidth={STROKE} />
        <polygon points={`${tx - 30},70 ${tx + tw + 30},70 ${tx + tw + 10},20 ${tx - 10},20`} fill="#16151f" stroke={INK} strokeWidth={4} />
        <rect x={tx - 10} y={470} width={14} height={260} fill="#c9a14a" stroke={INK} strokeWidth={3} />
        <rect x={tx + tw - 4} y={470} width={14} height={260} fill="#c9a14a" stroke={INK} strokeWidth={3} />
        <Display x={420} y={480} w={500} h={230} label="COPIES SOLD" value={copies} color="#ffd23f" />
        <ellipse cx={300} cy={1610} rx={260} ry={120} fill="#e0457b" stroke={INK} strokeWidth={STROKE} />
        <ellipse cx={270} cy={1580} rx={180} ry={60} fill="#f0679a" />
        <Char x={300} y={1620 + m.wave(56, 4)} s={280} sit hair="cap" hat="#2bb673" top="#ff8a3d" skin="#b9774a" outfit="tee"
          face={turned ? "happy" : "smirk"} look={turned ? [0.8, -0.3] : [-0.3, 0.4]} armL={[30, 140]} armR={[30, 140]} light="#7fb8ff" />
        {/* the new sealed box: lands on the beanbag, lifted, then set down as he turns to the old one */}
        {m.t >= buy - 2 ? (
          <g transform={`translate(0 ${(1 - drop) * -700 - lift * (1 - put) * 260})`}>
            <GameBox x={60 - 120 * put} y={1380} w={180} rot={10} sealed label="NEW" />
          </g>
        ) : null}
        <GameBox x={160} y={1040 + m.wave(56, 4)} w={300} rot={-8} dusty />
      </View>
    </Stage>
  );
};

export default Loop;
