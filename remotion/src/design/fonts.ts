import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/** Poppins (OFL), the same files the Python engine used. Loaded once; rendering waits for them. */
const WEIGHTS: [string, string][] = [["400", "Regular"], ["500", "Medium"], ["600", "SemiBold"], ["700", "Bold"], ["800", "ExtraBold"], ["900", "Black"]];
for (const [weight, name] of WEIGHTS) loadFont({ family: "Poppins", url: staticFile(`fonts/Poppins-${name}.ttf`), weight });

export const FONT = "Poppins";
