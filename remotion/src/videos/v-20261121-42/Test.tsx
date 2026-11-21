// Test: "The test to prove they would hold was done with the air brakes still on. So what was really holding it?"
// A quick flat insert: the train drawn in side elevation on the investigators' grid ("test"), the hand
// brake marks on the first cars; the HOLD TEST bar fills ("prove"); the locomotive's air brake line lights
// up along its wheels ("air"); HELD stamps on ("still"); then the stamp turns to AIR BRAKES, NOT HAND
// BRAKES with a question mark ("holding").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { MonoLabel } from "../../disaster/index";
import { AMBER, ANTON, CREAM, Flat, RED } from "./World";

const INK = "#cfd8e6", DIM = "#3a4658";

const Test: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const test = m.at("test", 2), prove = m.at("done", 14), air = m.at("air", 40), still = m.at("on", 56), holding = m.at("holding", 90);
  const draw = m.lerp([0, 10], [0.35, 1]);
  const fill = m.lerp([prove, still], [0, 1]);
  const airK = m.lerp([air, air + 10], [0, 1]) * (0.8 + 0.2 * Math.sin(t * 0.5));
  const stamp = m.pop(still, 9, 200);
  const turn = m.pop(holding, 10, 180);
  const y0 = 820;
  const veh = [{ x: 90, w: 230, loco: true }, ...Array.from({ length: 5 }, (_, i) => ({ x: 330 + i * 160, w: 150, loco: false }))];
  return (
    <Flat t={t} tag="general principle">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={m.lerp([0, air], [1.0, 1.06]) + m.lerp([air, air + 10], [0, 0.08]) - m.lerp([holding, holding + 12], [0, 0.08])} cx={540} cy={860}>
          <MonoLabel t={t} at={-40} x={90} y={470} text="THE BRAKE TEST" size={64} color={CREAM} />
          {/* the train in side elevation */}
          {veh.map((v, i) => {
            const k = Math.max(0, Math.min(1, draw * 6 - i));
            return (
              <g key={i} opacity={k}>
                {v.loco ? (
                  <g>
                    <rect x={v.x} y={y0 - 120} width={v.w} height={110} fill={DIM} stroke={INK} strokeWidth={5} rx={6} />
                    <rect x={v.x + v.w - 80} y={y0 - 175} width={80} height={165} fill={DIM} stroke={INK} strokeWidth={5} rx={6} />
                  </g>
                ) : (
                  <rect x={v.x} y={y0 - 120} width={v.w} height={100} fill={DIM} stroke={INK} strokeWidth={5} rx={50} />
                )}
                {[0.22, 0.78].map((u) => <circle key={u} cx={v.x + v.w * u} cy={y0 + 8} r={18} fill="#1b2230" stroke={INK} strokeWidth={4} />)}
                {/* hand brake mark on the first two cars */}
                {(i === 1 || i === 2) ? <circle cx={v.x + v.w - 20} cy={y0 - 150} r={18} fill="none" stroke={AMBER} strokeWidth={7} /> : null}
              </g>
            );
          })}
          <line x1={60} y1={y0 + 40} x2={1030} y2={y0 + 40} stroke={INK} strokeWidth={6} />
          <MonoLabel t={t} at={test + 10} x={360} y={y0 - 200} text="HAND BRAKES" size={48} color={AMBER} />
          {/* the air brake line along the locomotive */}
          {airK > 0 ? (
            <g>
              <rect x={86} y={y0 - 6} width={238} height={30} rx={10} fill={AMBER} opacity={0.35 + 0.6 * airK} />
              <MonoLabel t={t} at={air} x={90} y={y0 + 120} text="AIR BRAKES ON" size={52} color={AMBER} />
            </g>
          ) : null}
          {/* the hold test bar */}
          <MonoLabel t={t} at={prove} x={90} y={1020} text="HOLD TEST" size={52} color={CREAM} />
          <rect x={90} y={1050} width={900} height={80} rx={10} fill="rgba(8,10,14,0.8)" stroke={INK} strokeWidth={4} />
          <rect x={98} y={1058} width={884 * fill} height={64} rx={6} fill={turn > 0 ? RED : "#6fd08c"} opacity={0.85} />
          {stamp > 0 ? (
            <g transform={`translate(780 960) rotate(-8) scale(${1.6 - 0.6 * stamp})`} opacity={Math.min(1, stamp * 1.4) * (1 - turn)}>
              <rect x={-150} y={-62} width={300} height={110} fill="none" stroke="#6fd08c" strokeWidth={10} rx={10} />
              <text x={0} y={30} textAnchor="middle" fontFamily={ANTON} fontSize={96} fill="#6fd08c">HELD</text>
            </g>
          ) : null}
          {turn > 0 ? (
            <g opacity={Math.min(1, turn * 1.4)}>
              <MonoLabel t={t} at={holding} x={540} y={1240} text="AIR BRAKES," size={60} color={RED} anchor="middle" />
              <MonoLabel t={t} at={holding + 6} x={540} y={1310} text="NOT HAND BRAKES" size={60} color={RED} anchor="middle" />
              <g transform={`translate(930 1290) scale(${1.5 - 0.5 * turn})`}>
                <circle cx={0} cy={-60} r={80} fill={RED} />
                <text x={0} y={0} textAnchor="middle" fontFamily={ANTON} fontSize={150} fill={CREAM}>?</text>
              </g>
            </g>
          ) : null}
        </View>
      </svg>
    </Flat>
  );
};
export default Test;
