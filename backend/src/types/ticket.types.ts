// Tipos de sistema de tickets de suporte

import { AuditFields, Status, Priority } from './common.types';

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
  customFields?: Record<string, any>;
  slaStatus: SlaStatus;
  satisfaction?: CustomerSatisfaction;
  provider?: any; // Será definido em provider.types.ts
  assignee?: any; // Será definido em user.types.ts
  customer?: Customer;
  equipment?: any; // Será definido em equipment.types.ts
  comments: TicketComment[];
  attachments: TicketAttachment[];
  history: TicketHistory[];
  zabbixEvents?: any[]; // Será definido em zabbix.types.ts
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
  | 'technical'     // Técnico
  | 'billing'       // Cobrança
  | 'commercial'    // Comercial
  | 'installation'  // Instalação
  | 'maintenance'   // Manutenção
  | 'complaint'     // Reclamação
  | 'request'       // Solicitação
  | 'incident'      // Incidente
  | 'change'        // Mudança
  | 'other';        // Outros

// Fonte do ticket
export type TicketSource = 
  | 'manual'        // Criado manualmente
  | 'email'         // Email
  | 'phone'         // Telefone
  | 'chat'          // Chat
  | 'portal'        // Portal do cliente
  | 'api'           // API
  | 'zabbix'        // Zabbix (monitoramento)
  | 'mobile'        // App mobile
  | 'social'        // Redes sociais
  | 'other';        // Outros

// Status do SLA
export interface SlaStatus {
  responseTime: SlaMetric;
  resolutionTime: SlaMetric;
  overallStatus: 'met' | 'at_risk' | 'breached';
}

export interface SlaMetric {
  target: number; // em minutos
  elapsed: number; // em minutos
  remaining: number; // em minutos
  status: 'met' | 'at_risk' | 'breached';
  breachedAt?: Date;
}

// Informações do cliente
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF/CNPJ
  address?: string;
  company?: string;
  contractNumber?: string;
  serviceType?: string;
}

// Cliente completo
export interface Customer extends AuditFields {
  id: number;
  providerId: number;
  name: string;
  email: string;
  phone: string;
  document?: string;
  documentType?: 'cpf' | 'cnpj';
  address?: CustomerAddress;
  company?: string;
  contactPerson?: string;
  status: Status;
  customerType: 'residential' | 'business';
  serviceInfo?: ServiceInfo;
  billingInfo?: CustomerBillingInfo;
  preferences?: CustomerPreferences;
  tickets?: Ticket[];
}

export interface CustomerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ServiceInfo {
  plan: string;
  speed: string;
  technology: 'fiber' | 'cable' | 'dsl' | 'wireless' | 'satellite';
  installationDate?: Date;
  contractNumber: string;
  monthlyFee: number;
  status: 'active' | 'suspended' | 'cancelled';
}

export interface CustomerBillingInfo {
  billingEmail?: string;
  billingAddress?: CustomerAddress;
  paymentMethod: 'credit_card' | 'bank_slip' | 'bank_transfer' | 'pix';
  dueDate: number; // dia do mês
  autoDebit: boolean;
}

export interface CustomerPreferences {
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
  language: string;
  timezone: string;
  notifications: {
    maintenance: boolean;
    billing: boolean;
    promotions: boolean;
    outages: boolean;
  };
}

// Comentários do ticket
export interface TicketComment extends AuditFields {
  id: number;
  ticketId: number;
  userId: number;
  content: string;
  type: CommentType;
  visibility: CommentVisibility;
  timeSpent?: number; // em minutos
  attachments?: string[];
  user?: any; // Será definido em user.types.ts
}

export type CommentType = 
  | 'comment'       // Comentário
  | 'solution'      // Solução
  | 'workaround'    // Solução temporária
  | 'escalation'    // Escalação
  | 'status_change' // Mudança de status
  | 'assignment'    // Atribuição
  | 'system';       // Sistema

export type CommentVisibility = 
  | 'internal'      // Apenas equipe interna
  | 'customer'      // Visível para o cliente
  | 'public';       // Público

// Anexos do ticket
export interface TicketAttachment extends AuditFields {
  id: number;
  ticketId: number;
  commentId?: number;
  userId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  description?: string;
  isImage: boolean;
  thumbnailPath?: string;
}

// Histórico do ticket
export interface TicketHistory extends AuditFields {
  id: number;
  ticketId: number;
  userId: number;
  action: TicketAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  metadata?: Record<string, any>;
  user?: any; // Será definido em user.types.ts
}

export type TicketAction = 
  | 'created'
  | 'updated'
  | 'assigned'
  | 'unassigned'
  | 'status_changed'
  | 'priority_changed'
  | 'category_changed'
  | 'due_date_changed'
  | 'comment_added'
  | 'attachment_added'
  | 'attachment_removed'
  | 'escalated'
  | 'merged'
  | 'split'
  | 'linked'
  | 'unlinked'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'cancelled';

// Satisfação do cliente
export interface CustomerSatisfaction extends AuditFields {
  id: number;
  ticketId: number;
  rating: number; // 1-5
  feedback?: string;
  surveyToken: string;
  respondedAt?: Date;
  ipAddress?: string;
}

// DTOs para criação de ticket
export interface CreateTicketDto {
  title: string;
  description: string;
  priority?: Priority;
  category: TicketCategory;
  subcategory?: string;
  source?: TicketSource;
  customerId?: number;
  customerInfo: Omit<CustomerInfo, 'contractNumber' | 'serviceType'>;
  assignedTo?: number;
  dueDate?: Date;
  equipmentId?: number;
  tags?: string[];
  customFields?: Record<string, any>;
  attachments?: CreateAttachmentDto[];
}

export interface CreateAttachmentDto {
  filename: string;
  content: string; // base64
  mimeType: string;
  description?: string;
}

export interface CreateTicketResponse {
  ticket: Ticket;
  message: string;
}

// DTOs para atualização de ticket
export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: Priority;
  category?: TicketCategory;
  subcategory?: string;
  assignedTo?: number;
  dueDate?: Date;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateTicketResponse {
  ticket: Ticket;
  message: string;
}

// DTOs para comentários
export interface AddCommentDto {
  content: string;
  type?: CommentType;
  visibility?: CommentVisibility;
  timeSpent?: number;
  attachments?: CreateAttachmentDto[];
}

export interface AddCommentResponse {
  comment: TicketComment;
  message: string;
}

// DTOs para listagem de tickets
export interface ListTicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus | TicketStatus[];
  priority?: Priority | Priority[];
  category?: TicketCategory | TicketCategory[];
  source?: TicketSource | TicketSource[];
  assignedTo?: number;
  customerId?: number;
  equipmentId?: number;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  dueAfter?: Date;
  dueBefore?: Date;
  slaStatus?: 'met' | 'at_risk' | 'breached';
  sortBy?: keyof Ticket;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketListItem {
  id: number;
  number: string;
  title: string;
  status: TicketStatus;
  priority: Priority;
  category: TicketCategory;
  source: TicketSource;
  customerName: string;
  customerEmail: string;
  assignedTo?: {
    id: number;
    name: string;
  };
  dueDate?: Date;
  slaStatus: 'met' | 'at_risk' | 'breached';
  commentsCount: number;
  attachmentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de estatísticas de tickets
export interface TicketStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  pending: number;
  resolved: number;
  closed: number;
  cancelled: number;
  byPriority: Record<Priority, number>;
  byCategory: Record<TicketCategory, number>;
  bySource: Record<TicketSource, number>;
  averageResolutionTime: number; // em horas
  averageFirstResponseTime: number; // em horas
  slaCompliance: number; // percentual
  customerSatisfaction: number; // média 1-5
  overdueTickets: number;
  unassignedTickets: number;
}

// Tipos de relatórios
export interface TicketReport {
  id: string;
  name: string;
  type: ReportType;
  filters: ListTicketsQuery;
  generatedAt: Date;
  generatedBy: number;
  format: 'pdf' | 'excel' | 'csv';
  url: string;
  expiresAt: Date;
}

export type ReportType = 
  | 'summary'
  | 'detailed'
  | 'sla'
  | 'performance'
  | 'satisfaction'
  | 'trends';

// Tipos de automação
export interface TicketAutomation {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdBy: number;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AutomationTrigger {
  event: 'ticket_created' | 'ticket_updated' | 'comment_added' | 'status_changed' | 'overdue';
  conditions?: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface AutomationAction {
  type: 'assign' | 'change_status' | 'change_priority' | 'add_tag' | 'send_email' | 'create_task';
  parameters: Record<string, any>;
}

// Tipos de templates
export interface TicketTemplate {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  category: TicketCategory;
  title: string;
  content: string;
  priority: Priority;
  tags: string[];
  customFields?: Record<string, any>;
  isActive: boolean;
  usageCount: number;
  createdBy: number;
}

// Tipos de macros
export interface TicketMacro {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  actions: MacroAction[];
  isActive: boolean;
  usageCount: number;
  createdBy: number;
}

export interface MacroAction {
  type: 'change_status' | 'change_priority' | 'assign' | 'add_comment' | 'add_tag';
  parameters: Record<string, any>;
}

// Tipos de escalação
export interface EscalationRule {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  order: number;
}

export interface EscalationCondition {
  field: string;
  operator: string;
  value: any;
  timeframe?: number; // em minutos
}

export interface EscalationAction {
  type: 'assign' | 'notify' | 'change_priority' | 'add_comment';
  parameters: Record<string, any>;
  delay?: number; // em minutos
}