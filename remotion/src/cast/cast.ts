/**
 * The recurring cast. Viewers should recognise them from video to video, the way a channel's
 * mascots become its trademark. They are story characters — people things happen to — never an
 * "AI advisor": YouTube does not monetise AI personas that give financial guidance.
 *
 * Per-video variety comes from outfits, settings and roles, not from new faces every time.
 */
export type HairStyle = "side-part" | "braid" | "receding" | "bun" | "curly";
export type Top = "shirt" | "kurti" | "kurta-vest" | "hoodie" | "tee";

export interface Look {
  skin: string; skinShade: string;
  hair: string; hairStyle: HairStyle;
  ink: string; lip: string;
  top: Top; topColor: string; topShade: string; accent: string;
  bottom: string; shoes: string;
  glasses?: "rect" | "round";
  bindi?: boolean; earrings?: boolean; moustache?: boolean; watch?: boolean; dupatta?: string;
  lanyard?: string; lashes?: boolean;
  scale: number;                 // relative height
}

export interface CastMember {
  id: string;
  name: string;
  age: number;
  role: string;
  personality: string;
  look: Look;
}

export const CAST: Record<string, CastMember> = {
  rohan: {
    id: "rohan", name: "Rohan", age: 27, role: "the hero: salaried techie in Bengaluru, first real paycheque, big plans",
    personality: "optimistic, impulsive with money, quick to laugh, learns things the hard way",
    look: {
      skin: "#c98a5e", skinShade: "#a96d45", hair: "#1d1a1f", hairStyle: "side-part", ink: "#231c22", lip: "#7a3b33",
      top: "shirt", topColor: "#2bb3a3", topShade: "#1f8f83", accent: "#f4f1e8", bottom: "#2d3a5c", shoes: "#f4f1e8",
      watch: true, lanyard: "#3b5bdb", scale: 1,
    },
  },
  priya: {
    id: "priya", name: "Priya", age: 26, role: "Rohan's friend and colleague, the planner",
    personality: "calm, sharp, explains with a smile, slightly smug when she's right",
    look: {
      skin: "#b97c55", skinShade: "#98603d", hair: "#20161a", hairStyle: "braid", ink: "#21181d", lip: "#8a3a3f",
      top: "kurti", topColor: "#f2a93b", topShade: "#d48b22", accent: "#c2432f", bottom: "#33476e", shoes: "#8a3a3f",
      bindi: true, earrings: true, dupatta: "#c2432f", lashes: true, scale: 0.96,
    },
  },
  sharma: {
    id: "sharma", name: "Sharma Uncle", age: 63, role: "the neighbour: retired bank officer who has seen every money mistake",
    personality: "warm, dry humour, tells stories, a little old-fashioned about gold",
    look: {
      skin: "#d9a07a", skinShade: "#b8805a", hair: "#d9d6d0", hairStyle: "receding", ink: "#2a2224", lip: "#80453a",
      top: "kurta-vest", topColor: "#f3eee3", topShade: "#d9d2c3", accent: "#7a4b2c", bottom: "#f3eee3", shoes: "#5a3a26",
      glasses: "round", moustache: true, scale: 0.97,
    },
  },
};

/** Sikka: a living ₹ coin. Comic relief and a visual for "the money itself" — it gets spent, grows, runs away. */
export const SIKKA = { id: "sikka", name: "Sikka", gold: "#ffd34d", goldShade: "#e0a800", rim: "#b8860b", ink: "#5a3a00" } as const;

export const CAST_ORDER = ["rohan", "priya", "sharma"] as const;
