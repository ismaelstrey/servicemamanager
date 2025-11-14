"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineService = void 0;
const routineRepository_1 = require("../repositories/routineRepository");
const ticketRepository_1 = require("../repositories/ticketRepository");
class RoutineService {
    constructor() { this.repo = new routineRepository_1.RoutineRepository(); this.ticketRepo = new ticketRepository_1.TicketRepository(); }
    create(data) { return this.repo.create(data); }
    list(filter) { return this.repo.list(filter); }
    getById(id) { return this.repo.getById(id); }
    update(id, data) { return this.repo.update(id, data); }
    logs(id) { return this.repo.logs(id); }
    async testRun(id) {
        const routine = await this.repo.getById(id);
        if (!routine)
            throw new Error('Rotina não encontrada');
        let createdCount = 0;
        // Execução simplificada: cria 1 ticket de teste para provider
        if (routine.createFor === 'TICKET') {
            const ticket = await this.ticketRepo.create(routine.providerId, {
                title: `[Rotina] ${routine.name}`,
                description: `Ticket gerado pela rotina ${routine.name}`,
                priority: routine.defaultPriority || 'medium',
                source: routine.defaultSource || 'portal'
            });
            createdCount = ticket ? 1 : 0;
        }
        await this.repo.log(id, { result: 'success', createdCount });
        return { createdCount };
    }
}
exports.RoutineService = RoutineService;
