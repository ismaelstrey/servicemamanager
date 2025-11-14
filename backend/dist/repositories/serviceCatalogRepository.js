"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCatalogRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ServiceCatalogRepository {
    createService(providerId, data) {
        return prisma_1.prisma.providerService.create({ data: { providerId, name: data.name, type: data.type, url: data.url, description: data.description ?? null, isActive: data.isActive ?? true } });
    }
    listServices(providerId, isActive) { return prisma_1.prisma.providerService.findMany({ where: { providerId, ...(typeof isActive === 'boolean' ? { isActive } : {}) } }); }
    getService(id) { return prisma_1.prisma.providerService.findUnique({ where: { id } }); }
    updateService(id, data) { return prisma_1.prisma.providerService.update({ where: { id }, data }); }
    deleteService(id) { return prisma_1.prisma.providerService.delete({ where: { id } }); }
    createCredential(serviceId, data) {
        return prisma_1.prisma.providerServiceCredential.create({ data: { serviceId, label: data.label ?? null, username: data.username, passwordEnc: data.passwordEnc, isActive: data.isActive ?? true, visibility: (data.visibility ?? 'PROVIDER_ONLY') } });
    }
    listCredentials(serviceId) { return prisma_1.prisma.providerServiceCredential.findMany({ where: { serviceId }, include: { allowedUsers: true, allowedGroups: true } }); }
    getCredential(id) { return prisma_1.prisma.providerServiceCredential.findUnique({ where: { id }, include: { allowedUsers: true, allowedGroups: true } }); }
    updateCredential(id, data) { return prisma_1.prisma.providerServiceCredential.update({ where: { id }, data }); }
    deleteCredential(id) { return prisma_1.prisma.providerServiceCredential.delete({ where: { id } }); }
    setCredentialUsers(id, userIds) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.credentialUserAccess.deleteMany({ where: { credentialId: id } });
            if (userIds.length > 0)
                await tx.credentialUserAccess.createMany({ data: userIds.map((uid) => ({ credentialId: id, providerUserId: uid })) });
            return true;
        });
    }
    setCredentialGroups(id, groupIds) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.credentialGroupAccess.deleteMany({ where: { credentialId: id } });
            if (groupIds.length > 0)
                await tx.credentialGroupAccess.createMany({ data: groupIds.map((gid) => ({ credentialId: id, groupId: gid })) });
            return true;
        });
    }
    removeCredentialUser(id, providerUserId) { return prisma_1.prisma.credentialUserAccess.delete({ where: { credentialId_providerUserId: { credentialId: id, providerUserId } } }); }
    removeCredentialGroup(id, groupId) { return prisma_1.prisma.credentialGroupAccess.delete({ where: { credentialId_groupId: { credentialId: id, groupId } } }); }
}
exports.ServiceCatalogRepository = ServiceCatalogRepository;
