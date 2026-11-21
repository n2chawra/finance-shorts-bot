/**
 * The dive kit's colour looks (README "Looks"): one per video, rotated so two videos never look alike.
 * A look paints the sky, the street, the ground bands, the deep background and the meter's accent; the
 * landmark, tunnel and vehicle colours come from each layer's own params.
 */
export interface DiveLook {
  name: string;
  skyTop: string; skyLow: string; sun: string; skyline: string;
  street: string; deep: string; accent: string; paper: string;
  soil: string; clay: string; sand: string; gravel: string; rock: string; rockLine: string; chalk: string; water: string;
  light: string;        // the default tunnel light
}

export const DIVE_LOOKS = {
  // the Grand Central sample (2026-11-21): late-afternoon sky, brown fill over grey schist
  dusk: { name: "dusk", skyTop: "#7fb2e6", skyLow: "#ffb27a", sun: "#ffd9a0", skyline: "#5d6a8e", street: "#3a3d4a", deep: "#231d27", accent: "#ffc43d", paper: "#f4f1e8",
    soil: "#6e4b35", clay: "#9a5b3c", sand: "#c9a26a", gravel: "#7d7468", rock: "#4f4a5a", rockLine: "#5f596b", chalk: "#d9d2bf", water: "#2f6f9a", light: "#ffe7a8" },
  noon: { name: "noon", skyTop: "#3f9cf5", skyLow: "#c9ecff", sun: "#fff6c9", skyline: "#7d93b8", street: "#41454f", deep: "#1b2230", accent: "#ffd23f", paper: "#ffffff",
    soil: "#8a5a3a", clay: "#b66a43", sand: "#d8b77a", gravel: "#8d857a", rock: "#5b6270", rockLine: "#6c7382", chalk: "#e6e0cf", water: "#2f86c2", light: "#fff3c2" },
  night: { name: "night", skyTop: "#0d1240", skyLow: "#3a2b78", sun: "#9d8cff", skyline: "#2a2f5a", street: "#22253a", deep: "#0e0d18", accent: "#4dd8ff", paper: "#e8ecff",
    soil: "#4a3a3f", clay: "#5d3c3a", sand: "#7d6a55", gravel: "#4f4c55", rock: "#2f3045", rockLine: "#3d3e57", chalk: "#9a96a8", water: "#1f4a7a", light: "#bfe3ff" },
  storm: { name: "storm", skyTop: "#5a6478", skyLow: "#a7b0bd", sun: "#e8eef7", skyline: "#454c5c", street: "#2f333c", deep: "#16191f", accent: "#ff8a3d", paper: "#eef1f5",
    soil: "#5b4a3e", clay: "#7a5845", sand: "#a8977a", gravel: "#6c6a68", rock: "#3e434e", rockLine: "#4c525e", chalk: "#c4c2ba", water: "#2c5a78", light: "#ffe0b8" },
  desert: { name: "desert", skyTop: "#ff9e5e", skyLow: "#ffe1a1", sun: "#fff1c4", skyline: "#c0705a", street: "#5a4038", deep: "#2a1712", accent: "#ffe14d", paper: "#fff6e6",
    soil: "#a8673f", clay: "#c4764a", sand: "#e3b873", gravel: "#9c7f66", rock: "#6d4a43", rockLine: "#7e5850", chalk: "#efdcb9", water: "#3a7fa0", light: "#ffd9a8" },
  arctic: { name: "arctic", skyTop: "#9ad7ff", skyLow: "#eaf7ff", sun: "#ffffff", skyline: "#8aa7c4", street: "#4a5466", deep: "#101a26", accent: "#ff5a8a", paper: "#ffffff",
    soil: "#6a5a52", clay: "#7d6a62", sand: "#b9ad9c", gravel: "#7f8590", rock: "#46566b", rockLine: "#55667c", chalk: "#dfe6ee", water: "#2d7fb8", light: "#d9f4ff" },
} satisfies Record<string, DiveLook>;

export type DiveLookId = keyof typeof DIVE_LOOKS;
export const DIVE_LOOK_IDS = Object.keys(DIVE_LOOKS) as DiveLookId[];
export const diveLook = (id: unknown): DiveLook => DIVE_LOOKS[(typeof id === "string" && id in DIVE_LOOKS ? id : "dusk") as DiveLookId];
