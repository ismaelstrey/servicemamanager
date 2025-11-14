import { prisma } from '../lib/prisma'

export class GroupRepository {
  create(providerId: number, data: { name: string; description?: string }) { return prisma.providerGroup.create({ data: { providerId, name: data.name, description: data.description ?? null } }) }
  list(providerId: number) { return prisma.providerGroup.findMany({ where: { providerId } }) }
  get(id: number) { return prisma.providerGroup.findUnique({ where: { id }, include: { members: true } }) }
  update(id: number, data: { name?: string; description?: string }) { return prisma.providerGroup.update({ where: { id }, data }) }
  addMembers(id: number, providerUserIds: number[]) { return prisma.$transaction(async (tx: typeof prisma) => { await tx.providerGroupMember.deleteMany({ where: { groupId: id } }); if (providerUserIds.length>0) await tx.providerGroupMember.createMany({ data: providerUserIds.map((pid: number) => ({ groupId: id, providerUserId: pid })) }); return true }) }
  removeMember(id: number, providerUserId: number) { return prisma.providerGroupMember.delete({ where: { groupId_providerUserId: { groupId: id, providerUserId } } }) }
}
