import { NotificationRepository, ListNotificationsQuery } from '../repositories/notificationRepository';

export class ClientNotificationService {
  private repo: NotificationRepository;

  constructor() {
    this.repo = new NotificationRepository();
  }

  async list(customerId: number, providerId: number | undefined, query: ListNotificationsQuery) {
    return this.repo.listByCustomer(customerId, providerId, query);
  }

  async markRead(id: number, customerId: number) {
    return this.repo.markReadForCustomer(id, customerId);
  }
}