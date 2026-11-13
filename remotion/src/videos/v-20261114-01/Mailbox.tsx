// Payoff: "That's about {each} each. Would you lend America more?"
// Close on Rohan at his mailbox: he pulls the envelope on "That's", the per-person figure stamps on it on
// "each" (extreme close, his jaw drops); on "Would" he looks up the street, on "lend" the camera tilts up
// to the Treasury steps, and on "more" the debt clock at dusk fills the frame: the hook's first picture.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { DebtClock, Envelope, StoneFront } from "./props";

type Params = { fig?: { each?: string; total?: string } };

const Mailbox: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const pull = m.at("that's", 2), each = m.at("each", 45), would = m.at("would", 60), lend = m.at("lend", 70), more = m.at("more", 82);
  const out = m.lerp([pull, pull + 14], [0, 1], Easing.out(Easing.cubic));
  const stamp = m.pop(each - 18, 9);
  const tilt = m.lerp([lend - 4, more + 6], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = m.t < each - 18 ? m.lerp([0, each - 18], [1.25, 1.35]) : m.t < would ? m.lerp([each - 18, each - 8], [1.35, 1.8], Easing.out(Easing.cubic)) : m.lerp([would, would + 10], [1.8, 1.0], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2a2050" vignette={0.38}
        defs={<linearGradient id="d01-sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2a6e" /><stop offset="0.6" stopColor="#c45a7a" /><stop offset="1" stopColor="#ffb06b" /></linearGradient>}>
        {/* the world is tall: the Treasury steps at the top (y < 1700), the street and mailbox below; the camera tilts up */}
        <View zoom={zoom} cx={m.t < would ? 600 : 540} cy={m.lerp([0, 1], [2700, 2700]) - tilt * 1850 + (m.t < would ? -120 : 0)}>
          <rect x={-400} y={-300} width={1880} height={2000} fill="url(#d01-sky2)" />
          <circle cx={860} cy={420} r={60} fill="#ffe6b0" />
          <StoneFront x={40} base={1500} w={1000} />
          <DebtClock x={150} y={420} w={780} h={300} label="US DEBT" value={f.total ?? ""} glow={1 + 0.6 * m.pulse(more + 6, 10)} />
          <g transform={`translate(540 ${1330 + m.wave(70, 6)})`}><Photo name="treasury" s={440} t={m.t / p.fps} /></g>
          <rect x={-400} y={1500} width={1880} height={2800} fill="#8fc97a" />
          <rect x={-400} y={1500} width={1880} height={300} fill="#9a9488" />
          {[0, 1, 2, 3].map((i) => <Block key={i} x={-300 + i * 420} y={1900} w={300} h={260} fill={["#f2a65a", "#8fc9a8", "#f0d264", "#c79bd8"][i]!} />)}
          {/* Rohan's mailbox */}
          <rect x={640} y={2560} width={24} height={460} fill="#2a2f3d" stroke={INK} strokeWidth={4} />
          <Block x={510} y={2420} w={290} h={160} r={60} fill="#3d6fd1" />
          <rect x={525} y={2440} width={30} height={120} rx={8} fill="#2a4f9e" stroke={INK} strokeWidth={4} />
          <g transform={`translate(${240 + out * 20} ${-out * 260})`}>
            <Envelope x={300} y={2440} w={320} h={180} rot={-6 + out * 4}>
              {stamp > 0 ? <Tag x={330} y={2490} w={260} h={96} text={f.each ?? ""} rot={-6} bg="#d8433a" fg="#ffffff" size={54} k={stamp} /> : null}
            </Envelope>
            <Txt x={460} y={2660} size={44} fill="#ffffff" stroke={INK}>EACH</Txt>
          </g>
          <Glow x={620} y={2500} r={300} color="#ff6b6b" o={0.35 * stamp} />
          <Char x={390} y={3020 + m.wave(55, 3)} s={290} who="rohan" outfit="tee" face={m.t > each - 16 ? "shock" : "neutral"}
            look={m.t > would ? [0.2, -1] : [0.8, -0.2]} armR={[m.lerp([pull, pull + 12], [20, 110]), 40]} armL={[20, 10]} />
        </View>
      </Stage>
      <AbsoluteFill style={{ background: "#ffffff", opacity: m.pulse(more + 8, 5) * 0.5 }} />
    </AbsoluteFill>
  );
};

export default Mailbox;
