import { ProviderSettings, SlaSettings } from '../types/provider.types';
import { ProviderService } from './providerService';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface SlaInfo {
  enabled: boolean;
  priority: Priority | string;
  status: string;
  responseDueAt?: string; // ISO string
  resolutionDueAt?: string; // ISO string
  responseLateByMinutes?: number; // >0 if late
  resolutionLateByMinutes?: number; // >0 if late
  isBreached: boolean;
}

export class SlaService {
  private providerService: ProviderService;
  private cache: Map<number, ProviderSettings>;

  constructor() {
    this.providerService = new ProviderService();
    this.cache = new Map();
  }

  private async getProviderSettings(providerId: number, user: any): Promise<ProviderSettings | null> {
    const cached = this.cache.get(providerId);
    if (cached) return cached;
    const provider = await this.providerService.findById(providerId, user);
    if (!provider) return null;
    this.cache.set(providerId, provider.settings);
    return provider.settings;
  }

  private computeDueAt(createdAt: Date, minutes: number): Date {
    // Simplified: ignores business hours for first iteration
    const due = new Date(createdAt.getTime());
    due.setMinutes(due.getMinutes() + minutes);
    return due;
  }

  private computeHoursDue(createdAt: Date, hours: number): Date {
    // Simplified: ignores business hours for first iteration
    const due = new Date(createdAt.getTime());
    due.setHours(due.getHours() + hours);
    return due;
  }

  private buildSlaInfo(settings: SlaSettings | undefined, createdAt: Date, priority: Priority | string, status: string): SlaInfo {
    const enabled = !!settings?.enabled;
    const now = new Date();

    let responseDueAt: string | undefined;
    let resolutionDueAt: string | undefined;
    let responseLateByMinutes: number | undefined;
    let resolutionLateByMinutes: number | undefined;

    if (enabled && settings) {
      const respMinutes = (settings.responseTime || {})[priority] ?? undefined;
      const resHours = (settings.resolutionTime || {})[priority] ?? undefined;

      if (typeof respMinutes === 'number') {
        const due = this.computeDueAt(createdAt, respMinutes);
        responseDueAt = due.toISOString();
        if (now > due && !['closed','resolved'].includes(status)) {
          const diffMs = now.getTime() - due.getTime();
          responseLateByMinutes = Math.ceil(diffMs / 60000);
        }
      }

      if (typeof resHours === 'number') {
        const due = this.computeHoursDue(createdAt, resHours);
        resolutionDueAt = due.toISOString();
        if (now > due && !['closed','resolved'].includes(status)) {
          const diffMs = now.getTime() - due.getTime();
          resolutionLateByMinutes = Math.ceil(diffMs / 3600000) * 60; // in minutes
        }
      }
    }

    const isBreached = !!(
      (responseLateByMinutes && responseLateByMinutes > 0) ||
      (resolutionLateByMinutes && resolutionLateByMinutes > 0)
    );

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

  async computeForTicket(user: any, providerId: number, ticket: { createdAt: Date; priority: string; status: string }): Promise<SlaInfo> {
    const settings = await this.getProviderSettings(providerId, user);
    return this.buildSlaInfo(settings?.ticketSettings?.slaSettings, new Date(ticket.createdAt), ticket.priority as Priority, ticket.status);
  }

  async computeForServiceOrder(user: any, providerId: number, serviceOrder: { createdAt: Date; priority?: string; status: string }): Promise<SlaInfo> {
    const settings = await this.getProviderSettings(providerId, user);
    // For now, reuse ticket SLA settings for service orders
    const prio = (serviceOrder.priority || 'medium') as Priority;
    return this.buildSlaInfo(settings?.ticketSettings?.slaSettings, new Date(serviceOrder.createdAt), prio, serviceOrder.status);
  }
}