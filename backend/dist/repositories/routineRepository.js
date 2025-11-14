"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineRepository = void 0;
const prisma_1 = require("../lib/prisma");
class RoutineRepository {
    create(data) { return prisma_1.prisma.routine.create({ data }); }
    list(filter) { return prisma_1.prisma.routine.findMany({ where: { providerId: filter.providerId, enabled: filter.enabled } }); }
    getById(id) { return prisma_1.prisma.routine.findUnique({ where: { id } }); }
    update(id, data) { return prisma_1.prisma.routine.update({ where: { id }, data }); }
    logs(id) { return prisma_1.prisma.routineLog.findMany({ where: { routineId: id }, orderBy: { runAt: 'desc' } }); }
    log(id, data) { return prisma_1.prisma.routineLog.create({ data: { routineId: id, runAt: new Date(), result: data.result, createdCount: data.createdCount, errorMessage: data.errorMessage ?? null } }); }
}
exports.RoutineRepository = RoutineRepository;
