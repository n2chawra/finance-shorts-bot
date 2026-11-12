/**
 * Netlify scheduled function: every 10 minutes, start the Publish workflow if it hasn't started in
 * the last 15. GitHub's own cron drops runs for hours on busy days; Netlify's scheduler is separate,
 * so publishing (slots and "Upload now") keeps going either way. A no-op without GITHUB_ACTIONS_TOKEN.
 */
import { dispatchPublish } from "../../src/lib/dispatch";

export default async function handler(): Promise<Response> {
  try {
    const r = await dispatchPublish(15);
    console.log(`publish-heartbeat: ${r.why}`);
    return new Response(r.why);
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e);
    console.error(`publish-heartbeat: ${why}`);
    return new Response(why, { status: 500 });
  }
}

export const config = { schedule: "*/10 * * * *" };
