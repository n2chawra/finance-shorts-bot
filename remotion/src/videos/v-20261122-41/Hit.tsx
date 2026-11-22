// Hit: "{fact3} minutes after the rudder stuck, it hit a docked riverboat with {fact1} people aboard."
// From the water off the wharf: the clock from the stern reaches zero over the river ("rudder"); the tanker's
// bow pressed into the riverboat's side ("hit"); the camera runs along the dock lines ("docked"); the
// riverboat's decks light ("riverboat"); the count of people aboard lands on the wharf's board ("people"),
// push in on the lit windows ("aboard"). No people drawn.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { AMBER, ANTON, Clock, CREAM, MONO, PHI_HIT, River, Riverboat, Shot3D, TankerAt, turnPose } from "./World";

type Params = { fig?: { aboard?: string; minutes?: string } };

const Hit: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const rudder = m.at("rudder", 16), hit = m.at("hit", 34), riverboat = m.at("riverboat", 56), people = m.at("people", 80), aboard = m.at("aboard", 96);
  const T = turnPose(PHI_HIT + 0.004);
  const H = turnPose(PHI_HIT).bow;
  const keys = direct({}, [
    { at: 0, move: "push", look: [H[0] - 0.5, 0.5, H[2]], dir: [-0.35, 0.3, -0.89], from: 12.5, to: 11, dur: Math.max(10, riverboat) },
    { at: riverboat, move: "push", look: [H[0] - 0.8, 0.6, H[2] + 0.3], dir: [-0.12, 0.2, -0.97], to: 7.4, dur: Math.max(10, aboard - riverboat) },
    { at: aboard, move: "push", look: [H[0] - 1.2, 0.65, H[2] + 0.2], dir: [-0.1, 0.16, -0.98], to: 5.6, dur: Math.max(10, m.end - aboard) },
  ]);
  const ck = m.lerp([0, rudder], [0.25, 0]);
  const pk = m.lerp([people, people + 16], [0, 1]);
  return (
    <Shot3D f={f}
      overlay={
        <>
          {f < hit + 10 ? <Clock value={`${fig.minutes ?? ""} MIN`} caption={f >= rudder ? "IMPACT" : "FROM THE JAM"} top={430} k={1 - m.lerp([hit, hit + 10], [0, 1])} color={f >= rudder ? "#ff3b30" : CREAM} /> : null}
          {f >= people - 2 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", pointerEvents: "none", opacity: Math.min(1, pk * 2) }}>
              <div style={{ display: "inline-block", background: "rgba(8,10,14,0.78)", border: `4px solid ${AMBER}`, borderRadius: 14, padding: "10px 40px" }}>
                <div style={{ fontFamily: ANTON, fontSize: 170, lineHeight: 1.05, color: CREAM }}>{countText(fig.aboard ?? "", pk)}</div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 48, letterSpacing: 4, color: AMBER }}>PEOPLE ABOARD</div>
              </div>
            </div>
          ) : null}
          <svg data-probe="skip" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <circle cx={540} cy={560} r={220} fill="none" stroke="rgba(255,59,48,0.5)" strokeWidth={14} strokeDasharray={`${2 * Math.PI * 220 * ck} 2000`} transform="rotate(-90 540 560)" opacity={f < hit ? 1 : 0} />
          </svg>
        </>
      }>
      <Camera3D keys={keys} seed="ms-hit" drift={0.01} />
      <Focus at={[H[0], 0.5, H[2]]} range={6} />
      <River f={f} boat={<group position={[0, 0, 0.12]}><Riverboat dent={1} roll={-0.03} lights={m.lerp([riverboat - 4, riverboat + 10], [0.6, 1.2])} /></group>} />
      <TankerAt f={f} pos={T.pos} yaw={T.yaw} rudder={0.6} stress={0.7} bowStress={0.8} />
      <pointLight position={[H[0] - 0.4, 0.8, H[2] - 0.8]} intensity={1.0} distance={3} color="#ffb060" />
    </Shot3D>
  );
};
export default Hit;
