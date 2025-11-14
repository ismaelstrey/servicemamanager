"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientServiceCatalogController = void 0;
const serviceCatalogService_1 = require("../services/serviceCatalogService");
class ClientServiceCatalogController {
    constructor() { this.service = new serviceCatalogService_1.ServiceCatalogService(); }
    async listServices(req, res) {
        if (!req.customer)
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        const items = await this.service.listServices(req.customer.providerId, true);
        res.json({ success: true, data: items });
    }
    async listCredentials(req, res) {
        if (!req.customer)
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        const serviceId = Number(req.params.serviceId);
        const creds = await this.service.listCredentials(serviceId, { role: 'customer_user', id: req.customer.id }, []);
        // Filtra PROVIDER_ONLY implicitamente pelo canView e retorna mascaradas
        res.json({ success: true, data: creds });
    }
}
exports.ClientServiceCatalogController = ClientServiceCatalogController;
