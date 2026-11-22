// Lab (3D, night-grid look): the National Bureau of Standards' test hall. `params.shot`:
//  scale        a fallen walkway section on a floor scale under the hall lights; its display bars climb
//  scale-close  a concrete core on the scale; the extra-weight figure; a small arrow on a big gauge
//  rig          a box beam specimen lowered into a test frame, a rack of identical copies, the ram pulling
//               the rod while a load needle climbs, the nut jerking through
//  rigfail      close on the specimen: the weld seam opens and the nut punches through, flecks falling
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, DisasterStage, Focus, glow, type Shot, type V3 } from "../../three/index";
import { BeamJoint, HH, M } from "./world";
import { ChapterTitle, evs, FigPlate, MonoCaption, MonoLine, Overlay } from "./ui";

type Params = { shot?: string; fig?: { pct?: string } };
const d = (a: number, b: number, min = 10) => Math.max(min, b - a);

/** The hall: floor, back wall with high windows, a gantry crane, hall lights. */
const Hall: React.FC<{ t: number }> = () => (
  <group>
    <mesh rotation-x={-Math.PI / 2} material={M.concrete()} receiveShadow><planeGeometry args={[40, 30]} /></mesh>
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} rotation-x={-Math.PI / 2} position={[-14 + i * 4, 0.005, 0]} material={glow("#ffd84a", 0.25)}><planeGeometry args={[0.08, 30]} /></mesh>)}
    <mesh position={[0, 6, -9]} material={M.wall()} receiveShadow><boxGeometry args={[40, 12, 0.3]} /></mesh>
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-16 + i * 4, 9, -8.84]} material={glow("#9fc7e8", 0.5)}><planeGeometry args={[2.6, 1.6]} /></mesh>)}
    {[-9, 9].map((x) => <mesh key={x} position={[x, 4, -2]} material={M.painted()} castShadow><boxGeometry args={[0.4, 8, 0.4]} /></mesh>)}
    <mesh position={[0, 8, -2]} material={M.painted()} castShadow><boxGeometry args={[18.4, 0.6, 0.5]} /></mesh>
    <mesh position={[0, 7.4, -2]} material={M.darkSteel()}><boxGeometry args={[1, 0.6, 0.8]} /></mesh>
    {[-5, 0, 5].map((x) => (
      <group key={x} position={[x, 7, 2]}>
        <mesh material={M.darkSteel()}><cylinderGeometry args={[0.4, 0.6, 0.3, 16]} /></mesh>
        <mesh position={[0, -0.16, 0]} rotation-x={-Math.PI / 2} material={glow("#f4f1e8", 0.9)}><circleGeometry args={[0.5, 16]} /></mesh>
        <spotLight position={[0, -0.2, 0]} target-position={[x, 0, 2]} angle={0.7} penumbra={0.8} intensity={30} distance={14} color="#f4f1e8" castShadow={x === 0} />
      </group>
    ))}
  </group>
);

/** A floor scale with a walkway section (or a core) on it and a display post. */
const Scale: React.FC<{ t: number; bars: number; core?: boolean }> = ({ bars, core }) => (
  <group>
    <mesh position={[0, 0.1, 0]} material={M.darkSteel()} {...{ castShadow: true, receiveShadow: true }}><boxGeometry args={[3.4, 0.2, 2.2]} /></mesh>
    <mesh position={[0, 0.205, 0]} material={M.steel()}><boxGeometry args={[3.2, 0.01, 2]} /></mesh>
    {core ? (
      <mesh position={[0, 0.5, 0]} material={M.concrete()} castShadow><cylinderGeometry args={[0.22, 0.22, 0.6, 24]} /></mesh>
    ) : (
      <group position={[0, 0.45, 0]} rotation-z={0.04}>
        <mesh material={M.concrete()} castShadow><boxGeometry args={[3, 0.18, 1.1]} /></mesh>
        <mesh position={[0, -0.16, 0.5]} material={M.painted()} castShadow><boxGeometry args={[3, 0.18, 0.08]} /></mesh>
        <mesh position={[0, -0.16, -0.5]} material={M.painted()} castShadow><boxGeometry args={[3, 0.18, 0.08]} /></mesh>
        {[-1.1, 0.2, 1.2].map((x, i) => <mesh key={x} position={[x, 0.1, 0]} rotation={[0.3 * i, 0.4, 0.5]} material={M.concrete()} castShadow><dodecahedronGeometry args={[0.16 + 0.04 * i, 0]} /></mesh>)}
      </group>
    )}
    <group position={[2.2, 0, -0.6]}>
      <mesh position={[0, 0.8, 0]} material={M.darkSteel()}><boxGeometry args={[0.12, 1.6, 0.12]} /></mesh>
      <mesh position={[0, 1.7, 0]} material={M.darkSteel()} castShadow><boxGeometry args={[0.9, 0.5, 0.15]} /></mesh>
      {Array.from({ length: 8 }, (_, i) => i / 8 < bars ? (
        <mesh key={i} position={[-0.36 + i * 0.1, 1.7, 0.08]} material={glow(i > 5 ? "#ffb23e" : "#3ddc84", 0.9)}><planeGeometry args={[0.07, 0.3]} /></mesh>
      ) : null)}
    </group>
  </group>
);

/** The test frame: two columns, a crosshead with the ram, the specimen's rod running up into it. */
const Rig: React.FC<{ t: number; pull: number; fail: number; lower: number; fold: number; drop: number; debris: number; stress: number }> = ({ t, pull, lower, fold, drop, debris, stress }) => (
  <group>
    <mesh position={[0, 0.15, 0]} material={M.darkSteel()} receiveShadow castShadow><boxGeometry args={[3, 0.3, 1.6]} /></mesh>
    {[-1.2, 1.2].map((x) => <mesh key={x} position={[x, 2, 0]} material={M.machine()} castShadow><boxGeometry args={[0.22, 3.7, 0.4]} /></mesh>)}
    <mesh position={[0, 3.8, 0]} material={M.machine()} castShadow><boxGeometry args={[2.8, 0.36, 0.6]} /></mesh>
    {[-1.2, 1.2].map((x) => [0.6, 1.6, 2.6, 3.4].map((y) => <mesh key={`${x}${y}`} position={[x, y, 0.21]} material={M.darkSteel()}><cylinderGeometry args={[0.04, 0.04, 0.03, 8]} /></mesh>))}
    <mesh position={[0, 3.3 + pull * 0.08, 0]} material={M.steel()} castShadow><cylinderGeometry args={[0.18, 0.18, 0.7, 20]} /></mesh>
    <mesh position={[0, 3.62, 0.31]} material={M.darkSteel()}><boxGeometry args={[0.5, 0.2, 0.04]} /></mesh>
    {/* the specimen: a short box beam held at both ends on supports, the rod pulled up */}
    {[-0.75, 0.75].map((z) => <mesh key={z} position={[0, 1.05, z]} material={M.darkSteel()} castShadow><boxGeometry args={[0.8, 0.5, 0.12]} /></mesh>)}
    <group position={[0, 1.75 + lower, 0]} rotation-y={Math.PI / 2}>
      <group position={[0, 0, 0]} scale={[1, 1, 1]}>
        <group position={[0, pull * 0.02, 0]}>
          <BeamJoint t={t} rods="one" length={1.6} stress={stress} fold={fold} drop={-drop} debris={debris} />
        </group>
      </group>
    </group>
  </group>
);

const LabBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  useCurrentFrame();
  const t = m.t;
  const params = p.beat.params as Params;
  const shot = params.shot ?? "rig";
  const end = Math.max(m.end, 30);
  if (shot === "shop-rod" || shot === "shop-thread") {
    const names2 = shot === "shop-rod" ? ["fabricator", "rod", "problem"] : ["nut", "halfway", "thread", "wound"];
    const e = evs(m, names2);
    const ROD = 7.2;   // the rod, lying along x on trestles
    const k = shot === "shop-thread" ? cue(t, e.wound!, Math.max(30, end - e.wound! - 10), (x) => x) : 0;
    const nutX = -ROD / 2 + 0.2 + (ROD / 2 - 0.2) * k;
    const threadK = shot === "shop-thread" ? cue(t, e.thread!, 24) : 0;
    const camS: Shot[] = shot === "shop-rod"
      ? [{ at: 0, move: "crane", look: [0, 0.8, 0], base: [-2, 0, 6], from: 4.5, to: 2.4, dur: d(0, e.rod!), fov: 44 },
         { at: "rod", move: "fly", path: [[-2, 2.4, 6], [1, 1.8, 4.2], [3, 1.4, 2.6]], look: [0, 0.8, 0], dur: d(e.rod!, e.problem!) },
         { at: "problem", move: "push", look: [0, 0.8, 0], dir: [0.3, 0.6, 1], to: 2.4, dur: d(e.problem!, end) }]
      : [{ at: 0, move: "push", look: [-ROD / 2 + 0.4, 0.8, 0], dir: [0.4, 0.5, 1], from: 2.4, to: 2.0, dur: d(0, e.halfway!), fov: 40 },
         { at: "halfway", move: "pullback", look: [-0.6, 0.8, 0], dir: [0.2, 0.45, 1], to: 5.2, dur: d(e.halfway!, end) }];
    return (
      <DisasterStage look="nightGrid" floor={false} dof={1} shadowBox={8} fog={{ color: "#0a0d12", near: 9, far: 26 }} light={0.25}
        overlay={<Overlay text="3D reconstruction · not actual footage">
          <MonoCaption t={t} at={2} text="THE FABRICATOR'S SHOP · ONE HANGER ROD" />
          {shot === "shop-rod" && <MonoLine t={t} at={e.rod!} text="ROOF TO SECOND FLOOR · ONE PIECE" x={1060} y={760} size={34} color="#ffd84a" />}
          {shot === "shop-rod" && t >= e.problem! && <div style={{ position: "absolute", left: 900, top: 260, fontFamily: "Anton, Poppins, sans-serif", fontSize: 200, color: "#ffd84a", opacity: Math.min(1, (t - e.problem!) / 8) }}>?</div>}
          {shot === "shop-thread" && <MonoLine t={t} at={e.halfway!} text="THE NUT HAS TO GET HERE" x={900} y={300} size={34} color="#ff3b30" />}
          {shot === "shop-thread" && t >= e.wound! && <MonoLine t={t} at={e.wound!} text={`TURNS ${"▮".repeat(Math.min(14, Math.floor((t - e.wound!) / 4)))}`} x={120} y={760} size={34} />}
        </Overlay>}>
        <Camera3D keys={direct({ ...e, end }, camS)} frame={t} drift={0.008} />
        <Focus at={[shot === "shop-rod" ? 0 : nutX, 0.8, 0]} range={3} />
        <mesh rotation-x={-Math.PI / 2} material={M.carpet()} receiveShadow><planeGeometry args={[40, 30]} /></mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]} material={M.millscale()} receiveShadow><planeGeometry args={[14, 6]} /></mesh>
        <mesh position={[0, 4, -4.5]} material={M.darkSteel()} receiveShadow><boxGeometry args={[30, 8, 0.3]} /></mesh>
        {[-4.5, 0, 4.5].map((x) => (
          <group key={`lamp${x}`} position={[x, 3.6, 0.4]}>
            <mesh material={M.darkSteel()}><coneGeometry args={[0.45, 0.4, 16, 1, true]} /></mesh>
            <mesh position={[0, -0.15, 0]} material={glow("#ffd9a0", 0.95)}><sphereGeometry args={[0.12, 10, 8]} /></mesh>
            <spotLight position={[0, -0.2, 0]} target-position={[x, 0, 0.4]} angle={0.75} penumbra={0.7} intensity={26} distance={9} color="#ffd9a0" castShadow={x === 0} />
          </group>
        ))}
        <group position={[-3.5, 0, -3.4]}>
          {[0.4, 1.0, 1.6].map((y) => <mesh key={y} position={[0, y, 0]} material={M.machine()}><boxGeometry args={[5, 0.08, 0.7]} /></mesh>)}
          {[-2.4, 0, 2.4].map((x) => <mesh key={x} position={[x, 1, 0]} material={M.machine()} castShadow><boxGeometry args={[0.1, 2, 0.7]} /></mesh>)}
          {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[0, 0.48 + Math.floor(i / 5) * 0.6, -0.25 + (i % 5) * 0.12]} rotation-z={Math.PI / 2} material={M.steel()}><cylinderGeometry args={[0.03, 0.03, 4.8, 8]} /></mesh>)}
        </group>
        <group position={[3.6, 0, -3.2]}>
          {[0, 1, 2, 3].map((i) => <mesh key={i} position={[0, 0.12 + i * 0.22, 0]} material={M.millscale()} castShadow><boxGeometry args={[4, 0.2, 0.5]} /></mesh>)}
        </group>
        <group position={[5.4, 0, 1.4]}>
          <mesh position={[0, 0.45, 0]} material={M.machine()} castShadow><boxGeometry args={[0.8, 0.9, 0.6]} /></mesh>
          <mesh position={[0, 0.92, 0.2]} material={M.darkSteel()}><boxGeometry args={[0.5, 0.06, 0.06]} /></mesh>
          <mesh position={[-0.2, 0.7, 0.31]} material={glow("#3ddc84", 0.9)}><circleGeometry args={[0.04, 10]} /></mesh>
        </group>
        <group position={[-5.4, 0, 1.6]}>
          <mesh position={[0, 0.9, 0]} material={M.wood()} castShadow><boxGeometry args={[1.8, 0.1, 0.8]} /></mesh>
          {[-0.8, 0.8].map((x) => <mesh key={x} position={[x, 0.45, 0]} material={M.darkSteel()}><boxGeometry args={[0.08, 0.9, 0.7]} /></mesh>)}
          <mesh position={[0.5, 1.05, 0]} material={M.machine()} castShadow><boxGeometry args={[0.3, 0.2, 0.25]} /></mesh>
        </group>
        {[-2.6, 0, 2.6].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-0.35, 0.35].map((z) => <mesh key={z} position={[0, 0.38, z]} rotation-x={z * 0.6} material={M.wood()} castShadow><boxGeometry args={[0.08, 0.8, 0.08]} /></mesh>)}
            <mesh position={[0, 0.76, 0]} material={M.wood()} castShadow><boxGeometry args={[0.12, 0.08, 0.9]} /></mesh>
          </group>
        ))}
        <mesh position={[0, 0.83, 0]} rotation-z={Math.PI / 2} material={glow("#ffd84a", Math.round((shot === "shop-rod" ? 0.25 * cue(t, e.rod!, 10) : 0) * 10) / 10)}><cylinderGeometry args={[0.045, 0.045, ROD, 10]} /></mesh>
        <mesh position={[0, 0.83, 0]} rotation-z={Math.PI / 2} material={M.steel()} castShadow><cylinderGeometry args={[0.035, 0.035, ROD, 16]} /></mesh>
        {threadK > 0 && Array.from({ length: Math.floor(70 * threadK) }, (_, i) => (
          <mesh key={i} position={[-ROD / 2 + 0.1 + i * 0.1, 0.83, 0]} rotation-y={Math.PI / 2} material={M.darkSteel()}><torusGeometry args={[0.036, 0.006, 4, 14]} /></mesh>
        ))}
        {shot === "shop-thread" && t >= e.nut! && (
          <group position={[nutX, 0.83, 0]} rotation-z={Math.PI / 2}>
            <mesh rotation-y={k * 60} material={M.darkSteel()} castShadow><cylinderGeometry args={[0.09, 0.09, 0.09, 6]} /></mesh>
          </group>
        )}
        {shot === "shop-thread" && t >= e.halfway! && <mesh position={[0, 0.83, 0]} rotation-y={Math.PI / 2} material={glow("#ff3b30", 0.9)}><torusGeometry args={[0.12, 0.012, 6, 24]} /></mesh>}
      </DisasterStage>
    );
  }
  let names: string[], cam: Shot[], focus: V3, scene: React.ReactNode, overlay: React.ReactNode;
  if (shot === "scale" || shot === "scale-close") {
    names = shot === "scale" ? ["national", "case", "weighed"] : ["decks", "heavier", "drawings", "explain"];
    const e = evs(m, names);
    const bars = shot === "scale" ? cue(t, e.weighed!, 30, (x) => x) : 1;
    cam = shot === "scale"
      ? [{ at: 0, move: "crane", look: [0, 0.6, 0], base: [3, 0, 7], from: 5.5, to: 2.6, dur: d(0, end), fov: 44 }]
      : [{ at: 0, move: "push", look: [0.6, 0.8, 0], dir: [0.6, 0.4, 1], from: 4.6, to: 3.4, dur: d(0, end), fov: 40 }];
    focus = [0.5, 0.6, 0];
    scene = <><Hall t={t} /><Scale t={t} bars={bars} core={shot === "scale-close"} /></>;
    overlay = shot === "scale" ? (
      <>
        <ChapterTitle t={t} at={e.national!} text="WHAT THEY FOUND" out={e.weighed! + 20} />
        <MonoCaption t={t} at={e.case! - 10} text="NATIONAL BUREAU OF STANDARDS · TEST HALL" top={104} />
      </>
    ) : (
      <>
        <FigPlate t={t} at={e.heavier!} label="HEAVIER THAN DRAWN, ABOUT" value={params.fig?.pct ?? ""} x={1260} y={220} />
        <MonoLine t={t} at={e.drawings!} text="DRAWN WEIGHT ─ ─ ─" x={1260} y={450} size={30} color="#7fd0ff" />
        <MonoLine t={t} at={e.explain!} text="NOT ENOUGH TO EXPLAIN IT" x={1260} y={520} size={34} color="#c9d6e8" />
      </>
    );
  } else {
    names = shot === "rig" ? ["built", "copies", "pulled", "broke"] : ["broke", "weld", "nut"];
    const e = evs(m, names);
    const lower = shot === "rig" ? 1.6 * (1 - cue(t, 0, Math.max(14, e.copies! - 6), Easing.out(Easing.cubic))) : 0;
    const go = shot === "rig" ? e.broke! : e.nut!;
    const pull = shot === "rig" ? cue(t, e.pulled!, Math.max(12, e.broke! - e.pulled!), (x) => x) : 1;
    const stress = shot === "rig" ? pull * 0.9 : Math.min(1, 0.6 + cue(t, 0, Math.max(10, e.weld!), (x) => x) * 0.4);
    const fold = cue(t, shot === "rig" ? go : e.weld!, 14, Easing.out(Easing.cubic)) * 0.8;
    const drop = cue(t, go, 10, Easing.in(Easing.quad)) * 0.25;
    cam = shot === "rig"
      ? [{ at: 0, move: "orbit", center: [0, 1.8, 0], radius: 7.5, height: 1.2, from: 0.5, to: 0.8, dur: d(0, e.pulled!), fov: 42 },
         { at: "pulled", move: "push", look: [0, 1.6, 0], dir: [0.7, 0.1, 1], to: 4.2, dur: d(e.pulled!, end) }]
      : [{ at: 0, move: "push", look: [0, 1.75 - HH, 0], dir: [1, -0.3, 0.7], from: 2.4, to: 1.6, dur: d(0, end), fov: 38 }];
    focus = [0, 1.6, 0];
    scene = (
      <>
        <Hall t={t} />
        <Rig t={t} pull={pull} fail={0} lower={lower} fold={fold} drop={drop} debris={cue(t, go, 60, (x) => x)} stress={stress} />
        {shot === "rig" && (
          <group position={[4.2, 0, -1.5]}>
            <mesh position={[0, 1.4, 0]} material={M.machine()}><boxGeometry args={[0.1, 2.8, 2.6]} /></mesh>
            {[0.6, 1.5, 2.4].map((y) => (
              <group key={y}>
                <mesh position={[0.3, y - 0.25, 0]} material={M.painted()}><boxGeometry args={[0.7, 0.04, 2.6]} /></mesh>
                {[-0.8, 0, 0.8].map((z) => <mesh key={z} position={[0.3, y, z]} material={M.millscale()} castShadow><boxGeometry args={[0.5, 0.36, 0.6]} /></mesh>)}
              </group>
            ))}
          </group>
        )}
      </>
    );
    const needle = shot === "rig" ? pull * (t >= go ? Math.max(0.2, 1 - (t - go) / 10) : 1) : 0;
    overlay = (
      <>
        <MonoCaption t={t} at={2} text={shot === "rig" ? "NBS LABORATORY · A COPY OF THE JOINT" : "THE TEST · AS THE REPORT DESCRIBES"} />
        {shot === "rig" && t >= e.pulled! && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(1600 330)">
              <circle r={150} fill="rgba(8,14,26,0.85)" stroke="#c9d6e8" strokeWidth={4} />
              {Array.from({ length: 11 }, (_, i) => { const a = -2.4 + i * 0.48; return <line key={i} x1={Math.sin(a) * 120} y1={-Math.cos(a) * 120} x2={Math.sin(a) * 140} y2={-Math.cos(a) * 140} stroke="#c9d6e8" strokeWidth={4} />; })}
              <line x1={0} y1={0} x2={Math.sin(-2.4 + 4.8 * needle) * 110} y2={-Math.cos(-2.4 + 4.8 * needle) * 110} stroke="#ffb23e" strokeWidth={8} strokeLinecap="round" />
              <circle r={14} fill="#ffb23e" />
              <text y={80} textAnchor="middle" fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={30} fill="#c9d6e8">LOAD</text>
            </g>
          </svg>
        )}
        {shot === "rigfail" && <MonoLine t={t} at={e.nut! + 2} text="SAME FAILURE AS THE REAL ONE" x={1160} y={780} size={34} color="#ff3b30" />}
        {shot === "rig" && <MonoLine t={t} at={e.copies!} text="IDENTICAL COPIES" x={1240} y={700} size={34} />}
      </>
    );
  }
  const e = evs(m, names);
  return (
    <DisasterStage look="nightGrid" floor="reflect" dof={1} shadowBox={8} fog={{ color: "#0b1622", near: 12, far: 40 }} light={0.8}
      overlay={<Overlay text="3D reconstruction · laboratory">{overlay}</Overlay>}>
      <Camera3D keys={direct({ ...e, end }, cam)} frame={t} drift={0.008} />
      <Focus at={focus} range={3} />
      {scene}
    </DisasterStage>
  );
};

export default LabBeat;
