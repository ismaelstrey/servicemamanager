import { prisma } from '../lib/prisma'

export class ServiceCatalogRepository {
  createService(providerId: number, data: { name: string; type: string; url: string; description?: string; isActive?: boolean }) {
    return prisma.providerService.create({ data: { providerId, name: data.name, type: data.type as any, url: data.url, description: data.description ?? null, isActive: data.isActive ?? true } })
  }
  listServices(providerId: number, isActive?: boolean) { return prisma.providerService.findMany({ where: { providerId, ...(typeof isActive === 'boolean' ? { isActive } : {}) } }) }
  getService(id: number) { return prisma.providerService.findUnique({ where: { id } }) }
  updateService(id: number, data: any) { return prisma.providerService.update({ where: { id }, data }) }
  deleteService(id: number) { return prisma.providerService.delete({ where: { id } }) }

  createCredential(serviceId: number, data: { label?: string; username: string; passwordEnc: string; isActive?: boolean; visibility?: string }) {
    return prisma.providerServiceCredential.create({ data: { serviceId, label: data.label ?? null, username: data.username, passwordEnc: data.passwordEnc, isActive: data.isActive ?? true, visibility: (data.visibility ?? 'PROVIDER_ONLY') as any } })
  }
  listCredentials(serviceId: number) { return prisma.providerServiceCredential.findMany({ where: { serviceId }, include: { allowedUsers: true, allowedGroups: true } }) }
  getCredential(id: number) { return prisma.providerServiceCredential.findUnique({ where: { id }, include: { allowedUsers: true, allowedGroups: true } }) }
  updateCredential(id: number, data: any) { return prisma.providerServiceCredential.update({ where: { id }, data }) }
  deleteCredential(id: number) { return prisma.providerServiceCredential.delete({ where: { id } }) }

  setCredentialUsers(id: number, userIds: number[]) {
    return prisma.$transaction(async (tx: typeof prisma) => {
      await tx.credentialUserAccess.deleteMany({ where: { credentialId: id } })
      if (userIds.length > 0) await tx.credentialUserAccess.createMany({ data: userIds.map((uid: number) => ({ credentialId: id, providerUserId: uid })) })
      return true
    })
  }
  setCredentialGroups(id: number, groupIds: number[]) {
    return prisma.$transaction(async (tx: typeof prisma) => {
      await tx.credentialGroupAccess.deleteMany({ where: { credentialId: id } })
      if (groupIds.length > 0) await tx.credentialGroupAccess.createMany({ data: groupIds.map((gid: number) => ({ credentialId: id, groupId: gid })) })
      return true
    })
  }
  removeCredentialUser(id: number, providerUserId: number) { return prisma.credentialUserAccess.delete({ where: { credentialId_providerUserId: { credentialId: id, providerUserId } } }) }
  removeCredentialGroup(id: number, groupId: number) { return prisma.credentialGroupAccess.delete({ where: { credentialId_groupId: { credentialId: id, groupId } } }) }
}
