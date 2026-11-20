// Loop: "Driver or app: who earns more? Check your fare."
// Back on the night street by the Uber car: the driver leans out grinning on "Driver", Rohan holds up the
// phone with the Uber app on "app", a question mark pops between them on "earns", Rohan looks up at the fare
// receipt floating over the car on "Check", and it glows on "fare", whole again, ready to tear: the hook's
// first frame.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { Receipt, Street, UberCar } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const drv = m.at("driver", 2), app = m.at("app", 14), earns = m.at("earns", 24), check = m.at("check", 40), fare = m.at("fare", 52);
  const q = m.pop(earns, 9);
  const up = m.lerp([check - 6, check + 12], [0, 1]);
  const lean = m.pop(drv, 12);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#141a3a" vignette={0.45}>
        <View zoom={1.12 - 0.12 * up} cx={540 + m.wave(90, 8)} cy={1000 - 100 * up}>
          <Street m={m} />
          <UberCar x={470} y={1250} s={0.95} m={m} driver={
            <Char x={120 + 40 * lean} y={-130} s={80} sit skin="#a8683a" top="#2c6bd6" hair="side" outfit="tee" face="grin" look={[0.6, 0]} armR={[90 * lean, 160 * lean]} armL={[20, 20]} />
          } />
          {/* Rohan on the kerb with the app */}
          <Char x={860} y={1270 + m.wave(50, 3)} s={190} who="rohan" hair="spiky" outfit="tee" face={m.t >= check ? "worried" : "happy"} look={m.t >= check ? [-0.4, -1] : [-0.8, 0]}
            armR={[m.lerp([app - 4, app + 6], [20, 150]), 150]} armL={[15, 10]} />
          {m.t >= app ? (
            <g transform={`translate(900 ${640 - 20 * m.pop(app)})`}>
              <rect x={-70} y={-120} width={140} height={240} rx={22} fill="#111318" stroke={INK} strokeWidth={5} />
              <rect x={-58} y={-106} width={116} height={212} rx={14} fill="#ffffff" />
              <Photo name="uber" s={30} t={0} />
            </g>
          ) : null}
          {q > 0 ? <g transform={`translate(560 ${820 - 30 * q}) scale(${0.4 + 0.6 * q})`}><circle r={80} fill="#ffc43d" stroke={INK} strokeWidth={5} /><Txt x={0} y={4} size={110} fill={INK}>?</Txt></g> : null}
          <Glow x={540} y={640} r={460} color="#9fd0ff" o={0.15 + 0.35 * m.pulse(fare, 12)} />
          <Receipt x={540} y={630} w={560} h={600} m={m} tear={0} label="YOUR FARE" rot={-3} />
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Loop;
