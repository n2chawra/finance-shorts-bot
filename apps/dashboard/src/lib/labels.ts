/** Human labels for the code names the pipeline stores (story formats, voices, hooks, music…). */

/** Kokoro voices (renderer/engine/voice.py VOICES, plus older ones still in the history). */
const VOICES: Record<string, string> = {
  hf_alpha: "Alpha · Indian female",
  hf_beta: "Beta · Indian female",
  hm_omega: "Omega · Indian male",
  hm_psi: "Psi · Indian male",
  af_heart: "Heart · US female",
  af_bella: "Bella · US female",
  af_nicole: "Nicole · US female",
  af_sarah: "Sarah · US female",
  am_michael: "Michael · US male",
  am_fenrir: "Fenrir · US male (deep)",
  am_puck: "Puck · US male",
  am_adam: "Adam · US male",
  bf_emma: "Emma · UK female",
  bf_isabella: "Isabella · UK female",
  bm_george: "George · UK male",
  bm_lewis: "Lewis · UK male",
};

const VOICE_ACCENT: Record<string, string> = { a: "US", b: "UK", h: "Indian" };

/** Words kept as written (acronyms) when title-casing. */
const KEEP = new Set(["ai", "ceo", "usd", "inr", "emi", "sip", "ipo", "etf", "uk", "us", "nyc", "2d", "3d"]);

function words(s: string): string {
  return s
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => (KEEP.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Sentence case: "guess_the_number" → "Guess the number". */
export function sentence(s: string): string {
  const t = s.replace(/[_-]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** "am_michael" → "Michael · US male"; unknown Kokoro ids are decoded from their prefix. */
export function voiceLabel(id: string): string {
  if (VOICES[id]) return VOICES[id];
  const m = /^([a-z])([fm])_([a-z]+)$/.exec(id);
  if (!m) return words(id);
  const accent = VOICE_ACCENT[m[1]!];
  const name = m[3]!.charAt(0).toUpperCase() + m[3]!.slice(1);
  return accent ? `${name} · ${accent} ${m[2] === "f" ? "female" : "male"}` : name;
}

/**
 * A group value of a "What works" attribute as people say it.
 * Story formats read as a sentence, voices by name and accent, everything else in Title Case.
 */
export function label(value: string, attribute?: string): string {
  if (!value) return value;
  const a = (attribute ?? "").toLowerCase();
  if (a.includes("voice") || a.includes("narrator") || /^[abh][fm]_[a-z]+$/.test(value)) return voiceLabel(value);
  if (!/[_-]/.test(value) && /\s|\d/.test(value)) return value.charAt(0).toUpperCase() + value.slice(1); // already prose ("under 45 s")
  if (a.includes("story") || a.includes("format") || a.includes("shape")) return sentence(value);
  return words(value);
}

/** "% viewed" with a loop marker past 100% (Shorts replay); `title` holds the true value. */
export function viewedPct(pct: number): { text: string; title?: string } {
  return pct > 100 ? { text: "100%+ 🔁", title: `${pct.toFixed(0)}% viewed: people replayed it` } : { text: `${pct.toFixed(0)}%` };
}
