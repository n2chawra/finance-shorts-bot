import type { StaticImageData } from "next/image";

import billionSwitches from "@/assets/channels/a-billion-switches.png";
import crazeAndCrash from "@/assets/channels/craze-and-crash.png";
import disasterDesk from "@/assets/channels/disaster-desk.png";
import whyAtlas from "@/assets/channels/the-why-atlas.png";

/** A channel's public identity: its YouTube name, a short name for tight spots, an accent colour taken
 *  from its logo (mid-tone, readable on light and dark surfaces) and the logo itself. */
export type ChannelBrand = {
  id: string;
  name: string;
  short: string;
  accent: string;
  logo: StaticImageData | null;
  /** one or two letters for a logo-less channel's tile */
  initials: string;
};

/** A channel's public brand (its YouTube name and logo), by channel id. The login page lists these, so a new
 *  channel goes here once and shows everywhere. The database keeps the niche a
 *  channel was set up with ("How tech and AI actually work: chips, AI…") as its name, too long for cards. */
export const CHANNEL_BRAND: Record<string, { name: string; short: string; niche: string; accent: string; logo: StaticImageData }> = {
  "geography-maps-geopolitical-mysteries": { name: "The Why Atlas", short: "Why Atlas", niche: "Maps", accent: "#2f86c9", logo: whyAtlas },
  "how-tech-and-ai-actually-work-chips-ai-p": { name: "A Billion Switches", short: "Switches", niche: "Tech", accent: "#f08a1c", logo: billionSwitches },
  "business-documentaries-rise-and-fall-of": { name: "Craze & Crash", short: "Craze & Crash", niche: "Business", accent: "#e0452f", logo: crazeAndCrash },
  "disasters-and-engineering-failures-expla": { name: "Disaster Desk", short: "Disaster Desk", niche: "Disasters", accent: "#d6334a", logo: disasterDesk },
};

/** Accent for a channel with no brand entry: a neutral slate that reads on both themes. */
export const FALLBACK_ACCENT = "#7a8494";

const initialsOf = (name: string) =>
  name.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter((w) => w && !/^(the|a|an|and|of|&)$/i.test(w)).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

/** Everything needed to show a channel: its brand when it has one, else its stored name (or id),
 *  initials and a neutral accent. Pure, so it works in server and client code alike. */
export function channelBrand(id: string | null | undefined, storedName?: string): ChannelBrand {
  const b = id ? CHANNEL_BRAND[id] : undefined;
  const name = b?.name ?? storedName ?? id ?? "Channel";
  const short = b?.short ?? (name.length > 16 ? `${name.slice(0, 15).trimEnd()}…` : name);
  return { id: id ?? "", name, short, accent: b?.accent ?? FALLBACK_ACCENT, logo: b?.logo ?? null, initials: initialsOf(name) };
}

/** The name to show for a channel: its brand when it has one, else its stored name. */
export const brandName = (c: { id: string; name: string }): string => CHANNEL_BRAND[c.id]?.name ?? c.name;
