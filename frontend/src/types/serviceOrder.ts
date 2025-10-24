// Tipos de sistema de ordens de serviço

import type { AuditFields } from './common';
import type { User } from './user';
import type { Customer } from './ticket';

// Tipo principal da ordem de serviço
export interface ServiceOrder extends AuditFields {
  id: number;
  providerId: number;
  number: string; // Número único da OS (ex: OS-2024-001)
  title: string;
  description: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  type: ServiceOrderType;
  category: ServiceOrderCategory;
  customerId?: number;
  customerInfo: ServiceOrderCustomerInfo;
  assignedTo?: number;
  assignedBy?: number;
  assignedAt?: Date;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  location?: ServiceOrderLocation;
  equipment?: ServiceOrderEquipment[];
  materials?: ServiceOrderMaterial[];
  tasks: ServiceOrderTask[];
  comments: ServiceOrderComment[];
  attachments: ServiceOrderAttachment[];
  history: ServiceOrderHistory[];
  qualification?: ServiceOrderQualification;
  cost?: ServiceOrderCost;
  provider?: ServiceOrderProvider;
  assignee?: User;
  customer?: Customer;
  tags: string[];
  customFields?: Record<string, string | number | boolean>;
}

// Status da ordem de serviço
export type ServiceOrderStatus =
  | 'draft'        // Rascunho
  | 'scheduled'    // Agendada
  | 'in_progress'  // Em andamento
  | 'on_hold'      // Em espera
  | 'completed'    // Concluída
  | 'cancelled'    // Cancelada
  | 'approved'     // Aprovada
  | 'rejected';    // Rejeitada

// Prioridade da ordem de serviço
export type ServiceOrderPriority =
  | 'low'          // Baixa
  | 'medium'       // Média
  | 'high'         // Alta
  | 'urgent';      // Urgente

// Tipo da ordem de serviço
export type ServiceOrderType =
  | 'installation'   // Instalação
  | 'maintenance'    // Manutenção
  | 'repair'         // Reparo
  | 'upgrade'        // Upgrade
  | 'inspection'     // Inspeção
  | 'configuration'  // Configuração
  | 'training'       // Treinamento
  | 'consultation';  // Consultoria

// Categoria da ordem de serviço
export type ServiceOrderCategory =
  | 'hardware'       // Hardware
  | 'software'       // Software
  | 'network'        // Rede
  | 'security'       // Segurança
  | 'infrastructure' // Infraestrutura
  | 'support'        // Suporte
  | 'project';       // Projeto

// Informações do cliente da OS
export interface ServiceOrderCustomerInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  department?: string;
  contactPerson?: string;
}

// Localização da OS
export interface ServiceOrderLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  instructions?: string;
}

// Equipamento da OS
export interface ServiceOrderEquipment {
  id: number;
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  status: 'active' | 'inactive' | 'maintenance';
}

// Material da OS
export interface ServiceOrderMaterial {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  supplier?: string;
  partNumber?: string;
}

// Tarefa da OS
export interface ServiceOrderTask {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: number;
  estimatedHours?: number;
  actualHours?: number;
  startedAt?: Date;
  completedAt?: Date;
  order: number;
  dependencies?: number[];
  assignee?: User;
}

// Comentário da OS
export interface ServiceOrderComment {
  id: number;
  content: string;
  isInternal: boolean;
  isEdited: boolean;
  editedAt?: Date;
  userId?: number;
  customerId?: number;
  user?: User;
  customer?: Customer;
  createdAt: Date;
  updatedAt: Date;
  attachments?: ServiceOrderAttachment[];
}

// Anexo da OS
export interface ServiceOrderAttachment {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: number;
  uploadedAt: Date;
  isPublic: boolean;
  category?: 'photo' | 'document' | 'video' | 'other';
}

// Histórico da OS
export interface ServiceOrderHistory {
  id: number;
  action: ServiceOrderHistoryAction;
  description: string;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
  userId?: number;
  user?: User;
  createdAt: Date;
  metadata?: Record<string, string | number | boolean>;
}

export type ServiceOrderHistoryAction =
  | 'created'
  | 'updated'
  | 'assigned'
  | 'unassigned'
  | 'status_changed'
  | 'priority_changed'
  | 'scheduled'
  | 'started'
  | 'completed'
  | 'cancelled'
  | 'task_added'
  | 'task_updated'
  | 'task_completed'
  | 'material_added'
  | 'material_updated'
  | 'comment_added'
  | 'attachment_added'
  | 'qualified';

// Qualificação da OS
export interface ServiceOrderQualification {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  aspects: {
    quality: 1 | 2 | 3 | 4 | 5;
    timeliness: 1 | 2 | 3 | 4 | 5;
    communication: 1 | 2 | 3 | 4 | 5;
    professionalism: 1 | 2 | 3 | 4 | 5;
  };
  submittedAt: Date;
  submittedBy: number;
  wouldRecommend: boolean;
}

// Custo da OS
export interface ServiceOrderCost {
  laborCost: number;
  materialCost: number;
  travelCost?: number;
  additionalCosts?: {
    description: string;
    amount: number;
  }[];
  totalCost: number;
  currency: string;
  approved: boolean;
  approvedBy?: number;
  approvedAt?: Date;
}

// Provedor da OS
export interface ServiceOrderProvider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  logo?: string;
}

// Tipos para criação de OS
export interface CreateServiceOrderData {
  title: string;
  description: string;
  priority: ServiceOrderPriority;
  type: ServiceOrderType;
  category: ServiceOrderCategory;
  customerId?: number;
  customerInfo: ServiceOrderCustomerInfo;
  scheduledDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  location?: ServiceOrderLocation;
  equipmentIds?: number[];
  materials?: Omit<ServiceOrderMaterial, 'id'>[];
  tasks?: Omit<ServiceOrderTask, 'id' | 'assignee'>[];
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
  attachments?: File[];
}

// Tipos para atualização de OS
export interface UpdateServiceOrderData {
  title?: string;
  description?: string;
  status?: ServiceOrderStatus;
  priority?: ServiceOrderPriority;
  type?: ServiceOrderType;
  category?: ServiceOrderCategory;
  assignedTo?: number;
  scheduledDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  location?: ServiceOrderLocation;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
}

// Tipos para filtros de OS
export interface ServiceOrderFilters {
  status?: ServiceOrderStatus[];
  priority?: ServiceOrderPriority[];
  type?: ServiceOrderType[];
  category?: ServiceOrderCategory[];
  assignedTo?: number[];
  customerId?: number;
  providerId?: number;
  tags?: string[];
  scheduledFrom?: Date;
  scheduledTo?: Date;
  dueFrom?: Date;
  dueTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
  search?: string;
}

// Tipos para estatísticas de OS
export interface ServiceOrderStatistics {
  total: number;
  byStatus: Record<ServiceOrderStatus, number>;
  byPriority: Record<ServiceOrderPriority, number>;
  byType: Record<ServiceOrderType, number>;
  byCategory: Record<ServiceOrderCategory, number>;
  averageCompletionTime: number;
  onTimeCompletion: {
    total: number;
    onTime: number;
    percentage: number;
  };
  customerSatisfaction: {
    average: number;
    total: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
  costAnalysis: {
    totalRevenue: number;
    averageCost: number;
    profitMargin: number;
  };
}

// Tipos para dashboard de OS
export interface ServiceOrderDashboard {
  statistics: ServiceOrderStatistics;
  recentOrders: ServiceOrder[];
  myOrders: ServiceOrder[];
  scheduledToday: ServiceOrder[];
  overdueOrders: ServiceOrder[];
  trends: {
    period: string;
    created: number[];
    completed: number[];
    labels: string[];
  };
}

// Tipos para kanban de OS
export type ServiceOrderKanbanBoard = {
  [key in ServiceOrderStatus]: ServiceOrderKanbanItem[];
};

export interface ServiceOrderKanbanItem {
  id: number;
  number: string;
  title: string;
  priority: ServiceOrderPriority;
  type: ServiceOrderType;
  assignee?: {
    id: number;
    name: string;
    avatar?: string;
  };
  customer: {
    name: string;
    company?: string;
  };
  scheduledDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  tags: string[];
  tasksProgress: {
    completed: number;
    total: number;
  };
  updatedAt: Date;
}