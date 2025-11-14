import { ServiceCatalogRepository } from '../repositories/serviceCatalogRepository'
import { CredentialService } from './credentialService'

export class ServiceCatalogService {
  private repo: ServiceCatalogRepository
  private cred: CredentialService
  constructor() { this.repo = new ServiceCatalogRepository(); this.cred = new CredentialService() }

  createService(providerId: number, data: any) { return this.repo.createService(providerId, data) }
  listServices(providerId: number, isActive?: boolean) { return this.repo.listServices(providerId, isActive) }
  getService(id: number) { return this.repo.getService(id) }
  updateService(id: number, data: any) { return this.repo.updateService(id, data) }
  deleteService(id: number) { return this.repo.deleteService(id) }

  createCredential(serviceId: number, data: { label?: string; username: string; password: string; isActive?: boolean; visibility?: string }) {
    const passwordEnc = this.cred.encrypt(data.password)
    return this.repo.createCredential(serviceId, { label: data.label, username: data.username, passwordEnc, isActive: data.isActive, visibility: data.visibility })
  }
  listCredentials(serviceId: number, user: any, userGroupIds?: number[]) {
    return this.repo.listCredentials(serviceId).then((rows: Array<any>) => rows.map((r: any) => {
      const allowedUserIds = r.allowedUsers?.map((u: any) => u.providerUserId)
      const allowedGroupIds = r.allowedGroups?.map((g: any) => g.groupId)
      const can = this.cred.canView(r.visibility as any, user, allowedUserIds, user?.id, allowedGroupIds, userGroupIds)
      return { id: r.id, label: r.label, username: r.username, isActive: r.isActive, visibility: r.visibility, password: can ? this.cred.decrypt(r.passwordEnc) : this.cred.mask() }
    }))
  }
  getCredential(id: number, user: any, userGroupIds?: number[]) {
    return this.repo.getCredential(id).then((r: any) => {
      if (!r) return null
      const allowedUserIds = r.allowedUsers?.map((u: any) => u.providerUserId)
      const allowedGroupIds = r.allowedGroups?.map((g: any) => g.groupId)
      const can = this.cred.canView(r.visibility as any, user, allowedUserIds, user?.id, allowedGroupIds, userGroupIds)
      return { id: r.id, label: r.label, username: r.username, isActive: r.isActive, visibility: r.visibility, password: can ? this.cred.decrypt(r.passwordEnc) : this.cred.mask() }
    })
  }
  updateCredential(id: number, data: any) {
    const upd: any = { ...data }
    if (data.password) upd.passwordEnc = this.cred.encrypt(data.password)
    delete upd.password
    return this.repo.updateCredential(id, upd)
  }
  deleteCredential(id: number) { return this.repo.deleteCredential(id) }
  setCredentialUsers(id: number, userIds: number[]) { return this.repo.setCredentialUsers(id, userIds) }
  setCredentialGroups(id: number, groupIds: number[]) { return this.repo.setCredentialGroups(id, groupIds) }
  removeCredentialUser(id: number, providerUserId: number) { return this.repo.removeCredentialUser(id, providerUserId) }
  removeCredentialGroup(id: number, groupId: number) { return this.repo.removeCredentialGroup(id, groupId) }
}
