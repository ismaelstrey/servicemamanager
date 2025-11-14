import { prisma } from '../lib/prisma'

export class BranchRepository {
  create(providerId: number, data: { name: string; phone?: string; email?: string; address?: any; notes?: string }) {
    return prisma.providerBranch.create({ data: { providerId, name: data.name, phone: data.phone ?? null, email: data.email ?? null, address: data.address ?? null, notes: data.notes ?? null } })
  }
  list(providerId: number) { return prisma.providerBranch.findMany({ where: { providerId } }) }
  getById(id: number) { return prisma.providerBranch.findUnique({ where: { id } }) }
  update(id: number, data: { name?: string; phone?: string; email?: string; address?: any; notes?: string }) { return prisma.providerBranch.update({ where: { id }, data }) }
  delete(id: number) { return prisma.providerBranch.delete({ where: { id } }) }
}