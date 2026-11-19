import type { StaticImageData } from "next/image";

import billionSwitches from "@/assets/channels/a-billion-switches.png";
import paisaPanchayat from "@/assets/channels/paisa-panchayat.png";
import whyAtlas from "@/assets/channels/the-why-atlas.png";

/** A channel's public brand (its YouTube name and logo), by channel id. The database keeps the niche a
 *  channel was set up with ("How tech and AI actually work: chips, AI…") as its name, too long for cards. */
export const CHANNEL_BRAND: Record<string, { name: string; logo: StaticImageData }> = {
  "paisa-panchayat": { name: "Paisa Panchayat", logo: paisaPanchayat },
  "geography-maps-geopolitical-mysteries": { name: "The Why Atlas", logo: whyAtlas },
  "how-tech-and-ai-actually-work-chips-ai-p": { name: "A Billion Switches", logo: billionSwitches },
};

/** The name to show for a channel: its brand when it has one, else its stored name. */
export const brandName = (c: { id: string; name: string }): string => CHANNEL_BRAND[c.id]?.name ?? c.name;
