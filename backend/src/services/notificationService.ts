import { NotificationRepository, CreateNotificationData, ListNotificationsQuery, NotificationRecord } from '../repositories/notificationRepository';

export class NotificationService {
  private repo: NotificationRepository;

  constructor() {
    this.repo = new NotificationRepository();
  }

  async createStatusChangeNotification(params: {
    entityType: 'ticket' | 'service_order';
    entityId: number;
    providerId: number;
    statusFrom?: string | null;
    statusTo: string;
    actorName?: string;
    title?: string;
  }): Promise<NotificationRecord> {
    const title = params.title || (params.entityType === 'ticket' ? 'Status do Ticket atualizado' : 'Status da OS atualizado');
    const message = `${params.actorName ? params.actorName + ' ' : ''}alterou o status ${params.entityType === 'ticket' ? 'do ticket' : 'da OS'} ${params.entityId} de ${params.statusFrom ?? 'desconhecido'} para ${params.statusTo}`;

    const data: CreateNotificationData = {
      type: `${params.entityType}_status_changed`,
      entityType: params.entityType,
      entityId: params.entityId,
      title,
      message,
      statusFrom: params.statusFrom ?? null,
      statusTo: params.statusTo,
      providerId: params.providerId,
      userId: null
    };

    return await this.repo.create(data);
  }

  async listByProvider(providerId: number, query: ListNotificationsQuery) {
    return await this.repo.listByProvider(providerId, query);
  }

  async markRead(id: number) {
    return await this.repo.markRead(id);
  }

  async markAllReadByProvider(providerId: number) {
    return await this.repo.markAllReadByProvider(providerId);
  }
}