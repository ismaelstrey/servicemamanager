// Tipos de sistema de tickets de suporte

import type { AuditFields, Priority } from './common';
import type { User } from './user';

// Tipo principal do ticket
export interface Ticket extends AuditFields {
  id: number;
  providerId: number;
  number: string; // Número único do ticket (ex: TK-2024-001)
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  category: TicketCategory;
  subcategory?: string;
  source: TicketSource;
  customerId?: number;
  customerInfo: CustomerInfo;
  assignedTo?: number;
  assignedBy?: number;
  assignedAt?: Date;
  dueDate?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  resolutionTime?: number; // em minutos
  firstResponseTime?: number; // em minutos
  tags: string[];
  customFields?: Record<string, string | number | boolean>;
  slaStatus: SlaStatus;
  satisfaction?: CustomerSatisfaction;
  provider?: TicketProvider;
  assignee?: User;
  customer?: Customer;
  equipment?: TicketEquipment;
  comments: TicketComment[];
  attachments: TicketAttachment[];
  history: TicketHistory[];
}

// Status do ticket
export type TicketStatus = 
  | 'open'        // Aberto
  | 'assigned'    // Atribuído
  | 'in_progress' // Em andamento
  | 'pending'     // Pendente (aguardando cliente)
  | 'resolved'    // Resolvido
  | 'closed'      // Fechado
  | 'cancelled';  // Cancelado

// Categoria do ticket
export type TicketCategory =
  | 'hardware'     // Hardware
  | 'software'     // Software
  | 'network'      // Rede
  | 'security'     // Segurança
  | 'access'       // Acesso
  | 'email'        // Email
  | 'backup'       // Backup
  | 'maintenance'  // Manutenção
  | 'training'     // Treinamento
  | 'other';       // Outros

// Fonte do ticket
export type TicketSource =
  | 'web'          // Portal web
  | 'email'        // Email
  | 'phone'        // Telefone
  | 'chat'         // Chat
  | 'api'          // API
  | 'mobile'       // App mobile
  | 'monitoring';  // Sistema de monitoramento

// Status do SLA
export type SlaStatus =
  | 'within_sla'   // Dentro do SLA
  | 'approaching'  // Próximo do vencimento
  | 'breached';    // SLA violado

// Informações do cliente
export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  department?: string;
}

// Cliente
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  department?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Provedor do ticket
export interface TicketProvider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  logo?: string;
}

// Equipamento relacionado ao ticket
export interface TicketEquipment {
  id: number;
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  location?: string;
}

// Comentário do ticket
export interface TicketComment {
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
  attachments?: TicketAttachment[];
}

// Anexo do ticket
export interface TicketAttachment {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: number;
  uploadedAt: Date;
  isPublic: boolean;
}

// Histórico do ticket
export interface TicketHistory {
  id: number;
  action: TicketHistoryAction;
  description: string;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
  userId?: number;
  user?: User;
  createdAt: Date;
  metadata?: Record<string, string | number | boolean>;
}

export type TicketHistoryAction =
  | 'created'
  | 'updated'
  | 'assigned'
  | 'unassigned'
  | 'status_changed'
  | 'priority_changed'
  | 'category_changed'
  | 'comment_added'
  | 'attachment_added'
  | 'attachment_removed'
  | 'resolved'
  | 'closed'
  | 'reopened';

// Satisfação do cliente
export interface CustomerSatisfaction {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  submittedAt: Date;
  submittedBy: number;
}

// Tipos para criação de ticket
export interface CreateTicketData {
  title: string;
  description: string;
  priority: Priority;
  category: TicketCategory;
  subcategory?: string;
  source: TicketSource;
  customerId?: number;
  customerInfo: CustomerInfo;
  equipmentId?: number;
  dueDate?: Date;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
  attachments?: File[];
}

// Tipos para atualização de ticket
export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: Priority;
  category?: TicketCategory;
  subcategory?: string;
  assignedTo?: number;
  dueDate?: Date;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
}

// Tipos para filtros de ticket
export interface TicketFilters {
  status?: TicketStatus[];
  priority?: Priority[];
  category?: TicketCategory[];
  assignedTo?: number[];
  customerId?: number;
  providerId?: number;
  source?: TicketSource[];
  slaStatus?: SlaStatus[];
  tags?: string[];
  createdFrom?: Date;
  createdTo?: Date;
  dueFrom?: Date;
  dueTo?: Date;
  search?: string;
}

// Tipos para estatísticas de tickets
export interface TicketStatistics {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<Priority, number>;
  byCategory: Record<TicketCategory, number>;
  slaCompliance: {
    total: number;
    withinSla: number;
    breached: number;
    percentage: number;
  };
  averageResolutionTime: number;
  averageFirstResponseTime: number;
  customerSatisfaction: {
    average: number;
    total: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
}

// Tipos para dashboard de tickets
export interface TicketDashboard {
  statistics: TicketStatistics;
  recentTickets: Ticket[];
  myTickets: Ticket[];
  urgentTickets: Ticket[];
  slaAlerts: Ticket[];
  trends: {
    period: string;
    created: number[];
    resolved: number[];
    labels: string[];
  };
}

// Tipos para kanban de tickets
export type TicketKanbanBoard = {
  [key in TicketStatus]: TicketKanbanItem[];
};

export interface TicketKanbanItem {
  id: number;
  number: string;
  title: string;
  priority: Priority;
  assignee?: {
    id: number;
    name: string;
    avatar?: string;
  };
  customer: {
    name: string;
    company?: string;
  };
  dueDate?: Date;
  tags: string[];
  commentsCount: number;
  attachmentsCount: number;
  updatedAt: Date;
}