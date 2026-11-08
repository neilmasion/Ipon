import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton PrismaClient with Connection Pooling (Item 16).
 * Persists the client across serverless & dev re-evaluations to prevent pool exhaustion.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Always store singleton to reuse connection pool across all environments
globalForPrisma.prisma = prisma;
