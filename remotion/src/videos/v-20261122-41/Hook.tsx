// Hook: "Why couldn't this Mississippi tanker stop?"
// Frame 0: low over the night river beside the dark tanker's bow, its stern wake already glowing amber, the
// place caption and the reconstruction tag ("Mississippi"); push in as the bow starts to swing off its line
// and STEERING LOST types on red ("tanker"); cut high over the bend, the
// city lights on both banks and the tanker's wake curving toward the far bank ("stop").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { AMBER, CREAM, DateCaption, MONO, RED, River, Shot3D, Tag, TankerAt, turnPose } from "./World";

/** the swing at a frame of the hook: drifting straight, then turning from "steering" */
export const hookPhi = (f: number, steering: number) => -0.14 + 0.0016 * f + (f > steering ? 0.0000 + 0.0009 * (f - steering) ** 1.25 : 0);

export const Wake: React.FC<{ f: number; phis: number[]; hot?: number }> = ({ f, phis, hot = 0.6 }) => (
  <group>
    {phis.map((ph, i) => {
      const s = turnPose(ph).stern;
      return (
        <mesh key={i} position={[s[0], 0.03, s[2]]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.18 + i * 0.04, 16]} />
          <meshBasicMaterial color={AMBER} transparent opacity={Math.max(0, hot * (0.55 - i * 0.045)) * (0.8 + 0.2 * Math.sin(f * 0.3 + i))} />
        </mesh>
      );
    })}
  </group>
);

/** A loupe under the stern from frame 0: the rudder behind the propeller, already amber, swinging hard over
 * and going red on "tanker" (the part that fails, before we see it in 3D on the next beat). */
const RudderLoupe: React.FC<{ f: number; steering: number }> = ({ f, steering }) => {
  const a = f < steering ? 6 * Math.sin(f * 0.1) : Math.min(34, 6 + (f - steering) * 3);
  const col = f < steering ? AMBER : RED;
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <line x1={250} y1={980} x2={330} y2={1010} stroke={CREAM} strokeWidth={4} strokeDasharray="10 8" />
      <circle cx={600} cy={760} r={235} fill="#14261f" stroke={CREAM} strokeWidth={6} />
      <clipPath id="ms-loupe"><circle cx={600} cy={760} r={232} /></clipPath>
      <g clipPath="url(#ms-loupe)">
        <rect x={360} y={520} width={480} height={70} fill="#6f8f6c" opacity={0.55} />
        <path d="M360,590 L700,590 L700,700 Q690,760 640,770 L360,770 Z" fill="#23272c" stroke="#8f2c25" strokeWidth={8} />
        <rect x={640} y={720} width={30} height={90} rx={10} fill="#b0874a" />
        <circle cx={655} cy={765} r={14} fill="#cfc9c0" />
        <g transform={`rotate(${a} 730 640)`}>
          <rect x={720} y={630} width={34} height={210} rx={10} fill={col} />
        </g>
        <circle cx={737} cy={640} r={12} fill={CREAM} />
      </g>
      <text x={600} y={1040} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={50} letterSpacing={4} fill={col}>RUDDER</text>
    </svg>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const steering = m.at("tanker", 14), river = m.at("stop", 40);
  const phi = hookPhi(f, steering);
  const T = turnPose(phi);
  const high = f >= river;
  const keys = high
    ? direct({}, [
        { at: 0, move: "hold", pos: [T.pos[0] - 6, 22, T.pos[2] - 16], look: [T.pos[0] + 4, 0, T.pos[2] + 3], fov: 46 },
        { at: river, move: "cut", pos: [T.pos[0] - 6, 22, T.pos[2] - 16], look: [T.pos[0] + 4, 0, T.pos[2] + 3], fov: 46 },
        { at: river + 1, move: "pullback", look: [T.pos[0] + 4, 0, T.pos[2] + 3], dir: [-0.3, 0.75, -0.6], from: 26, to: 30, dur: Math.max(10, m.end - river) },
      ])
    : direct({}, [
        { at: 0, move: "push", look: [T.bow[0] - 2.2, 0.55, T.bow[2]], dir: [0.55, 0.16, -0.82], from: 7.6, to: 6.4, dur: Math.max(10, steering) },
        { at: steering, move: "push", look: [T.bow[0] - 1.2, 0.5, T.bow[2]], to: 4.8, dur: Math.max(10, river - steering), dir: [0.55, 0.14, -0.82] },
      ]);
  const trail = Array.from({ length: 10 }, (_, i) => hookPhi(Math.max(0, f - i * 6), steering));
  return (
    <Shot3D f={f}
      overlay={
        <>
          <DateCaption t={f} at={0} title={high ? "NEW ORLEANS" : undefined} titleAt={river} line="MISSISSIPPI RIVER · NEW ORLEANS" />
          {!high ? <Tag t={f} at={-30} top={1130} text="TANKER" color="#f4efe7" size={56} /> : null}
          {!high && f >= steering ? <Tag t={f} at={steering} top={1240} text="STEERING LOST" color={RED} size={56} /> : null}
          {high ? <Tag t={f} at={river} top={1220} text="TURNING · NO CONTROL" color={AMBER} size={48} /> : null}
          {!high ? <RudderLoupe f={f} steering={steering} /> : null}
          <SourceLine p={p} y={1330} />
        </>
      }>
      <Camera3D keys={keys} seed="ms-hook" drift={high ? 0.02 : 0.012} />
      <Focus at={high ? T.pos : [T.bow[0] - 2, 0.5, T.bow[2]]} range={high ? 30 : 5} />
      <River f={f} />
      <TankerAt f={f} pos={T.pos} yaw={T.yaw} rudder={f > steering ? 0.6 : 0} stress={f > steering ? 0.55 : 0.35} />
      <Wake f={f} phis={trail} hot={0.7} />
      <pointLight position={[T.stern[0], 0.5, T.stern[2]]} intensity={1.4} distance={3.5} color="#ff9a3c" />
    </Shot3D>
  );
};
export default Hook;
