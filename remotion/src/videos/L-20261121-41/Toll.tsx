// Toll (3D, quiet): the atrium from high above after the collapse. The fallen walkways lie stacked on the lobby
// floor in settling dust, the roof rods still hanging; the camera cranes slowly up and away from "floor"; the
// lights dim and the toll types on, centred and quiet, on "died"; the investigators' line types under it.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, DisasterStage, Focus, Smoke } from "../../three/index";
import { Atrium, Walkways } from "./world";
import { MONO, Overlay } from "./ui";

type Params = { fig?: { deaths?: string } };

const typed = (s: string, t: number, at: number, cps = 1.2) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));

const Toll: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const ev = { both: m.at("people", 2), floor: m.at("people", 2), died: m.at("died", 70), investigators: m.at("died", 40) + 14, seen: m.at("seen", 170) };
  const end = Math.max(m.end, ev.seen + 20);
  const keys = direct(ev, [
    { at: 0, move: "hold", pos: [-2, 11, 9.5], look: [0, 0.3, -0.5], fov: 46 },
    { at: "floor", move: "crane", look: [0, 0.3, -0.8], base: [-2.6, 0, 11.5], from: 11, to: 14.5, dur: Math.max(20, end - ev.floor) },
  ]);
  const dim = 0.6 * cue(t, ev.died, 24);
  const k1 = cue(t, ev.died, 10), k2 = cue(t, ev.investigators, 10);
  return (
    <DisasterStage look="nightGrid" dof={1} shadowBox={11} fog={{ color: "#08111c", near: 14, far: 40 }}
      overlay={
        <Overlay>
          <AbsoluteFill style={{ background: `rgba(5,18,48,${dim})` }} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 22 }}>
            {k2 > 0 && (
              <div style={{ opacity: k2 * 0.9, fontFamily: MONO, fontSize: 48, letterSpacing: 4, color: "#ffd84a", maxWidth: 1400, textAlign: "center" }}>
                {typed("THE MOST DEVASTATING STRUCTURAL COLLAPSE EVER IN THE UNITED STATES", t, ev.investigators, 1.6)}
              </div>
            )}
          </AbsoluteFill>
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.01} />
      <Focus at={[0, 0.4, 0]} range={8} />
      <Atrium dance={0.15} frame={t} dim={0.4 + dim * 0.5} />
      <Walkways frame={200} fall={1} />
      <Smoke frame={t + 60} at={[-2.5, 0, 0]} height={2.6} width={3.6} count={14} color="#c9d8ff" opacity={0.22} wind={[0.3, 0, 0.2]} seed="settle-a" />
      <Smoke frame={t + 90} at={[2.5, 0, 0.2]} height={2.4} width={3.6} count={14} color="#c9d8ff" opacity={0.22} wind={[-0.3, 0, 0.2]} seed="settle-b" />
    </DisasterStage>
  );
};

export default Toll;
