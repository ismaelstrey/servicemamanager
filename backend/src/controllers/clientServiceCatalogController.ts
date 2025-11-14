import { Response } from 'express'
import { ClientAuthenticatedRequest } from '../types/customer.types'
import { ServiceCatalogService } from '../services/serviceCatalogService'

export class ClientServiceCatalogController {
  private service: ServiceCatalogService
  constructor() { this.service = new ServiceCatalogService() }
  async listServices(req: ClientAuthenticatedRequest, res: Response) {
    if (!req.customer) return res.status(401).json({ success: false, message: 'Não autenticado' })
    const items = await this.service.listServices(req.customer.providerId, true)
    res.json({ success: true, data: items })
  }
  async listCredentials(req: ClientAuthenticatedRequest, res: Response) {
    if (!req.customer) return res.status(401).json({ success: false, message: 'Não autenticado' })
    const serviceId = Number(req.params.serviceId)
    const creds = await this.service.listCredentials(serviceId, { role: 'customer_user', id: req.customer.id }, [])
    // Filtra PROVIDER_ONLY implicitamente pelo canView e retorna mascaradas
    res.json({ success: true, data: creds })
  }
}