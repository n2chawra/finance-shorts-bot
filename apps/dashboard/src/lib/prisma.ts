import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma over the node-postgres driver. Netlify runs the API in Ohio and the database is in
 * Singapore (~220 ms away); Prisma's built-in engine spends several round trips per query through
 * the pooler, the pg driver one. TLS as before (the pooler's certificate is Supabase-signed).
 */
const create = () => new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 10, ssl: { rejectUnauthorized: false } }),
});

// one client per server process; Next's dev reloads would otherwise open a new pool each time
const g = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma = g.__prisma ?? create();
if (process.env.NODE_ENV !== "production") g.__prisma = prisma;
