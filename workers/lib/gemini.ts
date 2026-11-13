/**
 * Google's Gemini API over plain fetch, for watching public YouTube videos (the twins study,
 * workers/twins.ts; owner-approved 2026-11-13). Free tier only: no billing account is attached, so a
 * quota error ends the night's work instead of costing money.
 *
 * Models are tried in the order config/twins.json lists them: a busy model (503) or one without free
 * quota (429) hands the request to the next one.
 */
import { z } from "zod";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

export type Part =
  | { text: string }
  | { file_data: { file_uri: string; mime_type?: string }; video_metadata?: { fps?: number } }
  | { inline_data: { mime_type: string; data: string } };

const GenerateResponse = z.object({
  candidates: z.array(z.object({ content: z.object({ parts: z.array(z.object({ text: z.string().optional() }).passthrough()).optional() }).passthrough().optional(), finishReason: z.string().optional() }).passthrough()).optional(),
  usageMetadata: z.object({ promptTokenCount: z.number().optional(), totalTokenCount: z.number().optional() }).passthrough().optional(),
}).passthrough();

export type GeminiResult = { model: string; text: string; tokens: number | null };

/** No model answered: every one was busy, out of free quota, or failed. `quota` = the free tier is spent for today. */
export class GeminiUnavailable extends Error {
  constructor(message: string, readonly quota: boolean) { super(message); }
}

export type GeminiOptions = {
  key: string;
  models: string[];
  timeoutMs?: number;
  /** tries per model when it is busy (503) */
  busyTries?: number;
  busyWaitMs?: number;
  /** JSON output: the response is valid JSON (and follows `schema` when given) */
  json?: boolean;
  schema?: unknown;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** One generateContent call, falling through the model list. */
export async function generate(parts: Part[], opts: GeminiOptions): Promise<GeminiResult> {
  const f = opts.fetchImpl ?? fetch;
  const sleep = opts.sleep ?? defaultSleep;
  const errors: string[] = [];
  let quotaOnly = true;
  for (const model of opts.models) {
    for (let attempt = 0; attempt < (opts.busyTries ?? 2); attempt++) {
      const body = {
        contents: [{ parts }],
        generationConfig: opts.json ? { responseMimeType: "application/json", ...(opts.schema ? { responseSchema: opts.schema } : {}) } : undefined,
      };
      let res: Response;
      try {
        res = await f(`${BASE}/models/${model}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": opts.key },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
        });
      } catch (e) {
        errors.push(`${model}: ${String(e).slice(0, 120)}`);
        quotaOnly = false;
        break;   // a timeout: the next model
      }
      if (res.ok) {
        const out = GenerateResponse.parse(await res.json());
        const text = (out.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
        if (!text.trim()) { errors.push(`${model}: empty answer (${out.candidates?.[0]?.finishReason ?? "no candidate"})`); quotaOnly = false; break; }
        return { model, text, tokens: out.usageMetadata?.totalTokenCount ?? null };
      }
      const detail = (await res.text()).slice(0, 300).replace(/\s+/g, " ");
      errors.push(`${model}: ${res.status} ${detail}`);
      if (res.status === 503 || res.status === 500) { quotaOnly = false; await sleep(opts.busyWaitMs ?? 15_000); continue; }
      if (res.status !== 429) quotaOnly = false;
      break;   // 429 (no free quota for this model) or a request error: the next model
    }
  }
  throw new GeminiUnavailable(`no Gemini model answered:\n${errors.join("\n")}`, quotaOnly && errors.length > 0);
}

/** The JSON object inside an answer (models sometimes wrap it in a ```json fence). */
export function parseJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(t);
}
