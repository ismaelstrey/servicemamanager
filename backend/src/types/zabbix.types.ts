// Tipos de integração com Zabbix

import { AuditFields, Status, Priority } from './common.types';

// Servidor Zabbix
export interface ZabbixServer extends AuditFields {
  id: number;
  providerId: number;
  name: string;
  url: string;
  version?: string;
  username: string;
  password: string; // Será criptografado
  token?: string; // Token de API se disponível
  isActive: boolean;
  lastSync?: Date;
  syncInterval: number; // em minutos
  connectionTimeout: number; // em segundos
  retryAttempts: number;
  sslVerify: boolean;
  description?: string;
  tags: string[];
  config?: ZabbixConfig;
  events?: ZabbixEvent[];
  hosts?: ZabbixHost[];
  provider?: any; // Será definido em provider.types.ts
}

// Configuração do Zabbix
export interface ZabbixConfig extends AuditFields {
  id: number;
  zabbixServerId: number;
  webhookUrl: string;
  webhookToken: string;
  eventFilters: ZabbixEventFilter[];
  ticketCreation: ZabbixTicketCreation;
  hostMapping: ZabbixHostMapping[];
  notificationSettings: ZabbixNotificationSettings;
  syncSettings: ZabbixSyncSettings;
  isActive: boolean;
  zabbixServer?: ZabbixServer;
}

// Filtros de eventos
export interface ZabbixEventFilter {
  id: string;
  name: string;
  enabled: boolean;
  conditions: ZabbixFilterCondition[];
  actions: ZabbixFilterAction[];
  priority: number;
}

export interface ZabbixFilterCondition {
  field: ZabbixEventField;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'regex';
  value: string;
  caseSensitive?: boolean;
}

export type ZabbixEventField = 
  | 'host'
  | 'trigger'
  | 'severity'
  | 'status'
  | 'tag'
  | 'group'
  | 'item'
  | 'value';

export interface ZabbixFilterAction {
  type: 'create_ticket' | 'update_ticket' | 'ignore' | 'notify' | 'escalate';
  parameters: Record<string, any>;
}

// Configuração de criação de tickets
export interface ZabbixTicketCreation {
  enabled: boolean;
  autoAssign: boolean;
  defaultAssignee?: number;
  priorityMapping: ZabbixPriorityMapping;
  categoryMapping: ZabbixCategoryMapping;
  titleTemplate: string;
  descriptionTemplate: string;
  tagMapping: ZabbixTagMapping[];
  customFieldMapping: ZabbixCustomFieldMapping[];
  duplicateHandling: ZabbixDuplicateHandling;
}

export interface ZabbixPriorityMapping {
  disaster: Priority;
  high: Priority;
  average: Priority;
  warning: Priority;
  information: Priority;
  not_classified: Priority;
}

export interface ZabbixCategoryMapping {
  default: string;
  byHostGroup: Record<string, string>;
  byTrigger: Record<string, string>;
  byTag: Record<string, string>;
}

export interface ZabbixTagMapping {
  zabbixTag: string;
  ticketTag: string;
  condition?: string;
}

export interface ZabbixCustomFieldMapping {
  fieldName: string;
  zabbixField: ZabbixEventField;
  transform?: string; // Função de transformação
  defaultValue?: string;
}

export interface ZabbixDuplicateHandling {
  enabled: boolean;
  timeWindow: number; // em minutos
  mergeStrategy: 'update_existing' | 'create_new' | 'ignore_new';
  matchFields: ZabbixEventField[];
}

// Mapeamento de hosts
export interface ZabbixHostMapping extends AuditFields {
  id: number;
  configId: number;
  zabbixHostId: string;
  zabbixHostName: string;
  equipmentId?: number;
  customerId?: number;
  location?: string;
  tags: string[];
  isActive: boolean;
  lastSync?: Date;
  equipment?: any; // Será definido em equipment.types.ts
  customer?: any; // Será definido em ticket.types.ts (Customer)
}

// Configurações de notificação
export interface ZabbixNotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  webhookNotifications: boolean;
  slackIntegration?: ZabbixSlackConfig;
  teamsIntegration?: ZabbixTeamsConfig;
  customWebhooks: ZabbixCustomWebhook[];
}

export interface ZabbixSlackConfig {
  enabled: boolean;
  webhookUrl: string;
  channel: string;
  username?: string;
  iconEmoji?: string;
  mentionUsers: string[];
}

export interface ZabbixTeamsConfig {
  enabled: boolean;
  webhookUrl: string;
  mentionUsers: string[];
}

export interface ZabbixCustomWebhook {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  bodyTemplate: string;
  enabled: boolean;
  retryAttempts: number;
  timeout: number;
}

// Configurações de sincronização
export interface ZabbixSyncSettings {
  syncHosts: boolean;
  syncTriggers: boolean;
  syncEvents: boolean;
  syncItems: boolean;
  syncGraphs: boolean;
  hostGroupFilters: string[];
  templateFilters: string[];
  tagFilters: string[];
  maxEventsPerSync: number;
  syncHistoryDays: number;
}

// Evento do Zabbix
export interface ZabbixEvent extends AuditFields {
  id: number;
  zabbixServerId: number;
  zabbixEventId: string;
  eventType: ZabbixEventType;
  status: ZabbixEventStatus;
  severity: ZabbixSeverity;
  hostId: string;
  hostName: string;
  hostGroups: string[];
  triggerId?: string;
  triggerName?: string;
  triggerDescription?: string;
  itemId?: string;
  itemName?: string;
  itemValue?: string;
  eventTime: Date;
  acknowledgedTime?: Date;
  acknowledgedBy?: string;
  recoveryTime?: Date;
  duration?: number; // em segundos
  tags: ZabbixEventTag[];
  customFields: Record<string, any>;
  ticketId?: number;
  processed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  rawData: Record<string, any>;
  zabbixServer?: ZabbixServer;
  ticket?: any; // Será definido em ticket.types.ts
}

export type ZabbixEventType = 
  | 'trigger'
  | 'discovery'
  | 'autoregistration'
  | 'internal'
  | 'service';

export type ZabbixEventStatus = 
  | 'problem'
  | 'ok'
  | 'unknown';

export type ZabbixSeverity = 
  | 'not_classified'
  | 'information'
  | 'warning'
  | 'average'
  | 'high'
  | 'disaster';

export interface ZabbixEventTag {
  tag: string;
  value?: string;
}

// Host do Zabbix
export interface ZabbixHost extends AuditFields {
  id: number;
  zabbixServerId: number;
  zabbixHostId: string;
  name: string;
  visibleName?: string;
  description?: string;
  status: ZabbixHostStatus;
  available: ZabbixHostAvailable;
  ipAddress?: string;
  dnsName?: string;
  port?: number;
  groups: string[];
  templates: string[];
  tags: ZabbixEventTag[];
  inventory: ZabbixHostInventory;
  interfaces: ZabbixHostInterface[];
  items: ZabbixItem[];
  triggers: ZabbixTrigger[];
  lastSync: Date;
  equipmentId?: number;
  customerId?: number;
  zabbixServer?: ZabbixServer;
  equipment?: any; // Será definido em equipment.types.ts
}

export type ZabbixHostStatus = 
  | 'monitored'
  | 'unmonitored';

export type ZabbixHostAvailable = 
  | 'available'
  | 'unavailable'
  | 'unknown';

export interface ZabbixHostInventory {
  type?: string;
  name?: string;
  alias?: string;
  os?: string;
  osShort?: string;
  osFullDetails?: string;
  serialNumberA?: string;
  serialNumberB?: string;
  tag?: string;
  assetTag?: string;
  macAddressA?: string;
  macAddressB?: string;
  hardware?: string;
  hardwareFullDetails?: string;
  software?: string;
  softwareFullDetails?: string;
  softwareAppA?: string;
  softwareAppB?: string;
  softwareAppC?: string;
  softwareAppD?: string;
  softwareAppE?: string;
  contact?: string;
  location?: string;
  locationLat?: string;
  locationLon?: string;
  notes?: string;
  chassis?: string;
  model?: string;
  hwArch?: string;
  vendor?: string;
  contractNumber?: string;
  installerName?: string;
  deploymentStatus?: string;
  urlA?: string;
  urlB?: string;
  urlC?: string;
  hostNetworks?: string;
  hostNetmask?: string;
  hostRouter?: string;
  oobIp?: string;
  oobNetmask?: string;
  oobRouter?: string;
  dateHwPurchase?: string;
  dateHwInstall?: string;
  dateHwExpiry?: string;
  dateHwDecomm?: string;
  siteAddressA?: string;
  siteAddressB?: string;
  siteAddressC?: string;
  siteCity?: string;
  siteState?: string;
  siteCountry?: string;
  siteZip?: string;
  siteRack?: string;
  siteNotes?: string;
  pocPrimaryName?: string;
  pocPrimaryEmail?: string;
  pocPrimaryPhoneA?: string;
  pocPrimaryPhoneB?: string;
  pocPrimaryScreenName?: string;
  pocPrimaryNotes?: string;
  pocSecondaryName?: string;
  pocSecondaryEmail?: string;
  pocSecondaryPhoneA?: string;
  pocSecondaryPhoneB?: string;
  pocSecondaryScreenName?: string;
  pocSecondaryNotes?: string;
}

export interface ZabbixHostInterface {
  interfaceId: string;
  type: ZabbixInterfaceType;
  main: boolean;
  useip: boolean;
  ip: string;
  dns: string;
  port: string;
  details?: ZabbixInterfaceDetails;
}

export type ZabbixInterfaceType = 
  | 'agent'
  | 'snmp'
  | 'ipmi'
  | 'jmx';

export interface ZabbixInterfaceDetails {
  version?: string;
  bulk?: boolean;
  community?: string;
  securityname?: string;
  securitylevel?: string;
  authpassphrase?: string;
  privpassphrase?: string;
  authprotocol?: string;
  privprotocol?: string;
  contextname?: string;
}

// Item do Zabbix
export interface ZabbixItem extends AuditFields {
  id: number;
  zabbixServerId: number;
  zabbixItemId: string;
  hostId: string;
  name: string;
  key: string;
  type: ZabbixItemType;
  valueType: ZabbixValueType;
  units?: string;
  description?: string;
  status: ZabbixItemStatus;
  state: ZabbixItemState;
  error?: string;
  delay: string;
  history: string;
  trends: string;
  lastValue?: string;
  lastClock?: Date;
  prevValue?: string;
  tags: ZabbixEventTag[];
  preprocessing: ZabbixPreprocessing[];
  triggers: string[]; // IDs dos triggers
  lastSync: Date;
}

export type ZabbixItemType = 
  | 'zabbix_agent'
  | 'snmp_v1'
  | 'snmp_v2c'
  | 'snmp_v3'
  | 'zabbix_trapper'
  | 'simple_check'
  | 'internal'
  | 'zabbix_agent_active'
  | 'external_check'
  | 'database_monitor'
  | 'ipmi_agent'
  | 'ssh_agent'
  | 'telnet_agent'
  | 'calculated'
  | 'jmx_agent'
  | 'snmp_trap'
  | 'dependent_item'
  | 'http_agent'
  | 'script';

export type ZabbixValueType = 
  | 'float'
  | 'character'
  | 'log'
  | 'unsigned_integer'
  | 'text';

export type ZabbixItemStatus = 
  | 'enabled'
  | 'disabled';

export type ZabbixItemState = 
  | 'normal'
  | 'not_supported';

export interface ZabbixPreprocessing {
  type: string;
  params: string;
  errorHandler: string;
  errorHandlerParams: string;
}

// Trigger do Zabbix
export interface ZabbixTrigger extends AuditFields {
  id: number;
  zabbixServerId: number;
  zabbixTriggerId: string;
  description: string;
  expression: string;
  recoveryExpression?: string;
  priority: ZabbixSeverity;
  status: ZabbixTriggerStatus;
  state: ZabbixTriggerState;
  value: ZabbixTriggerValue;
  lastChange?: Date;
  error?: string;
  url?: string;
  comments?: string;
  tags: ZabbixEventTag[];
  dependencies: string[]; // IDs de outros triggers
  hosts: string[]; // IDs dos hosts
  items: string[]; // IDs dos items
  lastSync: Date;
}

export type ZabbixTriggerStatus = 
  | 'enabled'
  | 'disabled';

export type ZabbixTriggerState = 
  | 'normal'
  | 'unknown';

export type ZabbixTriggerValue = 
  | 'ok'
  | 'problem';

// DTOs para webhook do Zabbix
export interface ZabbixWebhookPayload {
  eventId: string;
  eventType: ZabbixEventType;
  eventStatus: ZabbixEventStatus;
  eventSeverity: ZabbixSeverity;
  eventTime: string;
  eventRecoveryTime?: string;
  eventAcknowledgeTime?: string;
  eventAcknowledgeBy?: string;
  hostId: string;
  hostName: string;
  hostGroups: string[];
  triggerId?: string;
  triggerName?: string;
  triggerDescription?: string;
  triggerExpression?: string;
  triggerUrl?: string;
  itemId?: string;
  itemName?: string;
  itemKey?: string;
  itemValue?: string;
  tags: ZabbixEventTag[];
  customFields?: Record<string, any>;
  rawData: Record<string, any>;
}

// DTOs para configuração
export interface CreateZabbixServerDto {
  name: string;
  url: string;
  username: string;
  password: string;
  syncInterval?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  sslVerify?: boolean;
  description?: string;
  tags?: string[];
}

export interface UpdateZabbixServerDto {
  name?: string;
  url?: string;
  username?: string;
  password?: string;
  syncInterval?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  sslVerify?: boolean;
  description?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface CreateZabbixConfigDto {
  eventFilters?: ZabbixEventFilter[];
  ticketCreation?: Partial<ZabbixTicketCreation>;
  hostMapping?: Omit<ZabbixHostMapping, 'id' | 'configId' | 'createdAt' | 'updatedAt'>[];
  notificationSettings?: Partial<ZabbixNotificationSettings>;
  syncSettings?: Partial<ZabbixSyncSettings>;
}

export interface UpdateZabbixConfigDto extends Partial<CreateZabbixConfigDto> {
  isActive?: boolean;
}

// DTOs para listagem
export interface ListZabbixServersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  tags?: string[];
  sortBy?: keyof ZabbixServer;
  sortOrder?: 'asc' | 'desc';
}

export interface ListZabbixEventsQuery {
  page?: number;
  limit?: number;
  search?: string;
  eventType?: ZabbixEventType;
  status?: ZabbixEventStatus;
  severity?: ZabbixSeverity | ZabbixSeverity[];
  hostName?: string;
  hostGroups?: string[];
  processed?: boolean;
  hasTicket?: boolean;
  eventTimeAfter?: Date;
  eventTimeBefore?: Date;
  sortBy?: keyof ZabbixEvent;
  sortOrder?: 'asc' | 'desc';
}

export interface ListZabbixHostsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ZabbixHostStatus;
  available?: ZabbixHostAvailable;
  groups?: string[];
  templates?: string[];
  hasEquipment?: boolean;
  sortBy?: keyof ZabbixHost;
  sortOrder?: 'asc' | 'desc';
}

// Tipos de resposta
export interface ZabbixServerResponse {
  server: ZabbixServer;
  message: string;
}

export interface ZabbixConfigResponse {
  config: ZabbixConfig;
  message: string;
}

export interface ZabbixEventResponse {
  event: ZabbixEvent;
  ticket?: any; // Será definido em ticket.types.ts
  message: string;
}

// Tipos de estatísticas
export interface ZabbixStats {
  totalServers: number;
  activeServers: number;
  totalEvents: number;
  unprocessedEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  eventsBySeverity: Record<ZabbixSeverity, number>;
  eventsByStatus: Record<ZabbixEventStatus, number>;
  ticketsCreated: number;
  averageProcessingTime: number; // em segundos
  topHosts: {
    hostName: string;
    eventsCount: number;
  }[];
  topTriggers: {
    triggerName: string;
    eventsCount: number;
  }[];
}

// Tipos de sincronização
export interface ZabbixSyncResult {
  serverId: number;
  startTime: Date;
  endTime: Date;
  duration: number; // em segundos
  success: boolean;
  error?: string;
  stats: {
    hostsSync: number;
    triggersSync: number;
    itemsSync: number;
    eventsSync: number;
    errorsCount: number;
  };
  details: ZabbixSyncDetail[];
}

export interface ZabbixSyncDetail {
  type: 'host' | 'trigger' | 'item' | 'event';
  action: 'create' | 'update' | 'delete' | 'skip';
  objectId: string;
  objectName: string;
  success: boolean;
  error?: string;
}

// Tipos de teste de conexão
export interface ZabbixConnectionTest {
  success: boolean;
  responseTime: number; // em ms
  version?: string;
  error?: string;
  details: {
    urlReachable: boolean;
    authenticationValid: boolean;
    apiAccessible: boolean;
    permissionsValid: boolean;
  };
}