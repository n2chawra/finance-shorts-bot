// Turn: "In the cloud, the helicopter was banking left and going down. He told the controller it was climbing."
// Behind the Sikorsky in grey cloud, a level horizon line ("cloud"); the helicopter rolls left and the real horizon
// tilts against a dashed FELT line that stays level ("banking"); BANK LEFT ("left"); a red DESCENDING arrow and
// the helicopter sinking ("down"); the radio transcript types on as reported text ("told"); the ATC label lights
// ("controller"); CLIMBING in the transcript is struck through in red, pull wide on the falling helicopter ("climbing").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Arrow } from "../../disaster/index";
import { AMBER, Cam, Country, CREAM, HeliAt, InCloud, k01, MONO, RED, Shot3D, sm, Tag, Veil } from "./World";
import { HELI_Y } from "./Hook";

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const banking = m.at("banking", 20), left = m.at("left", 32), down = m.at("down", 50), told = m.at("told", 70), atc = m.at("controller", 85), climbing = m.at("climbing", 105);
  const roll = sm((f - banking) / 30);
  const sink = sm((f - down) / 60);
  const bank = -0.55 * roll;
  const x = 0.03 * f, y = HELI_Y - 1.4 * sink - 0.004 * Math.max(0, f - down);
  const wide = sm((f - climbing) / 24);
  const pos: [number, number, number] = [x - 5.2 - 2 * wide, y + 1.4 + 0.8 * wide, 2.4 + 3 * wide];
  const look: [number, number, number] = [x + 0.6, y - 0.1, 0];
  const realTilt = 32 * roll; // the real horizon, as the camera behind sees the bank
  const strike = k01((f - climbing) / 10);
  return (
    <Shot3D f={f} fog={{ color: "#7d8690", near: 1.2, far: 15 }}
      overlay={
        <>
          <Veil f={f} k={0.9} />
          <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <line x1={90} y1={560} x2={990} y2={560} stroke={CREAM} strokeWidth={6} strokeDasharray="22 16" opacity={0.9} />
            {f >= banking ? (
              <g transform={`rotate(${realTilt} 540 560)`}>
                <line x1={40} y1={560} x2={1040} y2={560} stroke={AMBER} strokeWidth={9} />
              </g>
            ) : null}
            <Arrow x1={900} y1={820} x2={900} y2={1060} k={k01((f - down) / 12)} color={RED} w={18} />
          </svg>
          <div style={{ position: "absolute", right: 90, top: 460, fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 3, color: CREAM, background: "rgba(10,13,16,0.82)", padding: "6px 18px" }}>WHAT HE FELT</div>
          {f >= banking ? <div style={{ position: "absolute", left: 60, top: 620, fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 3, color: AMBER, background: "rgba(10,13,16,0.86)", padding: "6px 18px", opacity: k01((f - banking) / 8) }}>WHAT IT DID</div> : null}
          {f >= left ? <Tag t={f} at={left} top={880} left={60} text="BANK LEFT" color={AMBER} size={50} /> : null}
          {f >= down ? <Tag t={f} at={down} top={1080} left={620} text="DOWN" color={RED} size={52} /> : null}
          {f >= told ? (
            <div style={{ position: "absolute", left: 80, top: 1160, width: 860, background: "rgba(10,13,16,0.86)", border: `3px solid ${f >= atc ? AMBER : "#6b737c"}`, padding: "14px 22px", fontFamily: MONO, fontWeight: 700, pointerEvents: "none" }}>
              <div style={{ fontSize: 44, color: f >= atc ? AMBER : "#aab3bc", letterSpacing: 3 }}>PILOT → ATC · AS REPORTED</div>
              <div style={{ fontSize: 56, color: CREAM, letterSpacing: 2, position: "relative", display: "inline-block" }}>
                {"“CLIMBING”".slice(0, Math.max(1, Math.floor((f - told) * 1.2)))}
                <div style={{ position: "absolute", left: 0, top: "52%", height: 8, width: `${strike * 100}%`, background: RED }} />
              </div>
            </div>
          ) : null}
        </>
      }>
      <Cam pos={pos} look={look} fov={42} seed="cal-turn" range={5} />
      <Country />
      <InCloud f={f} y={y} />
      <HeliAt f={f} pos={[x, y, 0]} bank={bank} pitch={-0.12 * sink} yaw={0.25 * roll} />
    </Shot3D>
  );
};
export default Turn;
