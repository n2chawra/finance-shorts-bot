// "This one packs {fact2}, on a piece of silicon smaller than a bank card."
// The dark studio stage (void backdrop, reflective floor). The bare chip hovers, turning slowly (medium);
// on "packs" the camera pushes close as the switch field fills the chip edge to edge and the big amber
// count lands above it; on "silicon" it pulls back to the whole chip; on "smaller" a bank card slides in
// beside it at true relative size; on "card" both settle onto the reflective floor (wide), the figure
// glowing above the chip.
//
// Clock: m.t / the events are story frames (p.frame); the 3D kit's own parts read Remotion's frame,
// the video's global frame, so their starts go through `G` (kitClock, from Hook.tsx).
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../../design/fonts";
import { kitClock } from "./Hook";
import type { SceneProps } from "../../scenes/kit";
import { countText, SourceLine, motion } from "../../flat/kit";
import { Camera3D, cue, Die, direct, Focus, InstancedField, Label3D, mat, Stage3D, TECH, type V3 } from "../../three/index";

type Params = { fig?: { packs?: string } };

// model sizes: the chip's die is the unit; a bank card is about 3.4 die-widths long and 2.2 wide
// (an AD102-class die beside an ID-1 card: proportions, never shown as figures)
const CHIP = 1, THICK = 0.06;
const CARD_L = 3.4, CARD_W = 2.16;
const CELLS = 34, PITCH = (CHIP * 0.96) / CELLS;
const HOVER = 0.32;

/** The count, drawn over the 3D (never under the camera's motion blur or the depth of field): big amber
 * figure and its caption, top centre below the logo and the source line, clear of the right buttons.
 * `start` / `count` / `pulse` are the kit's (video) frames, like FigLabel3D's. */
const Count: React.FC<{ fig: string; caption: string; start: number; count: number; pulse: number }> = ({ fig, caption, start, count, pulse }) => {
  const f = useCurrentFrame();
  if (!fig || f < start) return null;
  const pop = cue(f, start, 8, Easing.out(Easing.back(1.6)));
  const k = cue(f, start, count, Easing.out(Easing.cubic));
  const beat = 1 + 0.1 * interpolate(f, [pulse, pulse + 4, pulse + 12], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 60, right: 150, top: 290, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ opacity: Math.min(1, pop * 1.4), transform: `scale(${(0.85 + 0.15 * pop) * beat})`, transformOrigin: "50% 0%", padding: "14px 40px 18px",
        borderRadius: 28, background: "rgba(8,11,22,0.78)", fontFamily: FONT, textAlign: "center", boxShadow: "0 0 60px rgba(255,180,60,0.25)" }}>
        <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1.05, color: TECH.amber, fontVariantNumeric: "tabular-nums", textShadow: "0 0 30px rgba(255,170,40,0.45)" }}>{countText(fig, k)}</div>
        <div style={{ fontSize: 54, fontWeight: 600, color: TECH.white, marginTop: 2 }}>{caption}</div>
      </div>
    </div>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const G = kitClock(p, useCurrentFrame());                  // story frame → the kit's frame
  const packs = m.at("packs", 8);
  const silicon = m.at("silicon", Math.round(m.end * 0.4));
  const smaller = m.at("smaller", Math.round(m.end * 0.58));
  const card = m.at("card", Math.round(m.end * 0.78));
  const piece = m.at("piece", Math.round(m.end * 0.32));   // "on a piece of silicon": the count flashes as it lands
  const fig = (p.beat.params as Params).fig?.packs ?? "";

  // both hover until "card", then settle onto the floor with a small bounce
  const settle = m.lerp([card - 2, card + 14], [0, 1], Easing.out(Easing.back(1.6)));
  const y = HOVER * (1 - settle) + m.wave(70, 0.02) * (1 - settle);
  const turn = m.lerp([0, card + 6], [-0.35, 0.12], Easing.inOut(Easing.cubic));
  // the card slides in from the right on "smaller", behind the chip (above it in the portrait frame)
  const cz = -(CHIP / 2 + 0.35 + CARD_L / 2);
  const cin = m.lerp([smaller - 2, smaller + 16], [0, 1], Easing.out(Easing.cubic));
  const cx = 4.2 * (1 - cin);
  const flash = m.pulse(card + 1, 6);

  /** a move from word a lasts `d` frames, but never runs past word b */
  const span = (a: number, b: number, d: number) => Math.max(4, Math.min(d, b - a));
  const chipTop: V3 = [0, y + THICK, 0];
  const pair: V3 = [0, 0.1, cz / 2 - 0.2];
  // medium (the chip turning) → close on "packs" (the field fills the frame) → the whole chip on
  // "silicon" → wide on "card" (chip and card on the floor), still drifting back to the end
  const keys = direct(p.beat.events, [
    { at: 0, move: "push", look: [0, HOVER, 0], dir: [0.2, 0.9, 1], from: 2.2, to: 1.9, dur: Math.max(4, packs), fov: 35 },
    { at: packs, move: "push", look: [0.05, HOVER + THICK, 0.05], dir: [0.12, 1, 0.55], to: 1.25, dur: span(packs, silicon, 16) },
    { at: silicon, move: "pullback", look: [0, HOVER, 0], dir: [0.15, 0.9, 0.75], to: 2.9, dur: span(silicon, smaller, 22) },
    { at: smaller, move: "push", look: [0, 0.25, cz / 4], dir: [0.15, 1, 0.8], to: 4.0, dur: Math.max(4, card - smaller) },
    { at: card, move: "pullback", look: pair, dir: [0.12, 1.15, 0.85], to: 7.4, dur: 20 },
    { at: card + 20, move: "pullback", look: pair, dir: [0.12, 1.15, 0.85], to: 7.9, dur: Math.max(10, Math.round(m.end - card - 20)) },
  ]);

  return (
    <Stage3D backdrop="void" floor="reflect" bloom={1} dof={2.5} blur={1} shadowBox={4}
      overlay={<>
        <SourceLine p={p} />
        <Count fig={fig} caption="switches" start={G(packs)} count={Math.round(22 / p.tl.tempo)} pulse={G(piece)} />
      </>}>
      <Camera3D keys={keys} frame={m.t} seed="payoff-cam" />
      <Focus at={m.t < card ? chipTop : pair} range={m.t < card ? 1.2 : 3.5} />
      {/* the chip and its switch field */}
      <group position={[0, y, 0]} rotation-y={turn}>
        <Die size={CHIP} thick={THICK} seed="payoff-die" lit={0.35 + 0.5 * m.lerp([packs, packs + 12], [0, 1]) + 0.3 * flash} position={[0, THICK / 2, 0]} />
        <InstancedField cols={CELLS} rows={CELLS} spacing={PITCH} shape="cell" start={G(packs - 2)} reveal={Math.round(16 / p.tl.tempo)}
          wave={22} waveColor={TECH.amber} seed="payoff-field" position={[0, THICK + 0.001, 0]} />
      </group>
      {/* the bank card, at true scale beside the chip */}
      {m.t >= smaller - 2 && (
        <group position={[cx, y * 0.9, cz]} rotation-y={Math.PI / 2 + turn * 0.3}>
          <mesh position={[0, 0.012, 0]} material={mat("glossy", "#1f3a8a")} castShadow receiveShadow>
            <boxGeometry args={[CARD_L, 0.024, CARD_W]} />
          </mesh>
          <mesh position={[-CARD_L * 0.28, 0.026, -CARD_W * 0.08]} material={mat("gold", "#e2b35a")} castShadow>
            <boxGeometry args={[0.42, 0.006, 0.34]} />
          </mesh>
          <mesh position={[0, 0.026, CARD_W * 0.3]} material={mat("glossy", "#c9d3ff")}>
            <boxGeometry args={[CARD_L * 0.7, 0.003, 0.08]} />
          </mesh>
        </group>
      )}
      <Label3D at={[0, 0.05, cz]} offset={[0.9, 0.5, 0]} text="a bank card" start={G(smaller + 12)} px={50} color={TECH.white} />
    </Stage3D>
  );
};

export default Payoff;
