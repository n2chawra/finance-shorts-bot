// The Titan world (18 June 2023) as one lit 3D set, shared by the Sea beats. One unit = one metre.
// Titan: a black carbon-fibre cylinder between two titanium rings and two titanium domes, an acrylic
// window in the front dome, a white fairing with a tail cone and four thrusters, landing rails underneath.
// The support ship on the swell, the launch platform it tows, the descent through dark water (marine snow
// drifting past), the seabed with the wreck of the Titanic's bow far off in the gloom, and the implosion
// (the hull's stress ramp, a flash, the crush, a cloud of bubbles and light fragments falling). No people
// are drawn and nothing of the occupants is ever shown.
import React from "react";
import { clayMat, Debris, glow, rnd, type V3 } from "../../three/index";

export const SUB_L = 6.7;
const sh = { castShadow: true, receiveShadow: true } as const;
const k01 = (x: number) => Math.max(0, Math.min(1, x));

const clay = (c: string, o: { emissive?: string; emissiveIntensity?: number; opacity?: number } = {}) => clayMat(c, { ao: 0.3, ...o });
export const M = {
  carbon: () => clay("#1d2026"),
  weave: () => clay("#30353d"),
  titanium: () => clay("#b4b9bf"),
  white: () => clay("#f1f2f4"),
  grey: () => clay("#737a82"),
  dark: () => clay("#1a1c20"),
  yellow: () => clay("#e8b21c"),
  rust: () => clay("#6a3c24"),
  rustDark: () => clay("#432a1c"),
  sand: () => clay("#4b5560"),
  pontoon: () => clay("#c9cdd2"),
  red: () => clay("#a2241d"),
  rubber: () => clay("#d1452c"),
  rope: () => clay("#e8e1c8"),
  body: (c: string) => clay(c),
  head: () => clay("#d9b38c"),
  fair: (o: number) => clay("#f1f2f4", { opacity: Math.round(o * 10) / 10 }),
  hot: (k: number) => {
    const q = Math.round(k * 10) / 10;
    const c = q < 0.5 ? "#c77a28" : "#e0241b";
    return clay(q < 0.25 ? "#5a4030" : c, { emissive: c, emissiveIntensity: 0.3 + 0.9 * q });
  },
};

/** Titan, nose to +x. `stress` 0..1 colours the carbon cylinder from grey to amber to red (the failure only);
 * `crush` 0..1 squeezes the cylinder and pushes the domes in (the implosion); `cut` 0..1 opens the fairing
 * (a cutaway: the fairing fades, the cylinder shows its layers); `lights` 0..1 the lamps and the window light */
export const Titan: React.FC<{ position?: V3; rotation?: V3; scale?: number; stress?: number; crush?: number; cut?: number; lights?: number; frame?: number; ring?: number; domeOpen?: number; bolts?: number; fairingOff?: number; domesOut?: number }> = ({
  position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, stress = 0, crush = 0, cut = 0, lights = 1, frame = 0, ring = 0, domeOpen = 0, bolts = 18, fairingOff = 0, domesOut = 0,
}) => {
  const c = k01(crush);
  const rs = 1 - 0.85 * c;                   // the cylinder's radius squeezes
  const ls = 1 - 0.45 * c;                   // and its length
  const R = 0.84, HL = 1.25;                  // radius, half length of the carbon cylinder
  const fair = 1 - k01(cut) * 0.92;
  const fairMat = cut > 0 ? M.fair(fair) : M.white();
  const hull = stress > 0.02 ? M.hot(stress) : M.carbon();
  const lamp = glow("#cfe9ff", 0.35 + 0.65 * k01(lights) * (0.92 + 0.08 * Math.sin(frame * 0.3)));
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* the pressure hull: carbon-fibre cylinder, titanium rings and domes */}
      <group scale={[ls, rs, rs]}>
        <mesh rotation-z={Math.PI / 2} material={hull} {...sh}><cylinderGeometry args={[R, R, HL * 2, 48, 1]} /></mesh>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => <mesh key={i} position={[x, 0, 0]} rotation-z={Math.PI / 2} material={stress > 0.02 ? hull : M.weave()}><cylinderGeometry args={[R + 0.006, R + 0.006, 0.05, 48, 1, true]} /></mesh>)}
        {ring > 0 && <mesh rotation-z={Math.PI / 2} material={glow("#ff3b30", k01(ring))}><cylinderGeometry args={[R + 0.03, R + 0.03, 0.18, 48, 1, true]} /></mesh>}
      </group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (HL * ls + 0.6 * k01(domesOut)), 0, 0]}>
          <mesh rotation-z={Math.PI / 2} material={M.titanium()} {...sh}><cylinderGeometry args={[R + 0.08, R + 0.08, 0.22, 48]} /></mesh>
          {/* the front dome hinges up from its top edge when open */}
          <group position={[s * 0.1, s > 0 ? R : 0, 0]} rotation-z={s > 0 ? 1.7 * k01(domeOpen) : 0}>
            <group position={[0, s > 0 ? -R : 0, 0]}>
              <mesh position={[s * (0.35 * c), 0, 0]} rotation-z={s > 0 ? -Math.PI / 2 : Math.PI / 2} scale={[1, 1 - 0.6 * c, 1]} material={M.titanium()} {...sh}>
                <sphereGeometry args={[R + 0.02, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
              {s > 0 && <mesh position={[R * 0.92 + 0.02, 0.02, 0]} rotation-z={-Math.PI / 2} material={glow("#9fd8ff", 1)}><cylinderGeometry args={[0.2, 0.2, 0.1, 32]} /></mesh>}
            </group>
          </group>
          {s > 0 && Array.from({ length: Math.max(0, Math.min(18, Math.round(bolts))) }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return <mesh key={i} position={[0.13, Math.cos(a) * (R + 0.04), Math.sin(a) * (R + 0.04)]} rotation-z={Math.PI / 2} material={M.yellow()}><cylinderGeometry args={[0.035, 0.035, 0.06, 6]} /></mesh>;
          })}
        </group>
      ))}
      {/* the fairing: a white shell over the top, the tail cone, the thrusters */}
      <group position={[0, 2.5 * k01(fairingOff), -3 * k01(fairingOff)]} rotation-x={-1.4 * k01(fairingOff)}>
        <mesh position={[-0.2, 0.35, 0]} rotation-z={Math.PI / 2} material={fairMat} {...sh}><cylinderGeometry args={[0.98, 0.98, 2.6, 40, 1, true, -Math.PI * 0.35, Math.PI * 0.7]} /></mesh>
      </group>
      <mesh position={[-HL - 1.25, 0.1, 0]} rotation-z={Math.PI / 2} material={fairMat} {...sh}><cylinderGeometry args={[0.92, 0.28, 2.2, 32]} /></mesh>
      {[[0.55, 0.55], [0.55, -0.55], [-0.4, 0.62], [-0.4, -0.62]].map(([y, z], i) => (
        <group key={i} position={[-HL - 2.1 + (i > 1 ? 0.9 : 0), y!, z!]}>
          <mesh rotation-z={Math.PI / 2} material={M.dark()}><cylinderGeometry args={[0.2, 0.2, 0.42, 20, 1, true]} /></mesh>
          <mesh rotation-z={Math.PI / 2} rotation-x={frame * 0.6} material={M.grey()}><boxGeometry args={[0.04, 0.34, 0.06]} /></mesh>
        </group>
      ))}
      {/* landing rails and frame */}
      {[-0.62, 0.62].map((z) => (
        <group key={z}>
          <mesh position={[-0.6, -1.08, z]} rotation-z={Math.PI / 2} material={M.yellow()} {...sh}><cylinderGeometry args={[0.07, 0.07, 5.0, 12]} /></mesh>
          {[-2.2, -0.9, 0.4, 1.4].map((x) => <mesh key={x} position={[x, -0.95, z]} material={M.grey()}><boxGeometry args={[0.08, 0.3, 0.08]} /></mesh>)}
        </group>
      ))}
      {/* lamps */}
      {[0.55, -0.55].map((z) => <mesh key={z} position={[HL + 0.55, 0.62, z]} material={lamp}><sphereGeometry args={[0.09, 12, 8]} /></mesh>)}
      {lights > 0 && <pointLight position={[HL + 2.2, 0.4, 0]} intensity={2.2 * lights} distance={9} color="#cfe9ff" />}
    </group>
  );
};

/** The launch platform: a grey deck on pontoons, half awash (Titan rides it down to the depth where it lets go). */
export const Platform: React.FC<{ position?: V3; y?: number }> = ({ position = [0, 0, 0], y = 0 }) => (
  <group position={[position[0], position[1] + y, position[2]]}>
    <mesh position={[0, 0, 0]} material={M.grey()} {...sh}><boxGeometry args={[9, 0.25, 3.6]} /></mesh>
    {[-1.5, 1.5].map((z) => <mesh key={z} position={[0, -0.45, z]} rotation-z={Math.PI / 2} material={M.pontoon()} {...sh}><cylinderGeometry args={[0.42, 0.42, 9, 20]} /></mesh>)}
    {[-3.8, 3.8].map((x) => <mesh key={x} position={[x, 0.7, 0]} material={M.yellow()}><boxGeometry args={[0.15, 1.2, 3.4]} /></mesh>)}
  </group>
);

/** Marine snow: specks drifting past the camera; `sink` is how far the sub has gone down (the specks rise). */
export const Snow: React.FC<{ frame: number; sink?: number; center?: V3; size?: V3; count?: number; color?: string }> = ({ frame, sink = 0, center = [0, 0, 0], size = [30, 16, 20], count = 260, color = "#cfe6ff" }) => {
  const m = glow(color, 0.55);
  return (
    <group position={center}>
      {Array.from({ length: count }, (_, i) => {
        const x = (rnd("snow", i) - 0.5) * size[0];
        const yy = ((rnd("snow", i + 1000) * size[1] + frame * 0.01 + sink) % size[1] + size[1]) % size[1] - size[1] / 2;
        const z = (rnd("snow", i + 2000) - 0.5) * size[2];
        return <mesh key={i} material={m} position={[x + Math.sin(frame * 0.02 + i) * 0.1, yy, z]}><sphereGeometry args={[0.035, 5, 4]} /></mesh>;
      })}
    </group>
  );
};

/** The seabed: a wide grey-blue floor with low mounds, at y = 0. */
export const Seabed: React.FC = () => (
  <group>
    <mesh rotation-x={-Math.PI / 2} material={M.sand()} receiveShadow><planeGeometry args={[400, 400, 1, 1]} /></mesh>
    {Array.from({ length: 26 }, (_, i) => (
      <mesh key={i} position={[(rnd("mound", i) - 0.5) * 120, -0.6, (rnd("mound", i + 50) - 0.5) * 120]} scale={[2 + rnd("mound", i + 90) * 5, 1, 2 + rnd("mound", i + 120) * 5]} material={M.sand()}>
        <sphereGeometry args={[1, 12, 8]} />
      </mesh>
    ))}
  </group>
);

/** The wreck of the Titanic's bow, far off and partly buried: a long rusted hull rising to the bow, the rail,
 * the stump of the foremast. Drawn simply, in the gloom (it is the destination, not the subject). */
export const Wreck: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = ({ position = [24, 0, -30], rotation = [0, -0.5, 0], scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh material={M.rust()} position={[-10, 2.5, 0]} {...sh}><boxGeometry args={[48, 11, 7]} /></mesh>
      <mesh material={M.rust()} position={[19, 3.2, 0]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[1, 1, 1.6]} {...sh}><cylinderGeometry args={[0.2, 3.5, 12, 3, 1]} /></mesh>
      <mesh position={[-4, 8.3, 0]} material={M.rustDark()}><boxGeometry args={[52, 0.4, 7.2]} /></mesh>
      <mesh position={[10, 12, 0]} rotation-z={-0.35} material={M.rustDark()}><cylinderGeometry args={[0.35, 0.45, 8, 10]} /></mesh>
      {[-24, -12].map((x) => <mesh key={x} position={[x, 10, 0]} material={M.rustDark()}><boxGeometry args={[6, 3.5, 5]} /></mesh>)}
      {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[-32 + i * 3.4, 2 + rnd("port", i) * 3, 3.55]} material={M.rustDark()}><circleGeometry args={[0.32, 10]} /></mesh>)}
    </group>
  );
};

/** The implosion, seen from outside: a white-blue flash, a ring of pressure, a cloud of bubbles rising, the
 * hull's light fragments falling (`k` 0..1 from the moment it fails). */
export const Implosion: React.FC<{ k: number; at?: V3; frame: number }> = ({ k, at = [0, 0, 0], frame }) => {
  if (k <= 0) return null;
  const flash = Math.max(0, 1 - k * 6);
  const ringR = 0.5 + k * 9;
  return (
    <group position={at}>
      {flash > 0 && <mesh material={glow("#e8f6ff", flash)}><sphereGeometry args={[1.4 + 3 * k, 24, 16]} /></mesh>}
      {flash > 0 && <pointLight intensity={30 * flash} distance={40} color="#e8f6ff" />}
      <mesh rotation-x={Math.PI / 2} material={glow("#9fd8ff", Math.max(0, 0.6 - k))}><torusGeometry args={[ringR, 0.08 + 0.2 * (1 - k), 8, 60]} /></mesh>
      {Array.from({ length: 70 }, (_, i) => {
        const a = rnd("bub", i) * Math.PI * 2, r = rnd("bub", i + 99) * 3.2 * Math.min(1, k * 3);
        const y = k * (2 + rnd("bub", i + 199) * 7) + Math.sin(frame * 0.2 + i) * 0.1;
        const s = 0.06 + rnd("bub", i + 299) * 0.2;
        return <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} material={glow("#d6f0ff", 0.55 * (1 - k * 0.6))}><sphereGeometry args={[s, 10, 8]} /></mesh>;
      })}
      <Debris at={[0, 0, 0]} count={70} spread={1.2} dir={[0, -0.3, 0]} speed={3.2} size={0.16} start={0.02} seconds={3} slow={0.5} gravity={1.2} floor={-30} kind="metal" seed="titan" progress={k} />
    </group>
  );
};

/** The support ship on the surface: a dark-blue hull, white bridge forward, a work deck aft, the crane. */
export const Ship: React.FC<{ position?: V3; frame: number; scale?: number }> = ({ position = [0, 0, 0], frame, scale = 1 }) => {
  const roll = Math.sin(frame * 0.04) * 0.025, pitch = Math.sin(frame * 0.03 + 1) * 0.015;
  return (
    <group position={position} rotation={[roll, 0, pitch]} scale={scale}>
      <mesh position={[-2.5, 0.9, 0]} material={M.red()} {...sh}><boxGeometry args={[23, 4.2, 5.2]} /></mesh>
      <mesh position={[11.5, 1.4, 0]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[1, 1, 0.55]} material={M.red()} {...sh}><cylinderGeometry args={[0.2, 4.6, 5, 3, 1]} /></mesh>
      <mesh position={[5, 5, 0]} material={M.white()} {...sh}><boxGeometry args={[7, 4, 4.4]} /></mesh>
      <mesh position={[5.5, 7.4, 0]} material={M.white()} {...sh}><boxGeometry args={[4.5, 1, 4.6]} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[2.6 + i * 0.95, 7.4, 2.32]} material={glow("#ffe6a8", 0.8)}><boxGeometry args={[0.6, 0.45, 0.02]} /></mesh>)}
      <mesh position={[1.5, 9.5, 0]} material={M.yellow()}><cylinderGeometry args={[0.12, 0.12, 6, 8]} /></mesh>
      <mesh position={[-7, 5.5, 0]} rotation-z={0.7} material={M.yellow()} {...sh}><boxGeometry args={[0.4, 7, 0.4]} /></mesh>
    </group>
  );
};

/** A small person, standing (for decks, platforms and boats): legs, body, head; `lamp` adds a head lamp. */
export const Folk: React.FC<{ position?: V3; h?: number; color?: string; lamp?: boolean; yaw?: number }> = ({ position = [0, 0, 0], h = 1.75, color = "#3e5a78", lamp = false, yaw = 0 }) => {
  const body = M.body(color);
  const head = M.head();
  return (
    <group position={position} rotation-y={yaw}>
      <mesh position={[0, h * 0.22, 0]} material={body} castShadow><cylinderGeometry args={[h * 0.1, h * 0.08, h * 0.44, 10]} /></mesh>
      <mesh position={[0, h * 0.6, 0]} material={body} castShadow><capsuleGeometry args={[h * 0.12, h * 0.26, 4, 12]} /></mesh>
      <mesh position={[0, h * 0.9, 0]} material={head} castShadow><sphereGeometry args={[h * 0.095, 16, 12]} /></mesh>
      {lamp && <mesh position={[h * 0.09, h * 0.93, 0]} material={glow("#fff3c4", 1)}><sphereGeometry args={[h * 0.04, 8, 6]} /></mesh>}
    </group>
  );
};

/** A diver: a swimmer lying along x with a lamp, fins kicking. */
export const Diver: React.FC<{ position?: V3; frame: number; yaw?: number }> = ({ position = [0, 0, 0], frame, yaw = 0 }) => (
  <group position={position} rotation-y={yaw}>
    <mesh rotation-z={Math.PI / 2} material={M.dark()}><capsuleGeometry args={[0.2, 1.0, 4, 10]} /></mesh>
    <mesh position={[0.78, 0.04, 0]} material={M.dark()}><sphereGeometry args={[0.17, 12, 10]} /></mesh>
    <mesh position={[0.2, 0.25, 0]} rotation-z={Math.PI / 2} material={M.yellow()}><cylinderGeometry args={[0.1, 0.1, 0.6, 10]} /></mesh>
    <mesh position={[-0.85, 0, Math.sin(frame * 0.3) * 0.1]} rotation-y={Math.sin(frame * 0.3) * 0.4} material={M.yellow()}><boxGeometry args={[0.4, 0.04, 0.3]} /></mesh>
    <mesh position={[0.95, 0.05, 0]} material={glow("#fff3c4", 1)}><sphereGeometry args={[0.07, 8, 6]} /></mesh>
    <spotLight position={[0.95, 0.05, 0]} intensity={6} distance={8} angle={0.5} penumbra={0.6} color="#fff3c4" />
  </group>
);

/** A small inflatable boat with three crew. */
export const Boat: React.FC<{ position?: V3; frame: number; turn?: number }> = ({ position = [0, 0, 0], frame, turn = 0 }) => {
  const rubber = M.rubber();
  return (
    <group position={position} rotation={[Math.sin(frame * 0.07) * 0.05, 0, Math.sin(frame * 0.05) * 0.04]}>
      {[-0.9, 0.9].map((z) => <mesh key={z} position={[0, 0, z]} rotation-z={Math.PI / 2} material={rubber}><capsuleGeometry args={[0.35, 4, 4, 12]} /></mesh>)}
      <mesh position={[0, -0.1, 0]} material={M.dark()}><boxGeometry args={[4.4, 0.2, 1.8]} /></mesh>
      {[-1.2, 0, 1.2].map((x, i) => <Folk key={i} position={[x, 0, 0]} h={1.6} color={["#e8b21c", "#3e5a78", "#e8b21c"][i]} yaw={turn * (i - 1)} />)}
    </group>
  );
};

/** An underwater robot (ROV): a yellow frame box with lamps and two spotlights sweeping. */
export const Robot: React.FC<{ position?: V3; frame: number; yaw?: number }> = ({ position = [0, 0, 0], frame, yaw = 0 }) => (
  <group position={position} rotation-y={yaw}>
    <mesh material={M.yellow()} castShadow><boxGeometry args={[2.4, 1.3, 1.6]} /></mesh>
    <mesh position={[0, 0.8, 0]} material={M.white()}><boxGeometry args={[2.2, 0.3, 1.5]} /></mesh>
    {[-0.5, 0.5].map((z) => <mesh key={z} position={[1.25, -0.3, z]} material={glow("#fff6d8", 1)}><sphereGeometry args={[0.12, 10, 8]} /></mesh>)}
    <spotLight position={[1.3, -0.3, 0]} intensity={60} distance={30} angle={0.5} penumbra={0.5} color="#fff6d8" />
    <mesh position={[-1.3, 0.2, 0]} rotation-z={Math.PI / 2} material={M.dark()}><cylinderGeometry args={[0.25, 0.25, 0.3, 14]} /></mesh>
  </group>
);

/** What was found on the seabed: the white tail cone, the two titanium domes, light fragments around. */
export const DebrisField: React.FC = () => (
  <group>
    <mesh position={[0, 0.7, 0]} rotation={[0.2, 0.6, Math.PI / 2 + 0.15]} material={M.white()} castShadow><cylinderGeometry args={[0.9, 0.3, 2.2, 28, 1, true]} /></mesh>
    {[[4, 0.5, 2.5, 0.4], [-3.5, 0.5, 3, 2.2]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x!, y!, z!]} rotation={[r!, r! * 0.5, 0.3]} material={M.titanium()} castShadow><sphereGeometry args={[0.86, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
    ))}
    {Array.from({ length: 24 }, (_, i) => (
      <mesh key={i} position={[(rnd("frag", i) - 0.5) * 12, 0.08, (rnd("frag", i + 40) - 0.5) * 9]} rotation={[rnd("frag", i + 80) * 3, rnd("frag", i + 120) * 3, 0]} material={i % 3 ? M.carbon() : M.white()}>
        <boxGeometry args={[0.2 + rnd("frag", i + 160) * 0.7, 0.04, 0.2 + rnd("frag", i + 200) * 0.5]} />
      </mesh>
    ))}
  </group>
);

/** A search plane crossing high over the sea. */
export const Plane: React.FC<{ position?: V3 }> = ({ position = [0, 0, 0] }) => (
  <group position={position}>
    <mesh rotation-z={Math.PI / 2} material={M.grey()}><capsuleGeometry args={[0.8, 7, 4, 16]} /></mesh>
    {[-4.5, -2.4, 2.4, 4.5].map((z) => <mesh key={z} position={[0.9, 0.05, z]} rotation-z={Math.PI / 2} material={M.dark()}><cylinderGeometry args={[0.32, 0.32, 1.3, 14]} /></mesh>)}
    <mesh position={[3.9, 0.1, 0]} material={M.dark()}><sphereGeometry args={[0.45, 12, 8]} /></mesh>
    <mesh position={[0.3, 0.3, 0]} material={M.grey()}><boxGeometry args={[1.6, 0.15, 13]} /></mesh>
    <mesh position={[-3.2, 1, 0]} material={M.grey()}><boxGeometry args={[0.9, 1.8, 0.15]} /></mesh>
    <mesh position={[-3.2, 0.4, 0]} material={M.grey()}><boxGeometry args={[0.8, 0.12, 4]} /></mesh>
  </group>
);

/** The underside of the surface, seen from below: a bright rippling sheet. */
export const SurfaceFromBelow: React.FC<{ y?: number; frame: number; k?: number }> = ({ y = 0, frame, k = 1 }) => (
  <group position={[0, y, 0]}>
    <mesh rotation-x={Math.PI / 2}>
      <planeGeometry args={[300, 300]} />
      <meshBasicMaterial color="#8fd3ff" transparent opacity={0.55 * k} side={2} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[(rnd("ray", i) - 0.5) * 50 + Math.sin(frame * 0.01 + i) * 2, -10, (rnd("ray", i + 30) - 0.5) * 40]} rotation-z={0.15} material={glow("#bfe8ff", 0.06 * k)}>
        <cylinderGeometry args={[0.6, 2.4, 20, 8, 1, true]} />
      </mesh>
    ))}
  </group>
);

export default Titan;
