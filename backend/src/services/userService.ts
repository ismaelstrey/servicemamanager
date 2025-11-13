import { UserRepository } from '../repositories/userRepository'
import { hashPassword } from '../utils/passwordUtils'

export class UserService {
  private repo = new UserRepository()

  async list(query: { page?: number; limit?: number; search?: string; role?: string; isActive?: boolean; sortBy?: string; sortOrder?: 'asc'|'desc' }) {
    return this.repo.list(query)
  }

  async getById(id: number) {
    return this.repo.getById(id)
  }

  async create(input: { name: string; email: string; password: string; role?: string }) {
    const existing = await this.repo.findByEmail(input.email)
    if (existing) throw new Error('EMAIL_IN_USE')
    const passwordHash = await hashPassword(input.password)
    return this.repo.create(input.name, input.email, passwordHash, input.role)
  }

  async update(id: number, input: { name?: string; email?: string; role?: string; password?: string }) {
    let passwordHash: string | undefined
    if (input.password) passwordHash = await hashPassword(input.password)
    return this.repo.update(id, { name: input.name, email: input.email, role: input.role, passwordHash })
  }

  async disable(id: number) {
    return this.repo.setActive(id, false)
  }

  async enable(id: number) {
    return this.repo.setActive(id, true)
  }
}

export default UserService
