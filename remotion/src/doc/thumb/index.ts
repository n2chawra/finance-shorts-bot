/**
 * The documentary thumbnail kit (Craze & Crash, 2026-11-20; channels/business-documentaries-rise-and-fall-of/
 * style-study/2026-11-20-thumbnails.md). A long video's own remotion/src/videos/<id>/Thumb.tsx (spec layout
 * "custom") composes these; the words always go through StackWords (studio/thumbType). README "Thumbnails".
 */
export { CORNER, DocThumb, MARGIN, placeCut, shortFig } from "./frame";
export { Plate, tint, type PlateKind } from "./Plate";
export { ProductHero, PersonCutout, type Damage } from "./Hero";
export { CrashLine, crashKey, type CrashShape } from "./CrashLine";
export { capSize, PriceJump, VerdictTag } from "./Tags";
export { VersusSplit } from "./VersusSplit";
export { StackWords } from "../../studio/thumbType";
export type { ThumbProps } from "../../studio/thumb";
