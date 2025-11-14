import { RoutineRepository } from '../repositories/routineRepository'
import { TicketRepository } from '../repositories/ticketRepository'

export class RoutineService {
  private repo: RoutineRepository
  private ticketRepo: TicketRepository
  constructor() { this.repo = new RoutineRepository(); this.ticketRepo = new TicketRepository() }

  create(data: any) { return this.repo.create(data) }
  list(filter: { providerId?: number; enabled?: boolean }) { return this.repo.list(filter) }
  getById(id: number) { return this.repo.getById(id) }
  update(id: number, data: any) { return this.repo.update(id, data) }
  logs(id: number) { return this.repo.logs(id) }

  async testRun(id: number) {
    const routine = await this.repo.getById(id)
    if (!routine) throw new Error('Rotina não encontrada')
    let createdCount = 0
    // Execução simplificada: cria 1 ticket de teste para provider
    if (routine.createFor === 'TICKET') {
      const ticket = await this.ticketRepo.create(routine.providerId, {
        title: `[Rotina] ${routine.name}`,
        description: `Ticket gerado pela rotina ${routine.name}`,
        priority: (routine.defaultPriority as any) || 'medium',
        source: (routine.defaultSource as any) || 'portal'
      } as any)
      createdCount = ticket ? 1 : 0
    }
    await this.repo.log(id, { result: 'success', createdCount })
    return { createdCount }
  }
}