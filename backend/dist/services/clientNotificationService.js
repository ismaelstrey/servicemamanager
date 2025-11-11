"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientNotificationService = void 0;
const notificationRepository_1 = require("../repositories/notificationRepository");
class ClientNotificationService {
    constructor() {
        this.repo = new notificationRepository_1.NotificationRepository();
    }
    async list(customerId, providerId, query) {
        return this.repo.listByCustomer(customerId, providerId, query);
    }
    async markRead(id, customerId) {
        return this.repo.markReadForCustomer(id, customerId);
    }
}
exports.ClientNotificationService = ClientNotificationService;
