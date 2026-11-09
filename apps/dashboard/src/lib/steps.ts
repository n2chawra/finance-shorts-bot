/**
 * Split a notification's "how to fix" text into an intro and numbered steps.
 *
 * Agents write fixes on one line ("1. Open … 2. Run …", the policy.md format), sometimes after a
 * short intro ("Pick one: 1. … 2. …"), and a few write one step per line. Steps must count up
 * from 1 and each marker must follow a space, so "tempo 1.25" or "v2.1" never start a step.
 * Returns no steps when the text isn't a numbered list of at least two.
 */
export function splitSteps(text: string): { intro: string; steps: string[] } {
  const t = text.trim();
  const marker = (n: number, from: number) => {
    const re = new RegExp(`(^|\\s)${n}[.)]\\s+`, "g");
    re.lastIndex = from;
    const m = re.exec(t);
    return m ? { at: m.index + m[1].length, body: m.index + m[0].length } : null;
  };
  const first = marker(1, 0);
  if (!first) return { intro: t, steps: [] };
  const bounds = [first];
  for (let n = 2; ; n++) {
    const next = marker(n, bounds[bounds.length - 1].body);
    if (!next) break;
    bounds.push(next);
  }
  if (bounds.length < 2) return { intro: t, steps: [] };
  const steps = bounds.map((b, i) => t.slice(b.body, i + 1 < bounds.length ? bounds[i + 1].at : undefined).trim());
  if (steps.some((s) => !s)) return { intro: t, steps: [] };
  return { intro: t.slice(0, first.at).trim(), steps };
}
