// Build: "Over the whole year, the Strip's casinos kept $8.82B."
// The desert from above at night: close on one glowing tower on "Over", pulling out on "whole" to the whole
// Strip, a line of lights in the dark desert; the towers light up one by one on "Strip's", a billboard rises
// over them on "casinos" and counts up to the year's total on "kept" as the camera closes on it.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Display, Glow, IsoBlock, INK, Stage, View, countText, isoProjector, motion, pts, rng } from "../../flat/kit";
import { NEON } from "./props";

type Params = { fig?: { year?: string } };

const Desert: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const v = (p.beat.params as Params).fig?.year ?? "";
  const over = m.at("over", 2), whole = m.at("all", 12), strip = m.at("strip", 30), casinos = m.at("casinos", 44), kept = m.at("kept", 56);
  const out = m.lerp([whole - 4, whole + 16], [0, 1], Easing.inOut(Easing.cubic));
  const up = m.lerp([kept - 4, kept + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 2.2 - 1.25 * out + 0.25 * up, cx = 600 - 60 * out, cy = 1060 - 120 * out - 330 * up;
  const iso = isoProjector(540, 1080, 38);
  const r = rng("desert-towers");
  const towers = Array.from({ length: 10 }).map((_, i) => ({ x0: -9 + i * 2.1, y0: 5 - i * 1.15, h: 4 + r() * 7, c: NEON[i % 5]! }))
    .sort((a, b) => a.x0 + a.y0 - (b.x0 + b.y0));
  const litN = m.lerp([strip - 4, strip + 20], [2, 10]);
  const rise = m.pop(casinos - 4, 13);
  const k = m.lerp([casinos, kept + 6], [0, 1], Easing.out(Easing.quad));
  const s = rng("stars");
  return (
    <Stage p={p} bg="#0b0a24" vignette={0.5}>
      <View zoom={zoom * (1 + 0.03 * Math.sin(m.t / 9.5))} cx={cx + m.wave(70, 16)} cy={cy + m.wave(83, 10)} rot={m.wave(110, 0.6)}>
        <rect x={-600} y={-600} width={2280} height={3000} fill="#120f33" />
        {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={-400 + s() * 1900} cy={-400 + s() * 900} r={2 + s() * 3} fill="#fff6d8" opacity={0.5 + 0.4 * Math.sin(m.t / 9 + i)} />)}
        <rect x={-600} y={820} width={2280} height={2200} fill="#4a3040" />
        <polygon points={pts([iso(-14, 6.5, 0), iso(14, -8.5, 0), iso(15, -7, 0), iso(-13, 8, 0)])} fill="#2a2440" stroke={INK} strokeWidth={4} />
        <Glow x={540} y={1060} r={560} color="#ff3fa4" o={0.2 + 0.25 * (litN / 10)} />
        {towers.map((t, i) => {
          const on = i < litN;
          const top = iso(t.x0 + 0.8, t.y0 + 0.8, t.h);
          return (
            <g key={i}>
              <IsoBlock iso={iso} x0={t.x0} y0={t.y0} w={1.6} d={1.6} h={t.h} color={on ? "#3a3175" : "#221d48"} roof={on ? t.c : "#2c2a52"} seed={`t${i}`} cols={2} lit={() => on} />
              {on ? <Glow x={top[0]} y={top[1]} r={90} color={t.c} o={0.6 + 0.2 * Math.sin(m.t / 6 + i)} /> : null}
            </g>
          );
        })}
        <g transform={`translate(0 ${(1 - rise) * 500})`} opacity={Math.min(1, rise * 1.5)}>
          <rect x={530} y={520} width={20} height={300} fill="#3a3f4f" stroke={INK} strokeWidth={4} />
          <Display x={150} y={250} w={780} h={290} label="KEPT IN ONE YEAR" value={countText(v, k)} color="#ffd23f" />
        </g>
      </View>
    </Stage>
  );
};

export default Desert;
