// Tipos locais para evitar depender de exports de @prisma/client
export type ServiceOrderStatus = 'pending' | 'in_progress' | 'waiting_parts' | 'waiting_client' | 'completed' | 'cancelled';
export type ServiceOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ServiceOrderKanbanItem = {
  id: number;
  title: string;
  priority: ServiceOrderPriority;
  updatedAt: Date;
};

export type ServiceOrderKanbanBoard = {
  [key in ServiceOrderStatus]: ServiceOrderKanbanItem[];
};