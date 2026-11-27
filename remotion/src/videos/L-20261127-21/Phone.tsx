// Phone: a phone lying on a desk at night, a chat app open; the question types itself in, the send arrow lights,
// a pulse of light leaves the phone; later the answer arrives letter by letter. For the hook it cuts to a graphics
// chip on its board in a dark server (anchor "gpu", far off to the side). Actions (params.moments[].do):
// type, send, pulse, sparks, gpu, grid, racks, fade, phone, arrive, letters, more, moreb, fill, glow, bubble.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FigLabel3D, glow, mat, Phone as PhoneModel, ServerRack, TECH, type V3 } from "../../three/index";
import { BigChip, Beads, DotGrid, FloorGrid, NIGHT, q, Shot, useBeat, Words, type Anchor } from "./kit";

const GPU_X = 40;
type Extra = { question?: string; answer?: string };

const Phone: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const ex = (p.beat.params ?? {}) as Extra;
  const question = ex.question ?? "";
  const answer = ex.answer ?? "";
  const typed = has("type") ? Math.round(question.length * k("type", 40)) : question.length;
  const sent = k("send", 10);
  const ans = has("letters") ? Math.min(1, 0.15 * k("letters", 8) + 0.3 * k("more", 14) + 0.3 * k("moreb", 14) + 0.25 * k("fill", 30)) : 0;
  const shownA = answer.slice(0, Math.round(answer.length * ans));
  // the answer wrapped at word ends, about 22 letters a line
  const lines: string[] = [];
  for (const w of shownA.split(" ")) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + " " + w).length <= 22) lines[lines.length - 1] = last + " " + w; else lines.push(w);
  }
  const inGpu = has("gpu") && f >= at("gpu");
  const grid = k("grid", 30);
  const anchors: Record<string, Anchor> = {
    phone: { look: [0, 0.2, -0.1], dir: [0.12, 1.3, 0.7], d: 4.6 },
    screen: { look: [0, 0.22, -0.2], dir: [0.04, 1.4, 0.45], d: 4.4 },
    gpu: { look: [GPU_X, 0.1, 0], dir: [0.25, 0.95, 1], d: 7 },
  };
  const pos = (on: string): V3 => on === "screen" ? [0.5, 0.4, -1.2] : on === "gpu" ? [GPU_X + 1.4, 0.6, -1] : [0.9, 0.5, -1.4];
  const tx = (s: string) => s.length ? s : " ";
  return (
    <Shot p={p} b={b} anchors={anchors} seed="phone" backdrop={NIGHT} floor={false} bloom={1.15} light={0.9} dust={{ c: [0, 1, 0], r0: 6, r1: 16, size: 0.35, color: "#9fc4ff" }}>
      {/* the desk: dark wood with grain lines, a lamp's warm pool, a mug */}
      <mesh position={[0, -0.02, 0]} rotation-x={-Math.PI / 2} material={mat("clay", "#3a2616", { roughness: 0.6 })}><planeGeometry args={[30, 20]} /></mesh>
      <FloorGrid x0={-8} x1={8} z0={-6} z1={6} y={0.002} step={0.45} color="#5a3c22" o={0.9} />
      <DotGrid x0={-14} x1={14} y0={-1} y1={8} z={-7} gap={0.5} size={0.07} color="#3d5a9a" glowing />
      <pointLight position={[-3, 3, -2]} intensity={6} distance={9} color="#ffb36a" />
      <group position={[-2.3, 0, -1.6]}>
        <mesh position={[0, 0.45, 0]} material={mat("glossy", "#c94f3a")}><cylinderGeometry args={[0.42, 0.38, 0.9, 28]} /></mesh>
        <mesh position={[0.5, 0.5, 0]} rotation-x={Math.PI / 2} material={mat("glossy", "#c94f3a")}><torusGeometry args={[0.2, 0.06, 8, 20]} /></mesh>
      </group>
      {/* the phone, screen up, a glow on the desk around it */}
      <group rotation-y={0.12}>
        <PhoneModel glowScreen={0.35 + 0.3 * Math.abs(Math.sin(f * 0.05))} />
        <mesh position={[0, 0.216, 0]} rotation-x={-Math.PI / 2} material={mat("screen", "#060a14", { emissive: "#0d1a33", emissiveIntensity: 0.9 })}><planeGeometry args={[1.32, 2.86]} /></mesh>
        {/* the chat: a header, the question bubble, the answer bubble */}
        <mesh position={[0, 0.219, -1.25]} rotation-x={-Math.PI / 2} material={glow("#1d3b6e", 0.9)}><planeGeometry args={[1.32, 0.3]} /></mesh>
        <group position={[0.12, 0.222, -0.55 - 0.25 * sent]} rotation-x={-Math.PI / 2}>
          <mesh material={glow(sent > 0.5 ? TECH.cyan : "#2f4c7a", q(0.55 + 0.35 * sent))}><planeGeometry args={[1.25, 0.34]} /></mesh>
          <FigLabel3D fig={tx(question.slice(0, typed))} at={[0, 0, 0.01]} start={0} count={0} face="front" height={0.11} color={TECH.ink} plate={false} />
        </group>
        {shownA.length > 0 && (
          <group position={[-0.05, 0.222, 0.2]} rotation-x={-Math.PI / 2}>
            <mesh material={glow("#26324d", 0.95)}><planeGeometry args={[1.25, 0.8]} /></mesh>
            {lines.slice(0, 4).map((l, i) => <FigLabel3D key={i} fig={l} at={[0, 0.27 - i * 0.17, 0.01]} start={0} count={0} face="front" height={0.12} color={TECH.white} plate={false} />)}
          </group>
        )}
        {/* the send arrow */}
        <mesh position={[0.55, 0.224, 1.15]} rotation-x={-Math.PI / 2} material={glow(sent > 0 ? TECH.lime : "#355", q(0.4 + 0.6 * sent))}><circleGeometry args={[0.13, 20]} /></mesh>
        <mesh position={[0.55, 0.227, 1.15]} rotation-x={-Math.PI / 2} material={glow(TECH.white, 0.9)}><circleGeometry args={[0.05, 3]} /></mesh>
        {/* the keyboard keys flicker while typing */}
        {has("type") && typed < question.length && <DotGrid x0={-0.55} x1={0.55} y0={0.9} y1={1.0} z={0} gap={0.14} size={0.08} color={TECH.cyan} glowing />}
      </group>
      {/* light leaving the phone toward the data centre, and arriving back */}
      {(has("pulse") && f >= at("pulse")) && <Beads a={[0, 0.5, -1.4]} b={[0, 3.5, -14]} t={f - at("pulse")} n={10} color={TECH.cyan} r={0.07} />}
      {(has("arrive") && f >= at("arrive")) && <Beads a={[0, 3.5, -14]} b={[0, 0.5, -1.4]} t={f - at("arrive")} n={8} color={TECH.amber} r={0.07} />}
      {has("sparks") && f >= at("sparks") && <Beads a={[-0.8, 0.35, 1.6]} b={[-0.8, 0.35, -1.6]} t={(f - at("sparks")) * 2} n={8} color={TECH.white} r={0.035} spread={0.05} />}
      {/* the hook's cut: a graphics chip in a dark server */}
      {inGpu && (
        <group position={[GPU_X, 0, 0]}>
          <BigChip f={f} grid={grid} lit={0.3 + 0.5 * grid + 0.2 * k("fade", 20)} mem={0.4} />
          {has("racks") && [-6, -3.2, 3.2, 6].map((x, i) => <ServerRack key={i} seed={`ph-${i}`} lod="low" position={[x, 0, -5]} scale={1.8 * q(k("racks", 14))} />)}
          <Block size={[16, 0.05, 10]} radius={0.01} preset="blackPlastic" position={[0, -0.2, 0]} />
        </group>
      )}
      <Words b={b} pos={pos} />
    </Shot>
  );
};
export default Phone;
