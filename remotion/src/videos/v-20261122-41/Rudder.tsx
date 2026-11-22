// Rudder: "Its rudder had stuck to starboard. From then, it had {fact3} minutes."
// Under the tanker's stern in cutaway below the brown waterline: the propeller turning and the rudder behind
// it ("rudder"); the blade swings hard over and stops, juddering, its stress climbing amber ("stuck"); push in,
// STUCK TO STARBOARD types on and the blade goes red ("starboard"); a clock frame appears ("then") and the
// figure lands on it as its ring starts to drain ("minutes").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { AMBER, Clock, RED, Shot3D, Tag, TankerAt } from "./World";

type Params = { fig?: { minutes?: string } };

/** the rudder angle after it jams at `stuck`: swings over, overshoots, judders */
export const jam = (f: number, stuck: number) => {
  if (f < stuck) return 0.05 * Math.sin(f * 0.08);
  const u = Math.min(1, (f - stuck) / 10);
  return 0.62 * (1 - (1 - u) * (1 - u)) + 0.012 * Math.sin(f * 1.7) * Math.max(0, 1 - (f - stuck) / 40);
};

/** The surface of the river seen from below: a pale, rippling ceiling. */
export const Surface: React.FC<{ f: number }> = ({ f }) => (
  <mesh position={[0, -0.005 + 0.004 * Math.sin(f * 0.2), 0]} rotation-x={Math.PI / 2}>
    <planeGeometry args={[40, 40]} />
    <meshBasicMaterial color="#6f8f6c" transparent opacity={0.42} side={2} />
  </mesh>
);

const Rudder: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const stuck = m.at("stuck", 14), starboard = m.at("starboard", 34), moment = m.at("then", 56), minutes = m.at("minutes", 80);
  const ang = jam(f, stuck);
  const stress = f < stuck ? 0.35 : f < starboard ? 0.35 + 0.35 * Math.min(1, (f - stuck) / 12) : Math.min(1, 0.7 + (f - starboard) / 30);
  const look: [number, number, number] = [-4.2, -0.26, 0.05];
  const keys = direct({}, [
    { at: 0, move: "push", look, dir: [-0.45, 0.08, 0.89], from: 2.9, to: 2.3, dur: Math.max(10, starboard) },
    { at: starboard, move: "push", look: [-4.26, -0.26, 0.1], dir: [-0.35, 0.05, 0.94], to: 1.55, dur: Math.max(10, minutes - starboard) },
    { at: minutes, move: "pullback", look: [-4.0, -0.2, 0], dir: [-0.4, 0.12, 0.9], to: 3.2, dur: Math.max(10, m.end - minutes) },
  ]);
  const drain = m.lerp([minutes, m.end + 40], [1, 0.82]);
  const clockK = m.lerp([moment, moment + 8], [0, 1]);
  return (
    <Shot3D f={f} under
      overlay={
        <>
          <Tag t={f} at={0} top={390} text="RUDDER" color="#f4efe7" size={52} />
          {f >= starboard ? <Tag t={f} at={starboard} top={480} text="STUCK TO STARBOARD" color={RED} size={52} /> : null}
          {f >= moment ? (
            <>
              <svg data-probe="skip" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: clockK }}>
                <circle cx={540} cy={760} r={210} fill="none" stroke="rgba(244,239,231,0.18)" strokeWidth={18} />
                <circle cx={540} cy={760} r={210} fill="none" stroke={AMBER} strokeWidth={18} strokeDasharray={`${2 * Math.PI * 210 * drain} 2000`} transform="rotate(-90 540 760)" />
              </svg>
              {f >= minutes ? <Clock value={`${fig.minutes ?? ""} MIN`} caption="FROM THE JAM" top={650} k={m.lerp([minutes, minutes + 8], [0, 1])} /> : null}
            </>
          ) : null}
        </>
      }>
      <Camera3D keys={keys} seed="ms-rudder" drift={0.006} />
      <Focus at={look} range={1.2} />
      <Surface f={f} />
      <TankerAt f={f} pos={[0, 0, 0]} yaw={0} rudder={ang} stress={stress} prop={0.2} spin={f * 0.28} />
      <mesh position={[0, -2.2, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#20271c" roughness={1} /></mesh>
      <pointLight position={[-4.6, -0.1, 1.2]} intensity={1.6} distance={4} color="#d7efe0" />
      <pointLight position={[-4.4, -0.3, 0.4]} intensity={0.9 + 1.4 * stress} distance={1.6} color="#ff9a3c" />
    </Shot3D>
  );
};
export default Rudder;
