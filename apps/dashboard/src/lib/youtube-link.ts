/**
 * The 11-character video id from anything a person might paste: a Shorts link, a watch link,
 * a youtu.be link, a Studio link, or the bare id. Null when there is no id in it.
 */
export function youtubeIdFrom(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = /(?:youtube\.com\/(?:shorts\/|watch\?(?:.*&)?v=|embed\/|live\/|video\/)|youtu\.be\/)([\w-]{11})(?![\w-])/.exec(s);
  return m?.[1] ?? null;
}

/**
 * Whether a change points an upload at a different YouTube video (`next` undefined: no change
 * asked). The old link's numbers must then go: its daily stats belong to another video, and the
 * live counters only ever go up, so they would never fall back to the new video's.
 */
export function relinked(current: string | null | undefined, next: string | null | undefined): boolean {
  return next !== undefined && next !== (current ?? null);
}
