// Hook: "Almost no game could use NVIDIA's first graphics card."
// Frame 0: the real NV1 card (public-domain photo) already swinging into a spotlight in a dark studio, a
// dark game shelf beside it (wide). "game": the shelf's boxes stay dark; "could": one flickers; "use": the
// spotlight flares and the shelf slides away (medium); "NVIDIA's": the old wordmark writes on; "first": a
// label; "graphics": a scan line sweeps the board; "card": push in on its chip (close).
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Place3D, Stage3D, TECH } from "../../three/index";
import { GameShelf, OldLogo, Pool, RealCard, k01 } from "./Parts";

export const StudioCard: React.FC<{ f: number; spot: number; shelf: number; flick: number; dim: number }> = ({ spot, shelf, flick, dim }) => (
  <group>
    <Place3D kind="studio" seed="v2521-studio" />
    <Pool position={[0, 0.01, 0]} r={2.0} k={0.25 + 0.5 * spot - 0.2 * dim} />
    <spotLight position={[0, 7, 3]} angle={0.5} penumbra={0.6} intensity={30 + 40 * spot - 20 * dim} color="#fff2d8" />
    <GameShelf position={[6 - 2.2 * shelf, 0, -1.2]} rotation-y={-0.35} lit={(i) => (i === 11 ? flick : 0)} dim={1} />
  </group>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const game = m.at("game", 6);
  const could = m.at("could", 12);
  const use = m.at("use", 18);
  const nv = m.at("nvidia's", 26);
  const first = m.at("first", 34);
  const graphics = m.at("graphics", 40);
  const card = m.at("card", 50);
  const end = Math.max(m.end, card + 20);
  const shelf = 1 - k01(f, use, 16);
  const keys = direct({}, [
    { at: 0, move: "push", look: [1.4, 1.2, 0], dir: [0.15, 0.25, 1], from: 10.5, to: 9.8, dur: Math.max(8, use), fov: 35 },
    { at: use, move: "push", look: [0, 1.6, 0], dir: [0.1, 0.25, 1], from: 10, to: 9, dur: Math.max(8, card - use) },
    { at: card, move: "push", look: [0, 1.6, 0], dir: [0.1, 0.25, 1], to: 7.6, dur: Math.max(10, end - card) },
  ]);
  // the card overlay: smaller and left beside the shelf, then big and centred, then closer on "card"
  const zoomIn = k01(f, card, 14);
  const w = 960 + 100 * zoomIn - 40 * shelf;
  const x = 540 - 60 * shelf;
  const y = 470 - 30 * zoomIn;
  const swing = 1 - k01(f, -6, 26);
  const turn = -22 * swing + m.wave(90, 6);
  const flare = m.pulse(use + 4, 10);
  const dim = 0;
  const scan = k01(f, graphics, 14);
  const knew = could;
  const was = first;
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#141a2e", bottom: "#04050a", glow: "rgba(255,230,190,0.10)" }} floor="reflect" bloom={1} dof={0} blur={1}
        overlay={
          <AbsoluteFill>
            <OldLogo x={540} y={190} w={640 + 60 * m.pulse(nv + 4, 10)} k={1} />
            <RealCard x={x} y={y} w={w} turn={turn} tilt={8} k={0.75 + 0.25 * k01(f, -10, 14)} glowK={0.6 * flare + 0.3 * m.pulse(knew + 3, 8) - 0.2 * dim} />
            {scan > 0 && scan < 1 && (
              <div style={{ position: "absolute", left: x - w / 2 + w * scan, top: y, width: 10, height: w * 0.66, background: TECH.cyan, boxShadow: `0 0 30px ${TECH.cyan}`, opacity: 0.85 }} />
            )}
            {f >= was && (
              <div style={{ position: "absolute", left: x - 260, top: y + w * 0.68 + 10, width: 520, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 52,
                color: TECH.cyan, opacity: k01(f, was, 8) * (1 - 0.6 * shelf), textShadow: "0 4px 18px rgba(0,0,0,0.8)" }}>first NVIDIA card</div>
            )}
            {dim > 0 && <AbsoluteFill style={{ background: `rgba(3,4,10,${(0.35 * dim).toFixed(2)})` }} />}
          </AbsoluteFill>
        }>
        <Camera3D keys={keys} seed="v2521-hook" />
        <StudioCard f={f} spot={flare} shelf={shelf} flick={m.pulse(knew + 4, 6) + 0.3 * m.pulse(game + 3, 5)} dim={dim} />
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
