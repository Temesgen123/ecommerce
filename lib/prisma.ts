// ============================================================
// lib/prisma.ts
// ============================================================
// Singleton PrismaClient for Next.js.
// In development, Next.js hot-reload creates new module instances
// on every change. Without this pattern, each reload opens a new
// database connection pool, quickly exhausting PostgreSQL's limit.
// The global object persists across hot-reloads; production always
// creates exactly one instance per process.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
