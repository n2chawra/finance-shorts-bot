import { PrismaClient } from "@prisma/client";

// one client per server process; Next's dev reloads would otherwise open a new pool each time
const g = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma = g.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.__prisma = prisma;
