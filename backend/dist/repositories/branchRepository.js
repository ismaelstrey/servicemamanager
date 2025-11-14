"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchRepository = void 0;
const prisma_1 = require("../lib/prisma");
class BranchRepository {
    create(providerId, data) {
        return prisma_1.prisma.providerBranch.create({ data: { providerId, name: data.name, phone: data.phone ?? null, email: data.email ?? null, address: data.address ?? null, notes: data.notes ?? null } });
    }
    list(providerId) { return prisma_1.prisma.providerBranch.findMany({ where: { providerId } }); }
    getById(id) { return prisma_1.prisma.providerBranch.findUnique({ where: { id } }); }
    update(id, data) { return prisma_1.prisma.providerBranch.update({ where: { id }, data }); }
    delete(id) { return prisma_1.prisma.providerBranch.delete({ where: { id } }); }
}
exports.BranchRepository = BranchRepository;
