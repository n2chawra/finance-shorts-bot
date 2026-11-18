// Parts: the models and places this video's beats share (all procedural, nothing downloaded).
// A microwave oven, a candy bar that melts, a magnetron (outside and cut open: the anode ring with its
// cavities and the electron wheel), wave rings, water molecules, a popcorn kernel, the tall 1947
// Radarange cabinet, and three places: a kitchen at night, a wartime radar lab, a workshop.
// Everything is a function of the frame passed in (`f`, the beat's story frame); no figures here.
import React from "react";
import { Easing } from "remotion";
import { Block, cue, glow, mat, rnd, TECH, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const WARM = "#ffb84a";
export const CHOC = "#5a2f1b";
export const WRAP = "#c8202a";

// ------------------------------------------------------------------ microwave oven (today's)
/** Width 1.6, height 0.95, depth 1.1, standing on y=0, door facing +z.
 * `on` 0..1 lights the window, `plate` is the plate's turn (radians), `xray` 0..1 fades the shell to
 * show the small magnetron glowing inside. */
export const Microwave: React.FC<Group & { on?: number; plate?: number; xray?: number; badge?: number }> = ({ on = 1, plate = 0, xray = 0, badge = 0, ...g }) => {
  const W = 1.6, H = 0.95, D = 1.1;
  const shell = xray > 0.02 ? mat("glass", "#9fc7e8", { opacity: 0.85 - 0.6 * Math.round(xray * 10) / 10 }) : mat("brushed", "#c9ced8");
  return (
    <group {...g}>
      <Block size={[W, H, D]} radius={0.06} material={shell} position={[0, H / 2 + 0.03, 0]} />
      {/* feet */}
      {[-1, 1].map((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.12), 0.015, sz * (D / 2 - 0.12)]} material={mat("rubber")}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
        </mesh>
      )))}
      {/* door: dark frame, glowing window, the plate turning behind it */}
      <mesh position={[-0.2, H / 2 + 0.03, D / 2 + 0.006]} material={mat("glossy", "#14171f")}>
        <boxGeometry args={[1.1, 0.8, 0.012]} />
      </mesh>
      <mesh position={[-0.2, H / 2 + 0.03, D / 2 + 0.014]} material={glow(WARM, 0.15 + 0.55 * on)}>
        <planeGeometry args={[0.86, 0.56]} />
      </mesh>
      <group position={[-0.2, H / 2 - 0.14, D / 2 + 0.02]} rotation-x={Math.PI / 2 - 0.25}>
        <mesh rotation-y={plate} material={mat("glass", "#ffffff", { opacity: 0.6 })}>
          <cylinderGeometry args={[0.32, 0.32, 0.01, 40]} />
        </mesh>
        <mesh rotation-y={plate} position={[0.12, 0.04, 0]} material={mat("clay", "#e7d9c0")}>
          <cylinderGeometry args={[0.1, 0.07, 0.07, 24]} />
        </mesh>
      </group>
      {/* the control panel and its buttons */}
      <mesh position={[0.6, H / 2 + 0.03, D / 2 + 0.006]} material={mat("glossy", "#1a1d26")}>
        <boxGeometry args={[0.3, 0.8, 0.012]} />
      </mesh>
      <mesh position={[0.6, H / 2 + 0.26, D / 2 + 0.014]} material={glow("#7cf2a6", 0.5 + 0.4 * on)}>
        <planeGeometry args={[0.22, 0.08]} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0.54 + (i % 3) * 0.06, H / 2 + 0.13 - Math.floor(i / 3) * 0.07, D / 2 + 0.016]} material={mat("white", "#9aa3b5")}>
          <boxGeometry args={[0.045, 0.045, 0.01]} />
        </mesh>
      ))}
      <mesh position={[0.6, H / 2 - 0.22, D / 2 + 0.02]} rotation-x={Math.PI / 2} material={mat("brushed")}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 24]} />
      </mesh>
      {/* the badge that glows on "Raytheon" */}
      {badge > 0.01 && (
        <mesh position={[-0.2, H - 0.02, D / 2 + 0.016]} material={glow(TECH.cyan, Math.round(badge * 10) / 10)}>
          <planeGeometry args={[0.36, 0.05]} />
        </mesh>
      )}
      {/* the small magnetron inside, seen when the shell turns see-through */}
      {xray > 0.02 && <Magnetron scale={0.22} position={[0.55, 0.3, -0.15]} heat={xray} />}
    </group>
  );
};

// ------------------------------------------------------------------ candy bar
/** Length 0.7 along x, standing on y=0. `melt` 0..1: the bar sags into a puddle, drips grow off its end
 * (toward +x). `wrapped` keeps the red wrapper on the left half. */
export const CandyBar: React.FC<Group & { melt?: number; f?: number; wrapped?: boolean }> = ({ melt = 0, f = 0, wrapped = true, ...g }) => {
  const N = 6, L = 0.7, T = 0.09, Wd = 0.26;
  const seg = L / N;
  const m = Math.min(1, Math.max(0, melt));
  return (
    <group {...g}>
      {Array.from({ length: N }, (_, i) => {
        const x = -L / 2 + seg * (i + 0.5);
        const soft = wrapped && i < 3 ? m * 0.25 : m;
        const sag = soft * (0.35 + 0.65 * (i / (N - 1)));
        const h = T * (1 - 0.6 * sag);
        return (
          <group key={i} position={[x + sag * 0.04 * i, h / 2, 0]} scale={[1 + 0.25 * sag, 1, 1 + 0.35 * sag]}>
            <Block size={[seg * 0.94, h, Wd]} radius={0.015 + 0.02 * sag} material={mat("glossy", CHOC, { roughness: 0.3 - 0.2 * Math.round(sag * 5) / 5, clearcoat: 0.6 })} />
          </group>
        );
      })}
      {wrapped && (
        <group position={[-L / 4 - 0.01, T * 0.55, 0]}>
          <Block size={[L / 2 + 0.03, T * 1.15, Wd + 0.03]} radius={0.02} material={mat("glossy", WRAP, { clearcoat: 1 })} />
          <mesh position={[0.02, T * 0.6, 0]} rotation-x={-Math.PI / 2} material={glow("#fff3d6", 0.85)}>
            <planeGeometry args={[0.2, 0.07]} />
          </mesh>
        </group>
      )}
      {/* the puddle and drips past its melted end */}
      {m > 0.05 && (
        <>
          <mesh position={[L / 2 + 0.02, 0.004, 0]} scale={[0.15 + 0.3 * m, 1, 0.15 + 0.22 * m]} material={mat("glossy", CHOC, { roughness: 0.08, clearcoat: 1 })}>
            <cylinderGeometry args={[1, 1, 0.008, 32]} />
          </mesh>
          {[0, 1, 2].map((i) => {
            const k = Math.max(0, m - 0.25 - i * 0.18);
            const fall = ((f * 0.02 + i * 0.37) % 1) * k;
            return k > 0 ? (
              <mesh key={i} position={[L / 2 + 0.03 + i * 0.05, -0.03 - fall * 0.35, (i - 1) * 0.06]} scale={[1, 1.4 + k, 1]} material={mat("glossy", CHOC, { roughness: 0.1 })}>
                <sphereGeometry args={[0.025 + 0.015 * k, 16, 12]} />
              </mesh>
            ) : null;
          })}
        </>
      )}
    </group>
  );
};

// ------------------------------------------------------------------ magnetron (outside)
/** About 1.4 tall: a copper body in a stack of cooling fins, magnets above and below, the antenna on top.
 * `heat` 0..1 lights the copper and the antenna. */
export const Magnetron: React.FC<Group & { heat?: number }> = ({ heat = 0, ...g }) => {
  const h = Math.round(heat * 10) / 10;
  return (
    <group {...g}>
      <mesh position={[0, 0.06, 0]} material={mat("brushed", "#8d939e")} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.12, 1.3]} />
      </mesh>
      <mesh position={[0, 0.62, 0]} material={mat("copper", undefined, { emissive: "#ff6a20", emissiveIntensity: 0.6 * h })} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.9, 40]} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, 0.24 + i * 0.09, 0]} material={mat("aluminium")} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.018, 1.05]} />
        </mesh>
      ))}
      {[0.14, 1.12].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={mat("ceramic", "#3a3f4a")} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 40]} />
        </mesh>
      ))}
      <mesh position={[0, 1.3, 0]} material={mat("brushed")} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.26, 24]} />
      </mesh>
      <mesh position={[0, 1.47, 0]} material={h > 0.05 ? glow(WARM, 0.4 + 0.6 * h) : mat("brushed")}>
        <sphereGeometry args={[0.1, 24, 16]} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ the anode ring, cut open (top view)
export const CAVS = 8;
/** The cavity ring in the x/z plane, radius 1.6 outside. `wheel` the electron wheel's angle (radians),
 * `cloud` 0..1 how far the electrons have left the centre wire, `spokes` 0..1 how far they have curled
 * into spokes, `lit[i]` each cavity's glow. */
export const AnodeRing: React.FC<Group & { wheel?: number; cloud?: number; spokes?: number; lit?: number[]; f?: number }> = ({ wheel = 0, cloud = 0, spokes = 0, lit = [], f = 0, ...g }) => {
  const R_IN = 0.75, R_OUT = 1.6, CAV_R = 1.18;
  const vane = (Math.PI * 2) / CAVS;
  return (
    <group {...g}>
      {/* the copper vanes between the cavities */}
      {Array.from({ length: CAVS }, (_, i) => {
        const a = vane * i;
        const r = (R_IN + R_OUT) / 2;
        return (
          <mesh key={`v${i}`} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} rotation-y={-a} material={mat("copper")} castShadow receiveShadow>
            <boxGeometry args={[R_OUT - R_IN, 0.4, 0.42]} />
          </mesh>
        );
      })}
      {/* the outer wall */}
      <mesh material={mat("copper", "#c9773f")} receiveShadow>
        <cylinderGeometry args={[R_OUT + 0.18, R_OUT + 0.18, 0.4, 64, 1, true]} />
      </mesh>
      <mesh position={[0, -0.2, 0]} rotation-x={-Math.PI / 2} material={mat("copper", "#b86a36")}>
        <ringGeometry args={[0.15, R_OUT + 0.18, 64]} />
      </mesh>
      {/* the round holes at the back of each cavity (the keyholes), lit as the spokes pass */}
      {Array.from({ length: CAVS }, (_, i) => {
        const a = vane * (i + 0.5);
        const l = Math.round((lit[i] ?? 0) * 10) / 10;
        return (
          <group key={`c${i}`} position={[Math.cos(a) * CAV_R, 0.0, Math.sin(a) * CAV_R]}>
            <mesh material={mat("copper", "#7a4422")}>
              <cylinderGeometry args={[0.2, 0.2, 0.42, 28, 1, true]} />
            </mesh>
            {l > 0.05 && (
              <mesh position={[0, 0.215, 0]} rotation-x={-Math.PI / 2} material={glow(TECH.amber, l)}>
                <circleGeometry args={[0.19, 28]} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* the centre wire (cathode), glowing */}
      <mesh material={glow("#ffd7a0", 0.9)}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 20]} />
      </mesh>
      {/* the electrons: a cloud leaving the wire, curled into a turning wheel of spokes */}
      {cloud > 0.01 && Array.from({ length: 7 * 14 }, (_, k) => {
        const s = k % 7, j = Math.floor(k / 7);
        const t = j / 13;
        const r = 0.16 + t * (R_IN - 0.2) * cloud;
        const base = (Math.PI * 2 * s) / 7 + rnd("e", k) * (1 - spokes) * Math.PI * 2;
        const a = base + wheel + spokes * t * 1.1;
        const y = (rnd("ey", k) - 0.5) * 0.24 * (1 - 0.5 * spokes) + Math.sin(f * 0.3 + k) * 0.01;
        return (
          <mesh key={k} position={[Math.cos(a) * r, y + 0.05, Math.sin(a) * r]} material={glow(TECH.cyan, 0.9)}>
            <sphereGeometry args={[0.03, 8, 6]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Which cavities a spoke is passing at wheel angle `wheel` (0..1 glow per cavity). */
export function cavityLight(wheel: number, k = 1): number[] {
  const vane = (Math.PI * 2) / CAVS;
  return Array.from({ length: CAVS }, (_, i) => {
    let best = 0;
    for (let s = 0; s < 7; s++) {
      const a = (Math.PI * 2 * s) / 7 + wheel + 0.8;
      const d = Math.abs(Math.atan2(Math.sin(a - vane * (i + 0.5)), Math.cos(a - vane * (i + 0.5))));
      best = Math.max(best, Math.max(0, 1 - d / 0.45));
    }
    return best * k;
  });
}

// ------------------------------------------------------------------ waves
/** Rings of waves leaving `at`, one every `every` frames from `start`, growing to `reach` and fading.
 * `axis` "y": flat rings (seen from above); "z": rings facing the camera. */
export const WaveRings: React.FC<Group & { f: number; start: number; every?: number; reach?: number; color?: string; axis?: "y" | "z"; stop?: number }> = ({ f, start, every = 10, reach = 2, color = WARM, axis = "z", stop, ...g }) => {
  if (f < start) return null;
  const life = every * 3;
  const out: React.ReactNode[] = [];
  for (let n = Math.floor((f - start) / every); n >= 0 && (f - start - n * every) < life; n--) {
    const t0 = start + n * every;
    if (stop !== undefined && t0 > stop) continue;
    const k = (f - t0) / life;
    const r = 0.1 + reach * k;
    const o = Math.round((1 - k) * 0.9 * 10) / 10;
    if (o <= 0) continue;
    out.push(
      <mesh key={n} rotation-x={axis === "y" ? -Math.PI / 2 : 0} material={glow(color, o)}>
        <torusGeometry args={[r, 0.012 + 0.01 * (1 - k), 8, 64]} />
      </mesh>,
    );
  }
  return <group {...g}>{out}</group>;
};

// ------------------------------------------------------------------ a water molecule
/** O with two H at 104.5° (about 0.6 across). `heat` 0..1 tints it from blue to orange. */
export const Water: React.FC<Group & { heat?: number }> = ({ heat = 0, ...g }) => {
  const q = Math.round(heat * 6) / 6;
  const ox = q > 0.5 ? "#ff6a3d" : "#e2453c";
  const hc = q > 0.5 ? "#ffd2a8" : "#e9eef8";
  const a = (104.5 / 2) * (Math.PI / 180);
  return (
    <group {...g}>
      <mesh material={mat("glossy", ox, { roughness: 0.3, emissive: ox, emissiveIntensity: 0.15 + 0.8 * q })} castShadow>
        <sphereGeometry args={[0.2, 28, 20]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[Math.sin(a) * 0.26 * s, -Math.cos(a) * 0.26, 0]} material={mat("glossy", hc, { roughness: 0.3, emissive: q > 0.5 ? WARM : "#6fb8ff", emissiveIntensity: 0.1 + 0.6 * q })} castShadow>
          <sphereGeometry args={[0.12, 24, 16]} />
        </mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ popcorn
/** A kernel that bursts into a puff at `pop` (0..1). About 0.5 across. */
export const Kernel: React.FC<Group & { pop?: number }> = ({ pop = 0, ...g }) => {
  const p = Math.min(1, Math.max(0, pop));
  if (p < 0.05) {
    return (
      <group {...g}>
        <mesh scale={[0.18, 0.24, 0.16]} material={mat("glossy", "#e8b23a", { roughness: 0.35, clearcoat: 0.8 })} castShadow>
          <sphereGeometry args={[1, 24, 18]} />
        </mesh>
      </group>
    );
  }
  return (
    <group {...g} scale={0.6 + 0.6 * Easing.out(Easing.back(2))(p)}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.16, 0.05 + rnd("pc", i) * 0.12, Math.sin(a) * 0.16]} material={mat("clay", "#fff6e0")} castShadow>
            <sphereGeometry args={[0.15 + rnd("pr", i) * 0.06, 18, 14]} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.06, 0]} scale={[0.12, 0.08, 0.1]} material={mat("glossy", "#c98a24")}>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ the 1947 Radarange
/** A cabinet 1.7 tall, 0.9 wide, 0.75 deep, on y=0, door at the top facing +z. */
export const RADARANGE_H = 1.7;
export const Radarange: React.FC<Group & { on?: number; plate?: number }> = ({ on = 0, plate = 0, ...g }) => {
  const H = RADARANGE_H, W = 0.9, D = 0.75;
  return (
    <group {...g}>
      <Block size={[W, H, D]} radius={0.05} preset="white" color="#d9d4c4" position={[0, H / 2, 0]} />
      {/* the oven door near the top, with its window */}
      <mesh position={[0, H - 0.38, D / 2 + 0.006]} material={mat("brushed", "#a7adb8")}>
        <boxGeometry args={[0.72, 0.48, 0.012]} />
      </mesh>
      <mesh position={[0, H - 0.38, D / 2 + 0.014]} material={glow(WARM, 0.12 + 0.6 * on)}>
        <planeGeometry args={[0.5, 0.3]} />
      </mesh>
      <mesh position={[0, H - 0.42, D / 2 + 0.02]} rotation-x={Math.PI / 2 - 0.3} rotation-y={plate} material={mat("clay", "#e7e2d6")}>
        <cylinderGeometry args={[0.16, 0.16, 0.01, 30]} />
      </mesh>
      {/* the handle and the lower panels with their louvres */}
      <mesh position={[0, H - 0.1, D / 2 + 0.04]} rotation-z={Math.PI / 2} material={mat("brushed")}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, 0.25 + i * 0.07, D / 2 + 0.006]} material={mat("blackPlastic", "#3b3f48")}>
          <boxGeometry args={[0.6, 0.02, 0.01]} />
        </mesh>
      ))}
      {/* the dials */}
      {[-0.2, 0, 0.2].map((x) => (
        <mesh key={x} position={[x, H - 0.75, D / 2 + 0.02]} rotation-x={Math.PI / 2} material={mat("glossy", "#20232b")}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
        </mesh>
      ))}
      {/* the nameplate */}
      <mesh position={[0, H - 0.68, D / 2 + 0.008]} material={mat("gold")}>
        <boxGeometry args={[0.4, 0.06, 0.008]} />
      </mesh>
    </group>
  );
};

/** A person's outline at true height (1.75), clay. */
export const Person: React.FC<Group> = (g) => (
  <group {...g}>
    <mesh position={[0, 0.82, 0]} material={mat("clay", "#b9c3d6")} castShadow><capsuleGeometry args={[0.2, 0.9, 6, 16]} /></mesh>
    <mesh position={[0, 1.58, 0]} material={mat("clay", "#b9c3d6")} castShadow><sphereGeometry args={[0.15, 24, 16]} /></mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.27, 0.95, 0]} rotation-z={s * 0.12} material={mat("clay", "#b9c3d6")} castShadow><capsuleGeometry args={[0.06, 0.6, 6, 12]} /></mesh>
    ))}
  </group>
);

// ------------------------------------------------------------------ places
/** A kitchen at night: a stone counter (top at y=0, front edge at z=0.9), tiled wall, wall cabinets,
 * a dark window with the city behind it, a pendant lamp. `lights` 0..1 brings the room lights up. */
export const Kitchen: React.FC<Group & { lights?: number }> = ({ lights = 0, ...g }) => (
  <group {...g}>
    <Block size={[9, 0.12, 2]} radius={0.03} preset="glossy" color="#2c2f36" position={[0, -0.06, 0]} />
    <Block size={[9, 1.8, 1.8]} radius={0.02} preset="clay" color="#3d3a37" position={[0, -1.02, 0.05]} />
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[-3.75 + i * 1.5, -1.0, 0.96]} material={mat("brushed")}>
        <boxGeometry args={[0.4, 0.04, 0.04]} />
      </mesh>
    ))}
    {/* the wall: tiles and the window */}
    <mesh position={[0, 1.6, -1]} material={mat("clay", lights > 0.5 ? "#5d6470" : "#3a4050")} receiveShadow>
      <boxGeometry args={[9, 3.6, 0.05]} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[-4.5 + i * 0.75, 0.6, -0.97]} material={mat("white", "#4a5160")}>
        <boxGeometry args={[0.012, 1.2, 0.01]} />
      </mesh>
    ))}
    <mesh position={[2.6, 1.3, -0.96]} material={glow("#1c3a7a", 0.55)}>
      <planeGeometry args={[1.8, 1.2]} />
    </mesh>
    {Array.from({ length: 14 }, (_, i) => (
      <mesh key={i} position={[1.85 + i * 0.11, 0.85 + rnd("win", i) * 0.4, -0.95]} material={glow(i % 3 ? "#ffd27a" : "#9fd0ff", 0.6)}>
        <planeGeometry args={[0.03, 0.03]} />
      </mesh>
    ))}
    <Block size={[1.9, 0.06, 0.08]} preset="brushed" position={[2.6, 1.93, -0.92]} />
    <Block size={[1.9, 0.06, 0.08]} preset="brushed" position={[2.6, 0.67, -0.92]} />
    {/* wall cabinets */}
    {[-3.4, -2.2, -1.0, 0.2].map((x) => (
      <Block key={x} size={[1.12, 1.0, 0.6]} radius={0.03} preset="clay" color="#4a4642" position={[x, 2.6, -0.7]} />
    ))}
    {/* the pendant lamp */}
    <mesh position={[0.6, 3.1, 0.2]} material={mat("brushed")}><cylinderGeometry args={[0.01, 0.01, 1.4, 6]} /></mesh>
    <mesh position={[0.6, 2.35, 0.2]} material={mat("glossy", "#1a1a1a")}><coneGeometry args={[0.3, 0.3, 32, 1, true]} /></mesh>
    <mesh position={[0.6, 2.25, 0.2]} material={glow(WARM, 0.5 + 0.5 * lights)}><sphereGeometry args={[0.08, 16, 12]} /></mesh>
    <pointLight position={[0.6, 2.1, 0.4]} intensity={2 + 10 * lights} distance={8} color={WARM} />
  </group>
);

/** A wartime radar lab: a long bench (top at y=0), a back wall with a shelf of dials, a desk lamp. */
export const Lab: React.FC<Group & { f?: number }> = ({ f = 0, ...g }) => (
  <group {...g}>
    <Block size={[8, 0.1, 2]} radius={0.02} preset="clay" color="#5b4a39" position={[0, -0.05, 0]} />
    <Block size={[8, 1.6, 1.8]} radius={0.02} preset="clay" color="#3d4a44" position={[0, -0.9, 0]} />
    <mesh position={[0, 1.8, -1.05]} material={mat("clay", "#33423c")} receiveShadow>
      <boxGeometry args={[10, 4, 0.05]} />
    </mesh>
    <Block size={[6, 0.06, 0.4]} preset="clay" color="#5b4a39" position={[0, 1.6, -0.85]} />
    {Array.from({ length: 7 }, (_, i) => (
      <group key={i} position={[-2.6 + i * 0.85, 1.85, -0.85]}>
        <Block size={[0.6, 0.44, 0.3]} radius={0.03} preset="blackPlastic" color="#2a2f2c" />
        <mesh position={[0, 0.02, 0.16]} material={glow(i % 2 ? "#7cf2a6" : WARM, 0.35 + 0.25 * Math.max(0, Math.sin(f * 0.15 + i * 1.7)))}>
          <circleGeometry args={[0.12, 24]} />
        </mesh>
      </group>
    ))}
    {/* the desk lamp */}
    <group position={[-2.6, 0, -0.3]}>
      <mesh position={[0, 0.03, 0]} material={mat("glossy", "#26302b")}><cylinderGeometry args={[0.2, 0.22, 0.06, 24]} /></mesh>
      <mesh position={[0.15, 0.5, 0]} rotation-z={-0.3} material={mat("brushed")}><cylinderGeometry args={[0.02, 0.02, 1, 8]} /></mesh>
      <mesh position={[0.4, 0.98, 0]} rotation-z={0.9} material={mat("glossy", "#26302b")}><coneGeometry args={[0.2, 0.3, 24, 1, true]} /></mesh>
      <mesh position={[0.48, 0.92, 0]} material={glow("#fff0c8", 0.9)}><sphereGeometry args={[0.06, 12, 10]} /></mesh>
      <pointLight position={[0.55, 0.8, 0.2]} intensity={6} distance={5} color="#ffe2a8" />
    </group>
  </group>
);

/** A radar dish on a stand (about 1.4 tall), turning by `turn`, and a round scope beside it with a sweep. */
export const Radar: React.FC<Group & { turn?: number; sweep?: number }> = ({ turn = 0, sweep = 0, ...g }) => (
  <group {...g}>
    <mesh position={[0, 0.35, 0]} material={mat("brushed", "#7e8794")} castShadow><cylinderGeometry args={[0.05, 0.12, 0.7, 16]} /></mesh>
    <group position={[0, 0.85, 0]} rotation-y={turn}>
      <mesh rotation-x={-Math.PI / 2 + 0.5} material={mat("brushed", "#cfd5de", { side: 2 })} castShadow>
        <sphereGeometry args={[0.7, 40, 12, 0, Math.PI * 2, 0, 0.75]} />
      </mesh>
      <mesh position={[0, 0.1, 0.3]} rotation-x={0.5} material={mat("brushed")}><cylinderGeometry args={[0.015, 0.015, 0.5, 8]} /></mesh>
    </group>
    {/* the scope */}
    <group position={[1.1, 0.35, 0.2]}>
      <Block size={[0.7, 0.7, 0.4]} radius={0.04} preset="blackPlastic" color="#2c332f" />
      <mesh position={[0, 0.02, 0.205]} material={glow("#0f3a22", 1)}><circleGeometry args={[0.26, 40]} /></mesh>
      <mesh position={[0, 0.02, 0.21]} rotation-z={sweep} material={glow("#7cf2a6", 0.95)}>
        <planeGeometry args={[0.012, 0.26]} />
      </mesh>
      {[0.3, 1.4, 2.6].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.15, 0.02 + Math.sin(a) * 0.15, 0.212]} material={glow("#a8ffcf", Math.round(Math.max(0, Math.cos(sweep - a)) * 10) / 10 || 0.1)}>
          <circleGeometry args={[0.018, 12]} />
        </mesh>
      ))}
    </group>
  </group>
);

/** A white lab coat on a stand (about 1.9 tall), its chest pocket at POCKET (relative to the stand). */
export const POCKET: V3 = [0.2, 1.38, 0.2];
export const Coat: React.FC<Group> = (g) => (
  <group {...g}>
    <mesh position={[0, 0.9, 0]} material={mat("brushed", "#6e5a44")}><cylinderGeometry args={[0.03, 0.03, 1.8, 8]} /></mesh>
    <mesh position={[0, 0.02, 0]} material={mat("brushed", "#6e5a44")}><cylinderGeometry args={[0.3, 0.3, 0.04, 20]} /></mesh>
    <mesh position={[0, 1.1, 0]} scale={[1, 1, 0.55]} material={mat("clay", "#eceff3")} castShadow>
      <cylinderGeometry args={[0.36, 0.44, 1.0, 28]} />
    </mesh>
    <mesh position={[0, 1.65, 0]} scale={[1, 0.5, 0.6]} material={mat("clay", "#eceff3")} castShadow>
      <sphereGeometry args={[0.38, 24, 16]} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.44, 1.12, 0]} rotation-z={s * 0.08} material={mat("clay", "#e2e6ec")} castShadow>
        <capsuleGeometry args={[0.1, 0.8, 6, 12]} />
      </mesh>
    ))}
    {/* lapels and the pocket */}
    <mesh position={[0, 1.42, 0.2]} rotation-z={Math.PI / 4} material={mat("clay", "#dfe3ea")}><boxGeometry args={[0.16, 0.16, 0.02]} /></mesh>
    <mesh position={[POCKET[0], POCKET[1] - 0.06, POCKET[2] + 0.02]} material={mat("clay", "#dde2ea")}><boxGeometry args={[0.24, 0.2, 0.02]} /></mesh>
  </group>
);

/** A workshop: a steel workbench (top at y=0) and a pegboard wall with tools. */
export const Workshop: React.FC<Group> = (g) => (
  <group {...g}>
    <Block size={[6, 0.1, 2]} radius={0.02} preset="brushed" color="#7b828d" position={[0, -0.05, 0]} />
    {[-2.6, 2.6].map((x) => [-0.8, 0.8].map((z) => (
      <mesh key={`${x}${z}`} position={[x, -0.9, z]} material={mat("brushed", "#555b66")}><boxGeometry args={[0.08, 1.7, 0.08]} /></mesh>
    )))}
    <mesh position={[0, 1.7, -1.1]} material={mat("clay", "#5a4a3a")} receiveShadow><boxGeometry args={[9, 4, 0.05]} /></mesh>
    {Array.from({ length: 60 }, (_, i) => (
      <mesh key={i} position={[-2.9 + (i % 12) * 0.5, 0.8 + Math.floor(i / 12) * 0.4, -1.07]} material={mat("blackPlastic", "#2b241d")}>
        <circleGeometry args={[0.03, 8]} />
      </mesh>
    ))}
    {[-2.2, -1.1, 1.3, 2.4].map((x, i) => (
      <mesh key={x} position={[x, 1.3 + (i % 2) * 0.3, -1.04]} rotation-z={0.3 * (i - 1.5)} material={mat("brushed")}>
        <boxGeometry args={[0.08, 0.7, 0.03]} />
      </mesh>
    ))}
  </group>
);

const Parts = { Microwave, CandyBar, Magnetron, AnodeRing, WaveRings, Water, Kernel, Radarange, Person, Kitchen, Lab, Radar, Coat, Workshop };
export default Parts;

/** 0..1 between two frames, eased. */
export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
