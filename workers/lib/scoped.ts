/**
 * A Prisma client narrowed to one channel, for ingest's per-channel steps (metrics export, editor
 * ranking, agent notifications, feedback answers, the agents' docs). Reads of a channel's tables see only
 * its rows; new videos, topics, studies, feedback and notifications take its id; and the two unique keys
 * that would collide across channels, RepoDoc.key and Notification.dedupeKey, get a "<slug>:" prefix for
 * every channel but Paisa Panchayat (so channel #1's rows are exactly as before).
 */
import type { PrismaClient } from "@prisma/client";

import { CREATE_SCOPED, SCOPED_OPS, SCOPES, docKey } from "../../apps/dashboard/src/lib/channel-scopes.ts";

const lower = (m: string) => m.charAt(0).toLowerCase() + m.slice(1);

/** A key, or a `{ startsWith }` / `{ in }` filter on one, with the channel's prefix. */
function prefixed(v: unknown, channel: string): unknown {
  if (typeof v === "string") return docKey(v, channel);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.startsWith === "string") return { ...o, startsWith: docKey(o.startsWith, channel) };
    if (Array.isArray(o.in)) return { ...o, in: (o.in as string[]).map((x) => docKey(x, channel)) };
    if (typeof o.equals === "string") return { ...o, equals: docKey(o.equals, channel) };
  }
  return v;
}

const KEYED: Record<string, string> = { repoDoc: "key", notification: "dedupeKey" };

function withKey<T extends Record<string, unknown> | undefined>(o: T, field: string, channel: string): T {
  if (!o || !(field in o)) return o;
  return { ...o, [field]: prefixed(o[field], channel) } as T;
}

export function scopedPrisma(prisma: PrismaClient, channel: string): PrismaClient {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const key = lower(model);
          const a = { ...((args ?? {}) as Record<string, unknown>) } as { where?: Record<string, unknown>; data?: Record<string, unknown>; create?: Record<string, unknown> };
          const field = KEYED[key];
          if (field) {
            a.where = withKey(a.where, field, channel);
            a.data = withKey(a.data, field, channel);
            a.create = withKey(a.create, field, channel);
          }
          const scope = SCOPES[key];
          if (scope && SCOPED_OPS.has(operation)) a.where = scope(a.where, channel);
          const creates = CREATE_SCOPED.has(key) || key === "notification";
          if (creates && (operation === "create" || operation === "upsert")) {
            const d = operation === "create" ? a.data : a.create;
            if (d && d.channelId === undefined && d.channel === undefined) {
              if (operation === "create") a.data = { ...d, channelId: channel };
              else a.create = { ...d, channelId: channel };
            }
          }
          return query(a as typeof args);
        },
      },
    },
  }) as unknown as PrismaClient;
}
