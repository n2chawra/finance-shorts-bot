/**
 * The queue is read pick-first (the owner's pick, then queuePosition), here, in ingest and in publish.
 * So after the owner drags the list, a pick that is no longer first of its format would snap the picked
 * video back to the top and undo the drag (auditor dui-013). A drag is the owner's newer word: keep a
 * pick only while that video is still first of its format. No imports, so the workers tests can load it.
 */
export function picksToClear(order: { id: string; format: string; picked: boolean }[]): string[] {
  const first = new Map<string, string>();
  for (const v of order) if (!first.has(v.format)) first.set(v.format, v.id);
  return order.filter((v) => v.picked && first.get(v.format) !== v.id).map((v) => v.id);
}
