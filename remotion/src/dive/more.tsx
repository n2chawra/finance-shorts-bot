/**
 * More dive pieces (2026-11-22, owner: "fix it so that it never fails again: the kit improves itself when making
 * a video"). The first kit drew transit well (tunnels, trains, stations) and failed QA on everything else: a stone
 * town drew as a city street with taxis, carved rooms as one empty bunker box, a pillared flood tank as nothing.
 * These pieces add what those videos needed, each with something alive in it (people, animals, water, machines):
 *
 *   room     a room carved in rock: living | stable | press | storage | church | kitchen | door | tombs | ossuary | grave
 *   hall     a pillared hall (a flood tank, a cistern, a crypt): `count` pillars, light shafts, mist, a walker
 *   passage  a passage: walk (people with lamps in a line) | water (a rushing channel) | sewer
 *   pumps    a pump room: impellers spinning, pipes carrying water up
 *   vent     a ventilation shaft's fan room, air rising up a shaft that fades out above
 *   spiral   a spiral stair in a round shaft, people climbing and walking down its flights
 *   dig      a station still being built: shored box, turning cutterhead, workers, a swinging crane hook
 *   pour     water pouring in from the left into a churning pool (a flood arriving)
 *   surface  more presets: town | field | sea | mountain | pyramid | dome | arena, each with a readable name plate
 *
 * Same contract as pieces.tsx: world coordinates (x 0..1080, y 0 at the street, `w.Y(ft)` down), pure functions of
 * the story frame `g`, figures only from params.fig, everything that arrives on a word leaves again in the last
 * second (`outro`) so the loop's last frame is its first. A new piece goes here (or a new file) the same way:
 * add it, register it in MORE_PIECES, list it in README "Pieces", never change how an existing piece draws.
 */
import React from "react";
import { Ball, Block, Glow, INK, Limb, STROKE, Tag, Txt, rng, shade } from "../flat/kit";
import { Legible, Sign, Surface, Tally, Train, outro, useNear, type PieceProps } from "./pieces";
import { depthText, ramp, type DiveWorld, type Layer } from "./world";

const unitOf = (w: DiveWorld) => w.cfg.unit ?? "ft";
const depthLabel = (L: Layer, w: DiveWorld) => depthText(L.fig[L.spec.depth ?? "depth"], unitOf(w));
const TAU = Math.PI * 2;
/** a whole number of cycles over the video, so the loop's last frame matches the first */
const loopSin = (w: DiveWorld, g: number, perSec: number, ph = 0) => Math.sin((g / Math.max(1, w.total)) * TAU * Math.max(1, Math.round((w.total / 30) * perSec)) + ph);
const loopU = (w: DiveWorld, g: number, laps: number, ph = 0) => (((g / Math.max(1, w.total)) * Math.max(1, Math.round(laps)) + ph) % 1 + 1) % 1;

// ------------------------------------------------------------------ people and animals

const SKIN = ["#f2c9a0", "#c98d5e", "#8d5a3b", "#e8b48a"];
const CLOTH = ["#e85d75", "#3d8bfd", "#2fbf71", "#ffb02e", "#8a6dd8", "#e8eef7"];

/** A flat person standing on y (feet), walking when `step` moves; `pose` sit | stand | carry | kneel | tread. */
export const Person: React.FC<{ x: number; y: number; i: number; step?: number; pose?: "stand" | "sit" | "carry" | "kneel" | "tread"; lamp?: boolean; dir?: 1 | -1; s?: number }> = ({ x, y, i, step = 0, pose = "stand", lamp, dir = 1, s = 1 }) => {
  const skin = SKIN[i % SKIN.length]!, cloth = CLOTH[(i * 3 + 1) % CLOTH.length]!;
  const bob = Math.abs(Math.sin(step * Math.PI)) * 6;
  const sw = Math.sin(step * TAU) * 16;
  const hip = pose === "sit" ? y - 50 : pose === "kneel" ? y - 60 : y - 86 - (pose === "tread" ? bob * 2 : 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s}) translate(${-x} ${-y})`}>
      {pose === "sit" ? <>
        <Limb a={[x - 8, hip]} b={[x + 34, hip]} w={16} color={shade(cloth, -0.3)} sw={4} />
        <Limb a={[x + 34, hip]} b={[x + 34, y]} w={14} color={shade(cloth, -0.3)} sw={4} />
      </> : pose === "kneel" ? <>
        <Limb a={[x, hip]} b={[x + 26, y - 12]} w={16} color={shade(cloth, -0.3)} sw={4} />
        <Limb a={[x + 26, y - 12]} b={[x - 18, y - 6]} w={14} color={shade(cloth, -0.3)} sw={4} />
      </> : <>
        <Limb a={[x - 8, hip]} b={[x - 8 + sw, y]} w={15} color={shade(cloth, -0.35)} sw={4} />
        <Limb a={[x + 8, hip]} b={[x + 8 - sw, y]} w={15} color={shade(cloth, -0.35)} sw={4} />
      </>}
      <Block x={x - 26} y={hip - 74 - bob} w={52} h={84} fill={cloth} r={16} shadow={false} sw={4} />
      {pose === "carry"
        ? <><Limb a={[x + 10, hip - 60 - bob]} b={[x + 30, hip - 104 - bob]} w={12} color={skin} sw={4} />
          <path d={`M ${x + 6} ${hip - 108 - bob} q 26 -44 52 0 q 6 34 -26 40 q -32 -6 -26 -40 z`} fill="#c96a4a" stroke={INK} strokeWidth={4} /></>
        : <Limb a={[x + 14, hip - 62 - bob]} b={[x + 34 + sw * 0.6, hip - 18 - bob]} w={12} color={skin} sw={4} />}
      {lamp ? <><Glow x={x + 44} y={hip - 30 - bob} r={90} color="#ffb84d" o={0.55} /><Ball x={x + 40} y={hip - 24 - bob} r={10} fill="#ffd56b" shadow={false} sw={3} /></> : null}
      <Ball x={x} y={hip - 104 - bob} r={26} fill={skin} shadow={false} sw={4} />
      <circle cx={x + 9} cy={hip - 108 - bob} r={3.5} fill={INK} />
    </g>
  );
};

/** A sheep (white) or a goat (brown) walking on y. */
export const Animal: React.FC<{ x: number; y: number; i: number; step: number; dir?: 1 | -1 }> = ({ x, y, i, step, dir = 1 }) => {
  const goat = i % 2 === 1;
  const body = goat ? "#a8743f" : "#f4f1e8", head = goat ? "#7a5230" : "#3d3a44";
  const sw = Math.sin(step * TAU) * 10;
  const nod = Math.sin(step * TAU * 0.5) * 6;
  return (
    <g transform={`translate(${x} 0) scale(${dir} 1) translate(${-x} 0)`}>
      {[-34, -14, 18, 36].map((o, k) => <Limb key={k} a={[x + o, y - 44]} b={[x + o + (k % 2 ? sw : -sw), y]} w={9} color={head} sw={3} />)}
      <Ball x={x} y={y - 62} r={58} ry={36} fill={body} sw={4} />
      {!goat ? [-30, -6, 18].map((o) => <circle key={o} cx={x + o} cy={y - 86} r={14} fill={shade(body, -0.05)} stroke={INK} strokeWidth={3} />) : null}
      <Ball x={x + 62} y={y - 84 + nod} r={22} ry={18} fill={head} sw={4} shadow={false} />
      {goat ? <Limb a={[x + 58, y - 100 + nod]} b={[x + 48, y - 124 + nod]} w={6} color="#d9cbb0" sw={3} /> : null}
      <circle cx={x + 72} cy={y - 88 + nod} r={3} fill="#fff" />
    </g>
  );
};

/** An oil lamp's flame flickering on a niche. */
const Flame: React.FC<{ x: number; y: number; g: number; w: DiveWorld; ph?: number }> = ({ x, y, g, w, ph = 0 }) => {
  const f = 0.75 + 0.25 * loopSin(w, g, 3.1, ph);
  return (
    <g>
      <Glow x={x} y={y - 16} r={150 * f} color="#ffb84d" o={0.45} />
      <path d={`M ${x - 22} ${y} q 22 18 44 0 z`} fill="#8a5a3a" stroke={INK} strokeWidth={4} />
      <path d={`M ${x} ${y - 4} q -12 -16 0 ${-30 * f} q 12 14 0 ${30 * f} z`} fill="#ffd56b" stroke="#ff8a3d" strokeWidth={3} />
    </g>
  );
};

/** A clay jar (amphora). */
const Jar: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#c96a4a" }) => (
  <path d={`M ${x - 10 * s} ${y - 92 * s} h ${20 * s} v ${10 * s} q ${30 * s} ${16 * s} ${26 * s} ${48 * s} q ${-4 * s} ${30 * s} ${-36 * s} ${34 * s} q ${-32 * s} ${-4 * s} ${-36 * s} ${-34 * s} q ${-4 * s} ${-32 * s} ${26 * s} ${-48 * s} z`}
    fill={c} stroke={INK} strokeWidth={4} />
);

/** A sign or a depth tag for a piece: the sign when the layer has a label, else a tag with the depth figure. */
const Marker: React.FC<{ L: Layer; w: DiveWorld; g: number; x: number; y: number; wd?: number }> = ({ L, w, g, x, y, wd = 600 }) => {
  const s = L.spec, d = depthLabel(L, w), k = ramp(g, L.land - 16, L.land) * outro(w, g);
  const near = useNear(y + 48);
  if (s.label) return <Sign x={x} y={y} w={wd} text={s.label.toUpperCase()} depth={d} accent={w.look.accent} k={k} />;
  if (!d || near <= 0) return null;
  return <g opacity={near}><Legible x={x + 180} y={y} w={260} h={90} size={52}><Tag x={x + 180} y={y} w={260} h={90} text={d} bg={w.look.paper} k={k} rot={-3} /></Legible></g>;
};

// ------------------------------------------------------------------ room

/** A room carved in the rock: an uneven arched cave with a lamp, and the life of its `type` moving in it. */
export const Room: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yb = w.Y(L.ft) + 180, x0 = 100, x1 = 980, h = 400, top = yb - h;
  const type = s.type ?? "living";
  const rock = s.color ?? shade(look.chalk, -0.35);
  const inside = shade(rock, -0.45);
  const r = rng(`room-${L.beat}-${L.ft}`);
  const n = s.people ?? (type === "stable" ? 1 : type === "church" ? 2 : 3);
  const arch = `M ${x0} ${yb} L ${x0 + 6} ${top + 120} Q ${x0 + 20} ${top + 10} ${x0 + 170} ${top - 6} Q ${540} ${top - 40} ${x1 - 170} ${top - 4} Q ${x1 - 16} ${top + 14} ${x1 - 4} ${top + 120} L ${x1} ${yb} Z`;
  const walk = (i: number, laps = 1, ph = 0) => loopU(w, g, laps, ph + i * 0.37);
  const phases = Array.from({ length: 16 }, () => r());
  return (
    <g>
      <path d={arch} transform={`translate(0 -18) scale(1)`} fill={shade(look.deep, 0.06)} />
      <path d={arch} fill={inside} stroke={INK} strokeWidth={STROKE} />
      {/* tool marks in the carved walls */}
      {Array.from({ length: 22 }, (_, i) => { const tx = x0 + 40 + r() * (x1 - x0 - 80), ty = top + 30 + r() * (h - 80); return <path key={i} d={`M ${tx} ${ty} q 18 -6 34 2`} stroke={shade(inside, 0.18)} strokeWidth={5} fill="none" />; })}
      <rect x={x0 + 4} y={yb - 26} width={x1 - x0 - 8} height={26} fill={shade(rock, -0.2)} />
      <Flame x={x0 + 120} y={top + 140} g={g} w={w} />
      {type === "living" || type === "kitchen" ? <>
        {/* a niche shelf with pots, a low table, people at home */}
        <path d={`M 700 ${top + 70} h 200 v 90 h -200 z`} fill={shade(inside, -0.25)} stroke={INK} strokeWidth={4} />
        <Jar x={740} y={top + 158} s={0.7} /><Jar x={800} y={top + 158} s={0.6} c="#d8a05a" /><Jar x={860} y={top + 158} s={0.7} c="#a8743f" />
        <Block x={430} y={yb - 70} w={220} h={24} fill="#8a5a3a" shadow="bottom" sw={4} />
        {type === "kitchen" ? <><Block x={240} y={yb - 150} w={150} h={124} fill={shade(rock, 0.1)} r={60} shadow="right" />
          <Glow x={315} y={yb - 70} r={110 * (0.85 + 0.15 * loopSin(w, g, 2.3))} color="#ff7a2e" o={0.7} />
          {[0, 1, 2].map((j) => { const u = loopU(w, g, 4, j / 3); return <circle key={j} cx={315 + Math.sin(u * 6) * 18} cy={yb - 160 - u * 200} r={18 + u * 26} fill="#d9d2bf" opacity={0.5 * (1 - u)} />; })}</> : null}
        {Array.from({ length: n }, (_, i) => i === 0
          ? <Person key={i} x={260 + 440 * walk(i, 2)} y={yb - 26} i={i} step={walk(i, 2) * 10} />
          : <Person key={i} x={400 + i * 150} y={yb - 26} i={i + 2} pose="sit" step={0} dir={i % 2 ? 1 : -1} />)}
      </> : null}
      {type === "stable" ? <>
        {/* a stone trough, straw, animals walking along it, a herder */}
        <Block x={560} y={yb - 90} w={340} h={64} fill={shade(rock, 0.12)} r={10} shadow="bottom" />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${580 + i * 32} ${yb - 92} l ${10 + (i % 3) * 6} -26`} stroke="#e8c45a" strokeWidth={6} />)}
        {[0, 1, 2].map((i) => { const u = walk(i, 1, 0.1); const x = 160 + ((u * 1.6 + i * 0.28) % 1) * 640; return <Animal key={i} x={x} y={yb - 26} i={i} step={u * 14} />; })}
        {n > 0 ? <Person x={860} y={yb - 26} i={4} step={0} dir={-1} /> : null}
      </> : null}
      {type === "press" ? <>
        {/* a stone basin, someone treading the grapes, juice running down a channel into a jar */}
        <path d={`M 300 ${yb - 26} l -20 -120 h 340 l -20 120 z`} fill={shade(rock, 0.15)} stroke={INK} strokeWidth={STROKE} />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={312 + (i % 7) * 44} cy={yb - 150 + Math.floor(i / 7) * 18} r={16} fill="#6b2d6b" stroke={INK} strokeWidth={3} />)}
        <Person x={460} y={yb - 140} i={1} pose="tread" step={walk(0, 6) * 6} />
        <Limb a={[620, yb - 70]} b={[760, yb - 50]} w={18} color={shade(rock, -0.1)} sw={4} />
        <line x1={620} y1={yb - 74} x2={760} y2={yb - 54} stroke="#8e2c5a" strokeWidth={10} strokeDasharray="22 18" strokeDashoffset={-(loopU(w, g, 40) * 40)} />
        <Jar x={800} y={yb - 26} s={1.1} />
        {n > 1 ? <Person x={900} y={yb - 26} i={3} pose="carry" step={walk(1, 1) * 6} dir={-1} /> : null}
      </> : null}
      {type === "storage" ? <>
        {Array.from({ length: 9 }, (_, i) => <Jar key={i} x={480 + (i % 5) * 92 + (i > 4 ? 46 : 0)} y={yb - 26 - (i > 4 ? 0 : 0)} s={i > 4 ? 0.8 : 1} c={["#c96a4a", "#d8a05a", "#a8743f"][i % 3]} />)}
        <Person x={200 + 220 * walk(0, 1)} y={yb - 26} i={2} pose="carry" step={walk(0, 1) * 8} />
      </> : null}
      {type === "church" ? <>
        {/* carved arches and a cross, candles, people kneeling */}
        {[0, 1, 2].map((i) => <path key={i} d={`M ${300 + i * 200} ${yb - 26} v -170 a 70 70 0 0 1 140 0 v 170`} fill={shade(inside, -0.2)} stroke={INK} strokeWidth={5} />)}
        <Limb a={[540, top + 40]} b={[540, top + 150]} w={18} color={shade(rock, 0.25)} sw={4} />
        <Limb a={[500, top + 76]} b={[580, top + 76]} w={18} color={shade(rock, 0.25)} sw={4} />
        {[360, 720].map((cx, i) => <Flame key={cx} x={cx} y={yb - 200} g={g} w={w} ph={i * 2} />)}
        {Array.from({ length: n }, (_, i) => <Person key={i} x={420 + i * 220} y={yb - 26} i={i + 1} pose="kneel" step={0} dir={i % 2 ? -1 : 1} />)}
      </> : null}
      {type === "crowd" ? <>
        {/* seeded phases: walkers in two directions with linear phases met in pairs (v-20261122-54) */}
        {/* families and their animals filling the room, walking both ways */}
        {Array.from({ length: s.people ?? 12 }, (_, i) => { const n = s.people ?? 12; const dir = i % 2 ? -1 : 1; const u = loopU(w, g, dir === 1 ? 1 : 2, phases[i] ?? 0); const x = 150 + (dir === 1 ? u : 1 - u) * 780; return <Person key={i} x={x} y={yb - 26} i={i} step={u * 14} dir={dir} s={0.8} />; })}
        {[0, 1, 2].map((i) => { const u = walk(i + 9, 1, 0.5); return <Animal key={`a${i}`} x={200 + ((u + i * 0.33) % 1) * 680} y={yb - 26} i={i} step={u * 12} />; })}
      </> : null}
      {type === "tombs" ? <>
        {[0, 1].map((row) => [0, 1, 2, 3].map((c) => <Block key={`${row}${c}`} x={300 + c * 160} y={top + 90 + row * 120} w={130} h={80} fill={shade(inside, -0.3)} r={30} shadow={false} sw={4} />))}
        <Person x={200 + 600 * walk(0, 1)} y={yb - 26} i={5} lamp step={walk(0, 1) * 8} />
      </> : null}
      {type === "grave" ? <>
        {/* a grave shrine (St Peter's, v-20261123-52): a red plastered wall with a small two-column shrine against it,
            candles flickering, someone kneeling, an archaeologist with a lamp walking along */}
        <rect x={380} y={top + 70} width={320} height={yb - top - 96} fill="#b5483a" stroke={INK} strokeWidth={5} />
        {[440, 640].map((cx) => <Block key={cx} x={cx - 18} y={yb - 250} w={36} h={224} fill="#efe6d2" r={6} shadow={false} sw={4} />)}
        <path d={`M 410 ${yb - 250} L 540 ${yb - 330} L 670 ${yb - 250} Z`} fill="#efe6d2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <Block x={470} y={yb - 120} w={140} h={94} fill={shade(inside, -0.2)} r={8} shadow={false} sw={4} />
        <Flame x={430} y={yb - 60} g={g} w={w} ph={1} /><Flame x={650} y={yb - 60} g={g} w={w} ph={2} />
        <Person x={330} y={yb - 26} i={2} pose="kneel" s={0.85} />
        {(() => { const u = walk(3, 1); return <Person x={720 + u * 200} y={yb - 26} i={4} lamp step={u * 8} dir={-1} s={0.85} />; })()}
      </> : null}
      {type === "ossuary" ? (() => {
        // an ossuary (the Paris Catacombs, v-20261123-51): the walls stacked with bones, rows of long bones with
        // their knobbed ends facing out and bands of skulls between them, visitors walking past with lamps
        const bone = "#e9e0c8", boneDark = shade(bone, -0.3);
        const wx0 = 170, wx1 = 910, wy0 = top + 70, wy1 = yb - 40;
        const rows: React.ReactNode[] = [];
        for (let row = 0, y = wy1; y > wy0 + 30; row++) {
          const skulls = row % 3 === 1;
          const rh = skulls ? 62 : 34;
          y -= rh;
          if (skulls) {
            for (let x = wx0 + 34; x < wx1 - 20; x += 64) rows.push(<g key={`s${row}-${x}`}>
              <Ball x={x} y={y + 30} r={28} fill={bone} shadow={false} sw={4} />
              <circle cx={x - 10} cy={y + 28} r={7} fill={INK} /><circle cx={x + 10} cy={y + 28} r={7} fill={INK} />
              <path d={`M ${x - 3} ${y + 44} l 3 -6 l 3 6 z`} fill={INK} />
            </g>);
          } else {
            for (let x = wx0 + 20; x < wx1 - 10; x += 34) rows.push(<g key={`b${row}-${x}`}>
              <circle cx={x} cy={y + 17} r={15} fill={bone} stroke={INK} strokeWidth={3} />
              <circle cx={x} cy={y + 17} r={5} fill={boneDark} />
            </g>);
          }
        }
        return <>
          <rect x={wx0} y={wy0} width={wx1 - wx0} height={wy1 - wy0} fill={shade(inside, -0.2)} />
          {rows}
          {/* the lamp light on the bone wall breathes, a whole number of times over the video */}
          <Glow x={540} y={(wy0 + wy1) / 2} r={420 * (0.92 + 0.08 * loopSin(w, g, 0.6))} color="#ffcf7a" o={0.28} />
          {Array.from({ length: Math.max(1, n) }, (_, i) => { const dir = i % 2 ? -1 : 1; const u = walk(i, 1, i * 0.5); const x = 180 + (dir === 1 ? u : 1 - u) * 720; return <Person key={`v${i}`} x={x} y={yb - 26} i={i + 2} lamp={i === 0} step={u * 10} dir={dir} s={0.85} />; })}
        </>;
      })() : null}
      {type === "door" ? (() => {
        // a round stone door rolls across the doorway on its word (`on`), people behind it
        const shut = ramp(g, L.land - 4, L.land + 22) * outro(w, g);
        const cx = 260 + 300 * shut, cy = yb - 150;
        return <>
          <path d={`M 500 ${yb - 26} v -230 a 90 90 0 0 1 180 0 v 230 z`} fill={shade(inside, -0.4)} stroke={INK} strokeWidth={5} />
          {Array.from({ length: Math.max(1, n) }, (_, i) => <Person key={i} x={560 + i * 50} y={yb - 26} i={i} s={0.8} pose="stand" step={walk(i, 2) * 4} />)}
          <g transform={`rotate(${shut * 220} ${cx} ${cy})`}>
            <Ball x={cx} y={cy} r={150} fill={shade(rock, 0.18)} />
            <circle cx={cx} cy={cy} r={34} fill={shade(rock, -0.3)} stroke={INK} strokeWidth={5} />
            {[0, 1, 2, 3, 4, 5].map((j) => <path key={j} d={`M ${cx + Math.cos(j) * 70} ${cy + Math.sin(j) * 70} l 22 8`} stroke={shade(rock, -0.25)} strokeWidth={6} />)}
          </g>
          {s.stamp ? <Legible x={720} y={top + 40} w={240} h={100} size={60}><Tag x={720} y={top + 40} w={240} h={100} text={s.stamp} bg={look.accent} k={ramp(g, L.at(s.stampOn), L.at(s.stampOn) + 8) * outro(w, g)} rot={-4} /></Legible> : null}
        </>;
      })() : null}
      <Marker L={L} w={w} g={g} x={240} y={top - 160} />
      <Tally L={L} w={w} g={g} x={370} y={top - 10} />
    </g>
  );
};

// ------------------------------------------------------------------ well

/** A well and air shaft from the street down to its depth, passing carved floors (people at their openings), a
 * bucket riding a rope, air arrows flowing down, the water at the bottom; its sign lands at the bottom on its word. */
export const Well: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yb = w.Y(L.ft) + 120, y0 = 64, cx = 540, half = 90;
  const rock = s.color ?? shade(look.chalk, -0.35);
  // floors open onto the shaft only near its bottom, where the camera lands: higher up the shaft passes behind the
  // other layers' rooms (it ran in front of the stables and the door on v-20261122-54)
  const floors = 2, fTop = Math.max(y0 + 200, yb - 700);
  const u = loopU(w, g, Math.max(1, Math.round(w.total / 150)));
  const bucketY = y0 + 80 + (yb - y0 - 220) * (0.5 - 0.5 * Math.cos(u * TAU));
  return (
    <g>
      <rect x={cx - half - 14} y={y0} width={half * 2 + 28} height={yb - y0 + 40} fill={shade(look.deep, 0.06)} />
      <rect x={cx - half} y={y0} width={half * 2} height={yb - y0} fill={shade(rock, -0.5)} stroke={INK} strokeWidth={STROKE} />
      {/* floors opening onto the shaft, a person at each */}
      {Array.from({ length: floors }, (_, i) => {
        const fy = fTop + ((i + 0.8) * (yb - fTop - 160)) / floors;
        const left = i % 2 === 0;
        const x0 = left ? cx - half - 300 : cx + half;
        return (
          <g key={i}>
            <path d={`M ${x0} ${fy} v -170 q 0 -40 40 -40 h 220 q 40 0 40 40 v 170 z`} fill={shade(rock, -0.45)} stroke={INK} strokeWidth={5} />
            <Person x={left ? cx - half - 70 : cx + half + 70} y={fy} i={i + 2} s={0.8} dir={left ? 1 : -1} step={0} pose={i === 0 ? "carry" : "stand"} />
          </g>
        );
      })}
      {/* air flowing down */}
      {[0, 1, 2, 3].map((i) => { const v = loopU(w, g, 6, i / 4); const ay = y0 + v * (yb - y0 - 100); return <path key={i} d={`M ${cx - 50} ${ay} l 18 30 l 18 -30`} fill="none" stroke="#e8f6ff" strokeWidth={6} opacity={0.7} />; })}
      {/* the rope and the bucket */}
      <line x1={cx + 30} x2={cx + 30} y1={y0} y2={bucketY} stroke="#c9a26a" strokeWidth={6} />
      <path d={`M ${cx + 8} ${bucketY} h 44 l -6 50 h -32 z`} fill="#8a5a3a" stroke={INK} strokeWidth={4} />
      {/* the water at the bottom */}
      <rect x={cx - half} y={yb - 70} width={half * 2} height={70} fill={look.water} />
      {[0, 1].map((i) => <path key={i} transform={`translate(${-loopU(w, g, 10, i / 2) * 80} 0)`} d={`M ${cx - half} ${yb - 60 + i * 26} ${Array.from({ length: 4 }, () => "q 20 -8 40 0 t 40 0").join(" ")}`} fill="none" stroke="#e8f6ff" strokeWidth={5} />)}
      {/* the sign hangs at the water line, clear of the floors' openings (QA 2026-11-22: it sat on a person's head) */}
      <Marker L={L} w={w} g={g} x={400} y={yb + 30} wd={500} />
    </g>
  );
};

// ------------------------------------------------------------------ hall

/** A pillared hall in the rock (a flood tank, a cistern, a crypt): rows of pillars, light from above, a walker. */
export const Hall: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yb = w.Y(L.ft) + 210, x0 = 50, x1 = 1030, h = 560, top = yb - h;
  const n = Math.max(3, Math.min(9, s.count ?? 6));
  const wall = s.color ?? "#c9c6bc";
  const back = shade(wall, -0.45);
  const rise = ramp(g, L.land - 10, L.land + 18);
  const lit = 0.6 + 0.4 * loopSin(w, g, 0.6);
  const walker = loopU(w, g, 1, 0.2);
  return (
    <g>
      <rect x={x0 - 16} y={top - 16} width={x1 - x0 + 32} height={h + 32} rx={30} fill={shade(look.deep, 0.06)} />
      <rect x={x0} y={top} width={x1 - x0} height={h} rx={20} fill={shade(back, -0.35)} stroke={INK} strokeWidth={STROKE} />
      {/* light shafts from the ceiling openings */}
      {[0.28, 0.7].map((u, i) => <path key={i} d={`M ${x0 + u * (x1 - x0) - 40} ${top} h 80 l 120 ${h - 40} h -320 z`} fill="#fff6dc" opacity={0.14 * lit} />)}
      {/* the back row, smaller and darker, then the front row; they rise into place on the hall's word */}
      {Array.from({ length: n + 1 }, (_, i) => { const x = x0 + 60 + (i * (x1 - x0 - 120)) / n; const ph = h * 0.78; return <Block key={`b${i}`} x={x - 24} y={yb - 40 - ph * (0.6 + 0.4 * rise)} w={48} h={ph * (0.6 + 0.4 * rise)} fill={back} r={4} shadow={false} sw={4} />; })}
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + 110 + (i * (x1 - x0 - 220)) / Math.max(1, n - 1);
        const ph = (h - 30) * (0.55 + 0.45 * rise);
        return (
          <g key={i}>
            <Block x={x - 44} y={yb - ph} w={88} h={ph} fill={wall} r={6} shadow="right" sw={5} />
            <Block x={x - 58} y={yb - ph} w={116} h={30} fill={shade(wall, -0.12)} r={4} shadow={false} sw={4} />
            <Block x={x - 58} y={yb - 34} w={116} h={34} fill={shade(wall, -0.12)} r={4} shadow={false} sw={4} />
          </g>
        );
      })}
      {/* a wet floor and drifting mist */}
      <rect x={x0 + 6} y={yb - 20} width={x1 - x0 - 12} height={20} fill={shade(look.water, 0.1)} opacity={0.8} />
      {[0, 1, 2].map((i) => { const u = loopU(w, g, 1, i / 3); return <ellipse key={i} cx={x0 + u * (x1 - x0)} cy={yb - 60 - i * 30} rx={180} ry={26} fill="#e8f2ff" opacity={0.18} />; })}
      <Person x={x0 + 120 + walker * (x1 - x0 - 240)} y={yb - 18} i={4} lamp step={walker * 12} s={0.9} />
      <Marker L={L} w={w} g={g} x={240} y={top - 150} />
      <Tally L={L} w={w} g={g} x={370} y={top + 40} />
    </g>
  );
};

// ------------------------------------------------------------------ passage

/** A passage: `walk` (an arched tunnel, people walking through with lamps), `water` (a rushing channel), `sewer`. */
export const Passage: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yb = w.Y(L.ft) + 190, x0 = 50, x1 = 1030, h = 400, top = yb - h;
  const type = s.type ?? "walk";
  const wall = s.color ?? (type === "walk" ? shade(look.chalk, -0.3) : "#5b6270");
  const water = type !== "walk";
  const surge = ramp(g, L.land - 6, L.land + 20);
  const level = water ? h * (0.3 + 0.45 * surge) : 0;
  const id = `dive-pass-${Math.round(L.ft)}-${L.beat}`;
  return (
    <g>
      <clipPath id={id}><rect x={x0} y={top} width={x1 - x0} height={h + 20} rx={h / 2} /></clipPath>
      <rect x={x0 - 14} y={top - 14} width={x1 - x0 + 28} height={h + 48} rx={h / 2 + 14} fill={shade(look.deep, 0.08)} />
      <g clipPath={`url(#${id})`}>
        <rect x={x0} y={top} width={x1 - x0} height={h + 20} fill={shade(wall, -0.5)} />
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={x0 + i * 230} x2={x0 + i * 230 + 60} y1={top} y2={yb + 20} stroke={shade(wall, -0.3)} strokeWidth={10} />)}
        {water ? <>
          <rect x={x0} y={yb - level} width={x1 - x0} height={level + 20} fill={s.stripe ?? look.water} />
          {[0, 1, 2].map((i) => <path key={i} transform={`translate(${-loopU(w, g, 12 + i * 3) * 160} 0)`} d={`M ${x0 - 160} ${yb - level + 14 + i * 34} ${Array.from({ length: 9 }, () => "q 40 -14 80 0 t 80 0").join(" ")}`} fill="none" stroke="#e8f6ff" strokeWidth={6} opacity={0.7} />)}
          {[0, 1, 2, 3].map((i) => { const u = loopU(w, g, 6, i / 4); return <Block key={i} x={x0 + (1 - u) * (x1 - x0)} y={yb - level - 6 + (i % 2) * 20} w={40 + (i % 3) * 20} h={14} fill={i % 2 ? "#7a5230" : "#4f9a5a"} r={6} shadow={false} sw={3} />; })}
        </> : Array.from({ length: s.people ?? 4 }, (_, i) => { const u = loopU(w, g, 1, i / (s.people ?? 4)); return <Person key={i} x={x0 + 40 + u * (x1 - x0 - 80) * (s.dir === -1 ? -1 : 1) + (s.dir === -1 ? x1 - x0 - 80 : 0)} y={yb} i={i} lamp={i % 2 === 0} step={u * 16} dir={s.dir ?? 1} s={0.85} />; })}
      </g>
      <rect x={x0} y={top} width={x1 - x0} height={h + 20} rx={h / 2} fill="none" stroke={INK} strokeWidth={STROKE} />
      <Marker L={L} w={w} g={g} x={240} y={top - 150} />
    </g>
  );
};

// ------------------------------------------------------------------ pumps

/** A pump room: big impellers spinning (faster from their word), pipes carrying water up out of the frame. */
export const Pumps: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yb = w.Y(L.ft) + 190, x0 = 90, x1 = 990, h = 420, top = yb - h;
  const on = ramp(g, L.land - 4, L.land + 20);
  const n = Math.max(2, Math.min(4, s.count ?? 3));
  const spin = g * (4 + 14 * on);
  return (
    <g>
      <rect x={x0 - 14} y={top - 14} width={x1 - x0 + 28} height={h + 40} rx={20} fill={shade(look.deep, 0.05)} />
      <rect x={x0} y={top} width={x1 - x0} height={h + 12} rx={14} fill={s.color ?? "#2f3a44"} stroke={INK} strokeWidth={STROKE} />
      {Array.from({ length: n }, (_, i) => {
        const cx = x0 + ((i + 0.5) * (x1 - x0)) / n, cy = yb - 150;
        return (
          <g key={i}>
            {/* the pipe up from each pump, water rising through it */}
            <Limb a={[cx, cy - 100]} b={[cx, top - 260]} w={56} color="#8a95a8" sw={STROKE} />
            <line x1={cx} x2={cx} y1={cy - 100} y2={top - 260} stroke={look.water} strokeWidth={24} strokeDasharray="40 30" strokeDashoffset={(g * (3 + 12 * on)) % 70} />
            <Ball x={cx} y={cy} r={112} fill="#5b6270" />
            <g transform={`rotate(${spin + i * 30} ${cx} ${cy})`}>
              {[0, 72, 144, 216, 288].map((a) => <g key={a} transform={`rotate(${a} ${cx} ${cy})`}><path d={`M ${cx} ${cy} q 40 -30 86 -14 q -36 10 -62 44 z`} fill="#c9d6e2" stroke={INK} strokeWidth={4} /></g>)}
            </g>
            <Ball x={cx} y={cy} r={24} fill="#ffc43d" shadow={false} sw={4} />
            <Block x={cx - 80} y={yb - 40} w={160} h={40} fill="#4a4f5e" shadow={false} sw={4} />
          </g>
        );
      })}
      <Glow x={540} y={yb - 150} r={420} color={look.water} o={0.25 * on} />
      <Marker L={L} w={w} g={g} x={240} y={top - 150} />
      <Tally L={L} w={w} g={g} x={370} y={top + 14} />
    </g>
  );
};

// ------------------------------------------------------------------ pour

/** Water pouring in from the left (a flood arriving) into a churning pool, from its word. */
export const Pour: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const y = w.Y(L.ft), c = s.color ?? look.water;
  const k = ramp(g, L.land - 6, L.land + 16) * outro(w, g);
  const pool = 120 + 160 * k;
  const wall = s.wall ?? "#b9b4a8";
  return (
    <g>
      {/* the shaft itself: a concrete cylinder seen in section, lit rings and a ladder down its wall */}
      <rect x={110} y={y - 700} width={860} height={960} fill={shade(wall, -0.55)} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={110} y={y - 640 + i * 200} width={860} height={14} fill={shade(wall, -0.3)} />)}
      {[0, 1, 2, 3].map((i) => <Glow key={`l${i}`} x={240 + i * 200} y={y - 600} r={120} color="#fff3c2" o={0.35} />)}
      <Block x={60} y={y - 700} w={70} h={960} fill={wall} shadow="right" />
      <Block x={950} y={y - 700} w={70} h={960} fill={wall} shadow="left" />
      {Array.from({ length: 16 }, (_, i) => <line key={`r${i}`} x1={900} x2={940} y1={y - 680 + i * 50} y2={y - 680 + i * 50} stroke="#d6dbe4" strokeWidth={6} />)}
      <line x1={900} x2={900} y1={y - 690} y2={y + 160} stroke="#d6dbe4" strokeWidth={6} />
      <line x1={940} x2={940} y1={y - 690} y2={y + 160} stroke="#d6dbe4" strokeWidth={6} />
      <rect x={130} y={y + 200 - pool} width={820} height={pool + 60} fill={c} />
      {[0, 1, 2].map((i) => <path key={i} transform={`translate(${-loopU(w, g, 10 + i * 4) * 160} 0)`} d={`M 130 ${y + 220 - pool + i * 40} ${Array.from({ length: 14 }, () => "q 40 -18 80 0 t 80 0").join(" ")}`} fill="none" stroke={shade(c, 0.4)} strokeWidth={7} opacity={0.75} />)}
      {k > 0 ? <>
        <path d={`M 130 ${y - 520} Q 300 ${y - 480} 360 ${y + 200 - pool}`} fill="none" stroke={c} strokeWidth={130 * k} strokeLinecap="round" />
        <path d={`M 130 ${y - 520} Q 300 ${y - 480} 360 ${y + 200 - pool}`} fill="none" stroke="#e8f6ff" strokeWidth={18} strokeDasharray="50 40" strokeDashoffset={-loopU(w, g, 30) * 90} opacity={0.8 * k} />
        {Array.from({ length: 9 }, (_, i) => { const u = loopU(w, g, 8, i / 9); return <circle key={i} cx={330 + (i - 4) * 40 * u} cy={y + 190 - pool - Math.sin(u * Math.PI) * 120} r={14} fill="#e8f6ff" opacity={0.8 * k} />; })}
      </> : null}
      <Marker L={L} w={w} g={g} x={420} y={y - 230} />
    </g>
  );
};

// ------------------------------------------------------------------ more landmarks

/** A name plate over the landmark: dark board, light words, readable at the opening zoom. */
const Plate: React.FC<{ y: number; text: string; accent: string }> = ({ y, text, accent }) => {
  // it leaves with the street when the camera dives, never under the source chip (QA 2026-11-22)
  const near = useNear(y + 60, true);
  if (near <= 0) return null;
  return (
  <g opacity={near}><Legible x={170} y={y} w={740} h={120} size={64}>
    <Block x={170} y={y} w={740} h={120} fill="#111318" r={14} shadow="bottom" />
    <rect x={186} y={y + 12} width={708} height={8} fill={accent} />
    <Txt x={540} y={y + 78} size={64} fill="#f4f1e8" weight={800}>{text}</Txt>
  </Legible></g>
  );
};

const NEW_PRESETS = ["town", "field", "sea", "mountain", "pyramid", "dome", "arena"];

/** The surface: the first kit's presets as they were, plus town, field, sea, mountain, pyramid, dome, arena. */
export const SurfaceMore: React.FC<PieceProps> = (props) => {
  const { L, w, g } = props;
  const s = L.spec, look = w.look;
  const preset = s.preset ?? "station";
  const plate = s.label && (s.plate ?? NEW_PRESETS.includes(preset)) ? <Plate y={-1000} text={s.label.toUpperCase()} accent={look.accent} /> : null;
  if (!NEW_PRESETS.includes(preset)) return <g><Surface {...props} />{plate}</g>;
  const wall = s.wall ?? "#e3cfa6", trim = s.trim ?? shade(wall, -0.15), glass = s.glass ?? "#ffd98a";
  const laps = Math.max(1, Math.round((w.total / 30) * 260 / 3600));
  const mover = (i: number, n = 5) => ((((g / w.total) * laps + i / n) % 1) * 3600) - 1500;
  const people = Array.from({ length: 4 }, (_, i) => { const u = loopU(w, g, 1, i / 4); return <Person key={`p${i}`} x={-200 + u * 1480} y={0} i={i + 1} step={u * 30} s={0.9} />; });
  const cars = s.vehicle === "none" ? null : [0, 1, 2].map((i) => (
    <g key={i} transform={`translate(${mover(i, 3)} -60)`}>
      <Block x={0} y={0} w={190} h={56} fill={s.vehicle ?? look.accent} r={12} shadow={false} sw={5} />
      <Block x={40} y={-30} w={100} h={34} fill={s.vehicle ?? look.accent} r={10} shadow={false} sw={5} />
      <circle cx={40} cy={58} r={14} fill={INK} /><circle cx={150} cy={58} r={14} fill={INK} />
    </g>));
  let scene: React.ReactNode = null;
  if (preset === "town") {
    // low stone houses with flat roofs, arched doors and small windows, a dome and a minaret-like tower behind
    scene = <g>
      <Block x={600} y={-640} w={320} h={300} fill={shade(wall, -0.04)} r={6} shadow="right" />
      <path d="M 600 -640 a 160 150 0 0 1 320 0 z" fill={shade(wall, -0.1)} stroke={INK} strokeWidth={STROKE} />
      <Block x={880} y={-1100} w={60} h={460} fill={trim} r={10} shadow="right" />
      <path d={`M 870 -1100 L 910 -1190 L 950 -1100 Z`} fill={shade(trim, -0.2)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      {[[20, 300, 360], [300, 260, 470], [540, 300, 340], [820, 240, 420]].map(([x, wd, ht], i) => (
        <g key={i}>
          <Block x={x!} y={-ht!} w={wd!} h={ht!} fill={[wall, shade(wall, 0.06), shade(wall, -0.06), trim][i]!} r={6} shadow="right" />
          <Block x={x! - 10} y={-ht! - 20} w={wd! + 20} h={24} fill={shade(wall, -0.2)} r={4} shadow={false} sw={4} />
          {[0, 1].map((k) => <path key={k} d={`M ${x! + 40 + k * (wd! - 120)} ${-ht! + 120} v -40 a 20 20 0 0 1 40 0 v 40 z`} fill={glass} stroke={INK} strokeWidth={4} />)}
          <path d={`M ${x! + wd! / 2 - 40} 0 v -110 a 40 40 0 0 1 80 0 v 110 z`} fill={shade(wall, -0.55)} stroke={INK} strokeWidth={5} />
        </g>
      ))}
    </g>;
  } else if (preset === "field") {
    // an open green field with a small building and its door, trees, a goal, the suburbs far behind
    scene = <g>
      <rect x={-2400} y={-90} width={5900} height={90} fill="#6fbf5a" />
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-400 + i * 120} x2={-380 + i * 120} y1={-90} y2={-60} stroke="#4f9a3f" strokeWidth={6} />)}
      {[-80, 1060].map((x, i) => <g key={i}><Limb a={[x, -90]} b={[x, -300]} w={30} color="#7a5230" /><Ball x={x} y={-360} r={110} fill={i ? "#4f9a3f" : "#5aa84a"} /></g>)}
      <Block x={330} y={-420} w={420} h={330} fill={wall} r={8} shadow="right" />
      <Block x={310} y={-450} w={460} h={40} fill={trim} r={6} shadow="bottom" />
      <rect x={490} y={-300} width={100} height={210} fill={shade(wall, -0.6)} stroke={INK} strokeWidth={5} />
      <rect x={370} y={-370} width={80} height={60} fill={glass} stroke={INK} strokeWidth={4} />
      <rect x={630} y={-370} width={80} height={60} fill={glass} stroke={INK} strokeWidth={4} />
      <path d="M 820 -90 v -120 h 200 v 120" fill="none" stroke="#f4f1e8" strokeWidth={12} />
    </g>;
  } else if (preset === "sea") {
    // the open sea: waves, ferries crossing, white cliffs on the left
    scene = <g>
      <rect x={-2400} y={-320} width={5900} height={320} fill={look.water} />
      {[0, 1, 2].map((i) => <path key={i} transform={`translate(${-loopU(w, g, 6 + i * 2) * 160} 0)`} d={`M -2400 ${-300 + i * 90} ${Array.from({ length: 40 }, () => "q 40 -16 80 0 t 80 0").join(" ")}`} fill="none" stroke={shade(look.water, 0.35)} strokeWidth={7} />)}
      <path d="M -600 -320 L -600 -760 Q -200 -820 120 -700 L 220 -320 Z" fill="#f4f1e8" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M -600 -760 Q -200 -820 120 -700 L 110 -650 Q -200 -770 -600 -710 Z" fill="#6fbf5a" stroke={INK} strokeWidth={5} />
      {[0, 1].map((i) => <g key={i} transform={`translate(${mover(i, 2) * 0.45 + 400} ${-330 - i * 60})`}>
        <path d="M 0 0 L 300 0 L 260 60 L 30 60 Z" fill={i ? "#e8432f" : "#f4f1e8"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <Block x={70} y={-60} w={160} h={60} fill="#f4f1e8" r={6} shadow={false} sw={4} />
        <Block x={180} y={-110} w={40} h={50} fill={i ? "#2f5d9a" : "#e8432f"} r={4} shadow={false} sw={4} />
      </g>)}
    </g>;
  } else if (preset === "mountain") {
    // a snowy peak, a tunnel portal at its foot with a train coming out
    const u = loopU(w, g, Math.max(1, laps / 2));
    scene = <g>
      <path d="M -500 0 L 300 -1500 L 700 -900 L 900 -1150 L 1600 0 Z" fill={shade(wall, -0.4)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 180 -1280 L 300 -1500 L 430 -1300 L 360 -1240 L 300 -1300 L 240 -1230 Z" fill="#ffffff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 820 -1060 L 900 -1150 L 990 -1030 L 930 -1000 Z" fill="#ffffff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 380 0 v -200 a 150 150 0 0 1 300 0 v 200 z" fill="#1b1d24" stroke={INK} strokeWidth={STROKE} />
      <g transform={`translate(${380 + u * 1500} 0)`}><Train x={-200} y={-6} color={s.vehicle ?? "#e8432f"} stripe="#f4f1e8" /></g>
    </g>;
  } else if (preset === "pyramid") {
    scene = <g>
      <rect x={-2400} y={-60} width={5900} height={60} fill={look.sand} />
      <path d="M 900 0 L 1250 -420 L 1600 0 Z" fill={shade(wall, -0.12)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M -60 0 L 540 -1000 L 1140 0 Z" fill={wall} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 540 -1000 L 1140 0 L 780 0 Z" fill={shade(wall, -0.18)} />
      {Array.from({ length: 12 }, (_, i) => { const y = -80 * (i + 1); const hw = 600 * (1 + y / 1000); return <line key={i} x1={540 - hw} x2={540 + hw} y1={y} y2={y} stroke={shade(wall, -0.28)} strokeWidth={5} />; })}
      <path d="M 500 -560 h 60 l -10 -40 h -40 z" fill="#2a1712" stroke={INK} strokeWidth={4} />
    </g>;
  } else if (preset === "dome") {
    scene = <g>
      <Block x={60} y={-520} w={960} h={520} fill={wall} shadow="right" />
      {Array.from({ length: 8 }, (_, i) => <Block key={i} x={100 + i * 116} y={-480} w={40} h={480} fill={shade(wall, 0.06)} r={4} shadow="right" sw={4} />)}
      <Block x={30} y={-580} w={1020} h={70} fill={trim} shadow="bottom" />
      <Block x={330} y={-760} w={420} h={190} fill={shade(wall, -0.05)} shadow="right" />
      <path d="M 300 -760 Q 300 -1240 540 -1260 Q 780 -1240 780 -760 Z" fill={s.color ?? "#8fa8b8"} stroke={INK} strokeWidth={STROKE} />
      {[-160, -80, 0, 80, 160].map((o) => <path key={o} d={`M ${540 + o * 1.4} -760 Q ${540 + o} -1180 540 -1260`} fill="none" stroke={shade(s.color ?? "#8fa8b8", -0.25)} strokeWidth={6} />)}
      <Block x={510} y={-1350} w={60} h={100} fill={wall} r={8} shadow="right" />
      <Limb a={[540, -1350]} b={[540, -1420]} w={10} color={look.accent} sw={3} />
      <path d="M 480 0 v -220 a 60 60 0 0 1 120 0 v 220 z" fill={shade(wall, -0.55)} stroke={INK} strokeWidth={5} />
    </g>;
  } else if (preset === "arena") {
    scene = <g>
      <path d="M -40 0 L -40 -760 Q 540 -900 1120 -760 L 1120 0 Z" fill={wall} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      {[0, 1, 2].map((row) => Array.from({ length: 8 }, (_, i) => <path key={`${row}-${i}`} d={`M ${20 + i * 135} ${-40 - row * 230} v -130 a 50 50 0 0 1 100 0 v 130 z`} fill={shade(wall, -0.5)} stroke={INK} strokeWidth={4} />))}
      {[0, 1, 2].map((row) => <line key={row} x1={-40} x2={1120} y1={-220 - row * 230} y2={-220 - row * 230} stroke={shade(wall, -0.2)} strokeWidth={10} />)}
    </g>;
  }
  return (
    <g>
      <rect x={-2400} y={-3200} width={5900} height={3200} fill={look.skyLow} />
      <rect x={-2400} y={-3200} width={5900} height={2300} fill={look.skyTop} />
      <Glow x={540} y={-1150} r={900} color={look.sun} o={0.5} />
      {preset !== "sea" && preset !== "mountain" ? [-900, -500, 1300, 1700, -1300].map((x, i) => <Block key={i} x={x} y={-900 + (i % 3) * 150} w={340} h={900 - (i % 3) * 150} fill={look.skyline} shadow={false} sw={4} />) : null}
      {scene}
      {plate}
      <Block x={-2400} y={0} w={5900} h={64} fill={preset === "sea" ? shade(look.water, -0.3) : look.street} shadow={false} />
      {preset === "sea" || preset === "mountain" || preset === "pyramid" ? null : cars}
      {preset === "town" || preset === "field" || preset === "pyramid" || preset === "arena" ? people : null}
    </g>
  );
};


// ------------------------------------------------------------------ dig (2026-11-23, for v-20261123-51)

/** A station still being built: a dug box with shoring, a tunnel-boring machine's cutterhead turning in the end
 *  wall, workers in hard hats walking the floor, a crane hook swinging down the shaft, sparks from a welder. */
export const Dig: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const x0 = 60, x1 = 1020, yb = w.Y(L.ft) + 150, top = yb - 560;
  const wall = s.color ?? "#5b5f6b";
  const spin = loopU(w, g, Math.max(1, Math.round(w.total / 30 * 8))) * 360;
  const walk = (i: number) => loopU(w, g, 1, i * 0.41);
  return (
    <g>
      <rect x={x0 - 16} y={top - 16} width={x1 - x0 + 32} height={yb - top + 48} rx={40} fill={shade(look.deep, 0.05)} />
      <rect x={x0} y={top} width={x1 - x0} height={yb - top + 20} rx={30} fill={wall} stroke={INK} strokeWidth={STROKE} />
      {/* shoring struts across the box */}
      {[0, 1, 2].map((i) => <Block key={i} x={x0 + 10} y={top + 90 + i * 130} w={x1 - x0 - 20} h={22} fill="#e0a23a" shadow="bottom" sw={4} />)}
      {[0, 1, 2, 3].map((i) => <Glow key={`l${i}`} x={180 + i * 240} y={top + 60} r={150} color={s.light ?? "#ffe0a0"} o={0.45} />)}
      {/* the cutterhead in the right wall */}
      <g transform={`rotate(${spin} 900 ${yb - 200})`}>
        <Ball x={900} y={yb - 200} r={170} fill="#c9ced8" />
        {[0, 60, 120].map((a) => <line key={a} x1={900 + 160 * Math.cos(a * Math.PI / 180)} y1={yb - 200 + 160 * Math.sin(a * Math.PI / 180)} x2={900 - 160 * Math.cos(a * Math.PI / 180)} y2={yb - 200 - 160 * Math.sin(a * Math.PI / 180)} stroke={INK} strokeWidth={10} />)}
        <circle cx={900} cy={yb - 200} r={40} fill="#e8432f" stroke={INK} strokeWidth={5} />
      </g>
      {/* the crane hook swinging */}
      {(() => { const sw = loopSin(w, g, 0.5) * 60; return <g><line x1={420} y1={top} x2={420 + sw} y2={top + 260} stroke={INK} strokeWidth={6} /><Block x={390 + sw} y={top + 260} w={60} h={50} fill="#ffc43d" r={8} shadow={false} sw={4} /></g>; })()}
      {/* sparks from a welder at the left wall */}
      <Glow x={150} y={yb - 140} r={80 * (0.7 + 0.3 * Math.abs(loopSin(w, g, 3)))} color="#fff2a8" o={0.8} />
      <Person x={190} y={yb - 6} i={1} pose="kneel" s={0.9} />
      {[0, 1, 2].map((i) => { const u = walk(i); const dir = i % 2 ? -1 : 1; return <Person key={i} x={260 + (dir === 1 ? u : 1 - u) * 420} y={yb - 6} i={i + 3} step={u * 12} dir={dir} s={0.9} />; })}
      {/* hard hats */}
      <rect x={x0} y={yb - 6} width={x1 - x0} height={26} fill={shade(wall, -0.3)} />
      <Sign x={240} y={top - 130} text={s.label?.toUpperCase() ?? ""} depth={depthLabel(L, w)} bullets={s.bullets} accent={look.accent} k={ramp(g, L.land - 16, L.land) * outro(w, g)} />
    </g>
  );
};


// ------------------------------------------------------------------ spiral (2026-11-23, for v-20261123-51)

/** A spiral stair in a round shaft from `fromFt` to `toFt` (Abbesses): flights zigzag down the drum, people climb
 *  up and walk down them, the drum glows on `glowOn`, its sign with the depth beside the bottom. */
export const Spiral: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const y0 = w.Y(s.fromFt ?? 0) + 60, y1 = w.Y(s.toFt ?? L.ft) + 160;
  const cx = s.side === "left" ? 230 : 850, rw = 130;
  const col = s.color ?? "#2fa86a";
  const glowAt = L.at(s.glowOn);
  const glow = ramp(g, glowAt - 3, glowAt + 12) * outro(w, g);
  const step = 110, n = Math.max(2, Math.floor((y1 - y0) / step));
  // the zigzag path of the flights, top to bottom
  const pts: [number, number][] = Array.from({ length: n + 1 }, (_, i) => [i % 2 ? cx + rw - 24 : cx - rw + 24, y0 + i * step]);
  const at = (u: number): [number, number] => { const f = u * n, i = Math.min(n - 1, Math.floor(f)), t = f - i; const a = pts[i]!, b = pts[i + 1]!; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  return (
    <g>
      <rect x={cx - rw - 18} y={y0 - 18} width={2 * rw + 36} height={y1 - y0 + 36} rx={40} fill={shade(look.deep, 0.05)} />
      <rect x={cx - rw} y={y0} width={2 * rw} height={y1 - y0} rx={30} fill={shade(col, -0.55)} stroke={INK} strokeWidth={STROKE} />
      <Glow x={cx} y={(y0 + y1) / 2} r={(y1 - y0) * 0.6} color={col} o={0.15 + 0.35 * glow} />
      {/* the central newel post */}
      <rect x={cx - 10} y={y0} width={20} height={y1 - y0} fill={shade(col, -0.3)} />
      {pts.slice(0, -1).map((a, i) => { const b = pts[i + 1]!; return <g key={i}>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={INK} strokeWidth={30} strokeLinecap="round" />
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={col} strokeWidth={20} strokeLinecap="round" />
        {Array.from({ length: 6 }, (_, j) => { const t = (j + 0.5) / 6; return <line key={j} x1={a[0] + (b[0] - a[0]) * t} y1={a[1] + (b[1] - a[1]) * t - 9} x2={a[0] + (b[0] - a[0]) * t} y2={a[1] + (b[1] - a[1]) * t + 9} stroke={shade(col, -0.4)} strokeWidth={4} />; })}
      </g>; })}
      {Array.from({ length: s.riders ?? 4 }, (_, i) => { const up = i % 2 === 0; const u0 = loopU(w, g, 1, i / (s.riders ?? 4)); const u = up ? 1 - u0 : u0; const [x, y] = at(u); return <Person key={i} x={x} y={y - 12} i={i + 1} step={u0 * n * 3} s={0.55} dir={x > cx ? -1 : 1} />; })}
      <Sign x={cx > 540 ? 200 : 410} y={y1 - 160} w={470} text={s.label?.toUpperCase() ?? ""} depth={depthLabel(L, w)} bullets={s.bullets} accent={look.accent} k={ramp(g, L.land - 16, L.land) * outro(w, g)} />
    </g>
  );
};


// ------------------------------------------------------------------ vent (2026-11-23, for v-20261123-53)

/** A ventilation shaft's bottom: a fan room with a big fan turning, air arrows rising up a shaft that fades out
 *  upward (it never crosses the layers above), a worker on the gantry, the sign with the depth. */
export const Vent: React.FC<PieceProps> = ({ L, w, g }) => {
  const s = L.spec, look = w.look;
  const yb = w.Y(L.ft) + 160, x0 = 200, x1 = 880, top = yb - 330;
  const cx = 540, half = 110, shaftTop = top - 380;
  const wall = s.color ?? "#4c5462";
  const spin = loopU(w, g, Math.max(1, Math.round(w.total / 30 * 10))) * 360;
  const fid = `vent-fade-${L.beat}`;
  return (
    <g>
      <defs><linearGradient id={fid} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={shade(wall, -0.4)} stopOpacity={1} /><stop offset="1" stopColor={shade(wall, -0.4)} stopOpacity={0} /></linearGradient></defs>
      <rect x={cx - half} y={shaftTop} width={half * 2} height={top - shaftTop + 10} fill={`url(#${fid})`} />
      {[0, 1, 2, 3, 4].map((i) => { const v = loopU(w, g, 8, i / 5); const ay = top + 40 - v * (top - shaftTop); return <path key={i} d={`M ${cx - 24} ${ay + 18} l 24 -26 l 24 26`} fill="none" stroke="#e8f6ff" strokeWidth={7} strokeLinecap="round" opacity={0.85 * (1 - v)} />; })}
      <rect x={x0 - 16} y={top - 16} width={x1 - x0 + 32} height={yb - top + 32} rx={30} fill={shade(look.deep, 0.05)} />
      <rect x={x0} y={top} width={x1 - x0} height={yb - top} rx={24} fill={wall} stroke={INK} strokeWidth={STROKE} />
      <rect x={cx - half} y={top - 6} width={half * 2} height={20} fill={shade(wall, -0.4)} />
      <Glow x={cx} y={top + 160} r={260} color={s.light ?? "#cfe8ff"} o={0.35} />
      {/* the fan in its ring */}
      <circle cx={cx} cy={top + 170} r={128} fill={shade(wall, -0.35)} stroke={INK} strokeWidth={STROKE} />
      <g transform={`rotate(${spin} ${cx} ${top + 170})`}>
        {[0, 1, 2, 3, 4].map((j) => <path key={j} transform={`rotate(${j * 72} ${cx} ${top + 170})`} d={`M ${cx} ${top + 170} q 40 -40 10 -112 q -46 20 -10 112 z`} fill="#c9ced8" stroke={INK} strokeWidth={4} />)}
        <circle cx={cx} cy={top + 170} r={22} fill="#e8432f" stroke={INK} strokeWidth={4} />
      </g>
      {/* a gantry with a worker checking the fan */}
      <rect x={x0 + 10} y={yb - 40} width={x1 - x0 - 20} height={16} fill="#e0a23a" stroke={INK} strokeWidth={3} />
      {(() => { const u = loopU(w, g, 1, 0.2); return <Person x={260 + (u < 0.5 ? u * 2 : 2 - u * 2) * 120} y={yb - 40} i={4} step={u * 10} dir={u < 0.5 ? 1 : -1} s={0.8} lamp />; })()}
      <Sign x={560} y={yb - 140} w={300} text={s.label?.toUpperCase() ?? ""} depth={depthLabel(L, w)} bullets={s.bullets} accent={look.accent} k={ramp(g, L.land - 16, L.land) * outro(w, g)} />
    </g>
  );
};

export const MORE_PIECES: Record<string, React.FC<PieceProps>> = { surface: SurfaceMore, room: Room, hall: Hall, passage: Passage, pumps: Pumps, pour: Pour, well: Well, dig: Dig, spiral: Spiral, vent: Vent };
