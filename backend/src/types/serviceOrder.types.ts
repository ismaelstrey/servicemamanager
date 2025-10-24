import { ServiceOrderPriority, ServiceOrderStatus } from '@prisma/client';

export type ServiceOrderKanbanItem = {
  id: number;
  title: string;
  priority: ServiceOrderPriority;
  updatedAt: Date;
};

export type ServiceOrderKanbanBoard = {
  [key in ServiceOrderStatus]: ServiceOrderKanbanItem[];
};