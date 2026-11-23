// Home: a living room at night. The dish cable comes down through the ceiling to a router on a shelf; the
// router's own power cord goes to the wall socket (drawn as two different cables, labelled); a laptop on
// the table, a phone on the sofa, a TV on the wall. Actions: room, cable, cableRun, cableUp, ceiling,
// router, plug, power, wifi, laptop, phone, phoneUp, lag, lagcount, play, bubbles, clash, late, check,
// click, pulseOut, blip, tv.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, TECH, type V3 } from "../../three/index";
import { BACK, Beam, Laptop, lerpV, Lines, PulseRing, q, Ripples, Router, Shot, useBeat, Words, type Anchor } from "./kit";

const ROUTER: V3 = [-1.5, 1.62, -2.7];
const RTOP: V3 = [-1.5, 2.32, -2.7];
const CEIL: V3 = [-1.5, 3.4, -2.7];
const OUTLET: V3 = [-0.5, 0.45, -2.96];
const LAP: V3 = [0.9, 0.78, -0.2];
const PHONE: V3 = [2.7, 0.62, -1.3];
const cord: V3[] = [[-1.32, 1.66, -2.62], [-1.0, 1.0, -2.85], [-0.75, 0.55, -2.92], OUTLET];

const Home: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const routerLit = Math.max(k("router", 10), k("wifi", 10), k("cable", 30) > 0.9 ? 0.5 : 0, has("room") ? 0.45 : 0);
  const playing = has("play") && f >= at("play");
  const lagging = has("lag") && f >= at("lag") && !playing;
  const screen = Math.max(k("laptop", 10), k("lag", 8), k("play", 8), has("room") ? 0.4 : 0, has("click") ? 0.6 : 0);
  const bub = k("bubbles", 10);
  const clash = has("clash") && f >= at("clash") ? Math.sin((f - at("clash")) * 1.4) * 0.03 * Math.max(0, 1 - (f - at("clash")) / 30) : 0;
  const cableRun = has("cableRun") && f >= at("cableRun") ? Math.min(1, (f - at("cableRun")) / 24) : -1;
  const cableUp = has("cableUp") && f >= at("cableUp") ? Math.min(1, (f - at("cableUp")) / 24) : -1;
  const cableGlow = Math.max(k("cable", 16), cableRun >= 0 || cableUp >= 0 ? 0.6 : 0);
  const outT = has("pulseOut") && f >= at("pulseOut") ? Math.min(1, (f - at("pulseOut")) / 22) : -1;
  const blip = has("blip") ? Math.max(0, 1 - Math.abs(f - at("blip") - 4) / 5) : 0;
  const anchors: Record<string, Anchor> = {
    room: { look: [0.4, 1.3, -1.2], dir: [0.35, 0.32, 1], d: 5.6 },
    laptop: { look: [LAP[0], LAP[1] + 0.45, LAP[2] - 0.45], dir: [0.12, 0.18, 1], d: 2.1 },
    router: { look: [ROUTER[0], ROUTER[1] + 0.4, ROUTER[2]], dir: [0.35, 0.12, 1], d: 2.2 },
    cable: { look: [ROUTER[0], 2.7, ROUTER[2]], dir: [0.45, -0.05, 1], d: 2.4 },
    outlet: { look: [OUTLET[0] - 0.2, 0.8, OUTLET[2]], dir: [0.3, 0.2, 1], d: 1.8 },
    phone: { look: [PHONE[0] - 0.3, PHONE[1] + 0.3, PHONE[2]], dir: [-0.2, 0.45, 1], d: 3.2 },
  };
  const pos = (on: string): V3 => on === "router" ? RTOP : on === "outlet" ? OUTLET : on === "cable" ? [ROUTER[0], 2.9, ROUTER[2]] : on === "laptop" ? [LAP[0] + 0.5, LAP[1] + 0.9, LAP[2] - 0.5] : on === "phone" ? PHONE : anchors[on]?.look ?? [0, 0, 0];
  const spin = (f * 0.25) % (Math.PI * 2);
  return (
    <Shot p={p} b={b} anchors={anchors} seed="home" backdrop={BACK} floor={false} bloom={1.1} fov={40} light={0.8}>
      {/* the room: floor, back wall, side wall, ceiling, a warm lamp */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#3a2e28" roughness={0.75} /></mesh>
      <mesh position={[0, 1.8, -3]}><planeGeometry args={[14, 3.6]} /><meshStandardMaterial color="#2a3346" roughness={0.9} /></mesh>
      <mesh position={[-4.5, 1.8, 0]} rotation-y={Math.PI / 2}><planeGeometry args={[10, 3.6]} /><meshStandardMaterial color="#263043" roughness={0.9} /></mesh>
      <mesh position={[0, 3.6, 0]} rotation-x={Math.PI / 2}><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#1c2232" roughness={0.9} /></mesh>
      <Lines from={-7} to={7} step={0.32} along="x" span={[0, 3.6]} z={-2.99} color="#1a2130" r={0.018} />
      <Lines from={0.9} to={0.9} step={1} along="y" span={[-7, 7]} z={-2.98} color="#3b4660" r={0.04} />
      <group position={[-4.49, 0, 0]} rotation-y={Math.PI / 2}><Lines from={-5} to={5} step={0.32} along="x" span={[0, 3.6]} z={0} color="#182030" r={0.018} /></group>
      {Array.from({ length: 30 }, (_, i) => <mesh key={`fb${i}`} position={[-7 + i * 0.48, 0.005, 0]}><boxGeometry args={[0.02, 0.004, 10]} /><meshStandardMaterial color="#1f1712" /></mesh>)}
      {/* a picture and a plant */}
      <mesh position={[-3.2, 2.1, -2.97]} material={mat("clay", "#c9a86a")}><planeGeometry args={[1.1, 0.8]} /></mesh>
      <mesh position={[-3.2, 2.1, -2.96]} material={mat("clay", "#33507a")}><planeGeometry args={[0.95, 0.65]} /></mesh>
      <mesh position={[-3.6, 0.35, -2.2]} material={mat("clay", "#6b4a3a")}><cylinderGeometry args={[0.25, 0.2, 0.5, 12]} /></mesh>
      <mesh position={[-3.6, 1.0, -2.2]} material={mat("clay", "#3f7a48")}><sphereGeometry args={[0.45, 10, 8]} /></mesh>
      <pointLight position={[3.2, 2.2, 0.5]} intensity={6} color="#ffcf8a" distance={9} />
      <mesh position={[3.2, 2.2, 0.5]} material={glow("#ffd9a0", 0.9)}><sphereGeometry args={[0.14, 10, 8]} /></mesh>
      {/* the shelf and the router */}
      <Block size={[1.4, 0.06, 0.5]} radius={0.01} material={mat("clay", "#6b4d38")} position={[ROUTER[0], ROUTER[1] - 0.03, ROUTER[2] + 0.02]} />
      <Router position={ROUTER} lit={routerLit} blip={blip} />
      {/* the dish cable through the ceiling, and the router's own power cord to the wall */}
      <Beam a={CEIL} b={RTOP} r={0.025} color={cableGlow > 0.05 ? TECH.cyan : "#30343f"} o={0.4 + 0.6 * cableGlow} />
      {has("ceiling") && <PulseRing f={f} start={at("ceiling")} at={[CEIL[0], 3.58, CEIL[2]]} r={0.25} color={TECH.cyan} />}
      {cableRun >= 0 && cableRun < 1 && <mesh position={lerpV(CEIL, RTOP, cableRun)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.06, 8, 6]} /></mesh>}
      {cableUp >= 0 && cableUp < 1 && <mesh position={lerpV(RTOP, CEIL, cableUp)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.06, 8, 6]} /></mesh>}
      {(has("plug") || has("power") || has("room")) && cord.slice(1).map((c, i) => (
        <Beam key={i} a={cord[i]!} b={lerpV(cord[i]!, c, has("plug") ? k("plug", 14) : 1)} r={0.015} color={k("power") > 0.5 ? TECH.amber : "#4a4f5c"} o={0.95} />
      ))}
      <Block size={[0.16, 0.24, 0.03]} radius={0.02} material={has("power") ? glow(TECH.amber, q(0.25 + 0.6 * k("power", 10))) : mat("white")} position={OUTLET} />
      {has("wifi") && <Ripples f={f} start={at("wifi")} position={[ROUTER[0], ROUTER[1] + 0.5, ROUTER[2] + 0.3]} n={4} reach={3.2} period={30} upright />}
      {outT >= 0 && outT < 1 && <mesh position={lerpV([LAP[0], LAP[1] + 0.5, LAP[2] - 0.4], RTOP, outT)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.07, 8, 6]} /></mesh>}
      {/* the TV on the wall */}
      <Block size={[1.7, 1.0, 0.06]} radius={0.02} preset="blackPlastic" position={[2.3, 1.9, -2.95]} />
      <mesh position={[2.3, 1.9, -2.91]} material={glow("#5f8cff", q(0.15 + 0.5 * k("tv", 10) * (0.7 + 0.3 * Math.sin(f * 0.3))))}><planeGeometry args={[1.58, 0.88]} /></mesh>
      {/* the table, the laptop and what is on its screen */}
      <Block size={[2.2, 0.06, 1.3]} radius={0.02} material={mat("clay", "#7a5a40")} position={[LAP[0], LAP[1] - 0.04, LAP[2]]} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <mesh key={i} position={[LAP[0] + x! * 1.0, 0.37, LAP[2] + z! * 0.55]} material={mat("clay", "#5e4430")}><boxGeometry args={[0.07, 0.74, 0.07]} /></mesh>)}
      <Laptop position={LAP} screen={screen}>
        {screen > 0.3 && (
          <group position={[clash, 0, 0]}>
            {/* the call: two faces' tiles */}
            <mesh position={[-0.31, 0.05, 0.001]} material={mat("clay", "#7d8fb5")}><planeGeometry args={[0.6, 0.6]} /></mesh>
            <mesh position={[0.31, 0.05, 0.001]} material={mat("clay", "#b5937d")}><planeGeometry args={[0.6, 0.6]} /></mesh>
            {[-0.31, 0.31].map((x, i) => <mesh key={i} position={[x, 0.12 + (playing ? 0.01 * Math.sin(f * 0.4 + i) : 0), 0.003]} material={mat("clay", "#e8d2bf")}><circleGeometry args={[0.12, 20]} /></mesh>)}
            {lagging && <mesh position={[0, 0.05, 0.01]} rotation-z={-spin} material={glow(TECH.white, 0.9)}><torusGeometry args={[0.12, 0.018, 6, 30, Math.PI * 1.4]} /></mesh>}
            {playing && <mesh position={[-0.6 + 0.6 * Math.min(1, (f - at("play")) / 120), -0.33, 0.01]} material={glow(TECH.cyan, 0.9)}><planeGeometry args={[1.2 * Math.min(1, 0.1 + (f - at("play")) / 140), 0.025]} /></mesh>}
            {bub > 0 && [-0.31, 0.31].map((x, i) => (
              <mesh key={i} position={[x + (i ? -0.12 : 0.12) * (has("clash") ? k("clash", 6) : 0), 0.31 + 0.02 * i, 0.012]} scale={bub * (has("clash") || !has("play") ? 1 : (Math.floor((f - at("bubbles")) / 20) % 2 === i ? 1 : 0.4))} material={mat("white")}><circleGeometry args={[0.09, 16]} /></mesh>
            ))}
            {has("late") && f >= at("late") && <mesh position={[0.5 - 0.15 * k("late", 30), 0.3, 0.013]} material={mat("white", "#ffe8a0")}><circleGeometry args={[0.07, 16]} /></mesh>}
            {has("check") && <mesh position={[0.5, -0.22, 0.014]} material={glow(TECH.lime, q(k("check", 8)))}><torusGeometry args={[0.06, 0.012, 6, 20]} /></mesh>}
            {has("click") && <mesh position={[0.02, 0.03, 0.015]} material={glow(TECH.amber, q(Math.max(0, 1 - Math.abs(f - at("click")) / 8)))}><ringGeometry args={[0.04, 0.07, 20]} /></mesh>}
          </group>
        )}
      </Laptop>
      {/* the sofa and the phone */}
      <Block size={[2.4, 0.5, 1.0]} radius={0.12} material={mat("clay", "#3f5a6e")} position={[2.9, 0.25, -1.5]} />
      <Block size={[2.4, 0.7, 0.25]} radius={0.1} material={mat("clay", "#37506a")} position={[2.9, 0.75, -1.95]} />
      <group position={PHONE} rotation-x={-0.9 * k("phoneUp", 16)}>
        <Block size={[0.17, 0.02, 0.34]} radius={0.02} preset="blackPlastic" />
        <mesh position={[0, 0.012, 0]} rotation-x={-Math.PI / 2} material={glow("#5fa0ff", q(0.1 + 0.8 * k("phone", 10)))}><planeGeometry args={[0.15, 0.31]} /></mesh>
      </group>
      <Words b={b} pos={pos} />
    </Shot>
  );
};
export default Home;
