import { Request, Response } from 'express';
import { ServiceOrderService } from '../services/serviceOrderService';
import { AuthenticatedRequest } from '../types/api.types';
import { calculatePagination } from '../utils/paginationHelper';

export class ServiceOrderController {
  private serviceOrderService: ServiceOrderService;

  constructor() {
    this.serviceOrderService = new ServiceOrderService();
  }

  // GET /api/service-orders
  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, priority, providerId } = req.query;
      
      // Usar helper de paginação otimizada
      const paginationParams = calculatePagination({
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        maxLimit: 100,
        defaultLimit: 10
      });
      
      const filters = {
        status: status as string,
        priority: priority as string,
        providerId: providerId ? parseInt(providerId as string) : undefined
      };

      const serviceOrders = await this.serviceOrderService.getServiceOrders(
        req.user!,
        paginationParams.page,
        paginationParams.limit,
        filters
      );

      res.json(serviceOrders);
    } catch (error) {
      console.error('Error fetching service orders:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // GET /api/service-orders/:id
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const serviceOrder = await this.serviceOrderService.getServiceOrderById(
        req.user!,
        parseInt(id)
      );

      if (!serviceOrder) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      res.json(serviceOrder);
    } catch (error) {
      console.error('Error fetching service order:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // POST /api/service-orders
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const serviceOrderData = req.body;
      const serviceOrder = await this.serviceOrderService.createServiceOrder(
        req.user!,
        serviceOrderData
      );

      res.status(201).json(serviceOrder);
    } catch (error) {
      console.error('Error creating service order:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // PUT /api/service-orders/:id
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const serviceOrder = await this.serviceOrderService.updateServiceOrder(
        req.user!,
        parseInt(id),
        updateData
      );

      if (!serviceOrder) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      res.json(serviceOrder);
    } catch (error) {
      console.error('Error updating service order:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // DELETE /api/service-orders/:id
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.serviceOrderService.deleteServiceOrder(
        req.user!,
        parseInt(id)
      );

      if (!deleted) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting service order:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // PATCH /api/service-orders/:id/status
  async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const serviceOrder = await this.serviceOrderService.updateServiceOrderStatus(
        req.user!,
        parseInt(id),
        status
      );

      if (!serviceOrder) {
        res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        return;
      }

      res.json(serviceOrder);
    } catch (error) {
      console.error('Error updating service order status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // GET /api/service-orders/stats
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { providerId } = req.query;
      const stats = await this.serviceOrderService.getServiceOrderStats(
        req.user!,
        providerId ? parseInt(providerId as string) : undefined
      );

      res.json(stats);
    } catch (error) {
      console.error('Error fetching service order stats:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}