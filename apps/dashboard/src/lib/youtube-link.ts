/**
 * The 11-character video id from anything a person might paste: a Shorts link, a watch link,
 * a youtu.be link, a Studio link, or the bare id. Null when there is no id in it.
 */
export function youtubeIdFrom(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = /(?:youtube\.com\/(?:shorts\/|watch\?(?:.*&)?v=|embed\/|live\/|video\/)|youtu\.be\/)([\w-]{11})(?![\w-])/.exec(s);
  return m ? m[1] : null;
}
