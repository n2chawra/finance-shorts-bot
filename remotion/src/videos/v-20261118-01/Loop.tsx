// Loop: "Suez or Panama: which shortcut would hurt more? Picture it one more time:" The whole old world: a pin
// glows on Suez on "Suez" and on Panama on "Panama", a question mark bounces between them on "hurt"; on
// "Picture" the camera dives back to Egypt and lands on the hook's first frame (the canal half drawn, the
// ship at its mouth), so the Short plays on into its own start.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, Txt, View, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { EgyptMap } from "./Hook";
import { PANAMA, Place, SUEZ_MID, World } from "./props";

const Hop: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const a = at(SUEZ_MID), b = at(PANAMA);
  if (!a || !b || k <= 0) return null;
  const u = (Math.sin(t / 9) + 1) / 2;
  return <Txt x={b[0] + (a[0] - b[0]) * u} y={(a[1] + b[1]) / 2 - 80 - Math.abs(Math.sin(t / 4.5)) * 110} size={150 * k} fill="#f2b134" stroke="#1d1a2b">?</Txt>;
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const suez = m.at("suez", 4), panama = m.at("panama", 20), hurt = m.at("hurt", 40), pic = m.at("picture", 60);
  if (m.t < pic) {
    return (
      <Stage p={p} bg="#5f9fae" vignette={0.4}>
        <View zoom={1 + m.wave(80, 0.01)}>
          <World center={[-20, 22]} scale={300}>
            <MapPin at={SUEZ_MID} k={m.pop(suez, 12)} r={30} />
            <Place at={SUEZ_MID} name="SUEZ" k={m.lerp([suez, suez + 10], [0, 1])} size={48} />
            <MapPin at={PANAMA} k={m.pop(panama, 12)} r={30} color="#3b7dd8" />
            <Place at={PANAMA} name="PANAMA" k={m.lerp([panama, panama + 10], [0, 1])} size={48} />
            <Hop k={m.pop(hurt, 10)} t={m.t} />
          </World>
          {m.t >= m.at("comments", 50) ? (() => {
            const k = m.pop(m.at("comments", 50), 11);
            return <g transform={`translate(540 520) scale(${k})`}>
              <path d="M -230 -80 L 230 -80 Q 260 -80 260 -50 L 260 40 Q 260 70 230 70 L -40 70 L -90 120 L -80 70 L -230 70 Q -260 70 -260 40 L -260 -50 Q -260 -80 -230 -80 Z" fill="#ffffff" stroke="#1d1a2b" strokeWidth={6} />
              <Txt x={0} y={-5} size={52} fill="#1d1a2b">SUEZ OR PANAMA?</Txt>
            </g>;
          })() : null}
        </View>
      </Stage>
    );
  }
  const k = m.lerp([pic, pic + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <EgyptMap t={m.t} canal={1 - 0.65 * k} ship={0.12} egypt={1 - k} label={1 - k} scale={8500} center={[32.6, 29.9]} barrier={0} cal={0} />
      </View>
      <Flash k={m.pulse(pic, 6)} />
    </Stage>
  );
};

export default Loop;
