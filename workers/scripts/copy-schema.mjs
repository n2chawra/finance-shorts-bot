// Prisma generates its client next to the schema's node_modules, so the workers need their own
// copy of the dashboard's schema (the single source of truth). The copy is gitignored.
import { cpSync, mkdirSync } from "node:fs";

mkdirSync(new URL("../prisma/", import.meta.url), { recursive: true });
cpSync(new URL("../../apps/dashboard/prisma/schema.prisma", import.meta.url), new URL("../prisma/schema.prisma", import.meta.url));
