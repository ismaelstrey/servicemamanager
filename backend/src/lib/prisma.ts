// Centralized Prisma Client singleton
// Avoids multiple instances and ESM/CJS import issues
const { PrismaClient } = require('@prisma/client');

let prismaInstance: any;

function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export const prisma = getPrisma();