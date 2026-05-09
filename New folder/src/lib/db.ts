import { PrismaClient } from "@prisma/client";
import { createDemoPrismaClient, isDemoMode } from "@/lib/demo-prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  (isDemoMode()
    ? createDemoPrismaClient()
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
      }));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
