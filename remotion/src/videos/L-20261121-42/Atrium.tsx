// Atrium (3D, night-grid look): every beat set in the Hyatt Regency's atrium or outside the hotel. The beat's
// `params.shot` picks the light, what is lit and the camera; every change lands on the beat's spoken words:
//  hook      under the upper walkway, the nut already amber; pull back to both walkways, then the whole lobby
//  after     from the roof trusses: the walkways on the floor, dust, the empty rods swinging
//  title     sinking through the glass roof at dusk, the title on the roof beams, silence then the drone
//  exterior / exterior-wide   the hotel from the street: tower floor count, atrium height, opening year
//  day / end-on / tilt / low / days   the atrium by day: the three walkways labelled, the plumb line, the rods
//  party / crowd / watch / tape / band / approach   the evening of the dance, the lobby clock, the news camera
//  toll / third / edge   after the collapse; the third-floor walkway that stayed up; the empty atrium by day
// No people are drawn: the crowd is the tables, the lights and the walkway rails.
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, DisasterStage, Focus, glow, Label3D, type Shot, type V3 } from "../../three/index";
import { DisasterLookProvider, MissionClock } from "../../disaster/index";
import { Atrium as Room, Dust, Exterior, LOWER_Y, M, NewsCamera, ROOF_Y, THIRD_Y, THIRD_Z, UPPER_Y, Walkways, type Light } from "./world";
import { ChapterTitle, evs, FigPlate, inside, kitClock, MonoCaption, MonoLine, Overlay } from "./ui";

type Fig = Record<string, string | undefined>;
type Params = { shot?: string; fig?: Fig };

const NUTV: V3 = [0, UPPER_Y - 0.3, 0.55];

/** One shot's recipe: its events, the world's state and the camera, as functions of the beat's frame. */
type Recipe = {
  names: string[];
  light: Light;
  world: (t: number, e: Record<string, number>) => { dance?: number; dim?: number; sun?: number; band?: number; stress?: number; lit?: number; fall?: number; edges?: [number, number, number]; dust?: number; thirdLit?: number; lamps?: number };
  cam: (e: Record<string, number>, end: number) => Shot[];
  focus?: V3; range?: number;
  overlay?: (t: number, e: Record<string, number>, fig: Fig, K: (s: number) => number) => React.ReactNode;
  labels?: (t: number, e: Record<string, number>, K: (s: number) => number) => React.ReactNode;
  exterior?: boolean;
  camera?: (t: number, e: Record<string, number>) => React.ReactNode;
  clock?: (t: number, e: Record<string, number>, fig: Fig) => number | null;
};

const d = (a: number, b: number, min = 10) => Math.max(min, b - a);

const R: Record<string, Recipe> = {
  hook: {
    names: ["kansas", "steel", "walkways", "crowded", "lobby", "directly"], light: "night",
    world: (t, e) => ({ dance: 0.3 + 0.7 * cue(t, e.crowded!, 12), stress: 0.42 - 0.3 * cue(t, e.walkways!, 30), lit: cue(t, e.walkways!, 12), edges: [cue(t, e.directly!, 10), 0, cue(t, e.directly!, 10)] }),
    cam: (e, end) => [
      { at: 0, move: "push", look: NUTV, dir: [0.7, -0.35, 1], from: 2.2, to: 1.7, dur: d(0, e.steel!), fov: 38 },
      { at: "steel", move: "pullback", look: [0, UPPER_Y - 0.6, 0], dir: [0.55, -0.15, 1], to: 7.5, dur: d(e.steel!, e.lobby!) },
      { at: "lobby", move: "pullback", look: [0, 3.4, -1], dir: [-0.5, 0.25, 1], to: 19, dur: d(e.lobby!, end) },
    ],
    focus: [0, UPPER_Y - 0.4, 0.3], range: 6,
    overlay: (t, e, fig) => (
      <>
        <MonoCaption t={t} at={-60} text={`JULY ${fig.day ?? ""}, ${fig.year ?? ""} · KANSAS CITY, MISSOURI`} />
        <MonoCaption t={t} at={e.kansas! + 4} text="HYATT REGENCY HOTEL · THE ATRIUM" top={164} size={30} color="#f4f8ff" />
      </>
    ),
  },
  after: {
    names: ["seconds", "both", "floor"], light: "night",
    world: (t, e) => ({ fall: 1, dim: 0.55, dust: 0.3 + 0.7 * cue(t, 0, 90), edges: [cue(t, e.both!, 10), 0, cue(t, e.both!, 10)] }),
    cam: (e, end) => [{ at: 0, move: "crane", look: [0, 0.4, 0], base: [-3, 0, 4], from: 9.5, to: 8.4, dur: d(0, end), fov: 46 }],
    focus: [0, 0.4, 0], range: 8,
  },
  title: {
    names: ["hyatt", "walkway", "collapse"], light: "dusk",
    world: () => ({ dance: 0.4, lit: 0.6 }),
    cam: (e, end) => [{ at: 0, move: "crane", look: [0, 3.4, 0], base: [0.5, 0, 1.6], from: ROOF_Y + 4.5, to: ROOF_Y - 0.2, dur: d(0, end), fov: 50 }],
    focus: [0, ROOF_Y, -1], range: 10,
    overlay: (t, e) => (
      <>
        {t >= e.walkway! && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: Math.min(1, (t - e.walkway!) / 10) }}>
            <div style={{ fontFamily: "Anton, Poppins, sans-serif", fontSize: 118, letterSpacing: 6, color: "#f4f8ff", textShadow: "0 6px 30px rgba(0,0,0,0.85)" }}>THE HYATT REGENCY</div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 46, letterSpacing: 14, color: "#ff3b30", marginTop: 8 }}>WALKWAY COLLAPSE</div>
          </div>
        )}
      </>
    ),
  },
  exterior: {
    names: ["hyatt", "kansas", "opened"], light: "day", exterior: true,
    world: () => ({}),
    cam: (e, end) => [{ at: 0, move: "orbit", center: [0, 8, -4], radius: 44, height: 6, from: 0.55, to: 0.95, dur: d(0, end), fov: 42 }],
    focus: [0, 8, -4], range: 30,
    overlay: (t, e, fig) => (
      <>
        <ChapterTitle t={t} at={e.hyatt!} text="THE HOTEL" />
        <FigPlate t={t} at={e.opened!} label="OPENED" value={fig.year ?? ""} x={1380} y={640} />
      </>
    ),
  },
  "exterior-wide": {
    names: ["tower", "ballrooms", "glass", "high"], light: "day", exterior: true,
    world: () => ({}),
    cam: (e, end) => [
      { at: 0, move: "push", look: [-12, 18, -6], dir: [0.7, 0.05, 1], from: 70, to: 62, dur: d(0, e.ballrooms!), fov: 40 },
      { at: "ballrooms", move: "push", look: [8, 7, -5], dir: [0.3, 0.12, 1], to: 46, dur: d(e.ballrooms!, end) },
    ],
    focus: [0, 10, -4], range: 40,
    overlay: (t, e, fig) => (
      <>
        <FigPlate t={t} at={e.tower!} label="STOREYS, THE TOWER" value={fig.storeys ?? ""} x={90} y={300} />
        <FigPlate t={t} at={e.high!} label="ATRIUM HEIGHT, ABOUT" value={fig.height ?? ""} x={1340} y={300} />
      </>
    ),
  },
  day: {
    names: ["atrium", "three", "second", "third", "fourth"], light: "day",
    world: (t, e) => ({ sun: 0.35 + 0.1 * t / 300, edges: [cue(t, e.second!, 8), cue(t, e.third!, 8), cue(t, e.fourth!, 8)] }),
    cam: (e, end) => [{ at: 0, move: "push", look: [0, 3.6, -1], dir: [0.45, 0.12, 1], from: 21, to: 16.5, dur: d(0, end), fov: 44 }],
    focus: [0, 3.6, -1], range: 14,
    labels: (t, e, K) => (
      <>
        {t >= e.second! && <Label3D at={[4.5, LOWER_Y + 0.1, 0.5]} offset={[1.2, -1.1, 0.8]} text="SECOND FLOOR" start={K(e.second!)} color="#ffd84a" px={40} />}
        {t >= e.third! && <Label3D at={[-4.5, THIRD_Y + 0.4, THIRD_Z]} offset={[-1.4, 0.9, 0.4]} text="THIRD FLOOR" start={K(e.third!)} color="#ffd84a" px={40} />}
        {t >= e.fourth! && <Label3D at={[3, UPPER_Y + 0.5, 0.5]} offset={[1.2, 1.0, 0.6]} text="FOURTH FLOOR" start={K(e.fourth!)} color="#ffd84a" px={40} />}
      </>
    ),
  },
  "end-on": {
    names: ["third", "fourth-floor", "directly", "second"], light: "day",
    world: (t, e) => ({ sun: 0.5, edges: [cue(t, e.second!, 8), cue(t, e.third!, 8) * (1 - cue(t, e["fourth-floor"]!, 10)) + 0.2, cue(t, e["fourth-floor"]!, 8)] }),
    cam: (e, end) => [{ at: 0, move: "orbit", center: [0, 3.6, -1.4], radius: 7.6, height: 1.0, from: 1.3, to: 1.12, dur: d(0, end), fov: 40 }],
    focus: [0, 3.8, -1], range: 12,
    overlay: (t, e) => (
      <>
        {t >= e.directly! && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={960} y1={330} x2={960} y2={330 + Math.min(1, (t - e.directly!) / 14) * 300} stroke="#ffd84a" strokeWidth={5} strokeDasharray="16 12" />
          </svg>
        )}
        <MonoLine t={t} at={e.third! + 6} text="OFFSET" x={330} y={360} size={36} />
        <MonoLine t={t} at={e.directly! + 8} text="DIRECTLY ABOVE" x={1010} y={440} size={36} />
      </>
    ),
  },
  tilt: {
    names: ["columns", "hung", "roof", "rods"], light: "day",
    world: (t, e) => ({ sun: 0.6, edges: [0, 0, 0.3 * cue(t, e.columns!, 8) * (1 - cue(t, e.hung!, 8))] }),
    cam: (e, end) => [
      { at: 0, move: "hold", pos: [-2.5, 1.2, 5.5], look: [-2, 3.6, 0], fov: 46 },
      { at: "hung", move: "crane", look: [-2, 6.6, -0.3], base: [-2.6, 0, 4.4], from: 1.6, to: 3.6, dur: d(e.hung!, end) },
    ],
    focus: [-2, 5, 0], range: 8,
    overlay: (t, e) => (
      <>
        {t >= e.columns! && t < e.hung! + 12 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: (1 - Math.max(0, (t - e.hung!) / 12)) }}>
            {[600, 1000, 1400].map((x) => <rect key={x} x={x} y={560 - Math.min(1, (t - e.columns!) / 10) * 300} width={44} height={Math.min(1, (t - e.columns!) / 10) * 420} fill="none" stroke="#7fd0ff" strokeWidth={4} strokeDasharray="12 10" />)}
          </svg>
        )}
        <MonoLine t={t} at={e.columns! + 4} text="NO COLUMNS" x={140} y={300} size={38} out={e.hung! + 6} />
        <MonoLine t={t} at={e.rods!} text="HANGER RODS" x={1120} y={420} size={42} color="#ffd84a" />
      </>
    ),
  },
  low: {
    names: ["why", "floating", "weightless", "clear"], light: "day",
    world: (t, e) => ({ sun: 0.25 + 0.4 * cue(t, e.floating!, 120, (x) => x), lit: 0.3 }),
    cam: (e, end) => [
      { at: 0, move: "hold", pos: [5, 0.45, 5], look: [0, 4.6, -0.5], fov: 50 },
      { at: "floating", move: "fly", path: [[5, 0.45, 5], [1, 0.5, 6], [-4, 0.7, 6.5]], look: [0, 4.2, -0.6], dur: d(e.floating!, e.clear!) },
      { at: "clear", move: "crane", look: [0, 0.6, -1], base: [-5, 0, 8], from: 1.2, to: 3.2, dur: d(e.clear!, end) },
    ],
    focus: [0, 3.8, -0.4], range: 9,
  },
  days: {
    names: ["year", "held", "wrong"], light: "day",
    world: (t, e) => ({ sun: ((t - e.year!) / 45) % 1 + 0.001, stress: 0.35 * cue(t, e.wrong!, 18) }),
    cam: (e, end) => [
      { at: 0, move: "push", look: [0, 3.8, -1], dir: [-0.6, 0.1, 1], from: 18, to: 16, dur: d(0, e.wrong!), fov: 42 },
      { at: "wrong", move: "push", look: NUTV, dir: [0.7, -0.3, 1], to: 2.6, dur: d(e.wrong!, end) },
    ],
    focus: [0, 4, 0], range: 10,
    overlay: (t, e) => <MonoLine t={t} at={e.year!} text={"DAY AFTER DAY"} x={120} y={150} size={36} out={e.wrong!} />,
  },
  party: {
    names: ["friday", "dance"], light: "evening",
    world: (t, e) => ({ dance: cue(t, e.dance!, 12), band: cue(t, e.dance!, 10), lit: 0.5 }),
    cam: (e, end) => [{ at: 0, move: "orbit", center: [0, 1.4, -1.5], radius: 8, height: 3.2, from: 0.5, to: 0.15, dur: d(0, end), fov: 44 }],
    focus: [0, 1, -2], range: 10,
    overlay: (t, e, fig) => (
      <>
        <ChapterTitle t={t} at={e.friday!} text="THE LAST MINUTES" />
        <MonoCaption t={t} at={e.friday! + 4} text={`FRIDAY · JULY ${fig.day ?? ""}, ${fig.year ?? ""}`} top={300} />
      </>
    ),
  },
  crowd: {
    names: ["evening", "newspapers", "put", "crowd", "people"], light: "evening",
    world: (t, e) => ({ dance: 0.8, band: 0.6, lit: 0.6, lamps: 0.6 + 0.5 * cue(t, e.crowd!, 12) }),
    cam: (e, end) => [{ at: 0, move: "crane", look: [0, 0.8, -1.4], base: [3, 0, 9], from: 3.2, to: 6.4, dur: d(0, end), fov: 48 }],
    focus: [0, 0.8, -1], range: 10,
    overlay: (t, e, fig) => (
      <>
        <MonoLine t={t} at={e.newspapers!} text="AS REPORTED · KANSAS CITY NEWSPAPERS" x={120} y={300} size={30} />
        {t >= e.put! && <div style={{ position: "absolute", left: 120, top: 352, height: 5, width: Math.min(1, (t - e.put!) / 12) * 760, background: "#ffd84a" }} />}
        <FigPlate t={t} at={e.crowd!} label="IN THE ATRIUM" value={`${fig.lo ?? ""} – ${fig.hi ?? ""}`} x={1240} y={640} />
      </>
    ),
  },
  watch: {
    names: ["watched", "walkways", "above"], light: "evening",
    world: (t, e) => ({ dance: 0.9, band: 0.7, lit: 0.4 + 0.6 * cue(t, e.walkways!, 10) }),
    cam: (e, end) => [
      { at: 0, move: "hold", pos: [1.5, 0.6, 3], look: [0, 1.2, -1], fov: 46 },
      { at: "watched", move: "crane", look: [0, UPPER_Y, 0], base: [3, 0, 6.5], from: 0.8, to: 2.8, dur: d(e.watched!, end) },
    ],
    focus: [0, 3.8, 0], range: 8,
  },
  tape: {
    names: ["television", "tape", "counted", "second"], light: "evening",
    world: () => ({ dance: 0.85, band: 0.7, lit: 0.8 }),
    cam: (e, end) => [
      { at: 0, move: "hold", pos: [5.0, LOWER_Y + 0.62, 4.8], look: [7.2, LOWER_Y + 0.55, 2.2], fov: 42 },
      { at: 2, move: "push", look: [7.2, LOWER_Y + 0.55, 2.2], dir: [-0.7, 0.03, 0.7], from: 3.4, to: 2.4, dur: d(2, e.tape!) },
      { at: "tape", move: "push", look: [0, 3.9, 0], dir: [1, 0.05, 0.55], from: 6.2, to: 5.6, dur: d(e.tape!, end), fov: 36 },
    ],
    focus: [7.2, 3.2, 2.2], range: 4,
    camera: (t, e) => <NewsCamera p={[7.2, LOWER_Y, 2.2]} pan={-2.2 + 0.25 * Math.sin(t / 50)} rec frame={t} />,
    overlay: (t, e, fig) => (
      t >= e.tape! ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={120} y={110} width={1680} height={760} fill="none" stroke="#f4f8ff" strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${i < 2 ? 150 : 1770} ${i % 2 ? 840 : 140} l ${i < 2 ? 60 : -60} 0 M ${i < 2 ? 150 : 1770} ${i % 2 ? 840 : 140} l 0 ${i % 2 ? -60 : 60}`} stroke="#f4f8ff" strokeWidth={5} fill="none" />)}
          {Math.floor(t / 15) % 2 === 0 && <circle cx={190} cy={185} r={14} fill="#ff3b30" />}
          <text x={220} y={196} fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={34} fill="#f4f8ff">REC</text>
          {t >= e.counted! && Array.from({ length: 24 }, (_, i) => {
            const on = t >= e.counted! + i * 1.5;
            const x = 520 + i * 38, y = 430 + (i % 2) * 210;
            return on ? <rect key={i} x={x} y={y} width={8} height={30} fill="#ffd84a" opacity={0.9} /> : null;
          })}
        </svg>
      ) : null
    ),
  },
  band: {
    names: ["minutes", "band", "contest"], light: "evening",
    world: (t, e) => ({ dance: 0.5 + 0.5 * cue(t, e.contest!, 8), band: 0.3 + 0.7 * cue(t, e.band!, 6), lit: 0.6 }),
    cam: (e, end) => [
      { at: 0, move: "push", look: [0, 1.2, -4.8], dir: [0.3, 0.25, 1], from: 6.5, to: 5.2, dur: d(0, e.contest!), fov: 40 },
      { at: "contest", move: "pullback", look: [0, 1.2, -2.5], dir: [0.25, 0.45, 1], to: 12, dur: d(e.contest!, end) },
    ],
    focus: [0, 1.2, -4.6], range: 6,
    clock: (t, e, fig) => (Number(fig.hour ?? "0") + 12) * 3600 + Number(fig.minute ?? "0") * 60 - (t < e.minutes! ? 20 : 0),
  },
  approach: {
    names: ["minute", "upper", "nut"], light: "evening",
    world: (t, e) => ({ dance: 1, band: 1, lit: 0.8, stress: 0.25 + 0.3 * cue(t, e.nut!, 14) }),
    cam: (e, end) => [
      { at: 0, move: "hold", pos: [2, 1.3, 4.5], look: [0, 1.4, -2], fov: 44 },
      { at: "upper", move: "fly", path: [[2, 1.3, 4.5], [1.6, 3.2, 3.2], [0.9, 4.4, 1.8]], look: [0, UPPER_Y - 0.3, 0.5], dur: d(e.upper!, e.nut!) },
      { at: "nut", move: "push", look: NUTV, dir: [0.6, -0.5, 1], to: 1.3, dur: d(e.nut!, end) },
    ],
    focus: NUTV, range: 3,
    clock: (t, e, fig) => (t < e.upper! + 20 ? (Number(fig.hour ?? "0") + 12) * 3600 + Number(fig.minute ?? "0") * 60 + Math.max(0, Math.floor((t - e.minute!) / 4)) : null),
  },
  toll: {
    names: ["people", "injured", "were", "federal", "report", "devastating", "collapse", "united"], light: "night",
    world: (t, e) => ({ fall: 1, dim: 0.5 + 0.2 * cue(t, e.injured!, 20) + 0.15 * cue(t, e.federal!, 20), dust: 1 - 0.4 * cue(t, e.were!, 40) }),
    cam: (e) => [{ at: 0, move: "crane", look: [0, 0.2, 0], base: [2, 0, 3], from: 7.5, to: 12, dur: d(0, e.collapse!), fov: 46 }],
    focus: [0, 0.3, 0], range: 12,
    overlay: (t, e, fig) => (
      <>
        <FigPlate t={t} at={e.people!} label="DIED" value={fig.dead ?? ""} x={110} y={620} color="#f4f8ff" />
        <FigPlate t={t} at={e.injured!} label="INJURED" value={fig.injured ?? ""} x={480} y={620} color="#c9d6e8" />
        <MonoLine t={t} at={e.report!} text="THE MOST DEVASTATING STRUCTURAL COLLAPSE" x={960} y={330} size={40} center />
        <MonoLine t={t} at={e.united! - 8} text="EVER TO TAKE PLACE IN THE UNITED STATES · NBS" x={960} y={400} size={32} color="#c9d6e8" center />
      </>
    ),
  },
  links: {
    names: ["four", "small", "hanging", "party"], light: "dusk",
    world: (t, e) => ({ lit: 0.3, dance: cue(t, e.party!, 12), stress: 0.25 * cue(t, e.hanging!, 20) }),
    cam: (e, end) => [
      { at: 0, move: "push", look: [0, 3.8, -1], dir: [0.4, 0.15, 1], from: 17, to: 15, dur: d(0, e.hanging!), fov: 44 },
      { at: "hanging", move: "fly", path: [[3, 3.4, 6], [1.6, 4.2, 3.2], [0.6, 4.6, 1.8]], look: [0, UPPER_Y - 0.3, 0.55], dur: d(e.hanging!, e.party!) },
      { at: "party", move: "pullback", look: [0, 1.6, -1], dir: [0.3, 0.5, 1], to: 11, dur: d(e.party!, end) },
    ],
    focus: [0, 4, 0], range: 8,
    overlay: (t, e) => {
      const small = cue(t, e.small!, 14);
      const chips = ["WEAK JOINT", "ROD CHANGE", "DETAILER", "REVIEW"];
      return (
        <div style={{ position: "absolute", left: 120 + (1 - small) * 360, top: 300 - small * 60, transform: `scale(${1 - 0.15 * small})`, transformOrigin: "0 0", display: "flex", gap: 18 }}>
          {chips.map((c, i) => t >= e.four! + i * 6 ? (
            <div key={c} style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 38, letterSpacing: 3, color: "#1b2533", background: "#efe9dc", padding: "10px 18px", borderTop: "6px solid #c0392b", opacity: Math.min(1, (t - e.four! - i * 6) / 6) }}>{c}</div>
          ) : null)}
        </div>
      );
    },
  },
  rescue: {
    names: ["call", "fire", "department", "minutes", "rescuers", "cutting", "forklift"], light: "night",
    world: (t, e) => ({ fall: 1, dim: 0.6, dust: 0.8, lamps: 0.25 + 0.6 * cue(t, e.rescuers!, 10) }),
    cam: (e, end) => [{ at: 0, move: "orbit", center: [0, 0.6, 0], radius: 8, height: 2.8, from: 0.5, to: 0.2, dur: d(0, end), fov: 44 }],
    focus: [0, 0.6, 0], range: 10,
    clock: (t, e, fig) => (t >= e.minutes! - 2 ? (Number(fig.hour ?? "0") + 12) * 3600 + (t < e.cutting! ? Number(fig.call ?? "0") : t < e.forklift! ? Number(fig.tools ?? "0") : Number(fig.forklift ?? "0")) * 60 : null),
    camera: (t, e) => (
      <>
        {t >= e.call! && <pointLight position={[9, 1.5, 4]} intensity={(6 + 6 * cue(t, e.department!, 10)) * (Math.floor(t / 8) % 2 ? 1 : 0.2)} distance={18} color="#ff3b30" />}
        {t >= e.call! && <pointLight position={[-9, 1.5, 4]} intensity={(6 + 6 * cue(t, e.department!, 10)) * (Math.floor(t / 8) % 2 ? 0.2 : 1)} distance={18} color="#3b6bff" />}
        {t >= e.rescuers! && [-4, 0, 4].map((x) => <spotLight key={x} position={[x, 4, 3]} target-position={[x, 0, 0]} angle={0.5} penumbra={0.6} intensity={18} distance={9} color="#f4f1e8" />)}
        {t >= e.cutting! && t < e.cutting! + 50 && Array.from({ length: 10 }, (_, i) => {
          const k = ((t - e.cutting! + i * 5) % 20) / 20;
          return <mesh key={i} position={[5.6 + k * 0.6 * Math.cos(i), 0.5 + k * 0.8 - k * k * 1.2, 0.6 + k * 0.6 * Math.sin(i)]} material={glow("#ffb23e", 0.9)}><sphereGeometry args={[0.025, 6, 6]} /></mesh>;
        })}
        {t >= e.forklift! && (
          <group position={[-12 + 4 * cue(t, e.forklift!, 40), 0, 2.5]}>
            <mesh position={[0, 0.5, 0]} material={M.darkSteel()} castShadow><boxGeometry args={[1.4, 0.8, 0.9]} /></mesh>
            {[-0.4, 0.4].map((z) => <mesh key={z} position={[0.9, 0.9, z]} material={M.darkSteel()}><boxGeometry args={[0.08, 1.6, 0.08]} /></mesh>)}
            {[-0.3, 0.3].map((z) => <mesh key={`l${z}`} position={[0.75, 0.6, z]} material={glow("#fff4d0", 0.95)}><sphereGeometry args={[0.06, 8, 8]} /></mesh>)}
            <spotLight position={[0.8, 0.6, 0]} target-position={[6, 0, 0]} angle={0.4} penumbra={0.6} intensity={12} distance={10} color="#fff4d0" />
          </group>
        )}
      </>
    ),
    overlay: (t, e) => <MonoLine t={t} at={e.call!} text="AS REPORTED · NBS CHRONOLOGY" x={120} y={300} size={32} color="#c9d6e8" />,
  },
  third: {
    names: ["third-floor", "own", "stayed"], light: "night",
    world: (t, e) => ({ fall: 1, dim: 0.6, dust: 0.9, thirdLit: cue(t, e["third-floor"]!, 10) }),
    cam: (e, end) => [{ at: 0, move: "orbit", center: [0, THIRD_Y, THIRD_Z], radius: 8.5, height: 0.6, from: 0.35, to: 0.1, dur: d(0, end), fov: 42 }],
    focus: [0, THIRD_Y, THIRD_Z], range: 8,
    overlay: (t, e) => <MonoLine t={t} at={e.stayed!} text="✓ THIRD-FLOOR WALKWAY · STILL HANGING" x={120} y={300} size={36} color="#3ddc84" />,
  },
  edge: {
    names: ["year", "walked", "barely"], light: "day",
    world: (t, e) => ({ sun: 0.3 + 0.4 * t / 400, lit: 0.4 * cue(t, e.walked!, 10), stress: 0.5 * cue(t, e.barely!, 16) }),
    cam: (e, end) => [
      { at: 0, move: "push", look: [0, 4, -0.5], dir: [0.4, 0.05, 1], from: 17, to: 13, dur: d(0, e.barely!), fov: 42 },
      { at: "barely", move: "push", look: NUTV, dir: [-0.5, -0.4, 1], to: 2.4, dur: d(e.barely!, end) },
    ],
    focus: [0, 4.5, 0], range: 8,
  },
};

const AtriumBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const params = p.beat.params as Params;
  const r = R[params.shot ?? "day"] ?? R.day!;
  const fig = params.fig ?? {};
  const e = evs(m, r.names);
  const end = Math.max(m.end, 30);
  const raw = direct({ ...e, end }, r.cam(e, end));
  const keys = r.exterior ? raw : inside(raw);
  const w = r.world(t, e);
  const clock = r.clock ? r.clock(t, e, fig) : null;
  const isDay = r.light === "day";
  return (
    <DisasterStage look="nightGrid" floor={false} dof={1.2} shadowBox={r.exterior ? 40 : 12}
      fog={r.exterior ? { color: "#d9b48c", near: 70, far: 170 } : { color: isDay ? "#8b8f96" : "#08111c", near: isDay ? 24 : 18, far: isDay ? 60 : 52 }}
      {...(r.exterior ? { backdrop: { top: "#41608a", bottom: "#f0b27a", glow: "rgba(255,200,140,0.35)" } } : isDay ? { backdrop: { top: "#3d5a7a", bottom: "#a9b8c6", glow: "rgba(255,240,210,0.2)" } } : {})}
      light={r.exterior ? 0.75 : isDay ? 0.6 : r.light === "night" ? 0.22 : r.light === "dusk" ? 0.4 : 0.32}
      overlay={
        <Overlay>
          {r.overlay?.(t, e, fig, K)}
          {clock !== null && (
            <DisasterLookProvider value="night-grid">
              <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                <MissionClock x={1420} y={110} size={420} seconds={clock} label="the lobby clock" t={t} />
              </svg>
            </DisasterLookProvider>
          )}
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.012} />
      <Focus at={r.focus ?? [0, 3, 0]} range={r.range ?? 8} />
      {r.exterior ? (
        <Exterior frame={t} floorsLit={Math.min(1, cue(t, e.tower ?? 0, 40, Easing.out(Easing.cubic)) + (params.shot === "exterior" ? 1 : 0))} />
      ) : (
        <>
          <Room frame={t} light={r.light} dance={w.dance} dim={w.dim} sun={w.sun} band={w.band} lamps={w.lamps} />
          <Walkways frame={t} fall={w.fall} stress={w.stress} lit={w.lit} edges={w.edges} thirdLit={w.thirdLit} />
          {w.dust !== undefined && <Dust frame={t} k={w.dust} />}
          {r.camera?.(t, e)}
          {r.labels?.(t, e, K)}
        </>
      )}
    </DisasterStage>
  );
};

export default AtriumBeat;
