"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRepository = void 0;
const prisma_1 = require("../lib/prisma");
class GroupRepository {
    create(providerId, data) { return prisma_1.prisma.providerGroup.create({ data: { providerId, name: data.name, description: data.description ?? null } }); }
    list(providerId) { return prisma_1.prisma.providerGroup.findMany({ where: { providerId } }); }
    get(id) { return prisma_1.prisma.providerGroup.findUnique({ where: { id }, include: { members: true } }); }
    update(id, data) { return prisma_1.prisma.providerGroup.update({ where: { id }, data }); }
    addMembers(id, providerUserIds) { return prisma_1.prisma.$transaction(async (tx) => { await tx.providerGroupMember.deleteMany({ where: { groupId: id } }); if (providerUserIds.length > 0)
        await tx.providerGroupMember.createMany({ data: providerUserIds.map((pid) => ({ groupId: id, providerUserId: pid })) }); return true; }); }
    removeMember(id, providerUserId) { return prisma_1.prisma.providerGroupMember.delete({ where: { groupId_providerUserId: { groupId: id, providerUserId } } }); }
}
exports.GroupRepository = GroupRepository;
