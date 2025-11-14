import { prisma } from '../lib/prisma'

export class RoutineRepository {
  create(data: any) { return prisma.routine.create({ data }) }
  list(filter: { providerId?: number; enabled?: boolean }) { return prisma.routine.findMany({ where: { providerId: filter.providerId, enabled: filter.enabled } }) }
  getById(id: number) { return prisma.routine.findUnique({ where: { id } }) }
  update(id: number, data: any) { return prisma.routine.update({ where: { id }, data }) }
  logs(id: number) { return prisma.routineLog.findMany({ where: { routineId: id }, orderBy: { runAt: 'desc' } }) }
  log(id: number, data: { result: string; createdCount: number; errorMessage?: string }) { return prisma.routineLog.create({ data: { routineId: id, runAt: new Date(), result: data.result, createdCount: data.createdCount, errorMessage: data.errorMessage ?? null } }) }
}