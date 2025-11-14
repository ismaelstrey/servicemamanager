import { Response } from 'express'
import { AuthenticatedRequest } from '../types/api.types'
import { GroupService } from '../services/groupService'

export class GroupController {
  private service: GroupService
  constructor() { this.service = new GroupService() }
  async create(req: AuthenticatedRequest, res: Response) { const providerId = Number(req.params.providerId); const created = await this.service.create(providerId, req.body as any); res.status(201).json({ success: true, data: created }) }
  async list(req: AuthenticatedRequest, res: Response) { const providerId = Number(req.params.providerId); const items = await this.service.list(providerId); res.json({ success: true, data: items }) }
  async get(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const row = await this.service.get(id); if (!row) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: row }) }
  async update(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const row = await this.service.update(id, req.body as any); res.json({ success: true, data: row }) }
  async addMembers(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const ok = await this.service.addMembers(id, (req.body as any).providerUserIds); res.json({ success: true, data: ok }) }
  async removeMember(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const providerUserId = Number(req.params.providerUserId); await this.service.removeMember(id, providerUserId); res.json({ success: true }) }
}