// Build: "So who lent all that? Most of it, {pub}, is owed to whoever holds Treasury bills and bonds: banks, funds, other countries."
// The bond counter hall: the lights come up on three teller windows on "lent", the ledger board over them
// counts up on "Most", a Treasury bond certificate slides across the counter on "bonds" (close), then each
// window lights and grabs its bonds on "banks", "funds" and "countries" as the camera pulls back.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, Stage, Tag, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { pub?: string } };

const Bond: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = 0 }) => {
  const h = w * 0.62;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 6} y={y + 8} width={w} height={h} rx={6} fill="#000" opacity={0.22} />
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#e9f2df" stroke={INK} strokeWidth={4} />
      <rect x={x + w * 0.06} y={y + h * 0.08} width={w * 0.88} height={h * 0.84} rx={4} fill="none" stroke="#3a7d5a" strokeWidth={4} />
      <circle cx={x + w * 0.22} cy={y + h * 0.55} r={h * 0.2} fill="#3a7d5a" opacity={0.85} />
      <Txt x={x + w * 0.6} y={y + h * 0.36} size={Math.max(16, h * 0.17)} fill="#2a5a40" deco>TREASURY</Txt>
      <line x1={x + w * 0.42} y1={y + h * 0.62} x2={x + w * 0.85} y2={y + h * 0.62} stroke="#3a7d5a" strokeWidth={3} />
      <line x1={x + w * 0.42} y1={y + h * 0.74} x2={x + w * 0.78} y2={y + h * 0.74} stroke="#3a7d5a" strokeWidth={3} />
    </g>
  );
};

const Bonds: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pub = (p.beat.params as Params).fig?.pub ?? "";
  const lent = m.at("lent", 6), most = m.at("most", 30), it = m.at("it", 36), owed = m.at("owed", 70), holds = m.at("holds", 80), bonds = m.at("bonds", 90);
  const banks = m.at("banks", 110), funds = m.at("funds", 125), countries = m.at("countries", 140);
  const lights = m.lerp([lent, lent + 10], [0.25, 1]);
  const count = m.lerp([it, it + 30], [0, 1], Easing.out(Easing.cubic));
  // camera: wide, push close on the bond, back to medium on banks, wide on countries
  const z = m.t < bonds ? m.lerp([0, bonds], [1.0, 1.06])
    : m.t < banks ? m.lerp([bonds, bonds + 10], [1.06, 1.7], Easing.out(Easing.cubic))
    : m.lerp([banks - 4, banks + 8], [1.7, 1.0], Easing.inOut(Easing.cubic));
  const cy = m.t < bonds ? 900 : m.t < banks ? m.lerp([bonds, bonds + 10], [900, 1130]) : m.lerp([banks - 4, banks + 8], [1130, 960]);
  const wins: { x: number; at: number; name: string; col: string }[] = [
    { x: 60, at: banks, name: "BANKS", col: "#3d6fd1" },
    { x: 390, at: funds, name: "FUNDS", col: "#7b5cff" },
    { x: 720, at: countries, name: "COUNTRIES", col: "#e8432f" },
  ];
  const close = z > 1.15;   // the close-up on the bond: the far wall is out of shot
  const slideIn = m.lerp([holds, holds + 14], [-500, 0], Easing.out(Easing.back(1.1)));
  return (
    <Stage p={p} bg="#1f2433" vignette={0.4}>
      <View zoom={z} cx={540} cy={cy}>
        <rect x={-300} y={-300} width={1680} height={1700} fill="#c9b48a" />
        <rect x={-300} y={-300} width={1680} height={1700} fill="#000" opacity={0.6 * (1 - lights)} />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-120 + i * 240} y={-300} width={60} height={1700} fill="#b39d72" stroke={INK} strokeWidth={4} />)}
        {Array.from({ length: 4 }).map((_, i) => <Glow key={i} x={180 + i * 240} y={140} r={200} color="#fff1c9" o={0.45 * lights} />)}
        {/* the ledger board over the windows */}
        {close ? null : <Display x={140} y={250} w={800} h={260} label="OWED TO HOLDERS" value={m.t < it ? "- - -" : countText(pub, count)} color="#ffd23f" k={m.t < most ? 0.35 : 1} />}
        {m.t >= owed && !close ? <Tag x={640} y={200} w={260} h={96} text="OWED" rot={8} bg="#d8433a" fg="#ffffff" k={m.pop(owed, 9)} /> : null}
        {/* teller windows */}
        {wins.map((w, i) => {
          const on = m.t >= w.at;
          const grab = m.pop(w.at, 12);
          return (
            <g key={i}>
              <Block x={w.x} y={620} w={300} h={420} fill="#7a5a3a" />
              <rect x={w.x + 24} y={690} width={252} height={300} rx={10} fill={on ? "#fff4d6" : "#3a3022"} stroke={INK} strokeWidth={5} />
              {on ? <Glow x={w.x + 150} y={840} r={220} color={w.col} o={0.45} /> : null}
              <rect x={w.x + 20} y={630} width={260} height={56} rx={8} fill={w.col} stroke={INK} strokeWidth={4} />
              {close ? null : <Txt x={w.x + 150} y={659} size={44} fill="#ffffff">{w.name}</Txt>}
              {i === 2 ? (
                <g>
                  {(["#3d6fd1", "#d8433a", "#2bb673", "#ffc43d"]).map((c, k) => (
                    <g key={k}><Block x={w.x + 46 + k * 56} y={720} w={4} h={90} fill={INK} shadow={false} sw={2} /><rect x={w.x + 50 + k * 56} y={722} width={44} height={30} fill={c} stroke={INK} strokeWidth={3} /></g>
                  ))}
                </g>
              ) : null}
              {on ? <Char x={w.x + 150} y={1000} s={110} skin={["#e2a679", "#a8683a", "#f1c9a0"][i]!} top={w.col} outfit="suit" face="grin" hair={i === 1 ? "bun" : "side"}
                armL={[20, 10]} armR={[m.lerp([w.at, w.at + 8], [20, 130]), 30]} /> : null}
              {/* bonds fly into the window */}
              {Array.from({ length: i === 2 ? 5 : 3 }).map((_, k) => {
                const d = m.pop(w.at + k * 2, 13);
                return d > 0.02 ? <g key={k}><Bond x={w.x + 60 + (1 - d) * (540 - w.x - 60) + k * 12} y={880 - d * 40 + (1 - d) * 260 - k * 14} w={170} rot={-6 + k * 5} /></g> : null;
              })}
              {grab > 0 ? null : null}
            </g>
          );
        })}
        {/* the counter and the bond sliding across it */}
        <Block x={-200} y={1040} w={1480} h={120} fill="#5a3d24" />
        <rect x={-200} y={1160} width={1480} height={1000} fill="#3a2a1c" />
        <g transform={`translate(${slideIn} 0)`}><Bond x={380} y={1050} w={320} rot={-3} /></g>
        <Char x={860} y={1640} s={200} skin="#e2a679" top="#2f3445" pants="#2f3445" outfit="suit" accent="#2bb673" back hair="side" hairColor="#3a2a22"
          armR={[m.lerp([bonds - 6, bonds + 4], [20, 150]), 20]} armL={[20, 10]} />
      </View>
    </Stage>
  );
};

export default Bonds;
