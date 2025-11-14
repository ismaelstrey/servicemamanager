"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCatalogService = void 0;
const serviceCatalogRepository_1 = require("../repositories/serviceCatalogRepository");
const credentialService_1 = require("./credentialService");
class ServiceCatalogService {
    constructor() { this.repo = new serviceCatalogRepository_1.ServiceCatalogRepository(); this.cred = new credentialService_1.CredentialService(); }
    createService(providerId, data) { return this.repo.createService(providerId, data); }
    listServices(providerId, isActive) { return this.repo.listServices(providerId, isActive); }
    getService(id) { return this.repo.getService(id); }
    updateService(id, data) { return this.repo.updateService(id, data); }
    deleteService(id) { return this.repo.deleteService(id); }
    createCredential(serviceId, data) {
        const passwordEnc = this.cred.encrypt(data.password);
        return this.repo.createCredential(serviceId, { label: data.label, username: data.username, passwordEnc, isActive: data.isActive, visibility: data.visibility });
    }
    listCredentials(serviceId, user, userGroupIds) {
        return this.repo.listCredentials(serviceId).then((rows) => rows.map((r) => {
            const allowedUserIds = r.allowedUsers?.map((u) => u.providerUserId);
            const allowedGroupIds = r.allowedGroups?.map((g) => g.groupId);
            const can = this.cred.canView(r.visibility, user, allowedUserIds, user?.id, allowedGroupIds, userGroupIds);
            return { id: r.id, label: r.label, username: r.username, isActive: r.isActive, visibility: r.visibility, password: can ? this.cred.decrypt(r.passwordEnc) : this.cred.mask() };
        }));
    }
    getCredential(id, user, userGroupIds) {
        return this.repo.getCredential(id).then((r) => {
            if (!r)
                return null;
            const allowedUserIds = r.allowedUsers?.map((u) => u.providerUserId);
            const allowedGroupIds = r.allowedGroups?.map((g) => g.groupId);
            const can = this.cred.canView(r.visibility, user, allowedUserIds, user?.id, allowedGroupIds, userGroupIds);
            return { id: r.id, label: r.label, username: r.username, isActive: r.isActive, visibility: r.visibility, password: can ? this.cred.decrypt(r.passwordEnc) : this.cred.mask() };
        });
    }
    updateCredential(id, data) {
        const upd = { ...data };
        if (data.password)
            upd.passwordEnc = this.cred.encrypt(data.password);
        delete upd.password;
        return this.repo.updateCredential(id, upd);
    }
    deleteCredential(id) { return this.repo.deleteCredential(id); }
    setCredentialUsers(id, userIds) { return this.repo.setCredentialUsers(id, userIds); }
    setCredentialGroups(id, groupIds) { return this.repo.setCredentialGroups(id, groupIds); }
    removeCredentialUser(id, providerUserId) { return this.repo.removeCredentialUser(id, providerUserId); }
    removeCredentialGroup(id, groupId) { return this.repo.removeCredentialGroup(id, groupId); }
}
exports.ServiceCatalogService = ServiceCatalogService;
