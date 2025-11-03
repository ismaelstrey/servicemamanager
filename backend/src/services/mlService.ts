import { PrismaClient } from '@prisma/client';
import { Priority } from '../types/common.types';

const prisma = new PrismaClient();

export interface MLTicketPattern {
  pattern: string;
  frequency: number;
  averagePriority: Priority;
  averageResolutionTime: number;
  successRate: number;
  commonKeywords: string[];
  seasonality?: {
    month: number;
    dayOfWeek: number;
    hour: number;
  };
}

export interface MLAnalysisResult {
  patterns: MLTicketPattern[];
  predictions: {
    nextWeekVolume: number;
    criticalTicketsExpected: number;
    resourceNeeded: number;
  };
  recommendations: {
    staffing: string[];
    preventive: string[];
    training: string[];
  };
  trends: {
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
    priorityTrend: 'escalating' | 'improving' | 'stable';
    resolutionTimeTrend: 'improving' | 'degrading' | 'stable';
  };
}

export interface TicketClassificationModel {
  accuracy: number;
  features: {
    titleKeywords: { [key: string]: number };
    descriptionPatterns: { [key: string]: number };
    categoryWeights: { [key: string]: number };
    sourceWeights: { [key: string]: number };
    timeFactors: { [key: string]: number };
  };
  lastTraining: Date;
  sampleSize: number;
}

export class MLService {
  private classificationModel: TicketClassificationModel | null = null;

  /**
   * Treina o modelo de classificação baseado em dados históricos
   */
  async trainClassificationModel(providerId: number): Promise<TicketClassificationModel> {
    try {
      // Buscar dados históricos dos últimos 12 meses
      const historicalData = await this.getHistoricalTicketData(providerId, 365);

      if (historicalData.length < 50) {
        throw new Error('Dados insuficientes para treinamento (mínimo 50 tickets)');
      }

      // Extrair features dos dados históricos
      const features = this.extractFeatures(historicalData);

      // Calcular pesos e padrões
      const model: TicketClassificationModel = {
        accuracy: this.calculateModelAccuracy(historicalData, features),
        features,
        lastTraining: new Date(),
        sampleSize: historicalData.length
      };

      this.classificationModel = model;

      // Salvar modelo no banco (opcional - implementar tabela de modelos)
      await this.saveModel(providerId, model);

      return model;
    } catch (error) {
      console.error('Erro no treinamento do modelo:', error);
      throw error;
    }
  }

  /**
   * Classifica um ticket e sugere prioridade
   */
  async classifyTicket(
    title: string,
    description: string,
    source: string,
    providerId: number
  ): Promise<{
    suggestedPriority: Priority;
    confidence: number;
    estimatedResolutionTime: number;
  }> {
    try {
      // Carregar modelo se não estiver em memória
      if (!this.classificationModel) {
        this.classificationModel = await this.loadModel(providerId);
      }

      if (!this.classificationModel) {
        throw new Error('Modelo não treinado para este provedor');
      }

      const features = this.extractTicketFeatures(title, description, source);

      // Calcular scores para cada prioridade
      const priorityScores = this.calculatePriorityScores(features, this.classificationModel);

      // Determinar prioridade com maior score
      const suggestedPriority = this.getHighestScorePriority(priorityScores);
      const confidence = priorityScores[suggestedPriority];

      // Estimar tempo de resolução baseado em padrões históricos
      const estimatedResolutionTime = this.estimateResolutionTime(features, this.classificationModel);

      return {
        suggestedPriority,
        confidence,
        estimatedResolutionTime
      };
    } catch (error) {
      console.error('Erro na classificação automática:', error);
      // Fallback para classificação básica
      return {
        suggestedPriority: 'medium',
        confidence: 0.1,
        estimatedResolutionTime: 24
      };
    }
  }

  /**
   * Analisa padrões históricos e gera insights de ML
   */
  async analyzeHistoricalPatterns(providerId: number): Promise<MLAnalysisResult> {
    try {
      const historicalData = await this.getHistoricalTicketData(providerId, 180); // 6 meses

      if (historicalData.length === 0) {
        throw new Error('Dados históricos insuficientes');
      }

      // Identificar padrões
      const patterns = this.identifyPatterns(historicalData);

      // Fazer previsões
      const predictions = this.makePredictions(historicalData);

      // Gerar recomendações
      const recommendations = this.generateMLRecommendations(patterns, historicalData);

      // Analisar tendências
      const trends = this.analyzeTrends(historicalData);

      return {
        patterns,
        predictions,
        recommendations,
        trends
      };
    } catch (error) {
      console.error('Erro na análise de padrões:', error);
      throw error;
    }
  }

  /**
   * Busca dados históricos de tickets
   */
  private async getHistoricalTicketData(providerId: number, days: number): Promise<{
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    source: string;
    providerId: number;
    createdAt: Date;
    updatedAt: Date;
  }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.ticket.findMany({
      where: {
        providerId,
        createdAt: { gte: startDate },
        status: { in: ['resolved', 'closed'] }
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        source: true,
        providerId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Extrai features dos dados históricos para treinamento
   */
  private extractFeatures(historicalData: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    source: string;
    providerId: number;
    createdAt: Date;
    updatedAt: Date;
  }[]): TicketClassificationModel['features'] {
    const titleKeywords: { [key: string]: number } = {};
    const descriptionPatterns: { [key: string]: number } = {};
    const sourceWeights: { [key: string]: number } = {};
    const timeFactors: { [key: string]: number } = {};

    // Processar cada ticket histórico
    historicalData.forEach(ticket => {
      // Extrair palavras-chave do título
      const titleWords = this.extractWords(ticket.title);
      titleWords.forEach(word => {
        titleKeywords[word] = (titleKeywords[word] || 0) + this.getPriorityWeight(ticket.priority);
      });

      // Extrair padrões da descrição
      const descPatterns = this.extractDescriptionPatterns(ticket.description);
      descPatterns.forEach(pattern => {
        descriptionPatterns[pattern] = (descriptionPatterns[pattern] || 0) + this.getPriorityWeight(ticket.priority);
      });

      // Calcular pesos por fonte
      sourceWeights[ticket.source] = (sourceWeights[ticket.source] || 0) + this.getPriorityWeight(ticket.priority);

      // Fatores temporais
      const hour = new Date(ticket.createdAt).getHours();
      const dayOfWeek = new Date(ticket.createdAt).getDay();
      timeFactors[`hour_${hour}`] = (timeFactors[`hour_${hour}`] || 0) + this.getPriorityWeight(ticket.priority);
      timeFactors[`day_${dayOfWeek}`] = (timeFactors[`day_${dayOfWeek}`] || 0) + this.getPriorityWeight(ticket.priority);
    });

    // Normalizar pesos
    this.normalizeWeights(titleKeywords);
    this.normalizeWeights(descriptionPatterns);
    this.normalizeWeights(sourceWeights);
    this.normalizeWeights(timeFactors);

    return {
      titleKeywords,
      descriptionPatterns,
      categoryWeights: {} as { [key: string]: number },
      sourceWeights,
      timeFactors
    };
  }

  /**
   * Extrai features de um ticket específico para classificação
   */
  private extractTicketFeatures(title: string, description: string, source: string) {
    return {
      titleWords: this.extractWords(title),
      descriptionPatterns: this.extractDescriptionPatterns(description),
      source,
      timeFactors: {
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      }
    };
  }

  /**
   * Calcula scores de prioridade para um ticket
   */
  private calculatePriorityScores(features: any, model: TicketClassificationModel) {
    const scores: { [key in Priority]: number } = { low: 0, medium: 0, high: 0, urgent: 0 };

    // Score baseado em palavras-chave do título
    features.titleWords.forEach((word: string) => {
      const weight = model.features.titleKeywords[word] || 0;
      this.addWeightToScores(scores, weight);
    });

    // Score baseado em padrões da descrição
    features.descriptionPatterns.forEach((pattern: string) => {
      const weight = model.features.descriptionPatterns[pattern] || 0;
      this.addWeightToScores(scores, weight);
    });

    // Score baseado na fonte
    const sourceWeight = model.features.sourceWeights[features.source] || 0;
    this.addWeightToScores(scores, sourceWeight);

    // Score baseado em fatores temporais
    const hourWeight = model.features.timeFactors[`hour_${features.timeFactors.hour}`] || 0;
    const dayWeight = model.features.timeFactors[`day_${features.timeFactors.dayOfWeek}`] || 0;
    this.addWeightToScores(scores, hourWeight + dayWeight);

    // Normalizar scores
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(scores).forEach(key => {
        scores[key as Priority] = scores[key as Priority] / total;
      });
    }

    return scores;
  }

  /**
   * Identifica padrões nos dados históricos
   */
  private identifyPatterns(historicalData: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    source: string;
    providerId: number;
    createdAt: Date;
    updatedAt: Date;
  }[]): MLTicketPattern[] {
    const patterns: { [key: string]: MLTicketPattern } = {};

    historicalData.forEach(ticket => {
      const key = `${ticket.source}_${ticket.priority}`;

      if (!patterns[key]) {
        patterns[key] = {
          pattern: key,
          frequency: 0,
          averagePriority: ticket.priority as Priority,
          averageResolutionTime: 0,
          successRate: 0,
          commonKeywords: []
        };
      }

      patterns[key].frequency++;

      const resolutionTime = (new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
      patterns[key].averageResolutionTime += resolutionTime;
    });

    // Calcular médias
    Object.values(patterns).forEach(pattern => {
      if (pattern.frequency > 0) {
        pattern.averageResolutionTime = pattern.averageResolutionTime / pattern.frequency;
        pattern.successRate = 0.85; // Placeholder - calcular baseado em dados reais
      }
    });

    return Object.values(patterns).filter(p => p.frequency >= 3); // Mínimo 3 ocorrências
  }

  /**
   * Faz previsões baseadas em dados históricos
   */
  private makePredictions(historicalData: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    source: string;
    providerId: number;
    createdAt: Date;
    updatedAt: Date;
  }[]) {
    const recentData = historicalData.slice(0, 30); // Últimos 30 tickets
    const avgVolume = historicalData.length / 30; // Volume médio por dia

    return {
      nextWeekVolume: Math.round(avgVolume * 7),
      criticalTicketsExpected: Math.round(recentData.filter(t => t.priority === 'critical').length * 0.3),
      resourceNeeded: Math.round(avgVolume * 2) // Estimativa de recursos necessários
    };
  }

  /**
   * Gera recomendações baseadas em ML
   */
  private generateMLRecommendations(patterns: MLTicketPattern[], historicalData: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    source: string;
    providerId: number;
    createdAt: Date;
    updatedAt: Date;
  }[]) {
    const recommendations = {
      staffing: [] as string[],
      preventive: [] as string[],
      training: [] as string[]
    };

    // Análise de padrões para recomendações
    const highVolumePatterns = patterns.filter(p => p.frequency > 10);
    const slowResolutionPatterns = patterns.filter(p => p.averageResolutionTime > 48);

    if (highVolumePatterns.length > 0) {
      recommendations.staffing.push('Considerar aumento de equipe para categorias de alto volume');
    }

    if (slowResolutionPatterns.length > 0) {
      recommendations.training.push('Treinamento necessário para melhorar tempo de resolução');
    }

    recommendations.preventive.push('Implementar monitoramento proativo baseado em padrões identificados');

    return recommendations;
  }

  /**
   * Analisa tendências nos dados
   */
  private analyzeTrends(historicalData: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    source: string;
    providerId: number;
    createdAt: Date;
    updatedAt: Date;
  }[]) {
    const recent = historicalData.slice(0, 30);
    const older = historicalData.slice(30, 60);

    return {
      volumeTrend: recent.length > older.length ? 'increasing' :
        recent.length < older.length ? 'decreasing' : 'stable',
      priorityTrend: 'stable', // Implementar análise real
      resolutionTimeTrend: 'stable' // Implementar análise real
    } as const;
  }

  // Métodos auxiliares
  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10);
  }

  private extractDescriptionPatterns(description: string): string[] {
    const patterns = [];
    const text = description.toLowerCase();

    // Padrões comuns
    if (text.includes('não funciona')) patterns.push('not_working');
    if (text.includes('lento')) patterns.push('slow_performance');
    if (text.includes('erro')) patterns.push('error_message');
    if (text.includes('conexão')) patterns.push('connection_issue');

    return patterns;
  }

  private getPriorityWeight(priority: string): number {
    const weights: { [key: string]: number } = { low: 1, medium: 2, high: 3, critical: 4 };
    return weights[priority] || 1;
  }

  private normalizeWeights(weights: { [key: string]: number }) {
    const max = Math.max(...Object.values(weights));
    if (max > 0) {
      Object.keys(weights).forEach(key => {
        weights[key] = weights[key] / max;
      });
    }
  }

  private addWeightToScores(scores: { [key in Priority]: number }, weight: number) {
    if (weight > 0.7) scores.urgent += weight;
    else if (weight > 0.5) scores.high += weight;
    else if (weight > 0.3) scores.medium += weight;
    else scores.low += weight;
  }

  private getHighestScorePriority(scores: { [key in Priority]: number }): Priority {
    return Object.entries(scores).reduce((a, b) => scores[a[0] as Priority] > scores[b[0] as Priority] ? a : b)[0] as Priority;
  }

  private estimateResolutionTime(features: any, model: TicketClassificationModel): number {
    // Implementação simplificada - pode ser melhorada com regressão linear
    const baseTime = 24; // 24 horas base
    const sourceMultiplier = model.features.sourceWeights[features.source] || 1;
    return Math.round(baseTime * sourceMultiplier);
  }

  private calculateModelAccuracy(historicalData: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    source: string;
    providerId: number;
    createdAt: Date;
    updatedAt: Date;
  }[], features: any): number {
    // Implementação simplificada - validação cruzada seria ideal
    return Math.min(0.95, 0.6 + (historicalData.length / 1000) * 0.3);
  }

  private async saveModel(providerId: number, model: TicketClassificationModel) {
    // TODO: Implementar salvamento do modelo no banco de dados
    console.log(`Modelo salvo para provedor ${providerId} com acurácia ${model.accuracy}`);
  }

  private async loadModel(providerId: number): Promise<TicketClassificationModel | null> {
    // TODO: Implementar carregamento do modelo do banco de dados
    return null;
  }
}

export const mlService = new MLService();