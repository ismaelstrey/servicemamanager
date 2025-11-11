"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProfileService = void 0;
const customerRepository_1 = require("../repositories/customerRepository");
class ClientProfileService {
    constructor() {
        this.repo = new customerRepository_1.CustomerRepository();
    }
    async getProfile(customerId) {
        const customer = await this.repo.findById(customerId);
        if (!customer)
            throw new Error('Cliente não encontrado');
        return customer;
    }
    async updateProfile(customerId, data) {
        return this.repo.updateProfile(customerId, data);
    }
}
exports.ClientProfileService = ClientProfileService;
