// "And the strangest part: the International Date Line runs between the two islands. Drive east from Big Diomede,
// and you arrive in yesterday." Close on the two islands joined by the bridge: a dashed line draws down the sea
// between them from north to south and INTERNATIONAL DATE LINE writes on along it; calendar signs stand on both
// islands, a car rolls east across the bridge, crosses the line, and the calendar on Little Diomede flips back a day.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { BIG, BMap, BRIDGE, Bridge, Car, DATE_LON, Diomedes, LITTLE, along, between, fracAt, type LL , Floes } from "./props";

const Line: React.FC<{ k: number; label: number }> = ({ k, label }) => {
  const at = useAt();
  const a = at([DATE_LON, 65.86]), b = at([DATE_LON, 65.68]);
  if (!a || !b || k <= 0) return null;
  const y2 = a[1] + (b[1] - a[1]) * Math.min(1, k);
  const n = Math.round(14 * Math.min(1, label));
  const text = "INTERNATIONAL DATE LINE".slice(0, Math.round(23 * Math.min(1, label)));
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={a[0]} y2={y2} stroke={INK} strokeWidth={14} strokeDasharray="30 20" />
      <line x1={a[0]} y1={a[1]} x2={a[0]} y2={y2} stroke="#ffe08a" strokeWidth={8} strokeDasharray="30 20" />
      {n > 0 ? <Txt x={540} y={1230} size={50} fill="#ffffff" stroke={INK}>{text}</Txt> : null}
    </g>
  );
};

const Calendar: React.FC<{ ll: LL; day: string; k: number; flip?: number; dx?: number }> = ({ ll, day, k, flip = 0, dx = 0 }) => {
  const xy = useAt()(ll);
  if (!xy || k <= 0) return null;
  const x = Math.max(215, Math.min(865, xy[0] + dx)), y = xy[1] - 20;
  const q = Math.min(1, k);
  const sq = 1 - Math.sin(Math.min(1, flip) * Math.PI) * 0.9;
  return (
    <g transform={`translate(0,${(1 - q) * -80})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y]} b={[x, y - 100]} w={12} color="#6b4a2a" sw={3} />
      <g transform={`translate(${x},${y - 200}) scale(1,${sq})`}>
        <Block x={-185} y={-100} w={370} h={200} fill="#f7f3ea" r={12} />
        <rect x={-185} y={-100} width={370} height={56} rx={12} fill="#d9452f" stroke={INK} strokeWidth={4} />
        <Txt x={0} y={30} size={50} fill={INK}>{day}</Txt>
      </g>
    </g>
  );
};

const CarOn: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(along(BRIDGE, k).at);
  return xy ? <Car x={xy[0]} y={xy[1] - 8} s={72} bump={Math.sin(t / 3)} /> : null;
};

const DateLine: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sg = m.at("strangest", 2), da = m.at("date", 20), li = m.at("line", 34), be = m.at("between", 54), ea = m.at("east", 84), ar = m.at("arrive", 108), ye = m.at("yesterday", 124), sh = m.at("short", 150), wh = m.at("whole", 170), ti = m.at("time", 186);
  const view = { center: [-168.99, 65.785] as LL, scale: 70000 };
  const close = { center: [-168.975, 65.775] as LL, scale: 90000 };
  const cam = between({ center: [-169.0, 65.79], scale: 60000 }, view, m.lerp([sg, sg + 20], [0, 1]));
  const c2 = between(between(cam, close, m.lerp([ea, ea + 20], [0, 1])), { center: [-168.95, 65.8] as LL, scale: 30000 }, m.lerp([sh, sh + 24], [0, 1]));
  const k0 = fracAt(BRIDGE, 1) + 0.01, k1 = fracAt(BRIDGE, 4) - 0.005;
  const carK = m.lerp([ea, ye], [k0, k1]);
  const flip = m.lerp([ye, ye + 12], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <BMap center={c2.center} scale={c2.scale}>
          <Floes t={m.t} size={60} />
          <Diomedes t={m.t} />
          <Bridge k={1} w={20} />
          <Line k={m.lerp([da, da + 20], [0, 1])} label={m.lerp([li, li + 18], [0, 1])} />
          <Calendar ll={[BIG[0] - 0.01, BIG[1] + 0.012]} day="SUNDAY" k={m.pop(be) * (1 + 0.15 * m.pulse(wh, 10) + 0.15 * m.pulse(ti, 10))} dx={-230} />
          <Calendar ll={[LITTLE[0] + 0.01, LITTLE[1] + 0.01]} day={flip > 0.5 ? "SATURDAY" : "SUNDAY"} k={m.pop(be + 6) * (1 + 0.15 * m.pulse(wh + 6, 10) + 0.15 * m.pulse(ti, 10))} flip={flip} dx={210} />
          {m.t >= ea - 4 ? <CarOn k={carK} t={m.t} /> : null}
        </BMap>
      </View>
      <g opacity={m.pulse(ar, 10) * 0.5}><rect x={0} y={0} width={1080} height={1920} fill="#fff3b0" /></g>
    </Stage>
  );
};
export default DateLine;
