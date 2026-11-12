/**
 * Starts the Publish workflow on GitHub (workflow_dispatch), so publishing never waits on GitHub's
 * own scheduler, which drops runs under load (12 Nov 2026: no scheduled run for 9 hours, the 19:07
 * Short and an "Upload now" were lost). Used by "Upload now" and by the Netlify heartbeat.
 *
 * Needs GITHUB_ACTIONS_TOKEN in Netlify: a fine-grained token for this repository with
 * "Actions: Read and write". Without it every call is a no-op that says so.
 */
const API = "https://api.github.com";
const WORKFLOW = "publish.yml";

type Result = { dispatched: boolean; why: string };

function env(): { token: string; repo: string } | null {
  const token = process.env.GITHUB_ACTIONS_TOKEN, repo = process.env.GITHUB_REPOSITORY;
  return token && repo ? { token, repo } : null;
}

const headers = (token: string) => ({ authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" });

/** When the newest Publish run started, and whether it is still going. */
export async function latestPublishRun(): Promise<{ at: number; active: boolean } | null> {
  const e = env();
  if (!e) return null;
  const res = await fetch(`${API}/repos/${e.repo}/actions/workflows/${WORKFLOW}/runs?per_page=1`, { headers: headers(e.token), cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub runs list: ${res.status}`);
  const run = ((await res.json()) as { workflow_runs?: { created_at: string; status: string }[] }).workflow_runs?.[0];
  return run ? { at: Date.parse(run.created_at), active: run.status !== "completed" } : null;
}

/** Dispatch Publish now. `minGapMin` skips it when a run started that recently (or is still running). */
export async function dispatchPublish(minGapMin = 0): Promise<Result> {
  const e = env();
  if (!e) return { dispatched: false, why: "GITHUB_ACTIONS_TOKEN or GITHUB_REPOSITORY is not set" };
  if (minGapMin > 0) {
    const last = await latestPublishRun();
    if (last?.active) return { dispatched: false, why: "a Publish run is already going" };
    if (last && Date.now() - last.at < minGapMin * 60_000) return { dispatched: false, why: `Publish ran ${Math.round((Date.now() - last.at) / 60_000)} min ago` };
  }
  const res = await fetch(`${API}/repos/${e.repo}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST", headers: { ...headers(e.token), "content-type": "application/json" },
    body: JSON.stringify({ ref: "main", inputs: { upload_now: "0" } }),
  });
  if (res.status !== 204) return { dispatched: false, why: `GitHub refused the dispatch: ${res.status} ${(await res.text()).slice(0, 200)}` };
  return { dispatched: true, why: "Publish started" };
}
