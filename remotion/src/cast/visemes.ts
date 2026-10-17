/**
 * Lip-sync: Kokoro's phonemes (IPA, with a time each) to the ten mouth shapes in face.tsx.
 * Grouped the way animators group them: what the lips do, not what the tongue does.
 */
import type { Viseme } from "./face";

const MAP: Record<string, Viseme> = {
  // open vowels
  a: "A", "ɑ": "A", "æ": "A", "ʌ": "A", "ɐ": "A", "ɒ": "O",
  // mid/front vowels
  e: "E", "ɛ": "E", "ɜ": "E", "ə": "E", "ᵊ": "E",
  i: "I", "ɪ": "I", j: "I",
  // rounded
  o: "O", "ɔ": "O", u: "U", "ʊ": "U", w: "U",
  // lips together
  p: "M", b: "M", m: "M",
  // lip under teeth
  f: "F", v: "F",
  // tongue behind teeth
  l: "L", t: "L", d: "L", n: "L", "θ": "L", "ð": "L", "ɾ": "L",
  // teeth together
  s: "S", z: "S", "ʃ": "S", "ʒ": "S", "ʧ": "S", "ʤ": "S", "ç": "S",
  // the back of the mouth: a slightly open mouth reads right
  k: "E", g: "E", "ŋ": "E", h: "E", "ɹ": "E", r: "E", "ɡ": "E", x: "E",
};

export function visemeOf(p: string): Viseme | null {
  if (p === " " || /^[,.!?;:—–…"'()-]$/.test(p)) return "rest";
  if (p === "ˈ" || p === "ˌ" || p === "ː") return null;   // stress/length marks continue the shape
  return MAP[p] ?? "E";
}

/**
 * The mouth at `sec` seconds after speech starts. Each shape is held for its phoneme and blended
 * toward rest in long gaps, so a mouth never snaps shut between words of one sentence.
 */
export function visemeAt(phonemes: { p: string; s: number; e: number }[], sec: number): Viseme {
  if (!phonemes.length || sec < phonemes[0]!.s || sec > phonemes[phonemes.length - 1]!.e + 0.05) return "rest";
  let current: Viseme = "rest";
  for (const ph of phonemes) {
    if (ph.s > sec) break;
    const v = visemeOf(ph.p);
    if (v) current = sec <= ph.e + 0.04 || v !== "rest" ? v : "rest";
  }
  return current;
}
