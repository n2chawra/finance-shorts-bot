// Hook: "Grand Theft Auto Five has sold over 230M copies, and it came out over a decade ago."
// A gamer's bedroom at night: the gamer on a beanbag holds the game box (the subject, frame 0); a tower of
// box spines stacks up beside him on "Grand", shoots up through the ceiling on "sold" as the camera pulls back,
// the counter strapped to the tower counts to the figure on "copies", and on "came" the camera pushes in on
// the old, dusty box in his hands while he stares up.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Display, Glow, INK, STROKE, SourceLine, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Bedroom, GameBox, Spine } from "./props";

type Params = { fig?: { copies?: string } };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const copies = (p.beat.params as Params).fig?.copies ?? "";
  const grand = m.at("grand", 2), sold = m.at("sold", 18), said = m.at("copies", 50), came = m.at("came", 99999);
  const n = m.t < sold ? m.lerp([grand, sold], [7, 13]) : m.lerp([sold, sold + 16], [13, 70], Easing.in(Easing.quad));
  const back = m.lerp([sold, said + 6], [0, 1], Easing.inOut(Easing.cubic));
  const push = m.lerp([came - 2, came + 16], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.12 - 0.22 * back + 0.55 * push;
  const cx = 560 - 40 * back - 200 * push, cy = 1020 - 180 * back + 260 * push;
    const shake = m.t >= sold && m.t < sold + 14 ? Math.sin(m.t * 2.7) * (sold + 14 - m.t) * 1.4 : 0;
  const base = 1500, sh = 56, tx = 560, tw = 330;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2a2258" vignette={0.48}>
        <View zoom={zoom} cx={cx + shake} cy={cy}>
          <Bedroom tv={1} />
          {/* the tower of copies */}
          {Array.from({ length: Math.floor(n) }).map((_, i) => {
            const land = i === Math.floor(n) - 1 ? (n % 1) : 1;
            return <g key={i} transform={`translate(${(i % 3) * 6 - 6} ${(1 - land) * -120})`}><Spine x={tx} y={base - (i + 1) * sh} w={tw} h={sh} tone={i} /></g>;
          })}
          {/* the ceiling the tower breaks through */}
          <rect x={-400} y={-600} width={1880} height={660} fill="#2a2258" />
          <rect x={-400} y={40} width={1880} height={30} fill="#4a3d8a" stroke={INK} strokeWidth={STROKE} />
          {n > 28 ? (
            <g>
              <polygon points={`${tx - 30},70 ${tx + tw + 30},70 ${tx + tw + 10},20 ${tx - 10},20`} fill="#16151f" stroke={INK} strokeWidth={4} />
              {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={tx - 50 + i * 90 + m.wave(9, 6, i)} y={90 + ((m.t - sold) * 9 + i * 70) % 600} width={22} height={16} fill="#8f84c4" stroke={INK} strokeWidth={3} />)}
            </g>
          ) : null}
          {/* the counter strapped to the tower */}
          <rect x={tx - 10} y={470} width={14} height={260} fill="#c9a14a" stroke={INK} strokeWidth={3} />
          <rect x={tx + tw - 4} y={470} width={14} height={260} fill="#c9a14a" stroke={INK} strokeWidth={3} />
          <Display x={420} y={480} w={500} h={230} label="COPIES SOLD" value={copies} color="#ffd23f" />
          <Glow x={670} y={600} r={380} color="#ffd23f" o={0.5 * m.pulse(said, 10)} />
          {/* the gamer on the beanbag, holding the box */}
          <ellipse cx={300} cy={1610} rx={260} ry={120} fill="#e0457b" stroke={INK} strokeWidth={STROKE} />
          <ellipse cx={270} cy={1580} rx={180} ry={60} fill="#f0679a" />
          <Char x={300} y={1620 + m.wave(56, 4)} s={280} sit hair="cap" hat="#2bb673" top="#ff8a3d" skin="#b9774a" outfit="tee"
            face={m.t >= came ? "shock" : m.t >= sold ? "happy" : "neutral"} look={m.t >= sold ? [0.5, -0.8] : [0.3, 0]}
            armL={[30, 140]} armR={[30, 140]} light="#7fb8ff" tilt={m.lerp([sold, sold + 10], [0, -6])} />
          <GameBox x={160} y={1040 + m.wave(56, 4)} w={300} rot={-8} dusty={m.t >= came} />
          <Glow x={300} y={1200} r={300} color="#ffcf7a" o={0.25 * m.pulse(came, 14)} />
        </View>
      </Stage>
      <AbsoluteFill style={{ background: "#ffffff", opacity: m.pulse(sold, 5) * 0.5 }} />
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
