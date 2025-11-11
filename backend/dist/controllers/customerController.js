"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerController = void 0;
const customerRepository_1 = require("../repositories/customerRepository");
const customerValidator_1 = require("../validators/customerValidator");
const paginationHelper_1 = require("../utils/paginationHelper");
const repository = new customerRepository_1.CustomerRepository();
exports.customerController = {
    async list(req, res) {
        console.log("Resposta da query customer list", req.query);
        const { search, page, limit, providerId: providerIdParam } = customerValidator_1.listCustomersSchema.parse(req.query);
        console.log("Resposta da query customer list", search, page, limit, providerIdParam);
        const providerId = req.providerId ?? providerIdParam;
        const result = await repository.list({ providerId, search, page, limit });
        // Adiciona metadados de paginação conforme padrão do projeto
        const pagination = (0, paginationHelper_1.createPaginationMeta)(result.page, result.limit, result.total);
        return res.json({
            items: result.items,
            total: result.total,
            page: result.page,
            limit: result.limit,
            pagination,
        });
    },
};
