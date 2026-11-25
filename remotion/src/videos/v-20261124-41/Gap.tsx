// Gap: "A {fact4}-foot piece of deck fell into the water. No person died."
// From the shore: the bridge with its middle gone, a bracket spanning the gap with the figure ("piece"); splash
// rings spread under the gap ("fell"); the sagging cables sway ("water"); onlookers stand on the shore behind a
// rope, looking up ("person"); the light flattens grey, a stub of deck still swinging ("died").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Crowd3D } from "../../three/index";
import { AMBER, ANTON, Cam, CREAM, MONO, DECK_Y, Gertie, k01, Narrows, Readout, Shot3D, sm, SPAN, Tag } from "./World";
import { GAP } from "./Fail";

type Params = { fig?: { gap?: string } };

/** Where a world point lands on the 1080x1920 frame for a camera at pos looking at look (vertical fov in degrees). */
const project = (P: [number, number, number], pos: [number, number, number], look: [number, number, number], fov: number): [number, number] => {
  const sub3 = (a: number[], b: number[]) => [a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!];
  const dot = (a: number[], b: number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
  const cross = (a: number[], b: number[]) => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];
  const norm = (a: number[]) => { const l = Math.hypot(a[0]!, a[1]!, a[2]!); return [a[0]! / l, a[1]! / l, a[2]! / l]; };
  const fw = norm(sub3(look, pos)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
  const d = sub3(P, pos);
  const z = dot(d, fw), k = 960 / Math.tan((fov * Math.PI) / 360);
  return [540 + (dot(d, rt) / z) * k, 960 - (dot(d, up) / z) * k];
};

const Gap: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const fell = m.at("fell", 30), person = m.at("person", 60), died = m.at("died", 80);
  const shore = f >= person;
  const pos: [number, number, number] = shore ? [-SPAN / 2 - 7, 1.3, 9.5 - 0.01 * (f - person)] : [17 - 0.02 * f, 6.2, 12.5 - 0.012 * f];
  const look: [number, number, number] = shore ? [-2, 1.9, 0] : [-1.5, 2.0, 0];
  const rings = k01((f - fell) / 40);
  const a = project([-SPAN / 2 + SPAN * GAP[0], DECK_Y, 0], pos, look, 48), b = project([-SPAN / 2 + SPAN * GAP[1], DECK_Y, 0], pos, look, 48);
  const by = Math.min(a[1], b[1]) - 70, draw = k01(f / 12);
  const mx = (a[0] + b[0]) / 2;
  const grey = sm((f - died) / 20);
  return (
    <Shot3D f={f} fog={{ color: "#3e4746", near: 14, far: 80 - 20 * grey }}
      overlay={
        <>
          {!shore ? (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
                <line x1={a[0]} y1={a[1] - 10} x2={a[0]} y2={by - 20} stroke={AMBER} strokeWidth={7} />
                <line x1={b[0]} y1={b[1] - 10} x2={b[0]} y2={by - 20} stroke={AMBER} strokeWidth={7} />
                <line x1={mx - (mx - a[0]) * draw} y1={by} x2={mx + (b[0] - mx) * draw} y2={by} stroke={AMBER} strokeWidth={7} />
                <path d={`M ${a[0] + 26} ${by - 16} L ${a[0]} ${by} L ${a[0] + 26} ${by + 16}`} fill="none" stroke={AMBER} strokeWidth={7} opacity={draw} />
                <path d={`M ${b[0] - 26} ${by - 16} L ${b[0]} ${by} L ${b[0] - 26} ${by + 16}`} fill="none" stroke={AMBER} strokeWidth={7} opacity={draw} />
              </svg>
              <div style={{ position: "absolute", left: mx - 300, width: 600, top: by - 150, textAlign: "center", opacity: draw }}>
                <span style={{ fontFamily: ANTON, fontSize: 110, color: AMBER, textShadow: "0 4px 18px rgba(0,0,0,0.8)" }}>{`${fig.gap ?? ""} FT`}</span>
              </div>
              <div style={{ position: "absolute", left: mx - 300, width: 600, top: by + 18, textAlign: "center", opacity: draw }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: CREAM, letterSpacing: 3, background: "rgba(16,18,16,0.6)", padding: "4px 14px" }}>DECK GONE</span>
              </div>
            </div>
          ) : null}
          {shore ? <Tag t={f} at={person} top={420} text="NO PERSON DIED" color={CREAM} size={56} /> : null}
          <div style={{ position: "absolute", inset: 0, background: "#5f6766", opacity: 0.25 * grey, pointerEvents: "none" }} />
        </>
      }>
      <Cam pos={pos} look={look} fov={shore ? 46 : 48} seed="tac-gap" range={shore ? 10 : 18} />
      <Narrows f={f} />
      <Gertie twist={0.12} phase={(f * 2 * Math.PI) / 100} gap={GAP} fall={1} sway={0.5} hot={0.3} />
      {rings > 0 ? [0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1 + 5 * ((rings + i / 3) % 1), 1.15 + 5 * ((rings + i / 3) % 1), 64]} />
          <meshBasicMaterial color="#e9eeec" transparent opacity={0.5 * (1 - ((rings + i / 3) % 1))} />
        </mesh>
      )) : null}
      {shore ? <Crowd3D count={14} area={[2.2, 0.8]} height={0.32} seed="tac-shore" mood="lookUp" position={[-SPAN / 2 - 5.4, 0.15, 7.4]} /> : null}
    </Shot3D>
  );
};
export default Gap;
