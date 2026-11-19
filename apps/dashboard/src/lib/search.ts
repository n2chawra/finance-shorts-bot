import { z } from "zod";

/** GET /api/search?q=: channels by name and videos by title or id, across every channel. */
export const SearchChannelSchema = z.object({ id: z.string(), name: z.string(), status: z.string() });
export const SearchVideoSchema = z.object({
  id: z.string(), title: z.string(), status: z.string(), format: z.string(),
  channelId: z.string(), channelName: z.string(), views: z.number().int().nullable(),
});
export const SearchResultSchema = z.object({ channels: z.array(SearchChannelSchema), videos: z.array(SearchVideoSchema) });
export type SearchResult = z.infer<typeof SearchResultSchema>;
export const SearchQuerySchema = z.object({ q: z.string().trim().min(1).max(80) });

/** Case-insensitive match on any of the fields. */
export const matches = (q: string, ...fields: string[]): boolean => {
  const n = q.toLowerCase();
  return fields.some((f) => f.toLowerCase().includes(n));
};
