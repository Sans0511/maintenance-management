import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient instance across hot reloads in development.
// This avoids exhausting database connections (common in Next.js dev).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
