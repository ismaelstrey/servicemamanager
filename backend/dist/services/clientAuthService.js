"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAuthService = void 0;
const customerAuthService_1 = require("./customerAuthService");
class ClientAuthService {
    constructor() {
        this.customerAuth = new customerAuthService_1.CustomerAuthService();
    }
    async login(email, password) {
        return this.customerAuth.login(email, password);
    }
    async register(data) {
        return this.customerAuth.register(data);
    }
    async forgotPassword(email) {
        return this.customerAuth.forgotPassword(email);
    }
    async resetPassword(token, newPassword) {
        return this.customerAuth.resetPassword(token, newPassword);
    }
}
exports.ClientAuthService = ClientAuthService;
