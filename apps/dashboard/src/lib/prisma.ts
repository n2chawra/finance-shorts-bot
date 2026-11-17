import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { CREATE_SCOPED, SCOPED_OPS, SCOPES, currentChannel, docWhere, plainKey } from "./channel-scope";

/**
 * Prisma over the node-postgres driver. Netlify runs the API in Ohio and the database is in
 * Singapore (~220 ms away); Prisma's built-in engine spends several round trips per query through
 * the pooler, the pg driver one. TLS as before (the pooler's certificate is Supabase-signed).
 */
const create = () => new PrismaClient({
  // keep connections between the dashboard's 30 s polls: a new one costs ~4 round trips (TCP, TLS, auth)
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 12, idleTimeoutMillis: 300_000, ssl: { rejectUnauthorized: false } }),
});

// one client per server process; Next's dev reloads would otherwise open a new pool each time
const g = globalThis as unknown as { __prisma?: PrismaClient };

/** The raw client: every channel's rows (the Channels page and OAuth use it). */
export const prismaAll = g.__prisma ?? create();
if (process.env.NODE_ENV !== "production") g.__prisma = prismaAll;

const lower = (model: string) => model.charAt(0).toLowerCase() + model.slice(1);

/**
 * The client every page uses: reads of a channel's own tables are narrowed to the channel picked in
 * the switcher (lib/channel-scope.ts), and new videos, topics, studies and feedback take it. With one
 * channel nothing changes.
 */
export const prisma = prismaAll.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const key = lower(model);
        // the agents' docs are per channel: another channel's keys are "<slug>:<key>", returned as plain keys
        if (key === "repoDoc" && (operation === "findMany" || operation === "findUnique" || operation === "findFirst")) {
          const channel = await currentChannel();
          const a = (args ?? {}) as { where?: Record<string, unknown> };
          a.where = docWhere(a.where, channel);
          const rows = await query(a as typeof args);
          const fix = (r: unknown) => (r && typeof r === "object" && "key" in r ? { ...(r as object), key: plainKey((r as { key: string }).key, channel) } : r);
          return Array.isArray(rows) ? rows.map(fix) : fix(rows);
        }
        const scope = SCOPES[key];
        if (scope && SCOPED_OPS.has(operation)) {
          const a = (args ?? {}) as { where?: Record<string, unknown> };
          a.where = scope(a.where, await currentChannel());
          return query(a as typeof args);
        }
        if (CREATE_SCOPED.has(key) && operation === "create") {
          const a = args as { data: Record<string, unknown> };
          if (a.data && a.data.channelId === undefined && a.data.channel === undefined) a.data = { ...a.data, channelId: await currentChannel() };
          return query(a as typeof args);
        }
        return query(args);
      },
    },
  },
});
