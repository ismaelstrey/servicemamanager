import { prisma } from '../lib/prisma';

export interface EquipmentHealthMetrics {
  equipmentId: number;
  healthScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedFailureDate?: Date;
  confidence: number;
  maintenanceRecommendation: string;
  criticalFactors: string[];
  historicalPattern: {
    avgTicketsPerMonth: number;
    lastMaintenanceDate?: Date;
    daysSinceLastMaintenance: number;
    failureFrequency: number;
  };
}

export interface FaultPredictionModel {
  equipmentType: string;
  riskFactors: {
    age: number;
    ticketFrequency: number;
    maintenanceGap: number;
    seasonality: number;
    criticalIncidents: number;
  };
  thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  accuracy: number;
  lastUpdate: Date;
}

export interface PredictiveMaintenanceSchedule {
  equipmentId: number;
  recommendedDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  preventedIssues: string[];
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
}

export class FaultPredictionService {
  private predictionModels: Map<string, FaultPredictionModel> = new Map();

  /**
   * Analisa a saúde de todos os equipamentos de um provedor
   */
  async analyzeEquipmentHealth(providerId: number): Promise<EquipmentHealthMetrics[]> {
    try {
      const equipments = await this.getProviderEquipments(providerId);
      const healthMetrics: EquipmentHealthMetrics[] = [];

      for (const equipment of equipments) {
        const metrics = await this.calculateEquipmentHealth(equipment);
        healthMetrics.push(metrics);
      }

      // Ordenar por risco (crítico primeiro)
      return healthMetrics.sort((a, b) => {
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      });
    } catch (error) {
      console.error('Erro na análise de saúde dos equipamentos:', error);
      throw error;
    }
  }

  /**
   * Prediz falhas específicas para um equipamento
   */
  async predictEquipmentFailures(equipmentId: number): Promise<{
    predictions: Array<{
      failureType: string;
      probability: number;
      estimatedDate: Date;
      impact: 'low' | 'medium' | 'high' | 'critical';
      preventionActions: string[];
    }>;
    overallRisk: number;
    recommendedActions: string[];
  }> {
    try {
      const equipment = await this.getEquipmentDetails(equipmentId);
      const historicalData = await this.getEquipmentHistory(equipmentId);
      
      // Analisar padrões de falha
      const failurePatterns = this.analyzeFailurePatterns(historicalData);
      
      // Gerar previsões
      const predictions = this.generateFailurePredictions(equipment, failurePatterns);
      
      // Calcular risco geral
      const overallRisk = this.calculateOverallRisk(predictions);
      
      // Gerar recomendações
      const recommendedActions = this.generatePreventionRecommendations(predictions, equipment);

      return {
        predictions,
        overallRisk,
        recommendedActions
      };
    } catch (error) {
      console.error('Erro na previsão de falhas:', error);
      throw error;
    }
  }

  /**
   * Gera cronograma de manutenção preditiva
   */
  async generateMaintenanceSchedule(providerId: number): Promise<PredictiveMaintenanceSchedule[]> {
    try {
      const healthMetrics = await this.analyzeEquipmentHealth(providerId);
      const schedule: PredictiveMaintenanceSchedule[] = [];

      for (const metrics of healthMetrics) {
        if (metrics.riskLevel !== 'low') {
          const maintenanceItem = await this.createMaintenanceScheduleItem(metrics);
          schedule.push(maintenanceItem);
        }
      }

      // Ordenar por prioridade e data
      return schedule.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.recommendedDate.getTime() - b.recommendedDate.getTime();
      });
    } catch (error) {
      console.error('Erro na geração do cronograma de manutenção:', error);
      throw error;
    }
  }

  /**
   * Detecta anomalias em tempo real
   */
  async detectAnomalies(providerId: number): Promise<Array<{
    equipmentId: number;
    anomalyType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
    recommendedAction: string;
    confidence: number;
  }>> {
    try {
      const recentTickets = await this.getRecentTickets(providerId, 7); // Últimos 7 dias
      const anomalies = [];

      // Detectar picos anômalos de tickets
      const ticketSpikes = this.detectTicketSpikes(recentTickets);
      anomalies.push(...ticketSpikes);

      // Detectar padrões anômalos de falhas
      const failureAnomalies = this.detectFailureAnomalies(recentTickets);
      anomalies.push(...failureAnomalies);

      // Detectar equipamentos com comportamento anômalo
      const behaviorAnomalies = await this.detectBehaviorAnomalies(providerId);
      anomalies.push(...behaviorAnomalies);

      return anomalies.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    } catch (error) {
      console.error('Erro na detecção de anomalias:', error);
      throw error;
    }
  }

  /**
   * Calcula a saúde de um equipamento específico
   */
  private async calculateEquipmentHealth(equipment: any): Promise<EquipmentHealthMetrics> {
    const historicalData = await this.getEquipmentHistory(equipment.id);
    const recentTickets = historicalData.filter((ticket: any) => {
      const ticketDate = new Date(ticket.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return ticketDate >= thirtyDaysAgo;
    });

    // Calcular métricas
    const avgTicketsPerMonth = historicalData.length / 12; // Assumindo dados de 1 ano
    const criticalTicketsCount = recentTickets.filter((t: any) => t.priority === 'critical').length;
    const daysSinceLastMaintenance = this.calculateDaysSinceLastMaintenance(equipment);
    
    // Calcular score de saúde (0-100)
    let healthScore = 100;
    
    // Penalizar por tickets recentes
    healthScore -= Math.min(recentTickets.length * 5, 30);
    
    // Penalizar por tickets críticos
    healthScore -= criticalTicketsCount * 15;
    
    // Penalizar por falta de manutenção
    if (daysSinceLastMaintenance > 90) {
      healthScore -= Math.min((daysSinceLastMaintenance - 90) * 0.5, 25);
    }
    
    // Penalizar por idade do equipamento
    const equipmentAge = this.calculateEquipmentAge(equipment);
    if (equipmentAge > 3) {
      healthScore -= Math.min((equipmentAge - 3) * 3, 15);
    }

    healthScore = Math.max(0, Math.min(100, healthScore));

    // Determinar nível de risco
    const riskLevel = this.determineRiskLevel(healthScore);
    
    // Prever data de falha se aplicável
    const predictedFailureDate = this.predictFailureDate(equipment, historicalData, healthScore);
    
    // Gerar recomendação de manutenção
    const maintenanceRecommendation = this.generateMaintenanceRecommendation(healthScore, riskLevel, daysSinceLastMaintenance);
    
    // Identificar fatores críticos
    const criticalFactors = this.identifyCriticalFactors(recentTickets, daysSinceLastMaintenance, equipmentAge);

    return {
      equipmentId: equipment.id,
      healthScore,
      riskLevel,
      predictedFailureDate,
      confidence: this.calculateConfidence(historicalData.length, equipmentAge),
      maintenanceRecommendation,
      criticalFactors,
      historicalPattern: {
        avgTicketsPerMonth,
        lastMaintenanceDate: equipment.updatedAt, // Use updatedAt as proxy for last maintenance
        daysSinceLastMaintenance,
        failureFrequency: this.calculateFailureFrequency(historicalData)
      }
    };
  }

  /**
   * Busca equipamentos de um provedor
   */
  private async getProviderEquipments(providerId: number) {
    return await prisma.equipment.findMany({
      where: { providerId },
      select: {
        id: true,
        label: true,
        type: true,
        serial: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Busca detalhes de um equipamento
   */
  private async getEquipmentDetails(equipmentId: number) {
    return await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        provider: true
      }
    });
  }

  /**
   * Busca histórico de tickets de um equipamento
   */
  private async getEquipmentHistory(equipmentId: number) {
    // Since there's no direct relationship between Ticket and Equipment,
    // we need to get the equipment details first and search for tickets
    // that mention the equipment in their content
    const equipment = await this.getEquipmentDetails(equipmentId);
    if (!equipment) return [];

    return await prisma.ticket.findMany({
      where: {
        providerId: equipment.providerId,
        OR: [
          {
            title: {
              contains: equipment.serial,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: equipment.serial,
              mode: 'insensitive'
            }
          },
          {
            title: {
              contains: equipment.label,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: equipment.label,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Busca tickets recentes de um provedor
   */
  private async getRecentTickets(providerId: number, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.ticket.findMany({
      where: {
        providerId,
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Analisa padrões de falha
   */
  private analyzeFailurePatterns(historicalData: any[]) {
    const patterns = {
      commonFailures: new Map<string, number>(),
      seasonalPatterns: new Map<number, number>(),
      timePatterns: new Map<number, number>()
    };

    historicalData.forEach(ticket => {
      // Analisar tipos de falha comuns
      const failureType = this.classifyFailureType(ticket.title, ticket.description);
      patterns.commonFailures.set(failureType, (patterns.commonFailures.get(failureType) || 0) + 1);

      // Analisar padrões sazonais
      const month = new Date(ticket.createdAt).getMonth();
      patterns.seasonalPatterns.set(month, (patterns.seasonalPatterns.get(month) || 0) + 1);

      // Analisar padrões de horário
      const hour = new Date(ticket.createdAt).getHours();
      patterns.timePatterns.set(hour, (patterns.timePatterns.get(hour) || 0) + 1);
    });

    return patterns;
  }

  /**
   * Gera previsões de falha
   */
  private generateFailurePredictions(equipment: any, patterns: any) {
    const predictions = [];
    
    // Previsão baseada em padrões históricos
    for (const [failureType, frequency] of patterns.commonFailures) {
      if (frequency >= 2) { // Mínimo 2 ocorrências
        const probability = Math.min(frequency / 10, 0.9); // Máximo 90%
        const estimatedDate = this.estimateFailureDate(equipment, failureType, frequency);
        
        predictions.push({
          failureType,
          probability,
          estimatedDate,
          impact: this.assessFailureImpact(failureType),
          preventionActions: this.getPreventionActions(failureType)
        });
      }
    }

    return predictions;
  }

  /**
   * Calcula risco geral
   */
  private calculateOverallRisk(predictions: any[]): number {
    if (predictions.length === 0) return 0;
    
    const totalRisk = predictions.reduce((sum, pred) => {
      const impactWeight: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
      return sum + (pred.probability * impactWeight[pred.impact as string]);
    }, 0);
    
    return Math.min(totalRisk / predictions.length / 4, 1); // Normalizar para 0-1
  }

  /**
   * Gera recomendações de prevenção
   */
  private generatePreventionRecommendations(predictions: any[], equipment: any): string[] {
    const recommendations = [];
    
    const highRiskPredictions = predictions.filter(p => p.probability > 0.6);
    
    if (highRiskPredictions.length > 0) {
      recommendations.push('Agendar manutenção preventiva urgente');
      recommendations.push('Monitorar equipamento diariamente');
    }
    
    if (predictions.some(p => p.impact === 'critical')) {
      recommendations.push('Considerar substituição do equipamento');
    }
    
    recommendations.push('Implementar monitoramento proativo');
    
    return recommendations;
  }

  /**
   * Cria item do cronograma de manutenção
   */
  private async createMaintenanceScheduleItem(metrics: EquipmentHealthMetrics): Promise<PredictiveMaintenanceSchedule> {
    const urgencyDays = {
      critical: 1,
      high: 7,
      medium: 30,
      low: 90
    };

    const recommendedDate = new Date();
    recommendedDate.setDate(recommendedDate.getDate() + urgencyDays[metrics.riskLevel]);

    const priority = metrics.riskLevel === 'critical' ? 'urgent' : 
                    metrics.riskLevel === 'high' ? 'high' :
                    metrics.riskLevel === 'medium' ? 'medium' : 'low';

    return {
      equipmentId: metrics.equipmentId,
      recommendedDate,
      priority,
      estimatedCost: this.estimateMaintenanceCost(metrics),
      preventedIssues: this.identifyPreventableIssues(metrics),
      maintenanceType: metrics.riskLevel === 'critical' ? 'emergency' : 
                      metrics.riskLevel === 'high' ? 'corrective' : 'preventive'
    };
  }

  // Métodos auxiliares
  private calculateDaysSinceLastMaintenance(equipment: any): number {
    // Since we don't have lastMaintenanceDate in the schema, use updatedAt as proxy
    if (!equipment.updatedAt) return 365; // Assume 1 year if no data
    
    const lastUpdate = new Date(equipment.updatedAt);
    const now = new Date();
    return Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateEquipmentAge(equipment: any): number {
    // Since we don't have installationDate in the schema, use createdAt as proxy
    if (!equipment.createdAt) return 5; // Assume 5 years if no data
    
    const creation = new Date(equipment.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - creation.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }

  private determineRiskLevel(healthScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (healthScore >= 80) return 'low';
    if (healthScore >= 60) return 'medium';
    if (healthScore >= 40) return 'high';
    return 'critical';
  }

  private predictFailureDate(equipment: any, historicalData: any[], healthScore: number): Date | undefined {
    if (healthScore < 60) {
      const daysToFailure = Math.max(1, Math.floor(healthScore * 2)); // Quanto menor o score, mais próxima a falha
      const failureDate = new Date();
      failureDate.setDate(failureDate.getDate() + daysToFailure);
      return failureDate;
    }
    return undefined;
  }

  private generateMaintenanceRecommendation(healthScore: number, riskLevel: string, daysSinceLastMaintenance: number): string {
    if (riskLevel === 'critical') return 'Manutenção de emergência necessária imediatamente';
    if (riskLevel === 'high') return 'Agendar manutenção corretiva dentro de 7 dias';
    if (daysSinceLastMaintenance > 180) return 'Manutenção preventiva recomendada';
    return 'Continuar monitoramento regular';
  }

  private identifyCriticalFactors(recentTickets: any[], daysSinceLastMaintenance: number, equipmentAge: number): string[] {
    const factors = [];
    
    if (recentTickets.length > 5) factors.push('Alto volume de tickets recentes');
    if (recentTickets.some(t => t.priority === 'critical')) factors.push('Tickets críticos recentes');
    if (daysSinceLastMaintenance > 180) factors.push('Manutenção atrasada');
    if (equipmentAge > 5) factors.push('Equipamento antigo');
    
    return factors;
  }

  private calculateConfidence(dataPoints: number, equipmentAge: number): number {
    let confidence = Math.min(dataPoints / 50, 1); // Mais dados = mais confiança
    confidence *= Math.min(equipmentAge / 2, 1); // Equipamentos mais antigos = mais dados históricos
    return Math.max(0.1, confidence);
  }

  private calculateFailureFrequency(historicalData: any[]): number {
    const criticalTickets = historicalData.filter(t => t.priority === 'critical' || t.priority === 'high');
    return criticalTickets.length / Math.max(historicalData.length, 1);
  }

  private classifyFailureType(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('conexão') || text.includes('internet')) return 'connection_failure';
    if (text.includes('energia') || text.includes('power')) return 'power_failure';
    if (text.includes('hardware') || text.includes('equipamento')) return 'hardware_failure';
    if (text.includes('software') || text.includes('sistema')) return 'software_failure';
    
    return 'general_failure';
  }

  private estimateFailureDate(equipment: any, failureType: string, frequency: number): Date {
    const baseInterval = 90; // 90 dias base
    const adjustedInterval = Math.max(7, baseInterval / frequency);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + adjustedInterval);
    
    return estimatedDate;
  }

  private assessFailureImpact(failureType: string): 'low' | 'medium' | 'high' | 'critical' {
    const impactMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      connection_failure: 'high',
      power_failure: 'critical',
      hardware_failure: 'high',
      software_failure: 'medium',
      general_failure: 'medium'
    };
    
    return impactMap[failureType] || 'medium';
  }

  private getPreventionActions(failureType: string): string[] {
    const actionsMap: Record<string, string[]> = {
      connection_failure: ['Verificar cabos', 'Testar conectividade', 'Atualizar firmware'],
      power_failure: ['Verificar fonte de alimentação', 'Testar estabilizador', 'Verificar aterramento'],
      hardware_failure: ['Inspeção física', 'Limpeza preventiva', 'Substituição de componentes'],
      software_failure: ['Atualização de software', 'Verificação de logs', 'Reinicialização'],
      general_failure: ['Manutenção preventiva', 'Monitoramento', 'Documentação']
    };
    
    return actionsMap[failureType] || ['Manutenção geral'];
  }

  private estimateMaintenanceCost(metrics: EquipmentHealthMetrics): number {
    const baseCost = 500; // Custo base em reais
    const riskMultiplier = { low: 1, medium: 1.5, high: 2, critical: 3 };
    
    return baseCost * riskMultiplier[metrics.riskLevel];
  }

  private identifyPreventableIssues(metrics: EquipmentHealthMetrics): string[] {
    const issues = [];
    
    if (metrics.riskLevel === 'critical') {
      issues.push('Falha total do equipamento');
      issues.push('Interrupção prolongada do serviço');
    }
    
    if (metrics.historicalPattern.daysSinceLastMaintenance > 180) {
      issues.push('Degradação de performance');
      issues.push('Aumento de tickets de suporte');
    }
    
    return issues;
  }

  private detectTicketSpikes(recentTickets: any[]) {
    // Implementação simplificada - detectar picos anômalos
    const dailyCounts = new Map<string, number>();
    
    recentTickets.forEach(ticket => {
      const date = new Date(ticket.createdAt).toDateString();
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    });
    
    const avgDaily = Array.from(dailyCounts.values()).reduce((a, b) => a + b, 0) / dailyCounts.size;
    const anomalies = [];
    
    for (const [date, count] of dailyCounts) {
      if (count > avgDaily * 2) { // Mais que o dobro da média
        anomalies.push({
          equipmentId: 0, // Geral
          anomalyType: 'ticket_spike',
          severity: 'high' as const,
          description: `Pico anômalo de ${count} tickets em ${date}`,
          detectedAt: new Date(),
          recommendedAction: 'Investigar causa do aumento de tickets',
          confidence: 0.8
        });
      }
    }
    
    return anomalies;
  }

  private detectFailureAnomalies(recentTickets: any[]) {
    // Detectar padrões anômalos de falhas
    const criticalTickets = recentTickets.filter(t => t.priority === 'critical');
    const anomalies = [];
    
    if (criticalTickets.length > 3) {
      anomalies.push({
        equipmentId: 0,
        anomalyType: 'critical_failure_pattern',
        severity: 'critical' as const,
        description: `${criticalTickets.length} tickets críticos detectados recentemente`,
        detectedAt: new Date(),
        recommendedAction: 'Investigação urgente necessária',
        confidence: 0.9
      });
    }
    
    return anomalies;
  }

  private async detectBehaviorAnomalies(providerId: number) {
    // Detectar comportamentos anômalos em equipamentos
    const equipments = await this.getProviderEquipments(providerId);
    const anomalies = [];
    
    for (const equipment of equipments) {
      const recentHistory = await this.getEquipmentHistory(equipment.id);
      const recentTickets = recentHistory.filter((ticket: any) => {
        const ticketDate = new Date(ticket.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return ticketDate >= sevenDaysAgo;
      });
      
      if (recentTickets.length > 5) {
        anomalies.push({
          equipmentId: equipment.id,
          anomalyType: 'equipment_behavior_anomaly',
          severity: 'medium' as const,
          description: `Equipamento ${equipment.label} com ${recentTickets.length} tickets na última semana`,
          detectedAt: new Date(),
          recommendedAction: 'Verificar status do equipamento',
          confidence: 0.7
        });
      }
    }
    
    return anomalies;
  }
}

export const faultPredictionService = new FaultPredictionService();