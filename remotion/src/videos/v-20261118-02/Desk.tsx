// Desk (3D): a gaming desk at night. The monitor's game picture breaks into a grid of tiles on "split",
// the tiles fly back to the PC tower (its side glass glowing) on "frame", the picture rebuilds on the
// monitor on "game", the camera pushes into one tile on "colours" where a few dots fill with colour, and
// the dots pulse once on "dots".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import {
  Block, Camera3D, canvasTexture, cue, direct, Focus, glow, Place3D, rnd, Stage3D, TECH, type V3,
} from "../../three/index";

const COLS = 8, ROWS = 5;
const SCREEN = { w: 0.94, h: 0.55, c: [0, 1.33, -0.822] as V3 };
const TW = SCREEN.w / COLS, TH = SCREEN.h / ROWS;
const TOWER: V3 = [0.7, 1.04, -0.9];
const TOWER_GLASS: V3 = [0.7, 1.06, -0.655];
const PICK = { c: 5, r: 2 };
const DOT_COLORS = ["#ff8a3d", "#ffd166", "#ff4d8d", "#8b5cff", "#38e1ff", "#ffb340", "#ff6b4a", "#c58bff", "#4dd6ff", "#ffe08a", "#ff5e7e", "#7cf0ff"];

/** the game: a neon road racing toward a sunset over mountains */
function drawGame(g: CanvasRenderingContext2D, W: number, H: number): void {
  const sky = g.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, "#1a0b3d"); sky.addColorStop(0.6, "#7b2b8f"); sky.addColorStop(1, "#ff7a45");
  g.fillStyle = sky; g.fillRect(0, 0, W, H * 0.56);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = "rgba(255,255,255,0.8)";
    g.fillRect(rnd("v0218-star-x", i) * W, rnd("v0218-star-y", i) * H * 0.3, 2, 2);
  }
  g.fillStyle = "#ffd166"; g.beginPath(); g.arc(W * 0.5, H * 0.5, H * 0.2, Math.PI, 0); g.fill();
  g.fillStyle = "#2a0f4a";
  g.beginPath(); g.moveTo(0, H * 0.56);
  for (let i = 0; i <= 12; i++) g.lineTo((i / 12) * W, H * (0.56 - (i % 2 ? 0.16 : 0.05) - rnd("v0218-mtn", i) * 0.08));
  g.lineTo(W, H * 0.56); g.fill();
  const ground = g.createLinearGradient(0, H * 0.56, 0, H);
  ground.addColorStop(0, "#14082e"); ground.addColorStop(1, "#05020f");
  g.fillStyle = ground; g.fillRect(0, H * 0.56, W, H * 0.44);
  g.strokeStyle = "#ff4d8d"; g.lineWidth = 2;
  for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(W / 2 + i * 8, H * 0.56); g.lineTo(W / 2 + i * 160, H); g.stroke(); }
  for (let i = 1; i < 8; i++) { const y = H * 0.56 + (H * 0.44) * Math.pow(i / 8, 1.8); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = "#3a3f55"; g.beginPath(); g.moveTo(W * 0.47, H * 0.56); g.lineTo(W * 0.53, H * 0.56); g.lineTo(W * 0.75, H); g.lineTo(W * 0.25, H); g.fill();
  g.fillStyle = "#ffe08a";
  for (let i = 0; i < 5; i++) { const y = H * (0.6 + i * 0.08); g.fillRect(W * 0.5 - 2 - i, y, 4 + i * 2, H * 0.03); }
  g.fillStyle = "#38e1ff"; g.fillRect(W * 0.42, H * 0.78, W * 0.16, H * 0.1);
  g.fillStyle = "#0b0f1c"; g.fillRect(W * 0.44, H * 0.74, W * 0.12, H * 0.06);
  g.fillStyle = "#ff4d8d"; g.fillRect(W * 0.42, H * 0.86, W * 0.04, H * 0.02); g.fillRect(W * 0.54, H * 0.86, W * 0.04, H * 0.02);
}

/** one tile's piece of the picture (each tile its own small canvas, the picture drawn shifted) */
const tileTex = (c: number, r: number) => canvasTexture(`v0218-game-${c}-${r}`, 128, 120, (g) => {
  g.translate(-c * 128, -r * 120);
  drawGame(g, 128 * COLS, 120 * ROWS);
});

const Tower: React.FC<{ glowK: number; t: number }> = ({ glowK, t }) => (
  <group position={TOWER}>
    <Block size={[0.26, 0.54, 0.48]} radius={0.015} preset="glossy" color="#15171e" />
    {/* the side glass, facing the camera, and what glows behind it */}
    <mesh position={[0, 0.02, 0.242]}>
      <planeGeometry args={[0.2, 0.44]} />
      <meshPhysicalMaterial color="#9fdcff" roughness={0.05} transparent opacity={0.22} />
    </mesh>
    <mesh position={[0, -0.04, 0.2]} material={glow(TECH.cyan)}><boxGeometry args={[0.18, 0.012, 0.01]} /></mesh>
    {[0.12, -0.1].map((y, i) => (
      <mesh key={i} position={[0, y, 0.2]} rotation-z={t * 0.2 + i} material={glow(i ? TECH.violet : TECH.pink)}>
        <ringGeometry args={[0.045, 0.055, 32]} />
      </mesh>
    ))}
    <pointLight position={[0, 0, 0.32]} intensity={0.8 + glowK * 5} distance={1.6} color={TECH.cyan} />
    <mesh position={[0, -0.04, 0.21]} scale={[1, 1 + glowK * 6, 1]} material={glow(TECH.cyan, 0.5)}>
      <boxGeometry args={[0.16, 0.02, 0.004]} />
    </mesh>
  </group>
);

const Desk: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = { split: m.at("split", 4), frame: m.at("frame", 18), game: m.at("game", 34), colours: m.at("colours", 60), dots: m.at("dots", 84), patch: m.at("patch", 72) };
  const end = Math.max(m.end, ev.dots + 16);
  const back0 = Math.max(ev.game, ev.frame + 10);

  const pickC: V3 = [
    SCREEN.c[0] + (PICK.c - (COLS - 1) / 2) * TW,
    SCREEN.c[1] + ((ROWS - 1) / 2 - PICK.r) * TH,
    SCREEN.c[2] + 0.004,
  ];

  const keys = direct(ev, [
    { at: 0, move: "push", look: [0.18, 1.18, -0.85], dir: [0.15, 0.22, 1], from: 3.4, to: 3.05, dur: Math.max(8, ev.frame), fov: 40 },
    { at: "frame", move: "push", look: [0.32, 1.2, -0.85], dir: [0.18, 0.22, 1], to: 2.8, dur: Math.max(10, back0 - ev.frame) },
    { at: back0, move: "push", look: [0.1, 1.28, -0.85], dir: [0.12, 0.2, 1], to: 2.5, dur: Math.max(10, ev.colours - back0) },
    { at: "colours", move: "push", look: pickC, dir: [0.05, 0.08, 1], to: 0.4, dur: 16 },
    { at: ev.colours + 16, move: "push", look: pickC, dir: [0.05, 0.08, 1], to: 0.33, dur: Math.max(8, end - ev.colours - 16) },
  ]);

  // tiles: split apart, fly to the tower, come back and rebuild
  let inTower = 0;
  const tiles = Array.from({ length: COLS * ROWS }, (_, i) => {
    const c = i % COLS, r = Math.floor(i / COLS);
    const home: V3 = [SCREEN.c[0] + (c - (COLS - 1) / 2) * TW, SCREEN.c[1] + ((ROWS - 1) / 2 - r) * TH, SCREEN.c[2]];
    const delay = rnd("v0218-tile-d", i) * 6;
    const go = cue(t, ev.frame + delay, 14, Easing.inOut(Easing.cubic));
    const back = cue(t, back0 + delay, 14, Easing.inOut(Easing.cubic));
    const sp = cue(t, ev.split, 8, Easing.out(Easing.back(1.8))) * (1 - back);
    const k = go * (1 - back);
    inTower = Math.max(inTower, k);
    const out: V3 = [
      home[0] + (home[0] - SCREEN.c[0]) * 0.14 * sp,
      home[1] + (home[1] - SCREEN.c[1]) * 0.2 * sp,
      home[2] + (0.03 + rnd("v0218-tile-z", i) * 0.06) * sp,
    ];
    const arc = Math.sin(k * Math.PI) * (0.25 + rnd("v0218-tile-a", i) * 0.15);
    const pos: V3 = [out[0] + (TOWER_GLASS[0] - out[0]) * k, out[1] + (TOWER_GLASS[1] - out[1]) * k + arc, out[2] + (TOWER_GLASS[2] - out[2]) * k + arc * 0.6];
    const s = (1 - 0.75 * k) * (1 - 0.06 * sp);
    const spin = k * (rnd("v0218-tile-s", i) - 0.5) * 2.4;
    const picked = c === PICK.c && r === PICK.r;
    return { i, c, r, pos, s, spin, picked };
  });

  // the dots in the picked tile
  const dim = cue(t, ev.colours + 4, 10);
  const pulse = 1 + 0.4 * Math.max(0, 1 - Math.abs(t - ev.dots - 3) / 5) + 0.3 * Math.max(0, 1 - Math.abs(t - ev.patch - 3) / 5);

  return (
    <Stage3D backdrop="void" floor="reflect" bloom={0.9} dof={2.5} blur={1} shadowBox={3} fog={{ near: 4, far: 13 }}>
      <Camera3D keys={keys} frame={t} />
      <Focus at={t < ev.colours ? [0.3, 1.2, -0.85] : pickC} range={t < ev.colours ? 1.4 : 0.2} />
      <Place3D kind="desk" seed="v0218-desk" />

      {/* the monitor's panel goes dark behind the tiles while they are away */}
      <mesh position={[SCREEN.c[0], SCREEN.c[1], SCREEN.c[2] - 0.003]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial color="#05060c" />
      </mesh>
      {tiles.map((tl) => (
        <group key={tl.i} position={tl.pos} rotation={[0, tl.spin * 0.5, tl.spin]} scale={tl.s}>
          <mesh>
            <planeGeometry args={[TW * 0.985, TH * 0.985]} />
            <meshBasicMaterial map={tileTex(tl.c, tl.r)} toneMapped={false} />
          </mesh>
          {tl.picked && dim > 0 && (
            <mesh position={[0, 0, 0.001]}>
              <planeGeometry args={[TW, TH]} />
              <meshBasicMaterial color="#0b0f1c" transparent opacity={0.88 * dim} />
            </mesh>
          )}
        </group>
      ))}
      <Tower glowK={inTower} t={t} />

      {/* a few dots fill with colour, then pulse once */}
      {dim > 0 && DOT_COLORS.map((col, j) => {
        const dc = j % 4, dr = Math.floor(j / 4);
        const x = pickC[0] + (dc - 1.5) * TW * 0.22, y = pickC[1] + (1 - dr) * TH * 0.27;
        const fill = cue(t, ev.colours + 8 + j * 1.6, 8, Easing.out(Easing.back(1.6)));
        return (
          <group key={j} position={[x, y, pickC[2] + 0.002]} scale={pulse}>
            <mesh scale={dim}>
              <circleGeometry args={[0.011, 32]} />
              <meshBasicMaterial color="#3a3f55" />
            </mesh>
            {fill > 0 && (
              <mesh position={[0, 0, 0.0005]} scale={fill} material={glow(col)}>
                <circleGeometry args={[0.011, 32]} />
              </mesh>
            )}
          </group>
        );
      })}
    </Stage3D>
  );
};

export default Desk;
