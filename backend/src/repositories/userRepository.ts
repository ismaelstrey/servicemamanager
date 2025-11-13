import { prisma } from '../lib/prisma'

export class UserRepository {
  async create(name: string, email: string, passwordHash: string, role?: string) {
    const user = await prisma.user.create({ data: { name, email, password: passwordHash, role: role || 'user' } })
    return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    return user ? { id: user.id, name: user.name, email: user.email, password: user.password, role: user.role, isActive: user.isActive } : null
  }

  async getById(id: number) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return null
    return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt }
  }

  async list(params: { page?: number; limit?: number; search?: string; role?: string; isActive?: boolean; sortBy?: string; sortOrder?: 'asc'|'desc' }) {
    const page = params.page || 1
    const limit = params.limit || 10
    const where: any = {}
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ]
    }
    if (typeof params.isActive === 'boolean') where.isActive = params.isActive
    if (params.role) where.role = params.role

    const orderBy = params.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' }

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } }),
      prisma.user.count({ where })
    ])
    return { items, total, page, limit }
  }

  async update(id: number, data: { name?: string; email?: string; role?: string; passwordHash?: string }) {
    const payload: any = {}
    if (data.name) payload.name = data.name
    if (data.email) payload.email = data.email
    if (data.role) payload.role = data.role
    if (data.passwordHash) payload.password = data.passwordHash
    const user = await prisma.user.update({ where: { id }, data: payload })
    return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
  }

  async setActive(id: number, isActive: boolean) {
    const user = await prisma.user.update({ where: { id }, data: { isActive } })
    return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
  }
}
