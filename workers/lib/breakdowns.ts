/**
 * Which stored breakdown rows a refresh may replace (wrk-012, 2026-11-14). stats-deep fetches every
 * breakdown kind of a scope; a kind whose query failed keeps the rows it already had, so one passing
 * YouTube error no longer blanks that tab on the dashboard until the next good run.
 */
export function replaceableKinds(attempted: readonly string[], failed: readonly string[]): string[] {
  const bad = new Set(failed);
  return attempted.filter((k) => !bad.has(k));
}

/** The `deleteMany` filter for a refresh of `scope` that fetched `kinds` successfully. */
export function replaceWhere(scope: string, kinds: readonly string[]): { scope: string; kind: { in: string[] } } {
  return { scope, kind: { in: [...kinds] } };
}
