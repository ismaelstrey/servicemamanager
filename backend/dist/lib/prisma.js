"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Centralized Prisma Client singleton
// Avoids multiple instances and ESM/CJS import issues
const { PrismaClient } = require('@prisma/client');
let prismaInstance;
function getPrisma() {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient();
    }
    return prismaInstance;
}
exports.prisma = getPrisma();
