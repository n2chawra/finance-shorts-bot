/**
 * The documentary kit's own faces (OFL, from Google Fonts' repository, 2026-11-19; the owner lifted the
 * no-download rule for this channel). The files sit in public/fonts next to Poppins, with copies and their
 * licences (OFL-*.txt) in assets/fonts. Loaded once when the kit is imported; rendering waits for them, so a
 * render never falls back to the machine's own serif or mono.
 *   Anton             heavy condensed display: figures, poster cards, caps chapter titles
 *   Playfair Display  serif, upright and italic (variable weight): headlines, pages, units and asides
 *   Courier Prime     typewriter: filings, label tape, tickers, receipts
 */
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const f = (family: string, file: string, weight: string, style: "normal" | "italic" = "normal") =>
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });

f("Anton", "Anton-Regular.ttf", "400");
f("Playfair Display", "PlayfairDisplay-Variable.ttf", "400 900");
f("Playfair Display", "PlayfairDisplay-Italic-Variable.ttf", "400 900", "italic");
f("Courier Prime", "CourierPrime-Regular.ttf", "400");
f("Courier Prime", "CourierPrime-Bold.ttf", "700");
f("Courier Prime", "CourierPrime-Italic.ttf", "400", "italic");
f("Courier Prime", "CourierPrime-BoldItalic.ttf", "700", "italic");

export const DISPLAY_FAMILY = "Anton";
