// Phone: a phone held in a hand on a dark stage. In the assembly shot a bare chip floats over the board, is
// packaged, tested and soldered on, and the phone closes up round it; in the payoff the phone opens in
// layers, its chip lights and twinkles with switches, and a fingertip comes in beside it for size.
// Actions (params.moments[].do): chip, package, test, solder, close, phone, open, switches, zoom, nail.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, ChipPackage, Die, glow, mat, PHONE_STACK, PhonePartModel, TECH, type PhonePart, type V3 } from "../../three/index";
import { BACK, Beam, q, Shot, useBeat, Words, type Anchor } from "./kit";

const SKIN = "#c99a7a";
const S = 2.0;
const CHIP: V3 = [0, 0.95, 0.6];

const Hand: React.FC<{ o: number }> = ({ o }) => o <= 0.02 ? null : (
  <group position={[0.2, -0.55, 0.6]} scale={q(o)}>
    <Block size={[2.2, 0.5, 2.4]} radius={0.24} material={mat("clay", SKIN, { roughness: 0.7 })} position={[0, 0, 0]} />
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[1.25, 0.25, -0.9 + i * 0.55]} rotation-z={-0.9} material={mat("clay", SKIN, { roughness: 0.7 })}><capsuleGeometry args={[0.17, 0.9, 6, 10]} /></mesh>
    ))}
    <mesh position={[-1.2, 0.3, 0.8]} rotation-z={0.9} rotation-y={0.5} material={mat("clay", SKIN, { roughness: 0.7 })}><capsuleGeometry args={[0.2, 0.8, 6, 10]} /></mesh>
  </group>
);

const Phone: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const assembly = has("solder") || has("package") || has("test");
  const open = assembly ? 1 - k("close", 20) : 0.55 * Math.max(k("open", 20), has("zoom") || has("nail") ? 1 : 0);
  const pkg = k("package", 14);
  const test = k("test", 12);
  const drop = k("solder", 16);
  const chipLit = Math.max(k("chip", 12), test > 0.5 ? 0.6 : 0);
  const sw = k("switches", 14);
  const zoom = k("zoom", 20);
  const nail = k("nail", 20);
  const parts = Object.keys(PHONE_STACK) as PhonePart[];
  const spread = { back: 0, battery: 0.5, board: 1.0, frame: 1.6, screen: 2.3 } as Record<PhonePart, number>;
  // the chip's place: on the board when soldered, over it before, lifted toward us on "zoom"
  const boardY = PHONE_STACK.board * S + spread.board * open * 0.9;
  const chipY = assembly ? boardY + 0.2 + 1.6 * (1 - drop) : boardY + 0.2 + 1.4 * zoom;
  const chipPos: V3 = [0, chipY, 0.6 + 1.0 * zoom];
  const anchors: Record<string, Anchor> = {
    phone: { look: [0, 1.0, 0.4], dir: [0.3, 0.9, 1], d: 4.6 },
    chip: { look: chipPos, dir: [0.25, 0.8, 1], d: 2.4 },
    board: { look: [0, boardY, 0.4], dir: [0.3, 1.0, 1], d: 3.6 },
    finger: { look: [0.7, chipY, 0.9 + 1.0 * zoom], dir: [0.2, 0.7, 1], d: 3 },
  };
  const pos = (on: string): V3 => on === "chip" ? [chipPos[0] - 0.4, chipPos[1] + 0.4, chipPos[2]] : [0, 2.5, 0.4];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="phone" backdrop={BACK} floor="reflect" bloom={1.2} dust={{ c: [0, 1.2, 0], r0: 6, r1: 16, size: 0.55 }}>
      <mesh position={[0, 3, -4]} material={mat("clay", "#10131d")}><planeGeometry args={[30, 12]} /></mesh>
      {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-11 + i * 2, 3, -3.95]} material={mat("clay", "#171b28")}><boxGeometry args={[0.04, 12, 0.01]} /></mesh>)}
      <group position={[0, 0.6, 0]} rotation-x={-0.15}>
        {!assembly && <Hand o={1} />}
        <group scale={S}>
          {parts.filter((pt) => !(assembly && (pt === "screen" || pt === "frame") && k("close", 20) < 0.05)).map((pt) => (
            <PhonePartModel key={pt} part={pt} glowScreen={0.8}
              position={[0, PHONE_STACK[pt] + (spread[pt] * open * 0.9) / S, pt === "battery" ? 3.1 * 0.18 : 0]} />
          ))}
        </group>
      </group>
      {/* the chip */}
      <group position={[chipPos[0], chipPos[1] + 0.6, chipPos[2]]}>
        {pkg > 0.5 || !assembly ? <ChipPackage size={0.7} lid={false} lit={0.3 + 0.7 * Math.max(chipLit, sw)} seed="euvchip" /> : <Die size={0.4} lit={0.4 + 0.5 * chipLit} seed="euvchip" />}
        {has("package") && pkg < 0.98 && <mesh position={[0, 0.05, 0]} material={glow(TECH.cyan, q(0.5 * (1 - pkg)))}><boxGeometry args={[0.8, 0.12, 0.8]} /></mesh>}
        {sw > 0.02 && Array.from({ length: 30 }, (_, i) => (
          <mesh key={i} position={[-0.17 + 0.34 * ((i * 7) % 10) / 10, 0.11, -0.17 + 0.34 * ((i * 3) % 10) / 10]} material={glow("#ffffff", q(sw * Math.max(0, Math.sin(f * 0.35 + i * 1.3))))}><boxGeometry args={[0.02, 0.01, 0.02]} /></mesh>
        ))}
        {has("test") && [-1, 1].map((s, i) => <Beam key={i} a={[s * 0.9, 1.2, 0]} b={[s * 0.35, 0.12 + 0.6 * (1 - test), 0]} r={0.02} color={test > 0.6 ? TECH.lime : "#c9ced8"} o={0.9} />)}
        {has("solder") && drop > 0.95 && [0, 1, 2, 3].map((i) => <mesh key={i} position={[(i % 2 ? 0.3 : -0.3), -0.02, (i < 2 ? 0.3 : -0.3)]} material={glow("#ffffff", q(Math.max(0, 1 - (f - at("solder") - 16) / 20)))}><sphereGeometry args={[0.04, 8, 6]} /></mesh>)}
      </group>
      {/* a fingertip, for size */}
      {nail > 0.02 && <group position={[chipPos[0] + 0.95 + 1.2 * (1 - nail), chipPos[1] + 0.7, chipPos[2] + 0.1]} rotation-z={Math.PI / 2}>
        <mesh material={mat("clay", SKIN, { roughness: 0.7 })}><capsuleGeometry args={[0.36, 1.6, 8, 14]} /></mesh>
        <mesh position={[0, -0.75, 0.24]} rotation-x={0.3} material={mat("clay", "#f0c8b8", { roughness: 0.3 })}><boxGeometry args={[0.46, 0.5, 0.06]} /></mesh>
      </group>}
      <Words b={b} pos={pos} />
    </Shot>
  );
};
export default Phone;
