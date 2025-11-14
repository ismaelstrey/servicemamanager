import { Response } from 'express'
import { AuthenticatedRequest } from '../types/api.types'
import { ServiceCatalogService } from '../services/serviceCatalogService'

export class ServiceCatalogController {
  private service: ServiceCatalogService
  constructor() { this.service = new ServiceCatalogService() }
  async createService(req: AuthenticatedRequest, res: Response) { const providerId = Number(req.params.providerId); const created = await this.service.createService(providerId, req.body as any); res.status(201).json({ success: true, data: created }) }
  async listServices(req: AuthenticatedRequest, res: Response) { const providerId = Number(req.params.providerId); const isActive = typeof req.query.isActive !== 'undefined' ? String(req.query.isActive).toLowerCase() === 'true' : undefined; const items = await this.service.listServices(providerId, isActive); res.json({ success: true, data: items }) }
  async getService(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const row = await this.service.getService(id); if (!row) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: row }) }
  async updateService(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const row = await this.service.updateService(id, req.body as any); res.json({ success: true, data: row }) }
  async deleteService(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); await this.service.deleteService(id); res.json({ success: true }) }
  async createCredential(req: AuthenticatedRequest, res: Response) { const serviceId = Number(req.params.serviceId); const created = await this.service.createCredential(serviceId, req.body as any); res.status(201).json({ success: true, data: created }) }
  async listCredentials(req: AuthenticatedRequest, res: Response) { const serviceId = Number(req.params.serviceId); const creds = await this.service.listCredentials(serviceId, req.user, []); res.json({ success: true, data: creds }) }
  async getCredential(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const cred = await this.service.getCredential(id, req.user, []); if (!cred) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, data: cred }) }
  async updateCredential(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const row = await this.service.updateCredential(id, req.body as any); res.json({ success: true, data: row }) }
  async deleteCredential(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); await this.service.deleteCredential(id); res.json({ success: true }) }
  async setCredentialUsers(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const ok = await this.service.setCredentialUsers(id, (req.body as any).userIds); res.json({ success: true, data: ok }) }
  async setCredentialGroups(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const ok = await this.service.setCredentialGroups(id, (req.body as any).groupIds); res.json({ success: true, data: ok }) }
  async removeCredentialUser(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const providerUserId = Number(req.params.providerUserId); await this.service.removeCredentialUser(id, providerUserId); res.json({ success: true }) }
  async removeCredentialGroup(req: AuthenticatedRequest, res: Response) { const id = Number(req.params.id); const groupId = Number(req.params.groupId); await this.service.removeCredentialGroup(id, groupId); res.json({ success: true }) }
}