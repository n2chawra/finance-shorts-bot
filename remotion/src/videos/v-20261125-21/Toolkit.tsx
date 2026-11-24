// Toolkit: "Which would games use? Microsoft built DirectX, the toolkit Windows games are written on, around triangles."
// An old beige PC on a dark desk (wide): "so" it lights; "which" the CRT flickers on; "use" a game box
// slides up; "Microsoft"/"DirectX" labels write on; "toolkit" glowing layers rise from the tower
// (medium); "games"/"written" a race car builds on the CRT out of triangles; "around"/"triangles" push in
// on the screen, the mesh flashes (close).
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { OldLogo, OldPC, TriCar, k01, q } from "./Parts";

const Toolkit: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const so = m.at("which", 2);
  const which = m.at("which", 6);
  const use = m.at("use", 14);
  const ms = m.at("microsoft", 22);
  const built = m.at("built", 30);
  const dx = m.at("directx", 36);
  const windows = m.at("windows", 46);
  const toolkit = m.at("toolkit", 54);
  const games = windows;
  const written = windows + 8;
  const around = m.at("around", 78);
  const tri = m.at("triangles", 84);
  const end = Math.max(m.end, tri + 20);
  const on = k01(f, so, 8) * (0.6 + 0.4 * k01(f, which, 6));
  const keys = direct({}, [
    { at: 0, move: "push", look: [-0.3, 1.2, 0], dir: [0.3, 0.3, 1], from: 13, to: 12, dur: Math.max(8, toolkit), fov: 35 },
    { at: toolkit, move: "push", look: [-0.6, 1.8, 0], dir: [0.25, 0.3, 1], to: 9.5, dur: Math.max(8, around - toolkit) },
    { at: around, move: "push", look: [0.6, 1.4, 0.5], dir: [0.05, 0.08, 1], from: 4.4, to: 3.4, dur: Math.max(10, end - around) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#121a2c", bottom: "#040509", glow: "rgba(127,200,255,0.10)" }} floor={false} bloom={1} dof={0} blur={1}
        overlay={<AbsoluteFill>{f >= ms && f < around && <OldLogo file="msold-cut.png" x={540} y={230} w={600} k={k01(f, ms, 12)} />}</AbsoluteFill>}>
        <Camera3D keys={keys} seed="v2521-dx" />
        <OldPC on={on}>
          <TriCar position={[0, -0.1, 0.02]} built={k01(f, games, 10) * (0.5 + 0.5 * k01(f, written, 12))} flash={m.pulse(tri + 4, 8)} rotation-y={0.4 + f * 0.02} />
        </OldPC>
        {/* the game box sliding up to the PC on "use" */}
        <Block size={[0.6, 0.8, 0.12]} radius={0.03} material={glow(TECH.cyan, q(0.25 + 0.5 * m.pulse(use + 6, 10), 20))} position={[2.2 - 0.4 * k01(f, use, 12), 0.45, 0.6]} rotation-y={-0.4} />
        {/* DirectX: glowing layers rising from the tower */}
        {[0, 1, 2].map((i) => {
          const k = k01(f, toolkit + i * 4, 10);
          return (
            <mesh key={i} position={[-1.9, 2.3 + i * 0.35 * k, -0.2]} rotation-x={-Math.PI / 2} visible={k > 0.02}>
              <planeGeometry args={[1.5, 1.1]} />
              <meshBasicMaterial color={i === 2 ? TECH.cyan : "#2f6fff"} toneMapped={false} transparent opacity={q(0.25 + 0.4 * k + 0.3 * m.pulse(windows + 4, 8), 20)} />
            </mesh>
          );
        })}
        <Label3D at={[-1.9, 2.9, -0.2]} offset={[1.2, 0.8, 0.3]} text="DirectX" start={dx} px={64} color={TECH.cyan} align="center" />
        <Label3D at={[0.6, 0.6, 0.5]} offset={[0.3, -0.5, 0.4]} text="Windows games" start={windows} px={52} color={TECH.white} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Toolkit;
