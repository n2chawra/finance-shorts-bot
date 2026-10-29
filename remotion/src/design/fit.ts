/**
 * Text that always fits (2026-10-29: 147 of the last 200 render failures were words running off
 * the frame, and every one cost a re-render). Poppins widths are estimated per character, on the
 * generous side, so a size from here never overflows; it only shrinks text that would.
 */
import { FRAMES, type FormatName } from "./frame";

/** Rough on-screen width of `text` at `size` px in Poppins bold/black. */
export function textWidth(text: string, size: number, upper = false, spacing = 0): number {
  let em = 0;
  for (const ch of text) {
    if (ch === " ") em += 0.3;
    else if (/[MW@%mw]/.test(ch)) em += 0.95;
    else if (!upper && /[ijlI.,:;'!|]/.test(ch)) em += 0.32;
    else if (upper || /[A-Z]/.test(ch)) em += 0.76;
    else if (/[0-9$₹£€]/.test(ch)) em += 0.66;
    else em += 0.62;
  }
  return em * size + spacing * [...text].length;
}

/** The largest size up to `size` at which one line of `text` fits `maxW`, never below `min`. */
export function fitLine(text: string, size: number, maxW: number, opts: { upper?: boolean; min?: number; spacing?: number } = {}): number {
  const need = textWidth(text, size, opts.upper, opts.spacing);
  return need <= maxW ? size : Math.max(opts.min ?? 0, Math.floor(size * (maxW / need)));
}

/** For text that wraps at spaces: the size at which its longest word fits `maxW`. */
export function fitWords(text: string, size: number, maxW: number, opts: { upper?: boolean; min?: number; spacing?: number } = {}): number {
  const longest = text.split(/\s+/).reduce((a, b) => (textWidth(b, size, opts.upper) > textWidth(a, size, opts.upper) ? b : a), "");
  return fitLine(longest, size, maxW, opts);
}

/** The format's minimum text size (the layout gate's floor). */
export const minText = (w: number, h: number): number => FRAMES[(h > w ? "short" : "long") as FormatName].minText;

/** Where text may sit: inside the side margins, below the top, above the bottom zone (and, in a
 * Short, above the captions band and clear of the right-hand buttons). */
export function safeBox(w: number, h: number): { x0: number; x1: number; y0: number; y1: number } {
  const v = h > w;
  const f = FRAMES[v ? "short" : "long"];
  return { x0: f.sideMargin * 0.6, x1: w - f.sideMargin * (v ? 1.6 : 0.6), y0: v ? 90 : 30, y1: h - f.bottomSafe - (v ? 40 : 20) };
}
