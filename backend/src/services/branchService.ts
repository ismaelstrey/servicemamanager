import { BranchRepository } from '../repositories/branchRepository'

export class BranchService {
  private repo: BranchRepository
  constructor() { this.repo = new BranchRepository() }
  create(providerId: number, data: any) { return this.repo.create(providerId, data) }
  list(providerId: number) { return this.repo.list(providerId) }
  getById(id: number) { return this.repo.getById(id) }
  update(id: number, data: any) { return this.repo.update(id, data) }
  delete(id: number) { return this.repo.delete(id) }
}