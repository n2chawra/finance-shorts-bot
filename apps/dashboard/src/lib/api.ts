import type { z } from "zod";

async function readError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return (body && typeof body.error === "string" && body.error) || `${res.status} ${res.statusText}`;
}

/** GET a JSON payload and validate it. */
export async function getJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await readError(res));
  return schema.parse(await res.json());
}

/** POST/PATCH; throws with the API's error message on failure. */
export async function send(method: "POST" | "PATCH", url: string, body?: unknown): Promise<void> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
}
