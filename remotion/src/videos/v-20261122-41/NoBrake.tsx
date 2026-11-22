// NoBrake: "A ship has no brakes. Only engines in reverse and anchors, and a ship this size slides a long way."
// Beside the tanker on the river at night, in profile (a general principle, not this ship's log): the hull
// sliding on ("ship"); NO BRAKES stamps over it ("brakes"); its propeller lights amber under the stern
// ("engines"); a short REVERSE arrow points aft from the stern ("reverse"); ANCHORS marks the bow ("anchors");
// pull back as a long slide arrow runs ahead of the bow, A LONG WAY TO STOP ("slides").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { Arrow, MonoLabel } from "../../disaster/index";
import { AMBER, ANTON, CREAM, RED, River, Shot3D, TankerAt } from "./World";

const NoBrake: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const brakes = m.at("brakes", 14), engines = m.at("engines", 30), reverse = m.at("reverse", 44), anchors = m.at("anchors", 60), slides = m.at("slides", 84);
  // the tanker slides along +x (toward screen left from the port side), slowing only a little
  const x = -2 + 0.03 * f - 0.00004 * f * f;
  const keys = direct({}, [
    { at: 0, move: "push", look: [x - 0.5, 0.4, 0], dir: [-0.12, 0.18, -0.98], from: 11, to: 10, dur: Math.max(10, reverse) },
    { at: reverse, move: "push", look: [x - 1.6, 0.1, 0], dir: [-0.2, 0.12, -0.97], to: 8.4, dur: Math.max(10, slides - reverse) },
    { at: slides, move: "pullback", look: [x + 1, 0.3, 0], dir: [-0.1, 0.25, -0.96], to: 13, dur: Math.max(10, m.end - slides) },
  ]);
  const stamp = m.pop(brakes, 8, 200);
  const sk = m.lerp([slides, slides + 18], [0, 1]);
  return (
    <Shot3D f={f}
      overlay={
        <>
          {f >= brakes ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", pointerEvents: "none" }}>
              <span style={{ display: "inline-block", fontFamily: ANTON, fontSize: 120, color: RED, border: `8px solid ${RED}`, padding: "4px 30px", transform: `rotate(-6deg) scale(${1.5 - 0.5 * stamp})`, opacity: Math.min(1, stamp * 1.4), background: "rgba(8,10,14,0.6)" }}>NO BRAKES</span>
            </div>
          ) : null}
          <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {f >= engines && f < slides ? <MonoLabel t={f} at={engines} x={640} y={1000} text="ENGINES" size={50} color={CREAM} /> : null}
            {f >= reverse && f < slides ? (
              <>
                <Arrow x1={760} y1={1060} x2={960} y2={1060} k={m.lerp([reverse, reverse + 10], [0, 1])} color={AMBER} w={16} />
                <MonoLabel t={f} at={reverse} x={700} y={1150} text="REVERSE" size={50} color={AMBER} />
              </>
            ) : null}
            {f >= anchors && f < slides ? (
              <g>
                {[0, 1].map((i) => (
                  <g key={i} transform={`translate(${190 + i * 90} ${990})`} stroke={CREAM} strokeWidth={8} fill="none" strokeLinecap="round">
                    <line x1={0} y1={-40} x2={0} y2={40} /><path d="M-34,18 Q0,62 34,18" /><line x1={-18} y1={-26} x2={18} y2={-26} /><circle cx={0} cy={-50} r={10} />
                  </g>
                ))}
                <MonoLabel t={f} at={anchors} x={130} y={1130} text="ANCHORS" size={50} color={CREAM} />
              </g>
            ) : null}
            {f >= slides ? (
              <>
                <Arrow x1={560} y1={1080} x2={560 - 470 * sk} y2={1080} k={sk > 0.02 ? 1 : 0} color={AMBER} w={18} />
                <MonoLabel t={f} at={slides + 4} x={540} y={1190} text="A LONG WAY TO STOP" size={50} color={AMBER} anchor="middle" />
              </>
            ) : null}
          </svg>
        </>
      }>
      <Camera3D keys={keys} seed="ms-nobrake" drift={0.01} />
      <Focus at={[x, 0.3, 0]} range={8} />
      <River f={f} wharf={false} />
      <TankerAt f={f} pos={[x, 0, 0]} yaw={0} rudder={0.6} stress={0.7} prop={f >= engines ? 1 : 0} spin={f >= reverse ? -f * 0.3 : f * 0.3} />
      {f >= engines ? <pointLight position={[x - 3.9, 0.2, -0.6]} intensity={1.4} distance={1.4} color="#ff9a3c" /> : null}
    </Shot3D>
  );
};
export default NoBrake;
