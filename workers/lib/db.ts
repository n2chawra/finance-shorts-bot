/**
 * Prisma over the node-postgres driver, as the dashboard does (apps/dashboard/src/lib/prisma.ts). GitHub's runners
 * are in the US and the database in Singapore: Prisma's built-in engine spends several round trips per query
 * through the pooler (~380 ms a query), the pg driver one (~75 ms). Ingest makes a few hundred small queries a run
 * and was hitting its 10-minute limit (2026-11-23).
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export function newPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) return new PrismaClient();   // no URL: let Prisma raise its usual error
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 4, ssl: { rejectUnauthorized: false } }) });
}
