// Gertie: "It was four months old, and the men who built it called it Galloping Gertie. So what made it gallop?"
// Summer light on the deck: a car drives on, a calendar card on the toll sign flips JULY to NOVEMBER ("four");
// workers in hard hats stand on the tower's crossbeam ("men"); the road ahead rises and falls in a slow wave
// under the car ("built"); GALLOPING GERTIE types on the tower portal ("Galloping"); the camera drops below the
// deck edge to its solid steel side ("gallop").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Crowd3D } from "../../three/index";
import { AMBER, Cam, CREAM, DECK_Y, Gertie as Bridge, Narrows, Shot3D, sm, SPAN, Tag, TOWER_H, k01, MONO } from "./World";

const Calendar: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const flip = k01((t - at) / 14);
  const month = flip < 0.5 ? "JULY" : "NOVEMBER";
  return (
    <div style={{ position: "absolute", left: 640, top: 470, width: 330, textAlign: "center", pointerEvents: "none",
      transform: `perspective(600px) rotateX(${flip < 0.5 ? flip * 180 : (flip - 1) * 180}deg)`, transformOrigin: "50% 0%" }}>
      <div style={{ background: CREAM, borderTop: `26px solid #8b2f2a`, borderRadius: 10, padding: "10px 0 14px" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 52, color: "#222" }}>{month}</div>
      </div>
    </div>
  );
};

const Gertie: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const four = m.at("four", 0), men = m.at("builders", 40), built = m.at("called", 55), galloping = m.at("galloping", 80), gallop = m.at("gertie", 100);
  const phase = (f * 2 * Math.PI) / 90;
  const bounce = 0.1 + 0.2 * sm((f - built) / 20);
  const carS = -0.75 + 0.0035 * f;
  const carX = carS * (SPAN / 2);
  const under = sm((f - gallop) / 16);
  const onTower = f >= men && f < built;
  const pos: [number, number, number] = onTower
    ? [-SPAN / 2 + 3.2, TOWER_H + 0.4, 2.6]
    : [carX - 1.6, DECK_Y + 0.5 - 0.75 * under, 0.25 + 0.9 * under];
  const look: [number, number, number] = onTower ? [-SPAN / 2, TOWER_H - 0.1, 0] : [carX + 3.5 - 2 * under, DECK_Y - 0.1 * under, 0.2 * under];
  return (
    <Shot3D f={f} fog={{ color: "#6c7470", near: 14, far: 80 }}
      overlay={
        <>
          {f < men ? <Calendar t={f} at={four + 6} /> : null}
          {onTower ? <Tag t={f} at={men} top={420} text="THE MEN WHO BUILT IT" color={CREAM} size={48} /> : null}
          <Tag t={f} at={galloping} top={360} text="GALLOPING GERTIE" color={AMBER} size={60} />
          {f >= gallop ? <Tag t={f} at={gallop + 6} top={1150} text="SOLID STEEL SIDES" color={AMBER} size={48} /> : null}
        </>
      }>
      <Cam pos={pos} look={look} fov={onTower ? 38 : 46} seed="tac-gertie" range={onTower ? 4 : 8} />
      <Narrows f={f} />
      <Bridge bounce={bounce} waves={3} phase={phase} cars={[carS, carS + 0.3]} />
      <Crowd3D count={5} area={[0.15, 1.0]} height={0.16} seed="tac-crew" position={[-SPAN / 2, TOWER_H + 0.08, 0]} />
    </Shot3D>
  );
};
export default Gertie;
