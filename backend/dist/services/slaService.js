"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaService = void 0;
const providerService_1 = require("./providerService");
class SlaService {
    constructor() {
        this.providerService = new providerService_1.ProviderService();
        this.cache = new Map();
    }
    async getProviderSettings(providerId, user) {
        const cached = this.cache.get(providerId);
        if (cached)
            return cached;
        const provider = await this.providerService.findById(providerId, user);
        if (!provider)
            return null;
        this.cache.set(providerId, provider.settings);
        return provider.settings;
    }
    computeDueAt(createdAt, minutes) {
        // Simplified: ignores business hours for first iteration
        const due = new Date(createdAt.getTime());
        due.setMinutes(due.getMinutes() + minutes);
        return due;
    }
    computeHoursDue(createdAt, hours) {
        // Simplified: ignores business hours for first iteration
        const due = new Date(createdAt.getTime());
        due.setHours(due.getHours() + hours);
        return due;
    }
    buildSlaInfo(settings, createdAt, priority, status) {
        const enabled = !!settings?.enabled;
        const now = new Date();
        let responseDueAt;
        let resolutionDueAt;
        let responseLateByMinutes;
        let resolutionLateByMinutes;
        if (enabled && settings) {
            const respMinutes = (settings.responseTime || {})[priority] ?? undefined;
            const resHours = (settings.resolutionTime || {})[priority] ?? undefined;
            if (typeof respMinutes === 'number') {
                const due = this.computeDueAt(createdAt, respMinutes);
                responseDueAt = due.toISOString();
                if (now > due && !['closed', 'resolved'].includes(status)) {
                    const diffMs = now.getTime() - due.getTime();
                    responseLateByMinutes = Math.ceil(diffMs / 60000);
                }
            }
            if (typeof resHours === 'number') {
                const due = this.computeHoursDue(createdAt, resHours);
                resolutionDueAt = due.toISOString();
                if (now > due && !['closed', 'resolved'].includes(status)) {
                    const diffMs = now.getTime() - due.getTime();
                    resolutionLateByMinutes = Math.ceil(diffMs / 3600000) * 60; // in minutes
                }
            }
        }
        const isBreached = !!((responseLateByMinutes && responseLateByMinutes > 0) ||
            (resolutionLateByMinutes && resolutionLateByMinutes > 0));
        return {
            enabled,
            priority,
            status,
            responseDueAt,
            resolutionDueAt,
            responseLateByMinutes,
            resolutionLateByMinutes,
            isBreached
        };
    }
    async computeForTicket(user, providerId, ticket) {
        const settings = await this.getProviderSettings(providerId, user);
        return this.buildSlaInfo(settings?.ticketSettings?.slaSettings, new Date(ticket.createdAt), ticket.priority, ticket.status);
    }
    async computeForServiceOrder(user, providerId, serviceOrder) {
        const settings = await this.getProviderSettings(providerId, user);
        // For now, reuse ticket SLA settings for service orders
        const prio = (serviceOrder.priority || 'medium');
        return this.buildSlaInfo(settings?.ticketSettings?.slaSettings, new Date(serviceOrder.createdAt), prio, serviceOrder.status);
    }
}
exports.SlaService = SlaService;
