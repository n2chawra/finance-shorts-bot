// The disasters channel's 3D look system: one look per video (references §9), read by every piece of
// the disaster kit through context. A look sets the stage (backdrop, floor, fog, lights, the look
// pass) and how things are painted: `paint(role, colour)` returns a cached material, so in the Clay
// Studio look a jet's livery becomes warm white clay with one accent, in Blueprint everything is pale
// line-blue, and so on. Red always means the failure (RAMP).
import React, { createContext, useContext } from "react";
import * as THREE from "three";
import { Stage3D, type Stage3DProps } from "../Stage3D";

export type DLookName = "nightGrid" | "blueprint" | "clay" | "chalk" | "storm" | "crossSection";

/** What a material is for; each look maps a role to a material. */
export type Role = "body" | "trim" | "metal" | "glass" | "dark" | "accent" | "concrete" | "steel" | "water" | "ground" | "rubber";

export type DLook = {
  name: DLookName;
  stage: Partial<Stage3DProps>;
  /** every role painted as clay (colours ignored except the accent) */
  clay: boolean;
  accent: string;
  /** default colours per role when a piece gives none */
  colors: Record<Role, string>;
  /** sky / fog colour for atmospherics */
  sky: string;
  water: string;
  label: string;
};

/** grey → amber → red: the stress ramp (red always means the failure) */
export const RAMP = { calm: "#9aa3ad", warn: "#ffb23e", fail: "#ff3b30" } as const;
const rc = { calm: new THREE.Color(RAMP.calm), warn: new THREE.Color(RAMP.warn), fail: new THREE.Color(RAMP.fail) };
/** The ramp colour at v (0..1). */
export function rampColor(v: number, out = new THREE.Color()): THREE.Color {
  const t = Math.min(1, Math.max(0, v));
  return t < 0.5 ? out.copy(rc.calm).lerp(rc.warn, t * 2) : out.copy(rc.warn).lerp(rc.fail, (t - 0.5) * 2);
}

const BASE: Record<Role, string> = {
  body: "#e9edf2", trim: "#2c5aa0", metal: "#b9c0ca", glass: "#1a2230", dark: "#1c2028", accent: "#2f7de1",
  concrete: "#b8b4ac", steel: "#7f8a96", water: "#2a6f9e", ground: "#5d6656", rubber: "#25272c",
};

export const DISASTER_LOOKS: Record<DLookName, DLook> = {
  nightGrid: {
    name: "nightGrid", clay: false, accent: "#ff9a3c", sky: "#0d1b2a", water: "#123a5c", label: "#ff9a3c", colors: BASE,
    stage: { backdrop: { top: "#13263a", bottom: "#05090f", glow: "rgba(80,170,255,0.10)" }, floor: "reflect", bloom: 0.9, vignette: 0.55, rim: "#59c8ff", fog: { color: "#08111c", near: 14, far: 70 } },
  },
  blueprint: {
    name: "blueprint", clay: false, accent: "#ffd84a", sky: "#123a8a", water: "#5d8fe0", label: "#ffd84a",
    colors: { ...BASE, body: "#e6eeff", trim: "#c9d8ff", metal: "#d6e2ff", glass: "#2b56b5", dark: "#1d3f8f", concrete: "#d9e4ff", steel: "#bcd0ff", ground: "#1b438f" },
    stage: { backdrop: { top: "#1b4fb0", bottom: "#0b2a6b", glow: "rgba(255,255,255,0.08)" }, floor: { grid: true, opacity: 0.3 }, bloom: 0.5, vignette: 0.35, rim: "#ffffff", light: 0.9 },
  },
  clay: {
    name: "clay", clay: true, accent: "#2f7de1", sky: "#0b0b0d", water: "#78acd8", label: "#2f7de1", colors: BASE,
    stage: { backdrop: { top: "#1a1a1d", bottom: "#050506", glow: "rgba(255,240,220,0.06)" }, floor: true, bloom: 0.4, vignette: 0.5, rim: "#fff1df", light: 0.72 },
  },
  chalk: {
    name: "chalk", clay: false, accent: "#ffd400", sky: "#26292c", water: "#3d5966", label: "#ffd400",
    colors: { ...BASE, body: "#a9adb1", trim: "#ffd400", concrete: "#9fa2a3", steel: "#6d747a", ground: "#2e3133", dark: "#17191b" },
    stage: { backdrop: { top: "#33373b", bottom: "#141617", glow: "rgba(255,255,255,0.05)" }, floor: true, bloom: 0.5, vignette: 0.6, rim: "#fff6c8" },
  },
  storm: {
    name: "storm", clay: false, accent: "#ff8a2a", sky: "#3a434d", water: "#22333f", label: "#ff8a2a", colors: BASE,
    stage: { backdrop: { top: "#4a545e", bottom: "#161b20", glow: "rgba(255,150,60,0.08)" }, floor: false, bloom: 0.7, vignette: 0.6, rim: "#ffb070", light: 0.8, fog: { color: "#2b333b", near: 10, far: 55 } },
  },
  crossSection: {
    name: "crossSection", clay: true, accent: "#e0362c", sky: "#f4f5f7", water: "#8fc6ec", label: "#e0362c", colors: BASE,
    stage: { backdrop: { top: "#ffffff", bottom: "#e3e6ea", glow: "rgba(255,255,255,0.4)" }, floor: true, bloom: 0.3, vignette: 0.18, rim: "#ffffff", light: 0.8 },
  },
};

// ---------------------------------------------------------------- materials

const cache = new Map<string, THREE.Material>();

/** Warm white modelling clay with a soft ambient-occlusion feel: matte, a faint sheen, and a cavity
 * term that darkens surfaces facing away from the sky (a cheap AO; no extra pass). */
export function clayMat(color = "#efe9df", opts: { ao?: number; emissive?: string; emissiveIntensity?: number; opacity?: number } = {}): THREE.Material {
  const { ao = 0.35, emissive = "#000000", emissiveIntensity = 0, opacity = 1 } = opts;
  const key = `clay|${color}|${ao}|${emissive}|${emissiveIntensity}|${opacity}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const m = new THREE.MeshPhysicalMaterial({
    color, roughness: 0.9, metalness: 0, sheen: 0.35, sheenRoughness: 0.8, sheenColor: new THREE.Color("#ffffff"),
    emissive, emissiveIntensity, transparent: opacity < 1, opacity,
  });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vClayN;")
      .replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\nvClayN = normalize(mat3(modelMatrix) * objectNormal);");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vClayN;")
      .replace("#include <aomap_fragment>", `#include <aomap_fragment>
      float clayAo = mix(1.0 - ${ao.toFixed(3)}, 1.0, smoothstep(-0.9, 0.7, vClayN.y));
      reflectedLight.indirectDiffuse *= clayAo;
      reflectedLight.directDiffuse *= mix(1.0, clayAo, 0.5);`);
  };
  m.customProgramCacheKey = () => `dclay-${ao}`;
  cache.set(key, m);
  return m;
}

function painted(role: Role, color: string, look: DLook): THREE.Material {
  const key = `${look.name}|${role}|${color}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let m: THREE.Material;
  if (look.clay) {
    const c = role === "accent" || role === "trim" ? look.accent
      : role === "water" ? look.water
      : role === "glass" || role === "dark" || role === "rubber" ? "#5b5d62"
      : role === "ground" ? "#b5ab9c" : role === "concrete" ? "#d3cbbf" : role === "steel" || role === "metal" ? "#cfc9c0" : "#e4ddd2";
    m = role === "water"
      ? new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.85, clearcoat: 0.6 })
      : clayMat(c);
  } else if (look.name === "blueprint") {
    m = new THREE.MeshStandardMaterial({ color: role === "accent" ? look.accent : role === "water" ? look.water : color, roughness: 0.7, metalness: 0,
      transparent: role === "water" || role === "glass", opacity: role === "water" ? 0.75 : role === "glass" ? 0.6 : 1 });
  } else {
    const spec: THREE.MeshPhysicalMaterialParameters =
      role === "metal" ? { color, roughness: 0.35, metalness: 0.9 }
      : role === "steel" ? { color, roughness: 0.55, metalness: 0.6 }
      : role === "glass" ? { color, roughness: 0.08, metalness: 0.2, clearcoat: 1 }
      : role === "water" ? { color, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.88, clearcoat: 1 }
      : role === "concrete" || role === "ground" ? { color, roughness: 0.95, metalness: 0 }
      : role === "rubber" || role === "dark" ? { color, roughness: 0.7, metalness: 0.1 }
      : { color, roughness: 0.45, metalness: 0.05, clearcoat: 0.5, clearcoatRoughness: 0.3 };
    m = new THREE.MeshPhysicalMaterial(spec);
  }
  cache.set(key, m);
  return m;
}

const Ctx = createContext<DLook>(DISASTER_LOOKS.nightGrid);

export type Paint = (role: Role, color?: string) => THREE.Material;

/** The current look and a painter: `paint("body", livery.body)`. */
export function useDLook(): DLook & { paint: Paint } {
  const look = useContext(Ctx);
  return { ...look, paint: (role, color) => painted(role, color ?? look.colors[role], look) };
}

export const DLookProvider: React.FC<{ look: DLookName; children: React.ReactNode }> = ({ look, children }) => (
  <Ctx.Provider value={DISASTER_LOOKS[look]}>{children}</Ctx.Provider>
);

/** A Stage3D dressed in one of the channel's looks; explicit stage props still win. */
export const DisasterStage: React.FC<Omit<Stage3DProps, "look"> & { look?: DLookName }> = ({ look = "nightGrid", children, ...rest }) => {
  const L = DISASTER_LOOKS[look];
  return (
    <Stage3D {...(L.stage as Stage3DProps)} {...rest}>
      <DLookProvider look={look}>{children}</DLookProvider>
    </Stage3D>
  );
};
