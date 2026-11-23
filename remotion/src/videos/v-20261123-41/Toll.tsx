// Toll: "It hit a hillside {fact5} minutes after the climb began. All {fact2} people aboard died."
// The fog-covered slope with smoke rising from it ("hit"); pull along the slope to a trail marker with a clock face
// ("hillside"); the clock runs to its figure ("climb"); the climb path draws over the hills ("began"); rescuers walk
// in with head lamps through the fog ("people"); a memorial plaque on the trail shows its figure ("aboard"); the
// light dims and the plaque stays ("died"). No victims, no wreck close-ups.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { hillHeight, Rescuers, Smoke } from "../../three/index";
import { AMBER, Cam, Country, CREAM, HILLS, k01, MONO, Readout, Shot3D, sm, ANTON } from "./World";
import { SITE } from "./Impact";

type Params = { fig?: { minutes?: string; aboard?: string } };

const Toll: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const hillside = m.at("hillside", 20), climb = m.at("climb", 45), began = m.at("began", 60), people = m.at("people", 80), aboard = m.at("aboard", 100), died = m.at("died", 115);
  const along = sm((f - hillside) / 40), close = sm((f - aboard) / 25);
  const pos: [number, number, number] = [SITE[0] - 5.5 + 2 * along + 1.5 * close, SITE[1] + 1.6 - 0.3 * along - 0.3 * close, SITE[2] + 6.5 - 1.5 * along - 1.5 * close];
  const look: [number, number, number] = [SITE[0] - 0.5 * along, SITE[1] + 1.4, SITE[2]];
  const dim = 1 - 0.35 * sm((f - died) / 20);
  const path = Array.from({ length: 24 }, (_, i) => {
    const x = SITE[0] - 16 + i * 0.7, z = SITE[2] - 2 + Math.sin(i * 0.3) * 0.8;
    return [x, hillHeight(x, z, HILLS) + 1.2 + 2.2 * Math.sin((i / 23) * Math.PI * 0.8), z] as [number, number, number];
  });
  const drawn = Math.floor(24 * k01((f - began) / 20));
  return (
    <Shot3D f={f} fog={{ color: "#5d666f", near: 3, far: 26 }}
      overlay={
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `rgba(10,12,16,${(1 - dim) * 0.8})` }}>
          <Readout left={140} top={360} w={800} value={countText(fig.minutes ?? "", k01((f - climb) / 18))} caption="MINUTES · CLIMB TO HILLSIDE" k={k01((f - hillside) / 10)} color={AMBER} />
          {f >= aboard ? (
            <div style={{ position: "absolute", left: 190, top: 820, width: 700, textAlign: "center", opacity: k01((f - aboard) / 10),
              background: "linear-gradient(180deg,#6b5333,#4a3820)", border: "6px solid #c9a36a", borderRadius: 14, padding: "18px 10px", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 4, color: "#f1dcb0" }}>IN MEMORY</div>
              <div style={{ fontFamily: ANTON, fontSize: 120, lineHeight: 1.05, color: CREAM }}>{fig.aboard ?? ""}</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 4, color: "#f1dcb0" }}>ABOARD · CALABASAS</div>
            </div>
          ) : null}
        </div>
      }>
      <Cam pos={pos} look={look} fov={44} seed="cal-toll" range={12} />
      <ambientLight intensity={-0.2 * (1 - dim)} />
      <Country />
      <Smoke frame={f + 70} at={SITE} height={7} width={4} count={60} life={110} wind={[0.35, 0, 0]} color="#3e3b37" opacity={0.85} seed="cal-smoke2" />
      {path.slice(0, drawn).map((q, i) => (
        <mesh key={i} position={q}><sphereGeometry args={[0.09, 8, 6]} /><meshBasicMaterial color={AMBER} /></mesh>
      ))}
      {f >= people ? <Rescuers position={[SITE[0] - 2.2, hillHeight(SITE[0] - 2.2, SITE[2] + 1, HILLS), SITE[2] + 1]} height={0.45} enterAt={people} enterFrom={-2} spots={[[-0.8, 0, 0.3], [0, 0, -0.2], [0.8, 0, 0.4], [1.4, 0, -0.1]]} /> : null}
    </Shot3D>
  );
};
export default Toll;
