"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { getJson } from "./api";

const YtTitlesSchema = z.object({ items: z.array(z.object({ id: z.string(), title: z.string().nullable(), channel: z.string().nullable() })) });

/** Titles of other channels' videos by YouTube id (/api/yt-titles, cached server-side for a day). */
export function useYtTitles(ids: string[]) {
  const key = [...ids].sort().join(",");
  return useQuery({
    queryKey: ["yt-titles", key],
    queryFn: () => getJson(`/api/yt-titles?ids=${encodeURIComponent(key)}`, YtTitlesSchema),
    enabled: ids.length > 0,
    staleTime: 3_600_000,
    select: (d) => new Map(d.items.map((it) => [it.id, it])),
  });
}
