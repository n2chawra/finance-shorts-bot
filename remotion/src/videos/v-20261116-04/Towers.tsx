// Build: "Who rents them? Companies running their apps and websites, on Amazon Web Services." Office
// towers downtown at night: windows light up on "Who", glowing cables shoot from the towers down into
// the server hall on "rents", app screens pop on in the windows on "apps", a website page unfolds on
// the tallest tower on "websites", the rooftop billboard flips to the cloud's name on "Services".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, Txt, View, motion, rng } from "../../flat/kit";
import { Rack } from "./props";
import { Char } from "../../flat/cast";

const TOWERS: [number, number, number, string][] = [[-120, 260, 900, "#3a4a72"], [170, 230, 1180, "#47598a"], [430, 300, 1380, "#34446a"], [760, 240, 1040, "#4a5c8c"], [1030, 260, 820, "#3a4a72"]];

const Towers: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const who = m.at("who", 2), rents = m.at("rents", 14), apps = m.at("apps", 34), web = m.at("websites", 46), svc = m.at("services", 64);
  const ground = 1500;
  const zoom = m.t < apps ? m.lerp([0, apps], [1.0, 1.05]) : m.t < svc ? m.lerp([apps, apps + 12], [1.05, 1.3]) : m.lerp([svc, svc + 14], [1.3, 1.0]);
  const cy = m.t < svc ? m.lerp([apps, apps + 12], [960, 820]) : m.lerp([svc, svc + 14], [820, 900]);
  const r = rng("tw");
  return (
    <Stage p={p} bg="#0e1430" vignette={0.45}>
      <View zoom={zoom} cx={540} cy={cy}>
        <rect x={-300} y={-300} width={1680} height={2400} fill="#121a3d" />
        {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={-200 + r() * 1480} cy={-200 + r() * 500} r={2 + r() * 3} fill="#fff" opacity={0.5 + 0.3 * Math.sin(m.t / 9 + i)} />)}
        {TOWERS.map(([x, w, h, c], i) => {
          const top = ground - h;
          const cols = Math.floor((w - 40) / 54), rows = Math.floor((h - 80) / 70);
          return (
            <g key={i}>
              <Block x={x} y={top} w={w} h={h} fill={c} />
              {Array.from({ length: rows * cols }).map((_, k) => {
                const cx2 = x + 26 + (k % cols) * 54, cy2 = top + 40 + Math.floor(k / cols) * 70;
                const litAt = who + ((k * 7 + i * 3) % 17) * 0.8;
                const lit = m.t >= litAt;
                const app = m.t >= apps + ((k + i) % 9) * 0.7 && (k + i) % 3 === 0;
                return <rect key={k} x={cx2} y={cy2} width={34} height={44} rx={4} fill={app ? ["#ff9900", "#4dd8ff", "#7dff9a"][(k + i) % 3] : lit ? "#ffe9a8" : "#232c4e"} stroke={INK} strokeWidth={2} />;
              })}
            </g>
          );
        })}
        {/* the tallest tower's website page */}
        {(() => {
          const k = m.pop(web, 12);
          if (k <= 0) return null;
          return (
            <g transform={`translate(580 520) scale(${k}) translate(-580 -520)`}>
              <rect x={400} y={300} width={360} height={440} rx={14} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
              <rect x={400} y={300} width={360} height={60} rx={14} fill="#2b5fa8" />
              {[0, 1, 2].map((i) => <circle key={i} cx={430 + i * 30} cy={330} r={9} fill="#ffffff" />)}
              <rect x={430} y={390} width={300} height={140} rx={8} fill="#ffc43d" stroke={INK} strokeWidth={3} />
              {[560, 600, 640, 680].map((y, i) => <rect key={y} x={430} y={y} width={300 - i * 50} height={18} rx={6} fill="#c9cfdb" />)}
            </g>
          );
        })()}
        {/* the cables into the server hall below */}
        {TOWERS.map(([x, w], i) => {
          const k = m.lerp([rents + i * 2, rents + i * 2 + 12], [0, 1], Easing.out(Easing.cubic));
          if (k <= 0) return null;
          const x0 = x + w / 2, y0 = ground, x1 = 540, y1 = ground + 260;
          const mx = x0 + (x1 - x0) * k, my = y0 + (y1 - y0) * k;
          return <g key={i}><path d={`M ${x0} ${y0} Q ${(x0 + mx) / 2} ${my + 60} ${mx} ${my}`} fill="none" stroke="#4dd8ff" strokeWidth={14} strokeLinecap="round" opacity={0.9} /><Glow x={mx} y={my} r={60} color="#4dd8ff" o={0.6} /></g>;
        })}
        <rect x={-300} y={ground} width={1680} height={900} fill="#0b1022" />
        <line x1={-300} y1={ground} x2={1380} y2={ground} stroke={INK} strokeWidth={STROKE} />
        {[180, 400, 620, 840].map((x, i) => <Rack key={i} x={x - 70} y={ground + 180} w={140} h={250} t={m.t + i * 4} on={m.lerp([rents, rents + 14], [0, 1])} seed={`tw${i}`} />)}
        <Char x={800} y={ground - 10 + m.wave(60, 3)} s={260} skin="#c98b5e" top="#e0457b" hair="bun" hairColor="#2a2233" outfit="tee" face={m.t >= web ? "grin" : "happy"}
          look={[-0.5, -0.4]} phone="R" light={m.t >= apps ? "#4dd8ff" : undefined} armL={[30, m.lerp([apps - 4, apps + 4], [20, 150])]} />
        {/* the rooftop billboard */}
        <g transform={`translate(0 ${-m.lerp([0, 10], [0, 0])})`}>
          <rect x={150} y={230} width={14} height={110} fill="#2a2f3d" />
          <rect x={916} y={230} width={14} height={110} fill="#2a2f3d" />
          <Block x={110} y={40} w={860} h={200} r={14} fill="#0b0f14" />
          {m.t >= svc
            ? <g transform={`translate(540 140) scale(1 ${m.lerp([svc, svc + 6], [0.1, 1])}) translate(-540 -140)`}>
                <Txt x={540} y={110} size={72} fill="#ff9900" glow="#ff9900">AMAZON</Txt>
                <Txt x={540} y={185} size={56} fill="#ffffff">WEB SERVICES</Txt>
              </g>
            : <Txt x={540} y={140} size={64} fill="#4dd8ff" glow="#4dd8ff">FOR RENT</Txt>}
          <Glow x={540} y={140} r={500} color={m.t >= svc ? "#ff9900" : "#4dd8ff"} o={0.2 + 0.25 * m.pulse(svc, 10)} />
        </g>
      </View>
    </Stage>
  );
};

export default Towers;
