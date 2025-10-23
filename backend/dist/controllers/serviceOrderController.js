"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrderController = void 0;
const serviceOrderService_1 = require("../services/serviceOrderService");
class ServiceOrderController {
    constructor() {
        this.serviceOrderService = new serviceOrderService_1.ServiceOrderService();
    }
    // GET /api/service-orders
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, status, priority, providerId } = req.query;
            const filters = {
                status: status,
                priority: priority,
                providerId: providerId ? parseInt(providerId) : undefined
            };
            const serviceOrders = await this.serviceOrderService.getServiceOrders(req.user, parseInt(page), parseInt(limit), filters);
            res.json(serviceOrders);
        }
        catch (error) {
            console.error('Error fetching service orders:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // GET /api/service-orders/:id
    async getById(req, res) {
        try {
            const { id } = req.params;
            const serviceOrder = await this.serviceOrderService.getServiceOrderById(req.user, parseInt(id));
            if (!serviceOrder) {
                res.status(404).json({ error: 'Ordem de serviço não encontrada' });
                return;
            }
            res.json(serviceOrder);
        }
        catch (error) {
            console.error('Error fetching service order:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // POST /api/service-orders
    async create(req, res) {
        try {
            const serviceOrderData = req.body;
            const serviceOrder = await this.serviceOrderService.createServiceOrder(req.user, serviceOrderData);
            res.status(201).json(serviceOrder);
        }
        catch (error) {
            console.error('Error creating service order:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // PUT /api/service-orders/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const serviceOrder = await this.serviceOrderService.updateServiceOrder(req.user, parseInt(id), updateData);
            if (!serviceOrder) {
                res.status(404).json({ error: 'Ordem de serviço não encontrada' });
                return;
            }
            res.json(serviceOrder);
        }
        catch (error) {
            console.error('Error updating service order:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // DELETE /api/service-orders/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.serviceOrderService.deleteServiceOrder(req.user, parseInt(id));
            if (!deleted) {
                res.status(404).json({ error: 'Ordem de serviço não encontrada' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting service order:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // PATCH /api/service-orders/:id/status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const serviceOrder = await this.serviceOrderService.updateServiceOrderStatus(req.user, parseInt(id), status);
            if (!serviceOrder) {
                res.status(404).json({ error: 'Ordem de serviço não encontrada' });
                return;
            }
            res.json(serviceOrder);
        }
        catch (error) {
            console.error('Error updating service order status:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // GET /api/service-orders/stats
    async getStats(req, res) {
        try {
            const { providerId } = req.query;
            const stats = await this.serviceOrderService.getServiceOrderStats(req.user, providerId ? parseInt(providerId) : undefined);
            res.json(stats);
        }
        catch (error) {
            console.error('Error fetching service order stats:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.ServiceOrderController = ServiceOrderController;
