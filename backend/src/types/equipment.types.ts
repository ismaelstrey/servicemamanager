// Tipos de equipamentos de rede

import { AuditFields, Status, Priority } from './common.types';

// Tipo principal do equipamento
export interface Equipment extends AuditFields {
  id: number;
  providerId: number;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber?: string;
  macAddress?: string;
  ipAddress: string;
  location: string;
  description?: string;
  status: EquipmentStatus;
  monitoringEnabled: boolean;
  specifications: EquipmentSpecifications;
  networkConfig: NetworkConfiguration;
  credentials?: EquipmentCredentials;
  monitoring?: MonitoringConfig;
  maintenance?: MaintenanceInfo;
  warranty?: WarrantyInfo;
  tags: string[];
  customFields?: Record<string, any>;
  provider?: any; // Será definido em provider.types.ts
  tickets?: any[]; // Será definido em ticket.types.ts
  alerts?: EquipmentAlert[];
  metrics?: EquipmentMetrics[];
}

// Tipos de equipamento
export type EquipmentType = 
  | 'router'           // Roteador
  | 'switch'           // Switch
  | 'access_point'     // Ponto de acesso
  | 'modem'           // Modem
  | 'firewall'        // Firewall
  | 'server'          // Servidor
  | 'antenna'         // Antena
  | 'radio'           // Rádio
  | 'ont'             // ONT (Optical Network Terminal)
  | 'olt'             // OLT (Optical Line Terminal)
  | 'ups'             // No-break
  | 'camera'          // Câmera IP
  | 'other';          // Outros

// Status do equipamento
export type EquipmentStatus = 
  | 'online'          // Online
  | 'offline'         // Offline
  | 'warning'         // Alerta
  | 'critical'        // Crítico
  | 'maintenance'     // Em manutenção
  | 'decommissioned'  // Descomissionado
  | 'unknown';        // Desconhecido

// Especificações técnicas
export interface EquipmentSpecifications {
  cpu?: string;
  memory?: string;
  storage?: string;
  ports?: PortInfo[];
  powerConsumption?: number; // em watts
  operatingTemp?: TemperatureRange;
  dimensions?: Dimensions;
  weight?: number; // em kg
  firmware?: FirmwareInfo;
  protocols?: string[];
  features?: string[];
}

export interface PortInfo {
  number: number;
  type: 'ethernet' | 'fiber' | 'usb' | 'serial' | 'power';
  speed?: string; // ex: "1Gbps", "100Mbps"
  status: 'up' | 'down' | 'disabled';
  description?: string;
}

export interface TemperatureRange {
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit';
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
  unit: 'mm' | 'cm' | 'inches';
}

export interface FirmwareInfo {
  version: string;
  releaseDate?: Date;
  updateAvailable?: boolean;
  latestVersion?: string;
}

// Configuração de rede
export interface NetworkConfiguration {
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  dns: string[];
  vlan?: number;
  dhcpEnabled: boolean;
  staticRoutes?: StaticRoute[];
  wirelessConfig?: WirelessConfiguration;
  qosConfig?: QosConfiguration;
}

export interface StaticRoute {
  destination: string;
  gateway: string;
  metric?: number;
}

export interface WirelessConfiguration {
  ssid: string;
  security: 'open' | 'wep' | 'wpa' | 'wpa2' | 'wpa3';
  channel: number;
  frequency: '2.4GHz' | '5GHz' | 'dual';
  maxClients?: number;
  hiddenSSID: boolean;
}

export interface QosConfiguration {
  enabled: boolean;
  uploadLimit?: number; // em Mbps
  downloadLimit?: number; // em Mbps
  priorityRules?: QosRule[];
}

export interface QosRule {
  id: string;
  name: string;
  priority: Priority;
  protocol?: string;
  sourceIP?: string;
  destinationIP?: string;
  port?: number;
  bandwidth?: number;
}

// Credenciais de acesso
export interface EquipmentCredentials {
  username: string;
  password: string; // Será criptografado
  enablePassword?: string; // Para equipamentos Cisco
  snmpCommunity?: string;
  sshKey?: string;
  accessMethod: 'ssh' | 'telnet' | 'http' | 'https' | 'snmp';
  port?: number;
}

// Configuração de monitoramento
export interface MonitoringConfig {
  enabled: boolean;
  interval: number; // em segundos
  timeout: number; // em segundos
  retries: number;
  methods: MonitoringMethod[];
  thresholds: MonitoringThresholds;
  notifications: MonitoringNotifications;
}

export type MonitoringMethod = 
  | 'ping'
  | 'snmp'
  | 'ssh'
  | 'http'
  | 'tcp_port';

export interface MonitoringThresholds {
  cpu?: ThresholdConfig;
  memory?: ThresholdConfig;
  temperature?: ThresholdConfig;
  bandwidth?: ThresholdConfig;
  diskSpace?: ThresholdConfig;
  responseTime?: ThresholdConfig;
}

export interface ThresholdConfig {
  warning: number;
  critical: number;
  unit: string;
}

export interface MonitoringNotifications {
  onDown: boolean;
  onUp: boolean;
  onWarning: boolean;
  onCritical: boolean;
  recipients: string[];
}

// Informações de manutenção
export interface MaintenanceInfo {
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  maintenanceInterval?: number; // em dias
  maintenanceNotes?: string;
  maintenanceHistory: MaintenanceRecord[];
}

export interface MaintenanceRecord extends AuditFields {
  id: number;
  equipmentId: number;
  type: MaintenanceType;
  description: string;
  performedBy: number;
  performedAt: Date;
  duration?: number; // em minutos
  cost?: number;
  notes?: string;
  attachments?: string[];
}

export type MaintenanceType = 
  | 'preventive'
  | 'corrective'
  | 'upgrade'
  | 'replacement'
  | 'cleaning'
  | 'calibration';

// Informações de garantia
export interface WarrantyInfo {
  provider: string;
  startDate: Date;
  endDate: Date;
  type: 'manufacturer' | 'extended' | 'service';
  coverage: string;
  contactInfo?: string;
  documentUrl?: string;
}

// Alertas do equipamento
export interface EquipmentAlert extends AuditFields {
  id: number;
  equipmentId: number;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details?: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: number;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  notificationSent: boolean;
}

export type AlertType = 
  | 'connectivity'
  | 'performance'
  | 'hardware'
  | 'security'
  | 'configuration'
  | 'maintenance'
  | 'threshold';

// Métricas do equipamento
export interface EquipmentMetrics extends AuditFields {
  id: number;
  equipmentId: number;
  timestamp: Date;
  metrics: MetricData;
}

export interface MetricData {
  uptime?: number; // em segundos
  cpuUsage?: number; // percentual
  memoryUsage?: number; // percentual
  temperature?: number; // em celsius
  bandwidth?: BandwidthMetrics;
  packetLoss?: number; // percentual
  responseTime?: number; // em ms
  diskUsage?: DiskMetrics[];
  interfaceStats?: InterfaceMetrics[];
}

export interface BandwidthMetrics {
  inbound: number; // em bps
  outbound: number; // em bps
  utilization: number; // percentual
}

export interface DiskMetrics {
  device: string;
  total: number; // em bytes
  used: number; // em bytes
  available: number; // em bytes
  utilization: number; // percentual
}

export interface InterfaceMetrics {
  name: string;
  status: 'up' | 'down';
  speed: number; // em bps
  inOctets: number;
  outOctets: number;
  inPackets: number;
  outPackets: number;
  inErrors: number;
  outErrors: number;
}

// DTOs para criação de equipamento
export interface CreateEquipmentDto {
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber?: string;
  macAddress?: string;
  ipAddress: string;
  location: string;
  description?: string;
  monitoringEnabled?: boolean;
  specifications?: Partial<EquipmentSpecifications>;
  networkConfig: Omit<NetworkConfiguration, 'staticRoutes' | 'wirelessConfig' | 'qosConfig'>;
  credentials?: Omit<EquipmentCredentials, 'password'> & { password: string };
  monitoring?: Partial<MonitoringConfig>;
  warranty?: WarrantyInfo;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateEquipmentResponse {
  equipment: Equipment;
  message: string;
}

// DTOs para atualização de equipamento
export interface UpdateEquipmentDto {
  name?: string;
  type?: EquipmentType;
  brand?: string;
  model?: string;
  serialNumber?: string;
  macAddress?: string;
  ipAddress?: string;
  location?: string;
  description?: string;
  monitoringEnabled?: boolean;
  specifications?: Partial<EquipmentSpecifications>;
  networkConfig?: Partial<NetworkConfiguration>;
  credentials?: Partial<EquipmentCredentials>;
  monitoring?: Partial<MonitoringConfig>;
  warranty?: Partial<WarrantyInfo>;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateEquipmentResponse {
  equipment: Equipment;
  message: string;
}

// DTOs para listagem de equipamentos
export interface ListEquipmentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: EquipmentType;
  status?: EquipmentStatus;
  location?: string;
  brand?: string;
  monitoringEnabled?: boolean;
  tags?: string[];
  sortBy?: keyof Equipment;
  sortOrder?: 'asc' | 'desc';
}

export interface EquipmentListItem {
  id: number;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  ipAddress: string;
  location: string;
  status: EquipmentStatus;
  monitoringEnabled: boolean;
  lastSeen?: Date;
  uptime?: number;
  alertsCount: number;
  createdAt: Date;
}

// Tipos de estatísticas de equipamentos
export interface EquipmentStats {
  total: number;
  online: number;
  offline: number;
  warning: number;
  critical: number;
  byType: Record<EquipmentType, number>;
  byStatus: Record<EquipmentStatus, number>;
  byLocation: Record<string, number>;
  averageUptime: number;
  totalAlerts: number;
  activeAlerts: number;
}

// Tipos de backup/restore de configuração
export interface ConfigurationBackup extends AuditFields {
  id: number;
  equipmentId: number;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  size: number; // em bytes
  checksum: string;
  createdBy: number;
}

export interface BackupConfigurationDto {
  name: string;
  description?: string;
}

export interface RestoreConfigurationDto {
  backupId: number;
  confirmRestore: boolean;
}

// Tipos de descoberta automática de equipamentos
export interface NetworkDiscovery {
  id: string;
  providerId: number;
  name: string;
  ipRange: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  discoveredDevices: DiscoveredDevice[];
  settings: DiscoverySettings;
}

export interface DiscoveredDevice {
  ipAddress: string;
  macAddress?: string;
  hostname?: string;
  vendor?: string;
  deviceType?: string;
  openPorts: number[];
  services: string[];
  responseTime: number;
  imported: boolean;
}

export interface DiscoverySettings {
  timeout: number;
  retries: number;
  portScan: boolean;
  snmpCommunity?: string;
  credentials?: {
    username: string;
    password: string;
  };
}