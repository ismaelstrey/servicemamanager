import { GroupRepository } from '../repositories/groupRepository'

export class GroupService {
  private repo: GroupRepository
  constructor() { this.repo = new GroupRepository() }
  create(providerId: number, data: any) { return this.repo.create(providerId, data) }
  list(providerId: number) { return this.repo.list(providerId) }
  get(id: number) { return this.repo.get(id) }
  update(id: number, data: any) { return this.repo.update(id, data) }
  addMembers(id: number, providerUserIds: number[]) { return this.repo.addMembers(id, providerUserIds) }
  removeMember(id: number, providerUserId: number) { return this.repo.removeMember(id, providerUserId) }
}