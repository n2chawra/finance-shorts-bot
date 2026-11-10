import { parseImpact, type Impact } from "./impact";
import { prisma } from "./prisma";

export async function getImpact(): Promise<Impact> {
  const row = await prisma.repoDoc.findUnique({ where: { key: "impact" } });
  return parseImpact(row?.value);
}
