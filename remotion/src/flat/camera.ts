/** The flat camera's limits (no fonts or React here, so tests can import it). */

/** The camera's closest push (owner, 2026-11-16, on the GTA Short: "Camera kinda looks zoom in. Zoom out a
 * little bit so that all things comes in picture"). Its shots pushed to 1.5-1.75x and cut the TV, the
 * rider, the queue and the signs at the edges; QA's top failure (things cut at the edge) had hit 30
 * videos in 14 days. A close-up is drawn big in the place, not reached by zooming past this. */
export const MAX_ZOOM = 1.3;
/** The first video the ceiling applies to: published videos re-render exactly as they were. */
export const MAX_ZOOM_SINCE = 20261117;

/** The zoom ceiling for a video, read from its id (v-YYYYMMDD-NN, L-YYYYMMDD-NN); none for older ones. */
export function maxZoomFor(id: string): number {
  const d = id.match(/^[A-Za-z]+-(\d{8})-/);
  return d && Number(d[1]) >= MAX_ZOOM_SINCE ? MAX_ZOOM : Infinity;
}
